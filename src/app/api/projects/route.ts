import { requireCurrentUser } from "@/server/auth";
import { handleRoute, json, parseJson } from "@/server/http";
import { createProject, listProjects } from "@/server/services/projects";
import { createProjectSchema } from "@/server/validation";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  return handleRoute(async () => {
    const user = await requireCurrentUser();
    return json({ projects: await listProjects(user.id) });
  });
}

export async function POST(request: Request): Promise<Response> {
  return handleRoute(async () => {
    const user = await requireCurrentUser();
    const project = await createProject(user.id, await parseJson(request, createProjectSchema));
    return json({ project }, { status: 201 });
  });
}
