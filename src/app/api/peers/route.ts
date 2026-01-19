import { NextResponse } from "next/server";
import { loadPeers } from "@/lib/auth/peers";
import { sendTraceEvent } from "@/lib/trace/sendTraceEvent";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const selfId = searchParams.get("selfId");
  const traceId = req.headers.get("x-trace-id") ?? crypto.randomUUID();
  const type = "USER_SELECT";
  const node = "api";



  if (!selfId) {
    sendTraceEvent({
      traceId,
      type,
      node,
      actorId: "undefined",
      outcome: "error",
      error: {
        message: "selfId is required",
      },
      timestamp: Date.now(),
    });
    return NextResponse.json({ error: "selfId is required" }, { status: 400 });
  }

  sendTraceEvent({
    traceId,
    type,
    node,
    actorId: selfId,
    payload: {
      entity: "peers",
    },
    outcome: "success",
    timestamp: Date.now(),
  });

  const users = await loadPeers(selfId, traceId);
  return NextResponse.json(users);
}
