"use client";

import { useEffect} from "react";

import ClientArea from "@/components/client/ClientArea";
import ObservationArea from "@/components/observation/ObservationArea";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/auth/supabaseClient";
import { sendTraceEvent } from "@/lib/trace/sendTraceEvent";
import { useSocket } from "@/context/SocketContext";

export default function App() {
  const { loading } = useAuth();

  const { events, clearEvents } = useSocket();
  useEffect(() => {
    console.log("HOME RENDER events ref", events);
    console.log("HOME RENDER events length", events.length);
  }, [events]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const method: "password" | "oauth" =
        session?.user.app_metadata?.provider === "google"
          ? "oauth"
          : "password";

      if (event === "SIGNED_IN" && session?.user) {
        sendTraceEvent({
          traceId: crypto.randomUUID(),
          type: "USER_LOGIN",
          node: "client_1",
          actorId: session.user.id,
          event: session.user.email
            ? "login success"
            : "login success (no email)",
          payload: {
            method,
            email: session.user.email,
          },
          outcome: "success",
          timestamp: Date.now(),
        });
      }
      if (event === "SIGNED_OUT") {
        sendTraceEvent({
          traceId: crypto.randomUUID(),
          type: "USER_LOGOUT",
          node: "client_1",
          actorId: session?.user?.id ?? "",
          event: "logout",
          outcome: "success",
          timestamp: Date.now(),
        });
      }
    });
    return () => subscription.unsubscribe();
  }, []);


  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-inactive">
        Loading…
      </div>
    );
  }

  return (
    <main className="flex-1 grid grid-cols-[1fr_2fr] min-h-0">
      <div className="flex flex-col border-border border-r min-w-170 min-h-0">
        <ClientArea />
      </div>
      <div className="h-full flex flex-col min-h-0 min-w-230">
        <ObservationArea events={events} onClearEvents={clearEvents} />
      </div>      
    </main>
  );
}
