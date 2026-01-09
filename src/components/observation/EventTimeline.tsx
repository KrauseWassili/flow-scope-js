import { SystemEvent } from "@/lib/events";
import { Marker } from "@/lib/Markers";
import { cn } from "@/lib/utils";

type EventTimelineProps = {
  events: SystemEvent[];
  activeEvent: SystemEvent | null;
  mode: "live" | "replay";
  markers: Marker[];
  onJumpToEvent: (eventId: string) => void;
};

const STAGES = [
  "client:emit",
  "api:received",
  "redis:published",
  "db:stored",
  "client:received",
] as const;


const STAGE_LABELS: Record<typeof STAGES[number], string> = {
  "client:emit": "Emit",
  "api:received": "API",
  "redis:published": "Redis",
  "db:stored": "DB",
  "client:received": "Recv",
};


function PipelineRail({ event }: { event: any }) {
  return (
    <div className="flex items-end gap-2 min-h-[40px]">
      {STAGES.map((stage, i) => {
        const time = event.stages?.[stage];
        return (
          <div key={stage} className="flex flex-col items-center min-w-[40px]">
            <span className="text-[10px] text-gray-400 mb-0.5">
              {STAGE_LABELS[stage]}
            </span>
            <span
              className={`w-2 h-2 rounded-full mb-0.5 transition-colors ${
                time ? "bg-emerald-500" : "bg-gray-300"
              }`}
              title={stage + (time ? `: ${new Date(time).toLocaleString()}` : "")}
            />
            <span className="text-[10px] text-gray-500 min-h-[12px]">
              {time ? new Date(time).toLocaleTimeString([], { hour12: false }) : "–"}
            </span>
          </div>
        );
      })}
    </div>
  );
}


export default function EventTimeline({
  events,
  activeEvent,
  mode,
  markers,
  onJumpToEvent,
}: EventTimelineProps) {
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
      <ul className="overflow-auto max-h-full">
        {events.map((event) => {
          const isActive = mode === "replay" && event.id === activeEvent?.id;
          const isMarked = markers.some((m) => m.eventId === event.id);
          return (
            <li
              key={event.id}
              className={cn(
                isMarked &&
                  mode === "replay" &&
                  "cursor-pointer hover:bg-amber-100",
                isActive && "bg-amber-200",
                isMarked && "border-l-4 border-amber-500"
              )}
              onClick={() => {
                if (isMarked && mode == "replay") {
                  onJumpToEvent(event.id);
                }
              }}
            >
                <PipelineRail event={event} />
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
  );
}
