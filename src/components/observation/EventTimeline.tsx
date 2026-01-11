import { Marker } from "@/lib/markers";
import { cn } from "@/lib/utils";
import { ObservedEvent } from "@/lib/events/observed/observedEvent.types";
import { EVENT_PIPELINES } from "@/lib/events/pipelines/eventPipelines";
import { STAGE_LABELS } from "@/lib/events/ui/eventTimelineConfig";
import { EventStage } from "@/lib/events/stages/eventStages";

type EventTimelineProps = {
  events: ObservedEvent[];
  activeEvent: ObservedEvent | null;
  mode: "live" | "replay";
  markers: Marker[];
  onJumpToEvent: (traceId: string) => void;
};

function getEventTime(event: ObservedEvent): Date | null {
  const times = Object.values(event.stages);
  if (times.length === 0) return null;
  return new Date(Math.min(...times));
}

function PipelineRail({ event }: { event: ObservedEvent }) {
  const pipeline = EVENT_PIPELINES[event.type];

  console.log("PIPELINE", pipeline);
  console.log("STAGES", event.stages);

  if (!pipeline) {
    return (
      <div className="text-xs text-red-500">
        Unknown pipeline: {event.type}
      </div>
    );
  }
  return (
    <div className="flex items-end gap-2 min-h-[40px]">
      {pipeline.map((stage: EventStage) => {
        const time = event.stages[stage];

        return (
          <div key={stage} className="flex flex-col items-center min-w-[40px]">
            <span className="text-[10px] text-gray-400 mb-0.5">
              {STAGE_LABELS[stage]}
            </span>

            <span
              className={cn(
                "w-2 h-2 rounded-full mb-0.5",
                time ? "bg-emerald-500" : "bg-gray-300"
              )}
            />

            <span className="text-[10px] text-gray-500 min-h-[12px]">
              {time
                ? new Date(time).toLocaleTimeString([], { hour12: false })
                : "–"}
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
  return (
    <ul className="overflow-auto max-h-full">
      {events.map(event => {
        const isActive =
          mode === "replay" && event.traceId === activeEvent?.traceId;
        const isMarked = markers.some(m => m.eventId === event.traceId);
        const time = getEventTime(event);

        return (
          <li
            key={event.traceId}
            className={cn(
              isMarked && mode === "replay" && "cursor-pointer hover:bg-amber-100",
              isActive && "bg-amber-200",
              isMarked && "border-l-4 border-amber-500"
            )}
            onClick={() => {
              if (isMarked && mode === "replay") {
                onJumpToEvent(event.traceId);
              }
            }}
          >
            <PipelineRail event={event} />

            {time && (
              <p className="text-xs text-gray-600">
                [{time.toLocaleString()}]
              </p>
            )}

            <p className="font-mono text-sm">{event.type}</p>

            <p className="text-xs text-gray-500">
              {Object.keys(event.stages).join(" → ")}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
