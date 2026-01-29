"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { TraceEvent } from "@/lib/trace/sсhemas";

type SocketCtx = {
  socket: Socket | null;
  events: TraceEvent[];
  clearEvents: () => void;
};

const SocketContext = createContext<SocketCtx | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const clearedAtRef = useRef(0);

  useEffect(() => {
    // --- teardown when not authenticated ---
    if (loading || !session?.access_token) {
      socket?.disconnect();
      setSocket(null);
      setEvents([]);
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!socketUrl) {
      console.error("❌ NEXT_PUBLIC_WS_URL is not defined");
      return;
    }

    console.log("🔌 creating EVENTS socket:", socketUrl);

    const s = io(socketUrl, {
      path: "/events/socket.io", 
      transports: ["websocket"],
      auth: { token: session.access_token },
    });

    // --- connection lifecycle logs ---
    s.on("connect", () => {
      console.log("✅ [EVENTS SOCKET] connected", {
        id: s.id,
        transport: s.io.engine.transport.name,
      });
    });

    s.on("connect_error", (err) => {
      console.log("❌ [EVENTS SOCKET] connect_error", {
        message: err?.message,
        name: err?.name,
        data: (err as any)?.data,
      });
    });

    s.on("disconnect", (reason) => {
      console.log("⚠️ [EVENTS SOCKET] disconnected", reason);
    });

    // --- system history (snapshot) ---
    s.on("system:history", (history: TraceEvent[]) => {
      setEvents(history);
    });

    // --- realtime event ---
    s.on("system:event", (event: TraceEvent) => {
      if (event.timestamp <= clearedAtRef.current) return;
      setEvents((prev) => [...prev, event]);
    });

    // --- clear ---
    s.on("system:cleared", () => {
      clearedAtRef.current = Date.now();
      setEvents([]);
    });

    setSocket(s);

    return () => {
      console.log("🧹 destroying EVENTS socket");
      s.disconnect();
    };
  }, [loading, session?.access_token]);

  const clearEvents = () => {
    clearedAtRef.current = Date.now();
    setEvents([]);
    socket?.emit("system:clear");
  };

  const value = useMemo(
    () => ({ socket, events, clearEvents }),
    [socket, events]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocket must be used inside SocketProvider");
  }
  return ctx;
}
