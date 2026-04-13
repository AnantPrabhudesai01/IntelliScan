import React from 'react';
import { X, AlertTriangle, Info, CheckCircle, Trash2 } from 'lucide-react';

export default function ConfirmationModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  type = 'warning' // 'warning', 'danger', 'info', 'success'
}) {
  if (!isOpen) return null;

  const iconMap = {
    warning: <AlertTriangle className="text-amber-500" size={24} />,
    danger: <Trash2 className="text-red-500" size={24} />,
    info: <Info className="text-indigo-500" size={24} />,
    success: <CheckCircle className="text-emerald-500" size={24} />
  };

  const buttonColorMap = {
    warning: 'bg-amber-600 hover:bg-amber-700',
    danger: 'bg-red-600 hover:bg-red-700',
    info: 'bg-indigo-600 hover:bg-indigo-700',
    success: 'bg-emerald-600 hover:bg-emerald-700'
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#161c28] w-full max-w-md rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-2xl animate-scale-up">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50`}>
              {iconMap[type]}
            </div>
            <h3 className="text-xl font-bold font-headline dark:text-white leading-tight">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 mb-8 font-body leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 ${buttonColorMap[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
