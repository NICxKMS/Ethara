import { requireCurrentUser } from "@/server/auth";
import { empty, handleRoute, json, parseJson, parseRouteId } from "@/server/http";
import { removeMember, updateMemberRole } from "@/server/services/members";
import { updateMemberSchema } from "@/server/validation";

type RouteContext = { params: Promise<{ projectId: string; userId: string }> };

export const runtime = "nodejs";

async function idsFrom(context: RouteContext): Promise<{ projectId: string; userId: string }> {
  const params = await context.params;
  return {
    projectId: parseRouteId(params.projectId, "projectId"),
    userId: parseRouteId(params.userId, "userId"),
  };
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  return handleRoute(async () => {
    const user = await requireCurrentUser();
    const ids = await idsFrom(context);
    const member = await updateMemberRole(ids.projectId, ids.userId, user.id, await parseJson(request, updateMemberSchema));
    return json({ member });
  });
}

export async function DELETE(_request: Request, context: RouteContext): Promise<Response> {
  return handleRoute(async () => {
    const user = await requireCurrentUser();
    const ids = await idsFrom(context);
    await removeMember(ids.projectId, ids.userId, user.id);
    return empty();
  });
}
