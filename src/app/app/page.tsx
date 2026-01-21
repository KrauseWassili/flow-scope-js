"use client";

import { useEffect } from "react";

import ClientArea from "@/components/client/ClientArea";
import ObservationArea from "@/components/observation/ObservationArea";

import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";

export default function App() {
  const { loading } = useAuth();
  const { events, clearEvents } = useSocket();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-inactive">
        Loading…
      </div>
    );
  }

  return (
    <main className="flex-1 h-full overflow-hidden">
      {/* HORIZONTAL SCROLL WRAPPER */}
      <div className="h-full overflow-x-auto">
        <div className="grid grid-cols-[1fr_2fr] min-w-100 h-full">

          {/* LEFT */}
          <div className="flex flex-col border-border border-r min-w-170 min-h-0 h-full shrink-0 overflow-hidden">
            <ClientArea />
          </div>

          {/* RIGHT */}
          <div className="flex flex-col min-w-230 min-h-0 h-full shrink-0 overflow-hidden">
            <ObservationArea events={events} onClearEvents={clearEvents} />
          </div>

        </div>
      </div>
    </main>
  );
}
