import { TraceEvent } from "./sсhemas";

export async function sendTraceEvent(
  event: TraceEvent
): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  console.log("sendTraceEvent payload:", event);

  await fetch("/api/trace", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
    keepalive: true,
  });
}
