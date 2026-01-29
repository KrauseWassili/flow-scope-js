import { NextResponse } from "next/server";
import { isEventType } from "@/lib/events/guards/isEventType";
import { eventSchemas } from "@/lib/trace/sсhemas";

const TRACE_INGEST_URL = process.env.TRACE_INGEST_URL;
const TRACE_INGEST_SECRET = process.env.TRACE_INGEST_SECRET;

export async function POST(req: Request) {
  console.log("🔥 [API][TRACE] HIT");
  if (!TRACE_INGEST_URL || !TRACE_INGEST_SECRET) {
    console.error("[API][TRACE] ingest is not configured");
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
    });
  }

  const { traceId, type } = parsed.data;
  console.log("[API][TRACE] forward", traceId, type);

  // 🔒 server → server, with secret
  fetch(TRACE_INGEST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-trace-secret": TRACE_INGEST_SECRET,
    },
    body: JSON.stringify(parsed.data),
    signal: AbortSignal.timeout(2000),
  }).catch((err) => {
    console.error("[API][TRACE] forward failed", err?.message ?? err);
  });

  // best-effort
  return NextResponse.json({ ok: true, traceId });
}
