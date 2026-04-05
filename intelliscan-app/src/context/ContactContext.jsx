import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getStoredToken } from '../utils/auth';

const ContactContext = createContext();

export function ContactProvider({ children }) {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = getStoredToken();
        if (!token) return;
        const res = await axios.get('/api/contacts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setContacts(res.data);
      } catch (err) {
        console.error('Failed to fetch contacts', err);
      }
    };
    fetchContacts();
  }, []);

  const addContact = async (contact) => {
    try {
      const token = getStoredToken();
      const res = await axios.post('/api/contacts', contact, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(prev => [{ ...contact, id: res.data.id, scan_date: new Date().toISOString() }, ...prev]);
      return res.data;
    } catch (err) {
      console.error('Failed to add contact', err);
      // Let the caller handle the 409 duplicate rejection so it can display the red UI alert
      throw err;
    }
  };

  const deleteContact = async (id) => {
    try {
      const token = getStoredToken();
      await axios.delete(`/api/contacts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete contact', err);
    }
  };

  const enrichContact = async (id) => {
    try {
      const token = getStoredToken();
      const res = await axios.post(`/api/contacts/${id}/enrich`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = res.data.data;
      // Map enriched data back to local contact state
      setContacts(prev => prev.map(c => c.id === id ? { 
        ...c, 
        linkedin_bio: updated.bio, 
        ai_enrichment_news: updated.latest_news, 
        inferred_industry: updated.industry, 
        inferred_seniority: updated.seniority 
      } : c));
      return res.data;
    } catch (err) {
      console.error('Failed to enrich contact', err);
      throw err;
    }
  };

  const semanticSearch = async (query) => {
    try {
      const token = getStoredToken();
      const res = await axios.get(`/api/contacts/semantic-search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.results;
    } catch (err) {
      console.error('Semantic search failed', err);
      throw err;
    }
  };

  const updateContact = (updatedContact) => {
    // Basic local update for now
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
  };

  return (
    <ContactContext.Provider value={{ contacts, addContact, deleteContact, updateContact, enrichContact, semanticSearch }}>
      {children}
    </ContactContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useContacts() {
  return useContext(ContactContext);
}
