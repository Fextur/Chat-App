import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message } from '@/types';
import { useUser } from './useUser';

const API_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export const useWebSocket = (onNewMessage: (message: Message) => void) => {
  const socketRef = useRef<Socket | null>(null);
  const callbackRef = useRef(onNewMessage);
  const { user } = useUser();

  // Keep callback ref up to date without causing re-renders
  useEffect(() => {
    callbackRef.current = onNewMessage;
  }, [onNewMessage]);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Don't reconnect if already connected
    if (socketRef.current?.connected) {
      return;
    }

    console.log('[WebSocket] Initializing connection for user:', user.email);

    // Initialize socket connection
    const socket = io(API_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[WebSocket] Connected successfully');
    });

    socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
    });

    socket.on('newMessage', (message: Message) => {
      console.log('[WebSocket] Received new message:', message.id);
      // Convert timestamp string to Date object
      const messageWithDate: Message = {
        ...message,
        timestamp: new Date(message.timestamp),
      };
      callbackRef.current(messageWithDate);
    });

    return () => {
      console.log('[WebSocket] Cleaning up connection');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  return socketRef.current;
};

