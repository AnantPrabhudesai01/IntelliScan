import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { getStoredToken, safeReadStoredUser } from '../utils/auth';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  
  const token = getStoredToken();
  const user = safeReadStoredUser();

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const removed = notifications.find(n => n.id === id);
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (removed && !removed.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchNotifications();

      // Initialize Socket connection
      // We pass the token in auth to allow the server to identify the user
      const newSocket = io(window.location.origin, {
        auth: { token }
      });

      newSocket.on('new-notification', (notif) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show Toast based on type
        const toastStyle = {
          style: {
            borderRadius: '10px',
            background: '#21132E',
            color: '#fff',
            fontSize: '13px',
            border: '1px solid #3D2650'
          }
        };

        if (notif.type === 'success') toast.success(notif.message, toastStyle);
        else if (notif.type === 'err') toast.error(notif.message, toastStyle);
        else toast(notif.message, { ...toastStyle, icon: '🔔' });
      });

      setSocket(newSocket);
      return () => newSocket.disconnect();
    }
  }, [token, user?.id]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
