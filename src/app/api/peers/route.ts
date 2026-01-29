import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { loadPeers } from "@/lib/auth/peers";
import { sendTraceEvent } from "@/lib/trace/sendTraceEvent";
import { requireAuth } from "@/lib/auth/requireAuth";
import { BAD_REQUEST, FORBIDDEN } from "@/lib/http/responses";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const selfId = searchParams.get("selfId");

  const traceId = req.headers.get("x-trace-id") ?? crypto.randomUUID();
  const type = "USER_SELECT";
  const node = "api";

  const auth = await requireAuth(req);

  if ("error" in auth) return auth.error;

  const user = auth.user;

  if (selfId && selfId !== user.id) {
    sendTraceEvent({
      traceId,
      type,
      node,
      actorId: user.id,
      outcome: "error",
      timestamp: Date.now(),
      error: { message: "selfId does not match authenticated user" },
    });

    return FORBIDDEN;
  }

  if (!selfId) {
    sendTraceEvent({
      traceId,
      type,
      node,
      actorId: user.id,
      outcome: "error",
      timestamp: Date.now(),
      error: { message: "selfId is required" },
    });

    return BAD_REQUEST("selfId is required");
  }

  sendTraceEvent({
    traceId,
    type,
    node,
    actorId: user.id,
    payload: { entity: "peers" },
    outcome: "success",
    timestamp: Date.now(),
  });

  const users = await loadPeers(selfId, traceId);

  return NextResponse.json(users);
}
