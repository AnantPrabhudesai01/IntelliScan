import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';
import { getStoredToken } from '../utils/auth';

const ContactContext = createContext();

export function ContactProvider({ children }) {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = getStoredToken();
        if (!token) return;
        const res = await apiClient.get('/contacts', {
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
      const res = await apiClient.post('/contacts', contact, {
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
      await apiClient.delete(`/contacts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete contact', err);
    }
  };

  const deleteContacts = async (ids) => {
    try {
      const token = getStoredToken();
      await apiClient.delete('/contacts/bulk', {
        headers: { Authorization: `Bearer ${token}` },
        data: { ids }
      });
      setContacts(prev => prev.filter(c => !ids.includes(c.id)));
    } catch (err) {
      console.error('Failed to delete contacts', err);
      throw err;
    }
  };

  const getDeletedContacts = async () => {
    try {
      const token = getStoredToken();
      const res = await apiClient.get('/contacts/trash', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (err) {
      console.error('Failed to fetch deleted contacts', err);
      throw err;
    }
  };

  const restoreContacts = async (ids) => {
    try {
      const token = getStoredToken();
      await apiClient.post('/contacts/restore', { ids }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Fetch fresh contacts to show restored ones
      const res = await apiClient.get('/contacts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(res.data);
    } catch (err) {
      console.error('Failed to restore contacts', err);
      throw err;
    }
  };

  const permanentlyDeleteContacts = async (ids) => {
    try {
      const token = getStoredToken();
      await apiClient.delete('/contacts/trash', {
        headers: { Authorization: `Bearer ${token}` },
        data: { ids }
      });
      // Trash state is handled locally in the component or via refresh
    } catch (err) {
      console.error('Permanent delete failed', err);
      throw err;
    }
  };

  const emptyTrash = async () => {
    try {
      const token = getStoredToken();
      await apiClient.delete('/contacts/trash/empty', {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Empty trash failed', err);
      throw err;
    }
  };

  const enrichContact = async (id) => {
    try {
      const token = getStoredToken();
      const res = await apiClient.post(`/contacts/${id}/enrich`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = res.data.data;
      // Map enriched data back to local contact state
      setContacts(prev => prev.map(c => c.id === id ? { 
        ...c, 
        linkedin_bio: updated.bio, 
        ai_enrichment_news: updated.latest_news, 
        inferred_industry: updated.industry, 
        inferred_seniority: updated.seniority,
        email: updated.email || c.email,
        phone: updated.phone || c.phone
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
      const res = await apiClient.get(`/contacts/semantic-search?q=${encodeURIComponent(query)}`, {
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
    <ContactContext.Provider value={{ 
      contacts, addContact, deleteContact, deleteContacts, 
      getDeletedContacts, restoreContacts, emptyTrash,
      updateContact, enrichContact, semanticSearch,
      permanentlyDeleteContacts 
    }}>
      {children}
    </ContactContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useContacts() {
  return useContext(ContactContext);
}
