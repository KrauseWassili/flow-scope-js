import { TraceEvent } from "./sсhemas";


export function sendTraceEvent(event: TraceEvent): void {
  /* =========================
     🟢 BROWSER + sendBeacon
     ========================= */
  if (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    typeof navigator.sendBeacon === "function"
  ) {
    try {
      const ok = navigator.sendBeacon(
        "/api/trace",
        new Blob([JSON.stringify(event)], {
          type: "application/json",
        })
      );

      if (ok) {
        return; 
      }

      console.warn("[TRACE] sendBeacon returned false, fallback to fetch", event);
    } catch (err) {
      console.error("[TRACE] sendBeacon threw error, fallback to fetch", err, event);
    }
  }

  /* =========================
     🟡 FALLBACK: fetch
     ========================= */
  try {
    fetch("/api/trace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      keepalive: true,
    }).catch((err) => {
      console.error("[TRACE] fetch fallback failed", err, event);
    });
  } catch (err) {
    console.error("[TRACE] fetch invocation failed", err, event);
  }
}
