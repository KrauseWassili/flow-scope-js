"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

const MessengerSocketContext = createContext<Socket | null>(null);

export function MessengerSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, loading } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  console.log("MessengerSocketContext instance", MessengerSocketContext);

  useEffect(() => {
    // --- teardown when logged out / loading ---
    if (loading || !session?.access_token) {
      socket?.disconnect();
      setSocket(null);
      return;
    }

    const url = process.env.NEXT_PUBLIC_WS_URL;
    if (!url) {
      console.error("❌ NEXT_PUBLIC_WS_URL is not defined");
      return;
    }

    // --- create messenger socket ---
    const s = io(url, {
      path: "/socket.io", // 👈 ВАЖНО: messenger path
      transports: ["websocket"],
      auth: { token: session.access_token },
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [loading, session?.access_token]);

  return (
    <MessengerSocketContext.Provider value={socket}>
      {children}
    </MessengerSocketContext.Provider>
  );
}

export function useMessengerSocket() {
  return useContext(MessengerSocketContext);
}

