import { EventType } from "./sсhemas";


export async function emitEvent<T extends EventType>(
  event: { traceId: string; type: T } & Record<string, any>
) {
  await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
}

