import { useSocket } from "@/context/SocketContext";
import { ObservedEvent } from "@/lib/events/observed/observedEvent.types";
import {
  onSystemEvent,
  emitSystemEvent,
} from "@/lib/events/system/emitSystemEvent";
import { SystemEvent } from "@/lib/events/system/systemEvent.type";
import { useEffect, useMemo, useState } from "react";

export function useObservedEvents() {
  const { socket } = useSocket();
  const [systemEvents, setSystemEvents] = useState<SystemEvent[]>([]);

  /* =========================
     CLIENT system events
     (emitSystemEvent)
  ========================= */

  useEffect(() => {
    const handler = (event: SystemEvent) => {
      console.log("[UI][client] system:event", event);
      setSystemEvents((prev) => [...prev, event]);
    };

    onSystemEvent(handler);

    // offSystemEvent пока не нужен
    return () => {};
  }, []);

  /* =========================
     SERVER system events
     (socket.io)
  ========================= */

  useEffect(() => {
    if (!socket) return;

    const handler = (event: SystemEvent) => {
      console.log("[UI][server] system:event", event);

      // 1️⃣ сохранить серверный stage
      setSystemEvents((prev) => [...prev, event]);

      // 2️⃣ зафиксировать факт получения клиентом
      // ТОЛЬКО после ws:emitted
      if (event.stage === "ws:emitted") {
        emitSystemEvent({
          traceId: event.traceId,
          type: event.type,
          stage: "client:received",
        });
      }
    };

    socket.on("system:event", handler);

    return () => {
      socket.off("system:event", handler);
    };
  }, [socket]);

  /* =========================
     Build ObservedEvent list
  ========================= */

  const observedList = useMemo(() => {
    const map = new Map<string, ObservedEvent>();

    for (const e of systemEvents) {
      if (!map.has(e.traceId)) {
        map.set(e.traceId, {
          traceId: e.traceId,
          type: e.type,
          stages: {},
        });
      }

      map.get(e.traceId)!.stages[e.stage] = e.timestamp;
    }

    return Array.from(map.values());
  }, [systemEvents]);

  return { observedList };
}
