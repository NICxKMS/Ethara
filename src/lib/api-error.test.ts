import { describe, expect, it } from "vitest";
import { readableApiError } from "./api-error";

describe("readableApiError", () => {
  it("prefers server validation messages", () => {
    expect(readableApiError({ error: "Password must be at least 8 characters.", fields: { password: ["Password must be at least 8 characters."] } })).toBe(
      "Password must be at least 8 characters.",
    );
  });

  it("falls back to a safe message", () => {
    expect(readableApiError({ error: 'Failed query: select "id" from "users"' })).toBe("Something went wrong. Please try again.");
  });
});
