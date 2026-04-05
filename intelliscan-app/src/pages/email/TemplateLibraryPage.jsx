import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, Copy, Edit3, Trash2, Mail, Layout, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import TemplateCard from '../../components/email/TemplateCard';
import { getStoredToken } from '../../utils/auth.js';

export default function TemplateLibraryPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = useNavigate();

  async function fetchTemplates() {
    try {
      const res = await fetch('/api/email/templates', {
        headers: { 'Authorization': `Bearer ${getStoredToken()}` }
      });
      const data = await res.json();
      if (data.success) setTemplates(data.templates);
      setLoading(false);
    } catch (err) {
      console.error('Fetch templates failed:', err);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTemplates();
  }, []);

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'welcome', 'follow-up', 'newsletter', 'promotional', 'general'];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-2">Intelligence <span className="text-indigo-500">Vector Library</span></h1>
          <p className="text-gray-400 font-medium">Pre-optimized templates and AI-generated transmission vectors.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/dashboard/email-marketing/campaigns/new', { state: { useAI: true } })}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-indigo-500/40 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg"
          >
            <Sparkles size={16} /> AI Composer Active
          </button>
          <button 
            onClick={() => navigate('/dashboard/email-marketing/templates/new')}
            className="hidden px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-sm transition-all md:flex items-center gap-2 border border-gray-700"
          >
            <Plus size={18} /> New Template
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between p-6 bg-gray-900/40 rounded-3xl border border-gray-800 backdrop-blur-sm">
        <div className="relative group w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search vectors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-black/30 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
          />
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
    {categories.map(cat => (
      <button
        key={cat}
        onClick={() => setCategoryFilter(cat)}
        className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
          categoryFilter === cat 
            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
            : 'bg-gray-800/40 border-gray-800 text-gray-500 hover:text-gray-300'
        }`}
      >
        {cat}
      </button>
    ))}
  </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-gray-800/20 rounded-2xl border border-gray-800 animate-pulse" />
          ))
        ) : filteredTemplates.length === 0 ? (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-800 rounded-3xl group">
            <Layout size={64} className="mx-auto text-gray-700 mb-6 group-hover:text-indigo-500/50 transition-colors" />
            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Zero Templates found</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">Create a custom transmission vector or use the AI Orchestrator to generate one.</p>
          </div>
        ) : (
          filteredTemplates.map(template => (
            <TemplateCard 
              key={template.id} 
              template={template} 
              onSelect={(t) => navigate('/dashboard/email-marketing/campaigns/new', { state: { template: t } })}
              onEdit={(t) => console.log('Edit', t)}
              onDuplicate={(t) => console.log('Duplicate', t)}
              onDelete={(id) => console.log('Delete', id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
