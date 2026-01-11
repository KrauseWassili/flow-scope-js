import { NextResponse } from "next/server";
import { isEventType } from "@/lib/events/guards/isEventType";
import Redis from "ioredis";
import { eventSchemas } from "@/lib/events/sсhemas";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: 6379,
});

export async function POST(req: Request) {
  const body: unknown = await req.json();

  if (typeof body !== "object" || body === null || !("type" in body)) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const rawType = (body as any).type;

  if (!isEventType(rawType)) {
    return NextResponse.json(
      { error: "Unknown event type" },
      { status: 400 }
    );
  }

  const schema = eventSchemas[rawType];
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(parsed.error.format(), { status: 400 });
  }

  const { traceId, type } = parsed.data;

  /* =========================
     1️⃣ API получил событие
  ========================= */

  await redis.publish(
    "system-events",
    JSON.stringify({
      traceId,
      type,
      stage: "api:received",
      timestamp: Date.now(),
    })
  );

  /* =========================
     2️⃣ API опубликовал в Redis
  ========================= */

  await redis.publish(
    "system-events",
    JSON.stringify({
      traceId,
      type,
      stage: "redis:published",
      timestamp: Date.now(),
      payload: parsed.data,
    })
  );

  return NextResponse.json({ traceId });
}
