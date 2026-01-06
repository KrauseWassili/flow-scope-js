import { SystemEvent } from "@/lib/events";
import { useEffect, useState } from "react";
import EventFlow from "./EventFlow";

type SystemMapProps = {
  events: SystemEvent[];
  activeEvent: SystemEvent | null;
};

export default function SystemMap({ events, activeEvent }: SystemMapProps) {
  const [activeNodes, setActiveNodes] = useState<String[]>([]);
    

  useEffect(() => {
    if (!activeEvent) return;

    setActiveNodes([activeEvent.from, activeEvent.to]);

    const timer = setTimeout(() => {
      setActiveNodes([]);
    }, 400);

    return () => clearTimeout(timer);
  }, [events.length, activeEvent]);

  if (!activeEvent || activeEvent.type !== "MESSAGE_SENT") {
    return null;
  }

  const isUserActive = activeNodes.includes("User");
  const isMessengerActive = activeNodes.includes("Messenger_Window");
  const direction = activeEvent.from === "User" ? "forward" : "backward";

  return (
    <div className="flex gap-4">
      <div className={isUserActive ? "bg-amber-300" : ""}>
        [{activeEvent.from}]
      </div>

      <EventFlow active={activeNodes.length > 0} direction={direction} />

      <div className={isMessengerActive ? "bg-amber-300" : ""}>
        [{activeEvent.to}]
      </div>
    </div>
  );
}
