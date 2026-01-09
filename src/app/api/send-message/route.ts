import Redis from "ioredis";

const redis = new Redis();

export async function POST(req: Request) {
  const { from, to, text } = await req.json();

  if (!from || !to || !text) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
  }

  const id = await redis.xadd("messages", "*", "from", from, "to", to, "text", text, "timestamp", new Date().toISOString());

  return Response.json({ id });
}
