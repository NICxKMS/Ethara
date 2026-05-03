import { signup } from "@/server/auth";
import { handleRoute, json, parseJson } from "@/server/http";
import { signupSchema } from "@/server/validation";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  return handleRoute(async () => json({ user: await signup(await parseJson(request, signupSchema)) }, { status: 201 }));
}
