import { TraceEvent } from "./sсhemas";

/**
 * Универсальная отправка trace-событий:
 * - browser → sendBeacon (best-effort, не дропается)
 * - server  → fetch (Node / API / Docker)
 */
export function sendTraceEvent(event: TraceEvent): void {
  /* =========================
     🟢 BROWSER
     ========================= */
  if (typeof window !== "undefined") {
    try {
      const ok = navigator.sendBeacon(
        "/api/trace",
        new Blob([JSON.stringify(event)], {
          type: "application/json",
        })
      );

      if (!ok) {
        console.warn("[TRACE] sendBeacon rejected payload", event);
      }
    } catch (err) {
      console.error("[TRACE] sendBeacon error", err, event);
    }

    return;
  }

  /* =========================
     🟢 SERVER (Node / API / Docker)
     ========================= */
  const url =
    process.env.TRACE_API_URL ||
    "http://localhost:3000/api/trace";

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  }).catch((err) => {
    console.error("[TRACE] server fetch failed", err, event);
  });
}
