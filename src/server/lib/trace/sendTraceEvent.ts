import { TraceEvent } from "./sсhemas";


const TRACE_API_URL =
  process.env.TRACE_API_URL ||
  "http://ws-server:4001/trace";

export async function sendTraceEvent(
  event: TraceEvent
): Promise<void> {
  if (!TRACE_API_URL) {
    console.warn("[TRACE] TRACE_API_URL is not defined");
    return;
  }

  try {
    await fetch(TRACE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
  } catch (err: any) {
    console.error(
      "[TRACE] sendTraceEvent failed",
      err?.message ?? err
    );
  }
}
