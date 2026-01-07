import { SystemEvent } from "@/lib/events";
import { Marker } from "@/lib/Markers";
import { cn } from "@/lib/utils";

type EventTimelineProps = {
  events: SystemEvent[];
  activeEvent: SystemEvent | null;
  mode: "live" | "replay";
  markers: Marker[];
};

export default function EventTimeline({ events, activeEvent, mode, markers }: EventTimelineProps) {
  function getFormattedDate(date: Date) {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  }

  function getTimeString(date: Date) {
    return date.toLocaleTimeString();
  }

  return (
    <div>
      <ul>
        {events.map((event) => {
            const isActive = mode === "replay" && event.id === activeEvent?.id; 
            const isMarked = markers.some((m) => m.eventId === event.id)
          return (
            <li key={event.id} className={cn(isActive && "bg-amber-200", isMarked && "border-l-4 border-amber-500")}>
              <p>
                [{getFormattedDate(event.timestamp)},{" "}
                {getTimeString(event.timestamp)}]
              </p>
              <p>{event.type}</p>
              <p>
                {event.from} → {event.to}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
