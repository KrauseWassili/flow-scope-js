import { EventSource, SystemEvent, SystemEventInput } from "./systemEvent.type";

type Listener = (event: SystemEvent) => void;

const listeners: Listener[] = [];

export function emitSystemEvent(input: SystemEventInput) {
  const event: SystemEvent = {
    id: crypto.randomUUID(),
    traceId: input.traceId,
    type: input.type,
    stage: input.stage,
    source: detectSource(),
    timestamp: Date.now(),
    payload: input.payload,
  };

  console.log("[emitSystemEvent]", input.stage, "listeners:", listeners.length);

  listeners.forEach((cb) => cb(event));
}

function detectSource(): EventSource {
  if (typeof window !== "undefined") return "client";
  return "api";
}

export function onSystemEvent(fn: Listener) {
  console.log("[onSystemEvent] register listener");

  listeners.push(fn);
}
