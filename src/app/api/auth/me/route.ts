import { getCurrentUser } from "@/server/auth";
import { handleRoute, json } from "@/server/http";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  return handleRoute(async () => json({ user: await getCurrentUser() }));
}
