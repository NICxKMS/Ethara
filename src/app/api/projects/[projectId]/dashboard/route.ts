import { requireCurrentUser } from "@/server/auth";
import { handleRoute, json, parseRouteId } from "@/server/http";
import { getProjectDashboard } from "@/server/services/dashboard";

type RouteContext = { params: Promise<{ projectId: string }> };

export const runtime = "nodejs";

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  return handleRoute(async () => {
    const user = await requireCurrentUser();
    const projectId = parseRouteId((await context.params).projectId, "projectId");
    return json({ dashboard: await getProjectDashboard(projectId, user.id) });
  });
}
