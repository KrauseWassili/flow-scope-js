import { TraceEvent } from "./sсhemas";

function resolveTraceUrl(): string {
  // 🟢 Browser
  if (typeof window !== "undefined") {
    return "/api/trace";
  }

  // 🟢 Server (Next / Node / Docker)
  const base =
    process.env.TRACE_API_BASE_URL || 
    process.env.NEXT_PUBLIC_BASE_URL || // fallback
    "http://localhost:3000";

  return `${base}/api/trace`;
}

export function sendTraceEvent(event: TraceEvent): void {
  const url = resolveTraceUrl();

 
  console.log("[TRACE][SEND]", {
    runtime: typeof window !== "undefined" ? "browser" : "server",
    url,
    type: event.type,
    traceId: event.traceId,
  });

  // 🟢 Browser — sendBeacon
  if (typeof window !== "undefined") {
    try {
      navigator.sendBeacon(
        url,
        new Blob([JSON.stringify(event)], {
          type: "application/json",
        })
      );
    } catch (err) {
      console.error("[TRACE] sendBeacon error", err);
    }
    return;
  }

  // 🟢 Server — fetch (absolute URL!)
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  }).catch((err) => {
    console.error("[TRACE] server fetch failed", err);
  });
}
