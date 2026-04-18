import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_PROXY_TARGET || 
  (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'http://localhost:5000');

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000
});

export const joinRoom = (userId) => {
  if (socket.connected) {
    socket.emit('join-room', `user-${userId}`);
    console.debug(`[Socket] Requested to join user-${userId}`);
  } else {
    socket.connect();
    socket.once('connect', () => {
      socket.emit('join-room', `user-${userId}`);
      console.debug(`[Socket] Connected and joined user-${userId}`);
    });
  }
};

export const leaveRoom = (userId) => {
  if (socket.connected) {
    socket.emit('leave-room', `user-${userId}`);
  }
};
