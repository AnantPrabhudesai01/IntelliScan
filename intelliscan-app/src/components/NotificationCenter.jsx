import React from 'react';
import { X, Bell, Trash2, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationDrawer({ isOpen, onClose }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:justify-end bg-black/40 backdrop-blur-[1px]" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#1A1A2E] border border-gray-200 dark:border-gray-700 rounded-t-xl sm:rounded-xl w-full sm:w-96 sm:mr-4 sm:mb-4 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] sm:max-h-[500px] animate-slide-up sm:animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <button 
                onClick={markAllAsRead}
                title="Mark all as read"
                className="p-1 text-gray-400 hover:text-brand transition-colors"
              >
                <CheckCircle2 size={16} />
              </button>
            )}
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800 overflow-y-auto overflow-x-hidden flex-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-3">
                <Bell size={20} className="text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">All caught up!</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No notifications at the moment.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={`group px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all relative ${!n.is_read ? 'bg-brand/5 dark:bg-brand/5' : ''}`}
                onClick={() => !n.is_read && markAsRead(n.id)}
              >
                <div className="flex gap-3">
                  {/* Status Indicator */}
                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    n.type === 'err' ? 'bg-red-500' : 
                    n.type === 'warn' ? 'bg-amber-500' : 
                    n.type === 'success' ? 'bg-green-500' : 
                    'bg-brand'
                  }`} />
                  
                  <div className="flex-1 min-w-0 pr-6">
                    {n.title && <p className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">{n.title}</p>}
                    <p className={`text-[13px] leading-relaxed ${!n.is_read ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      {!n.is_read && <span className="w-1 h-1 rounded-full bg-brand" />}
                    </p>
                  </div>

                  {/* Actions (visible on hover) */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                      className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 5 && (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 text-center">
            <button className="text-xs text-gray-500 dark:text-gray-400 font-medium hover:text-brand transition-colors">
              View History
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
