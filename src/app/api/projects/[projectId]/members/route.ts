import { requireCurrentUser } from "@/server/auth";
import { handleRoute, json, parseJson, parseRouteId } from "@/server/http";
import { addMember, listMembers } from "@/server/services/members";
import { addMemberSchema } from "@/server/validation";

type RouteContext = { params: Promise<{ projectId: string }> };

export const runtime = "nodejs";

async function projectIdFrom(context: RouteContext): Promise<string> {
  return parseRouteId((await context.params).projectId, "projectId");
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  return handleRoute(async () => {
    const user = await requireCurrentUser();
    return json({ members: await listMembers(await projectIdFrom(context), user.id) });
  });
}

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  return handleRoute(async () => {
    const user = await requireCurrentUser();
    const member = await addMember(await projectIdFrom(context), user.id, await parseJson(request, addMemberSchema));
    return json({ member }, { status: 201 });
  });
}
