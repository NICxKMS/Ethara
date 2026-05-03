import { logout } from "@/server/auth";
import { empty, handleRoute } from "@/server/http";

export const runtime = "nodejs";

export async function POST(): Promise<Response> {
  return handleRoute(async () => {
    await logout();
    return empty();
  });
}
