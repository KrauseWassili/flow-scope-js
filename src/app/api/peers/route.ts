import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { loadPeers } from "@/lib/auth/peers";
import { sendTraceEvent } from "@/lib/trace/sendTraceEvent";

// Server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // selfId is expected to represent the current user
  const selfId = searchParams.get("selfId");

  // Trace metadata
  const traceId = req.headers.get("x-trace-id") ?? crypto.randomUUID();
  const type = "USER_SELECT";
  const node = "api";

  // --- Authentication ------------------------------------------------------

  const authHeader = req.headers.get("authorization");

  // Authorization header is required for this endpoint
  if (!authHeader?.startsWith("Bearer ")) {
    sendTraceEvent({
      traceId,
      type,
      node,
      actorId: selfId ?? "anonymous",
      outcome: "error",
      error: { message: "Missing authorization token" },
      timestamp: Date.now(),
    });

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");

  // Validate access token via Supabase
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    sendTraceEvent({
      traceId,
      type,
      node,
      actorId: selfId ?? "anonymous",
      outcome: "error",
      error: { message: "Invalid auth token" },
      timestamp: Date.now(),
    });

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = data.user;

  // Optional consistency check:
  // ensure that selfId matches the authenticated user
  if (selfId && selfId !== user.id) {
    sendTraceEvent({
      traceId,
      type,
      node,
      actorId: user.id,
      outcome: "error",
      error: { message: "selfId does not match authenticated user" },
      timestamp: Date.now(),
    });

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // --- Validation ----------------------------------------------------------

  if (!selfId) {
    sendTraceEvent({
      traceId,
      type,
      node,
      actorId: user.id,
      outcome: "error",
      error: { message: "selfId is required" },
      timestamp: Date.now(),
    });

    return NextResponse.json({ error: "selfId is required" }, { status: 400 });
  }

  // --- Business logic ------------------------------------------------------

  sendTraceEvent({
    traceId,
    type,
    node,
    actorId: user.id,
    payload: {
      entity: "peers",
    },
    outcome: "success",
    timestamp: Date.now(),
  });

  const users = await loadPeers(selfId, traceId);

  return NextResponse.json(users);
}
