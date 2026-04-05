import React, { useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';

export default function EmailPreview({ html, subject, previewText }) {
  const [device, setDevice] = useState('desktop');

  return (
    <div className="flex flex-col h-full bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
        </div>
        <div className="flex bg-gray-900/50 rounded-lg p-1">
          <button 
            onClick={() => setDevice('mobile')}
            className={`p-1.5 rounded-md transition-all ${device === 'mobile' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Smartphone size={14} />
          </button>
          <button 
            onClick={() => setDevice('desktop')}
            className={`p-1.5 rounded-md transition-all ${device === 'desktop' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Monitor size={14} />
          </button>
        </div>
      </div>

      {/* Inbox Header */}
      <div className="px-6 py-4 bg-gray-800/30 border-b border-gray-700">
        <h4 className="text-sm font-bold text-white truncate mb-1">{subject || '(No Subject)'}</h4>
        <p className="text-xs text-gray-500 truncate">{previewText || 'No preview text set...'}</p>
      </div>

      {/* Render Area */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4 flex justify-center items-start">
        <div 
          className={`bg-white shadow-lg transition-all duration-300 origin-top overflow-hidden rounded-sm`}
          style={{ 
            width: device === 'mobile' ? '375px' : '100%', 
            maxWidth: '600px',
            minHeight: '400px'
          }}
        >
          {html ? (
            <div 
              className="w-full h-full pointer-events-none p-0 select-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-300">
              <p className="text-sm font-medium italic">Your email content will appear here...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
