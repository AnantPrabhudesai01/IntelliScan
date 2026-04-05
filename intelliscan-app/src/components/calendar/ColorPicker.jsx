import React from 'react';

const COLORS = [
  '#7b2fff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', 
  '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e'
];

export default function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLORS.map(color => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
            value === color ? 'border-white ring-2 ring-indigo-500' : 'border-transparent'
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}
