import { describe, expect, it } from "vitest";
import {
  completionFromSummary,
  findTaskAssignee,
  formatDueDate,
  initialsForName,
  type WorkspaceMember,
} from "./workspace-view-models";

const members: WorkspaceMember[] = [
  {
    id: "member-1",
    userId: "user-1",
    name: "Mira Haddad",
    email: "mira@example.com",
    role: "admin",
    initials: "MH",
    tone: "bg-warm-muted",
    isOwner: true,
  },
];

describe("workspace view models", () => {
  it("does not fall back to the first member for unassigned tasks", () => {
    expect(findTaskAssignee({ assigneeId: null }, members)).toBeNull();
    expect(findTaskAssignee({ assigneeId: "missing-user" }, members)).toBeNull();
  });

  it("calculates completion from real dashboard status totals", () => {
    expect(completionFromSummary({ total: 4, byStatus: { todo: 1, in_progress: 1, done: 2 }, overdue: 0 })).toBe(50);
    expect(completionFromSummary({ total: 0, byStatus: { todo: 0, in_progress: 0, done: 0 }, overdue: 0 })).toBe(0);
  });

  it("formats task due dates without inventing missing dates", () => {
    expect(formatDueDate(null)).toBe("No due date");
    expect(formatDueDate(new Date("2026-05-10T12:00:00Z"))).toBe("May 10, 2026");
  });

  it("builds readable initials from names or emails", () => {
    expect(initialsForName("Mira Haddad", "mira@example.com")).toBe("MH");
    expect(initialsForName("", "noor@example.com")).toBe("NO");
  });
});
