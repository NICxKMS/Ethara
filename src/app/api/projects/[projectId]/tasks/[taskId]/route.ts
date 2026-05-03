import { requireCurrentUser } from "@/server/auth";
import { empty, handleRoute, json, parseJson, parseRouteId } from "@/server/http";
import { deleteTask, getTask, updateTask } from "@/server/services/tasks";
import { updateTaskSchema } from "@/server/validation";

type RouteContext = { params: Promise<{ projectId: string; taskId: string }> };

export const runtime = "nodejs";

async function idsFrom(context: RouteContext): Promise<{ projectId: string; taskId: string }> {
  const params = await context.params;
  return {
    projectId: parseRouteId(params.projectId, "projectId"),
    taskId: parseRouteId(params.taskId, "taskId"),
  };
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  return handleRoute(async () => {
    const user = await requireCurrentUser();
    const ids = await idsFrom(context);
    return json({ task: await getTask(ids.projectId, ids.taskId, user.id) });
  });
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  return handleRoute(async () => {
    const user = await requireCurrentUser();
    const ids = await idsFrom(context);
    const task = await updateTask(ids.projectId, ids.taskId, user.id, await parseJson(request, updateTaskSchema));
    return json({ task });
  });
}

export async function DELETE(_request: Request, context: RouteContext): Promise<Response> {
  return handleRoute(async () => {
    const user = await requireCurrentUser();
    const ids = await idsFrom(context);
    await deleteTask(ids.projectId, ids.taskId, user.id);
    return empty();
  });
}
