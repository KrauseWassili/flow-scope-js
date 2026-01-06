import { SystemEvent } from "@/lib/events";

type EventTimelineProps = {
  events: SystemEvent[];
  activeEvent: SystemEvent | null;
  mode: "live" | "replay";
};

export default function EventTimeline({ events, activeEvent, mode }: EventTimelineProps) {
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
          return (
            <li key={event.id} className={isActive ? "bg-amber-200" : ""}>
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
