import { describe, expect, it } from "vitest";
import { z } from "zod";
import { conflict, handleRoute, parseJson } from "./http";
import { signupSchema } from "./validation";

describe("route error handling", () => {
  it("does not expose internal database query errors", async () => {
    const response = await handleRoute(async () => {
      throw new Error('Failed query: select "id" from "users" where "users"."email" = $1 limit $2\nparams: krahul9231@gmail.com,1');
    });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Something went wrong. Please try again." });
  });

  it("returns readable field validation messages", async () => {
    const request = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name: "Rahul", email: "krahul9231@gmail.com", password: "123" }),
    });

    const response = await handleRoute(async () => Response.json(await parseJson(request, signupSchema)));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Password must be at least 8 characters.",
      fields: { password: ["Password must be at least 8 characters."] },
    });
  });

  it("keeps explicit http errors unchanged", async () => {
    const response = await handleRoute(async () => {
      z.never().parse("not-never");
      return Response.json({ ok: true });
    });

    expect(response.status).toBe(400);
  });

  it("returns explicit conflict errors to users", async () => {
    const response = await handleRoute(async () => {
      conflict("Email is already registered.");
    });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: "Email is already registered." });
  });
});
