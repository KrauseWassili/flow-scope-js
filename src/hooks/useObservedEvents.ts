import { SystemEvent } from "@/lib/events";
import { useState, useMemo } from "react";

export type EventStage =
  | "client:emit"
  | "api:received"
  | "redis:published"
  | "db:stored"
  | "client:received";

export type ObservedEvent = SystemEvent & {
  stages: Partial<Record<EventStage, string>>;
};

export function useObservedEvents() {
  const [observedById, setObservedById] = useState<Record<string, ObservedEvent>>({});

  function upsertDbEvents(dbEvents: SystemEvent[]) {
    setObservedById(prev => {
      const next = { ...prev };
      for (const e of dbEvents) {
        const old = next[e.id];
        next[e.id] = {
          ...e,
          stages: {
            ...(old?.stages ?? {}),
            "db:stored": typeof e.timestamp === "string"
            ? e.timestamp
            : e.timestamp.toISOString(),
          },
        };
      }
      return next;
    });
  }

  function markStage(eventId: string, stage: EventStage, at = new Date().toISOString()) {
    setObservedById(prev => {
      const ev = prev[eventId];
      if (!ev) return prev;
      return {
        ...prev,
        [eventId]: {
          ...ev,
          stages: { ...ev.stages, [stage]: at },
        },
      };
    });
  }

  const observedList = useMemo(
    () => Object.values(observedById).sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1)),
    [observedById]
  );

  return { observedList, upsertDbEvents, markStage };
}
