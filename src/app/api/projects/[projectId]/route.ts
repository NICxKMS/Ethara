import { requireCurrentUser } from "@/server/auth";
import { empty, handleRoute, json, parseJson, parseRouteId } from "@/server/http";
import { deleteProject, getProject, updateProject } from "@/server/services/projects";
import { updateProjectSchema } from "@/server/validation";

type RouteContext = { params: Promise<{ projectId: string }> };

export const runtime = "nodejs";

async function projectIdFrom(context: RouteContext): Promise<string> {
  return parseRouteId((await context.params).projectId, "projectId");
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  return handleRoute(async () => {
    const user = await requireCurrentUser();
    return json({ project: await getProject(await projectIdFrom(context), user.id) });
  });
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  return handleRoute(async () => {
    const user = await requireCurrentUser();
    const project = await updateProject(await projectIdFrom(context), user.id, await parseJson(request, updateProjectSchema));
    return json({ project });
  });
}

export async function DELETE(_request: Request, context: RouteContext): Promise<Response> {
  return handleRoute(async () => {
    const user = await requireCurrentUser();
    await deleteProject(await projectIdFrom(context), user.id);
    return empty();
  });
}
