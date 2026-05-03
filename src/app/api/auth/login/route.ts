import { login } from "@/server/auth";
import { handleRoute, json, parseJson } from "@/server/http";
import { loginSchema } from "@/server/validation";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  return handleRoute(async () => json({ user: await login(await parseJson(request, loginSchema)) }));
}
