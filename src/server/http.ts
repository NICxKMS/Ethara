import { ZodError, type ZodSchema } from "zod";
import { routeIdSchema } from "./validation";

const internalErrorMessage = "Something went wrong. Please try again.";

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function badRequest(message: string): never {
  throw new HttpError(400, message);
}

export function unauthorized(message = "Authentication required"): never {
  throw new HttpError(401, message);
}

export function forbidden(message = "Forbidden"): never {
	throw new HttpError(403, message);
}

export function conflict(message: string): never {
	throw new HttpError(409, message);
}

export function notFound(message = "Not found"): never {
	throw new HttpError(404, message);
}

export async function parseJson<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    badRequest(message);
  }

  return schema.parse(body);
}

export function parseRouteId(id: string, label = "id"): string {
  const parsed = routeIdSchema.safeParse(id);
  if (!parsed.success) {
    badRequest(`Invalid ${label}`);
  }

  return parsed.data;
}

export function json(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, init);
}

function formatZodError(error: ZodError): { error: string; fields: Record<string, string[]> } {
  const fields: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "form";
    fields[key] = [...(fields[key] ?? []), issue.message];
  }

  const firstField = Object.keys(fields)[0];
  return {
    error: firstField ? fields[firstField][0] : "Validation failed.",
    fields,
  };
}

export function empty(status = 204): Response {
  return new Response(null, { status });
}

export async function handleRoute(handler: () => Promise<Response>): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof HttpError) {
      return json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return json(formatZodError(error), { status: 400 });
    }

    return json({ error: internalErrorMessage }, { status: 500 });
  }
}
