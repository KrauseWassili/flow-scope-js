import { SystemEvent } from "@/lib/events";

type EventTimelineProps = {
  events: SystemEvent[];
};

export default function EventTimeline({ events }: EventTimelineProps) {
  function getFormattedDate(date: Date) {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  }

  function getTimeString(date: Date) {
    return date.toLocaleTimeString()
  }
  
  return (
    <div>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <p>[{getFormattedDate(event.timestamp)}, {getTimeString(event.timestamp)}]</p>
            <p>{event.type}</p>
            <p>
              {event.from} → {event.to}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
