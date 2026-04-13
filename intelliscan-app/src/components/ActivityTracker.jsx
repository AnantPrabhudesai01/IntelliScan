import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import apiClient from '../api/client';
import { useRole } from '../context/RoleContext';
import { safeReadStoredUser } from '../utils/auth';

export default function ActivityTracker() {
  const location = useLocation();
  const { role } = useRole();
  const startTimeRef = useRef(null);
  if (startTimeRef.current === null) {
    // eslint-disable-next-line react-hooks/purity
    startTimeRef.current = Date.now();
  }
  const lastPathRef = useRef(location.pathname);

  // Helper to send log un-authenticated (allows tracking Anonymous)
  const sendLog = useCallback((action, path, duration_ms, detail = '') => {
    const user = safeReadStoredUser();
    const userEmail = user?.email || null;
    
    const combinedAction = action + (detail ? ` -> ${detail}` : '');
    
    apiClient.post('/analytics/log', {
      user_role: role || 'anonymous',
      user_email: userEmail,
      action: combinedAction,
      path: path,
      duration_ms: duration_ms
    }).catch(() => {
      // Silently fail if tracker server is down
    });
  }, [role]);

  useEffect(() => {
    // On path change, log the duration of the PREVIOUS path
    const currentPath = location.pathname;
    const now = Date.now();
    const durationMs = now - startTimeRef.current;
    
    if (durationMs > 100 && lastPathRef.current !== currentPath) {
      sendLog('page_view', lastPathRef.current, durationMs);
    }
    
    startTimeRef.current = now;
    lastPathRef.current = currentPath;
  }, [location.pathname, sendLog]);

  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest('button, a, [role="button"]') || e.target;
      let label = target.tagName.toLowerCase();
      
      const text = target.textContent || target.innerText;
      if (text && text.trim().length > 0 && text.trim().length <= 50) {
        label = `"${text.trim()}"`;
      }
      
      // Ensure we don't overwhelm with pure document clicks unless it's an actionable item or text
      if (label && label !== 'html' && label !== 'body') {
        sendLog('click', location.pathname, 0, label);
      }
    };

    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [location.pathname, role, sendLog]);

  return null; // Silent global watcher
}
