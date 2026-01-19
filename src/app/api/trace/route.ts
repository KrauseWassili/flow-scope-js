import { NextResponse } from "next/server";
import { isEventType } from "@/lib/events/guards/isEventType";
import { eventSchemas } from "@/lib/trace/sсhemas";

const WS_SERVER_URL = process.env.WS_SERVER_URL;

export async function POST(req: Request) {
  if (!WS_SERVER_URL) {
    console.error("[API][TRACE] WS_SERVER_URL is not defined");
    return NextResponse.json({ ok: false, reason: "trace_disabled" });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid_json" });
  }

  if (typeof body !== "object" || body === null || !("type" in body)) {
    return NextResponse.json({ ok: false, reason: "invalid_body" });
  }

  const rawType = (body as any).type;
  if (!isEventType(rawType)) {
    return NextResponse.json({ ok: false, reason: "unknown_event_type" });
  }

  const schema = eventSchemas[rawType];
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({
      ok: false,
      reason: "schema_validation_failed",
      details: parsed.error.format(),
    });
  }

  const { traceId, type } = parsed.data;
  console.log("[API][TRACE INGEST]:", traceId, type);

  console.log("[API][TRACE] forwarding to:", `${WS_SERVER_URL}/trace`);

  console.log("[API][TRACE] will forward trace", {
    traceId,
    type,
  });

  // 🔥 FIRE-AND-FORGET (КЛЮЧЕВОЕ ИЗМЕНЕНИЕ)
  fetch(`${WS_SERVER_URL}/trace`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
    signal: AbortSignal.timeout(2000),
  }).catch((err) => {
    console.error("[API][TRACE FORWARD ERROR]", err?.message ?? err);
  });

  // ⬅️ МГНОВЕННЫЙ ОТВЕТ
  return NextResponse.json({ ok: true, traceId });
}
