import { requireCurrentUser } from "@/server/auth";
import { handleRoute, json } from "@/server/http";
import { getUserDashboard } from "@/server/services/dashboard";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  return handleRoute(async () => {
    const user = await requireCurrentUser();
    return json({ dashboard: await getUserDashboard(user.id) });
  });
}
