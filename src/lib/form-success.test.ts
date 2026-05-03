import { describe, expect, it } from "vitest";
import { successMessageForMode, successRedirectForMode } from "./form-success";

describe("form success behavior", () => {
  it("routes auth forms to the dashboard", () => {
    expect(successRedirectForMode("signup")).toBe("/dashboard");
    expect(successRedirectForMode("login")).toBe("/dashboard");
  });

  it("keeps non-auth forms on the current surface", () => {
    expect(successRedirectForMode("project")).toBeNull();
    expect(successRedirectForMode("task")).toBeNull();
  });

  it("uses user-facing auth success messages", () => {
    expect(successMessageForMode("signup")).toBe("Account created. Opening your dashboard...");
    expect(successMessageForMode("login")).toBe("Logged in. Opening your dashboard...");
  });
});
