import { TraceEvent } from "./sсhemas";


function getTraceUrl(): string {
  const isBrowser = typeof window !== "undefined";

  console.log("[TRACE][URL] resolving url", {
    isBrowser,
    hasWindow: typeof window !== "undefined",
    baseEnv: process.env.NEXT_PUBLIC_BASE_URL,
  });

  if (isBrowser) {
    console.log("[TRACE][URL] using browser relative url");
    return "/api/trace";
  }

  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  const url = `${base}/api/trace`;

  console.log("[TRACE][URL] using server absolute url", url);

  return url;
}

export async function sendTraceEvent(event: TraceEvent): Promise<void> {
  /* =========================
     1️⃣ ФАКТ ВХОДА В ФУНКЦИЮ
     ========================= */
  console.log("[TRACE][SEND] ENTER sendTraceEvent", {
    type: event.type,
    traceId: event.traceId,
    node: event.node,
    actorId: event.actorId,
    runtime:
      typeof window !== "undefined"
        ? "browser"
        : "server",
  });

  /* =========================
     2️⃣ РЕЗОЛВ URL
     ========================= */
  let url: string;
  try {
    url = getTraceUrl();
  } catch (err) {
    console.error("[TRACE][SEND] getTraceUrl error", err);
    return;
  }

  /* =========================
     3️⃣ ПЕРЕД FETCH
     ========================= */
  console.log("[TRACE][SEND] BEFORE fetch", {
    url,
    payloadSize: JSON.stringify(event).length,
  });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });

    /* =========================
       4️⃣ ОТВЕТ
       ========================= */
    console.log("[TRACE][SEND] AFTER fetch", {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
    });

    try {
      const text = await res.text();
      console.log("[TRACE][SEND] response body", text);
    } catch {
      console.log("[TRACE][SEND] response body unreadable");
    }
  } catch (err: any) {
    /* =========================
       5️⃣ FETCH ERROR
       ========================= */
    console.error(
      "[TRACE][SEND] FETCH FAILED",
      err?.message ?? err,
      err
    );
  }

  /* =========================
     6️⃣ ВЫХОД ИЗ ФУНКЦИИ
     ========================= */
  console.log("[TRACE][SEND] EXIT sendTraceEvent");
}
