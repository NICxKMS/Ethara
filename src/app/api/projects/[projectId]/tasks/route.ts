import type { NextRequest } from "next/server";
import { requireCurrentUser } from "@/server/auth";
import { handleRoute, json, parseJson, parseRouteId } from "@/server/http";
import { createTask, listTasks } from "@/server/services/tasks";
import { createTaskSchema, taskFilterSchema } from "@/server/validation";

type RouteContext = { params: Promise<{ projectId: string }> };

export const runtime = "nodejs";

async function projectIdFrom(context: RouteContext): Promise<string> {
  return parseRouteId((await context.params).projectId, "projectId");
}

export async function GET(request: NextRequest, context: RouteContext): Promise<Response> {
  return handleRoute(async () => {
    const user = await requireCurrentUser();
    const filters = taskFilterSchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    return json({ tasks: await listTasks(await projectIdFrom(context), user.id, filters) });
  });
}

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  return handleRoute(async () => {
    const user = await requireCurrentUser();
    const task = await createTask(await projectIdFrom(context), user.id, await parseJson(request, createTaskSchema));
    return json({ task }, { status: 201 });
  });
}
