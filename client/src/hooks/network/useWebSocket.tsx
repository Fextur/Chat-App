import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Message } from "@/types";
import { useUser } from "@/hooks/auth/useUser";

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";

const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

export const useWebSocket = (onNewMessage: (message: Message) => void) => {
  const socketRef = useRef<Socket | null>(null);
  const callbackRef = useRef(onNewMessage);
  const { user } = useUser();

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

    if (socketRef.current?.connected) {
      return;
    }

    const token = getToken();
    const socket = io(API_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: token ? { token } : undefined,
    });

    socketRef.current = socket;

    socket.on("connect", () => {});

    socket.on("disconnect", (_reason) => {});

    socket.on("connect_error", (_error) => {});

    socket.on("newMessage", (message: Message) => {
      const messageWithDate: Message = {
        ...message,
        timestamp: new Date(message.timestamp),
      };
      callbackRef.current(messageWithDate);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  return socketRef.current;
};
