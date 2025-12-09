import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useAuth } from "./useAuth";
import { toastError, toastSuccess } from "@/services/toast";
import { API_WEBSOCKET_URL } from "@/constants/Api";
import { useSegments } from "expo-router";
import { ClubPost } from "@/services/api/Api";

type WebSocketStatus = "connecting" | "connected" | "disconnected";

interface WebSocketContextType {
  status: WebSocketStatus;
  send: (event: string, payload: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { token } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>("disconnected");
  const eventListeners = useRef<Record<string, ((data: any) => void)[]>>({});
  const segments = useSegments();

  const connect = useCallback(() => {
    if (!token || socketRef.current) {
      return;
    }

    console.log("Attempting to connect WebSocket...");
    setStatus("connecting");
    const ws = new WebSocket(`${API_WEBSOCKET_URL}?token=${token}`);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setStatus("connected");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        // Global notification logic
        if (message.event === "new_post") {
          const post: ClubPost = message.payload;
          const currentClubId = segments[2];

          // Check if we are on a club page and if it's the same club as the post
          const isOnClubPostsPage =
            segments[0] === "(tabs)" &&
            segments[1] === "(index, profile, clubs)" &&
            currentClubId === post.club_id;

          if (!isOnClubPostsPage) {
            toastSuccess(`New post in club ${post.club_id}`); // In a real app, you might fetch club name
          }
        }

        // Pass event to subscribed components
        if (message.event && eventListeners.current[message.event]) {
          eventListeners.current[message.event].forEach((callback) =>
            callback(message.payload),
          );
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toastError("Cannot connect to server notifications.");
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setStatus("disconnected");
      socketRef.current = null;
    };
  }, [token, segments]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }
  }, []);

  useEffect(() => {
    if (token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (!eventListeners.current[event]) {
      eventListeners.current[event] = [];
    }
    eventListeners.current[event].push(callback);
  }, []);

  const off = useCallback((event: string, callback: (data: any) => void) => {
    if (eventListeners.current[event]) {
      eventListeners.current[event] = eventListeners.current[event].filter(
        (cb) => cb !== callback,
      );
    }
  }, []);

  const send = useCallback((event: string, payload: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ event, payload }));
    } else {
      console.warn("WebSocket is not connected. Cannot send message.");
    }
  }, []);

  const contextValue = {
    status,
    on,
    off,
    send,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};
