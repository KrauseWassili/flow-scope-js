import Redis from "ioredis";
const redis = new Redis();

export async function GET() {
  const msgs = await redis.xrange("messages", "-", "+");
  return Response.json(msgs);
}
