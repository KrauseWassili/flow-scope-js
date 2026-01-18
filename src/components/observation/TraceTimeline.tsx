import { cn } from "@/lib/utils/cn";
import { formatTimeMs } from "@/lib/utils/formatTimeMs";
import { SYSTEM_NODES } from "@/lib/events/nodes/systemNodes";
import { TraceEvent } from "@/lib/trace/sсhemas";
import { useEffect, useRef } from "react";

type TraceTimelineProps = {
  events: TraceEvent[];
  mode: "live" | "replay";
  activeEvent: TraceEvent | null;
  onJumpToTrace: (traceId: string) => void;
  onSelectEvent: (event: TraceEvent) => void;
};

function getLampStates(events: TraceEvent[]) {
  const state: Record<
    string,
    {
      wasActive: boolean;
      lastOutcome?: string;
      lastTimestamp?: number;
      hadError?: boolean;
    }
  > = {};

  for (const event of events) {
    if (!event.node || typeof event.timestamp !== "number") continue;

    const prev = state[event.node] || { wasActive: false, hadError: false };

    state[event.node] = {
      wasActive: true,
      lastOutcome: event.outcome ?? prev.lastOutcome,
      lastTimestamp: event.timestamp ?? prev.lastTimestamp,
      hadError: prev.hadError || event.outcome === "error",
    };
  }

  return state;
}

function getLastEventForNode(
  events: TraceEvent[],
  node: string
): TraceEvent | undefined {
  return [...events].reverse().find((e) => e.node === node);
}

type PipelineRailProps = {
  events: TraceEvent[];
  activeNode?: string | null;
  onEventClick?: (event: TraceEvent) => void;
};

function PipelineRail({
  events,
  activeNode,
  onEventClick,
}: PipelineRailProps) {
  const nodeState = getLampStates(events);

  return (
    <div className="flex items-end gap-6 min-h-14">
      {SYSTEM_NODES.map((node) => {
        const s = nodeState[node];
        const isActive = s?.wasActive;

        let colorClass = "bg-inactive";
        if (s?.hadError) colorClass = "bg-error";
        else if (isActive) colorClass = "bg-success";

        const isActiveLamp = activeNode === node;
        const eventForNode = getLastEventForNode(events, node);

        return (
          <div key={node} className="flex flex-col items-center min-w-16">
            <span
              style={{ textShadow: "-1px 1px 1px rgba(0,0,0,0.15)" }}
              className="text-[10px] text-title mb-1"
            >
              {node.toUpperCase()}
            </span>

            <span
              onClick={(e) => {
                e.stopPropagation();
                if (eventForNode) {
                  onEventClick?.(eventForNode);
                }
              }}
              className={cn(
                "w-4 h-4 rounded-full transition-all cursor-pointer",
                colorClass,
                "shadow-[-2px_2px_1px_rgba(0,0,0,0.45)]",
                isActiveLamp &&
                  "ring-2 ring-marked scale-110 " +
                    "shadow-[0_0_0_2px_rgba(255,0,0,1),0_2px_4px_rgba(0,0,0,0.4)]"
              )}
            />

            <span
              style={{ textShadow: "-1px 1px 1px rgba(0,0,0,0.15)" }}
              className="text-[10px] text-value min-h-4 mt-1"
            >
              {s?.lastTimestamp ? formatTimeMs(s.lastTimestamp) : "–"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function TraceTimeline({
  events,
  mode,
  activeEvent,
  onJumpToTrace,
  onSelectEvent,
}: TraceTimelineProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode !== "live") return;

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [events.length, mode]);

  const eventsByTrace = events.reduce<Record<string, TraceEvent[]>>(
    (acc, e) => {
      acc[e.traceId] ??= [];
      acc[e.traceId].push(e);
      return acc;
    },
    {}
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex justify-center px-2 text-sm font-semibold p-3 border-b border-border shrink-0 bg-panel">
        TRACE TIMELINE
      </div>

      {events.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs opacity-50">
          No events
        </div>
      ) : (
        <div className="flex-1 min-h-0 min-w-0 overflow-auto">
          <ul className="divide-y divide-border">
            {Object.entries(eventsByTrace).map(([traceId, traceEvents]) => {
              const isActiveRow =
                mode === "replay" && activeEvent?.traceId === traceId;

              const activeNode = isActiveRow
                ? activeEvent?.node ?? null
                : null;

              return (
                <li
                  key={traceId}
                  className={cn(
                    "px-2 py-2 transition-colors min-w-0",
                    mode === "replay" && "cursor-pointer hover:bg-amber-100",
                    isActiveRow && "bg-amber-200"
                  )}
                  onClick={() => {
                    if (mode === "replay") {
                      onJumpToTrace(traceId);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-xs text-title">
                      {traceId}
                    </span>
                    <span className="text-xs font-semibold text-value">
                      {traceEvents[0]?.type}
                    </span>
                  </div>

                  <PipelineRail
                    events={traceEvents}
                    activeNode={activeNode}
                    onEventClick={onSelectEvent}
                  />
                </li>
              );
            })}

            <div className="h-8" ref={bottomRef} />
          </ul>
        </div>
      )}
    </div>
  );
}
