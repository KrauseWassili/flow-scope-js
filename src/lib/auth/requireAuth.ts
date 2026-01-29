import { supabaseServer } from "./supabaseServer";
import { UNAUTHORIZED } from "../http/responses";

export async function requireAuth(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return { error: UNAUTHORIZED };
  }

  const token = authHeader.replace("Bearer ", "");

  const { data, error } = await supabaseServer.auth.getUser(token);

  if (error || !data.user) {
    return { error: UNAUTHORIZED };
  }

  return {
    user: data.user,
    token,
  };
}
