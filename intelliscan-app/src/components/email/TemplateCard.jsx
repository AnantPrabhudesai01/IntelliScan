import React from 'react';
import { Copy, Edit3, Trash2, Mail, ExternalLink } from 'lucide-react';

export default function TemplateCard({ template, onSelect, onEdit, onDelete, onDuplicate }) {
  const categoryColors = {
    welcome: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'follow-up': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    newsletter: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    promotional: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    general: 'bg-brand-500/10 text-brand-400 border-brand-500/20'
  };

  const currentCategory = categoryColors[template.category] || categoryColors.general;

  return (
    <div className="group relative bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300">
      {/* Thumbnail / Header */}
      <div className="h-32 bg-gray-800/20 flex flex-col items-center justify-center border-b border-gray-800 group-hover:bg-brand-500/5 transition-colors">
        <Mail className="text-gray-700 group-hover:text-brand-500/50 transition-colors" size={40} />
        {template.is_shared === 1 && (
          <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-400 border border-violet-500/20">System</span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="text-sm font-bold text-white truncate flex-1">{template.name}</h4>
          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md border ${currentCategory}`}>{template.category}</span>
        </div>
        <p className="text-xs text-gray-500 italic truncate mb-4">"{template.subject}"</p>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => onSelect(template)} 
            className="flex-1 py-1.5 bg-brand-600 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-brand-600/10"
          >
            <ExternalLink size={12} /> Use
          </button>
          <div className="flex gap-1">
            <button 
              onClick={() => onEdit(template)} 
              className="p-1.5 bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700 rounded-lg transition-all"
            >
              <Edit3 size={12} />
            </button>
            <button 
              onClick={() => onDuplicate(template)} 
              className="p-1.5 bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700 rounded-lg transition-all"
            >
              <Copy size={12} />
            </button>
            {template.is_shared !== 1 && (
              <button 
                onClick={() => onDelete(template.id)} 
                className="p-1.5 bg-gray-800/50 text-rose-400/50 hover:text-rose-400 hover:bg-rose-500/10 border border-gray-700 rounded-lg transition-all"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
