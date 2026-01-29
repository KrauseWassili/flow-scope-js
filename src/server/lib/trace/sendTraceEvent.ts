import { TraceEvent } from "./sсhemas";


export async function sendTraceEvent(event: TraceEvent): Promise<void> {
  const base = process.env.TRACE_API_BASE_URL;
  if (!base) {
    console.warn("[TRACE] TRACE_API_BASE_URL is not defined");
    return;
  }

  const url = `${base}/api/trace`;
console.log("url:", url)
  try {
  console.log("[TRACE] typeof fetch =", typeof fetch);
  console.log("[TRACE] POST", url);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
    signal: AbortSignal.timeout(2000),
  });

  console.log("[TRACE] response", {
    ok: res.ok,
    status: res.status,
    statusText: res.statusText,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[TRACE] non-OK response body:", text);
  }
} catch (err: any) {
  console.error("[TRACE] fetch failed", {
    name: err?.name,
    message: err?.message,
    cause: err?.cause,
  });
}

}
