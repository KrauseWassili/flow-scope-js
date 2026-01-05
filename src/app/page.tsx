"use client"

import ControlArea from "@/components/layout/ControlArea";
import ObservationArea from "@/components/layout/ObservationArea";
import { SystemEvent } from "@/lib/events";
import { useState } from "react";

export default function Home() {
  const [events,setEvents] = useState<SystemEvent[]>([]);

  function handleSend() {
    const event: SystemEvent = {
      id: crypto.randomUUID(),
      type: "MESSAGE_SENT",
      from: "User",
      to: "Messenger_Window",
      payload: { text: "Hello from FlowScope" },
      timestamp: new Date(),
    };

    setEvents(prev => [...prev,event]); 
  }
  return (
    <main className="h-screen grid grid-cols-2">
      <ControlArea onSend={handleSend}/>
      <ObservationArea events={events}/>
    </main>
  );
}
