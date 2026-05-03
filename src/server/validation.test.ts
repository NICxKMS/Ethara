import { describe, expect, it } from "vitest";
import { makeId } from "@/test/factories";
import {
	createProjectSchema,
	createTaskSchema,
	emailSchema,
	memberRoleSchema,
	routeIdSchema,
} from "./validation";

describe("api validation", () => {
	it("normalizes email addresses", () => {
		expect(emailSchema.parse("  ADMIN@Ethara.test ")).toBe("admin@ethara.test");
	});

	it("rejects blank project names", () => {
		expect(() => createProjectSchema.parse({ name: "   " })).toThrow();
	});

	it("accepts valid task input and parses due dates", () => {
		const task = createTaskSchema.parse({
			title: "Draft launch board",
			description: "Prepare the first delivery lane",
			status: "todo",
			priority: "high",
			assigneeId: makeId(2),
			dueDate: "2026-05-10T12:00:00.000Z",
		});

		expect(task.dueDate).toBeInstanceOf(Date);
		expect(task.priority).toBe("high");
	});

	it("rejects invalid route ids, roles, and statuses", () => {
		expect(() => routeIdSchema.parse("not-a-uuid")).toThrow();
		expect(() => memberRoleSchema.parse("owner")).toThrow();
		expect(() =>
			createTaskSchema.parse({ title: "x", status: "blocked" }),
		).toThrow();
	});
});
