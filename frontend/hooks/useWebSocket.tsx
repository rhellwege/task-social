import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useApi } from "./useApi";
import { toastError, toastSuccess } from "@/services/toast";
import { API_WEBSOCKET_URL } from "@/constants/Api";
import { useSegments } from "expo-router";
import { RepositoryGetClubPostRow } from "@/services/api/Api";

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
  const { token } = useApi();
  const socketRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>("disconnected");
  const eventListeners = useRef<Record<string, ((data: any) => void)[]>>({});

  // Use a ref to track segments to prevent re-connections on navigation
  const segments = useSegments();
  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;

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
          const post: RepositoryGetClubPostRow = message.payload;
          // Use the ref to get the current segments without causing re-connects
          const currentSegments = segmentsRef.current;

          // Path is /myclubs/[clubId]/posts, segments are ['(tabs)', 'myclubs', 'CLUB_ID_HERE', 'posts']
          const isOnPostsPageForThisClub =
            currentSegments[1] === 'myclubs' &&
            currentSegments[3] === 'posts' &&
            currentSegments[2] === post.club_id;

          if (!isOnPostsPageForThisClub) {
            toastSuccess(`${post.author_username} posted in ${post.club_name}`);
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
//... (rest of file is the same)
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toastError("Cannot connect to server notifications.");
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setStatus("disconnected");
      socketRef.current = null;
    };
  }, [token]); // The dependency array no longer includes 'segments'

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      // Set onclose to null before closing to prevent the 'onclose' handler
      // from running during intentional disconnects (like logout).
      socketRef.current.onclose = null;
      socketRef.current.close();
      socketRef.current = null;
      setStatus("disconnected");
    }
  }, []);

  useEffect(() => {
    if (token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      // This cleanup will run on logout
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
