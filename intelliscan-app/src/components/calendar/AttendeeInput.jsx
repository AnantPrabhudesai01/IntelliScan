import React, { useState } from 'react';
import { Mail, X, UserPlus, Search } from 'lucide-react';

export default function AttendeeInput({ attendees, onChange }) {
  const [inputValue, setInputValue] = useState('');

  const addAttendee = (e) => {
    e.preventDefault();
    const email = inputValue.trim();
    if (email && !attendees.find(a => a.email === email)) {
      onChange([...attendees, { email, name: email.split('@')[0], status: 'pending' }]);
      setInputValue('');
    }
  };

  const removeAttendee = (email) => {
    onChange(attendees.filter(a => a.email !== email));
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type="email"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addAttendee(e)}
          placeholder="Add guests by email..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-gray-400 group-hover:border-indigo-400/50"
        />
        <Mail className="absolute left-3.5 top-3 text-gray-400" size={16} />
        <button
          type="button"
          onClick={addAttendee}
          className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <UserPlus size={16} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {attendees.map((att) => (
          <div
            key={att.email}
            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-bold shadow-sm transition-all hover:border-red-200 dark:hover:border-red-900 group"
          >
            <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px]">
              {att.name ? att.name.charAt(0).toUpperCase() : '?'}
            </div>
            <span className="text-gray-700 dark:text-gray-300">{att.email}</span>
            <button
              type="button"
              onClick={() => removeAttendee(att.email)}
              className="p-0.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
