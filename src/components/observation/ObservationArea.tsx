import { useState } from "react";
import TraceTimeline from "./TraceTimeline";
import { SystemMap } from "./SystemMap";
import { PlaybackPanel } from "./PlaybackPanel";
import { EventInspector } from "./EventInspector";
import { TraceEvent } from "@/lib/trace/sсhemas";
import { useReplay } from "@/hooks/useReplay";
import KeyboardControls from "../keyboard/KeyboardControls";

type ObservationAreaProps = {
  events: TraceEvent[];
  onClearEvents: () => void;
};

export default function ObservationArea({
  events,
  onClearEvents,
}: ObservationAreaProps) {
  const replay = useReplay(events);

  const currentTraceId =
    replay.mode === "replay"
      ? replay.activeEvent?.traceId
      : events.length > 0
      ? events[events.length - 1].traceId
      : null;

  const eventsForCurrentTrace = currentTraceId
    ? events.filter((e) => e.traceId === currentTraceId)
    : [];

  const [inspectedEvent, setInspectedEvent] = useState<{
    event: TraceEvent;
    node: string;
  } | null>(null);

  return (
    <div className="flex flex-col h-full min-h-0">
      <PlaybackPanel
        mode={replay.mode}
        isPlaying={replay.isPlaying}
        replayIndex={replay.index}
        speed={replay.speed}
        controls={replay.controls}
        clearEvents={onClearEvents}
      />
      <SystemMap
        mode={replay.mode}
        events={eventsForCurrentTrace}
        activeNode={
          replay.mode === "replay"
            ? replay.activeEvent?.node ?? null
            : undefined
        }
        onNodeClick={({ traceId, node }) => {
          const e = events
            .filter((e) => e.traceId === traceId && e.node === node)
            .at(-1);
          if (e) {
            setInspectedEvent({ event: e, node });
          }
        }}
      />
      <div className="flex-1 min-h-0 grid grid-cols-2">
        <div className="flex flex-col min-h-0 min-w-0 border-border border-r ">
          <TraceTimeline
            events={events}
            mode={replay.mode}
            activeEvent={replay.activeEvent}
            onJumpToTrace={replay.jumpToTrace}
            onSelectEvent={(event) =>
              setInspectedEvent({
                event,
                node: event.node!,
              })
            }
          />
        </div>

        <div className="flex flex-col min-w-0 min-h-0 border-border border-r">
          <EventInspector
            event={inspectedEvent?.event ?? null}
            node={inspectedEvent?.node ?? null}
          />
        </div>
      </div>
      <KeyboardControls
        mode={replay.mode}
        isPlaying={replay.isPlaying}
        replaySpeed={replay.speed}
        activeEvent={replay.activeEvent}
        controls={replay.controls}
      />
    </div>
  );
}
