import { getAllEvents, insertEvent } from "@/db/events";
import { systemEventSchema } from "@/lib/shemas/systemEvent";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = systemEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const event = await insertEvent(parsed.data);

  return NextResponse.json(event);
}

export async function GET() {
    const events = await getAllEvents();
    return NextResponse.json(events);
}