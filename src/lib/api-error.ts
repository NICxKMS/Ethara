type ErrorPayload = {
  error?: unknown;
  fields?: unknown;
};

const fallbackError = "Something went wrong. Please try again.";

function isUnsafeError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("failed query") || lower.includes("params:") || lower.includes("select ") || lower.includes("insert ");
}

export function readableApiError(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return fallbackError;
  }

  const { error } = payload as ErrorPayload;
  if (typeof error !== "string" || error.trim().length === 0 || isUnsafeError(error)) {
    return fallbackError;
  }

  return error;
}
