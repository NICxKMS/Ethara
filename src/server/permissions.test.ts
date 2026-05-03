import { describe, expect, it } from "vitest";
import { makeId } from "@/test/factories";
import {
	canEditTask,
	canManageTask,
	ensureAssigneeIsProjectMember,
	ensureProjectKeepsAdmin,
	ensureProjectOwnerKeepsAdmin,
	requireProjectAdmin,
	requireProjectMember,
} from "./permissions";

const admin = {
	projectId: makeId(1),
	userId: makeId(2),
	role: "admin" as const,
};
const member = {
	projectId: makeId(1),
	userId: makeId(3),
	role: "member" as const,
};

describe("project permissions", () => {
	it("allows members to view but only admins to administer", () => {
		expect(requireProjectMember(member)).toEqual(member);
		expect(requireProjectAdmin(admin)).toEqual(admin);
		expect(() => requireProjectAdmin(member)).toThrow(/admin/i);
		expect(() => requireProjectMember(null)).toThrow(/member/i);

		try {
			requireProjectAdmin(member);
		} catch (error) {
			expect(error).toMatchObject({ status: 403 });
		}
	});

	it("allows task creators to edit safe fields and admins to manage tasks", () => {
		const task = { createdById: member.userId };

		expect(
			canEditTask(member, task, [
				"title",
				"description",
				"status",
				"priority",
				"dueDate",
			]),
		).toBe(true);
		expect(canEditTask(member, task, ["assigneeId"])).toBe(false);
		expect(canEditTask(admin, task, ["assigneeId"])).toBe(true);
		expect(canManageTask(member)).toBe(false);
		expect(canManageTask(admin)).toBe(true);
	});

	it("allows project members to update only task status on tasks they did not create", () => {
		const task = { createdById: admin.userId };

		expect(canEditTask(member, task, ["status"])).toBe(true);
		expect(canEditTask(member, task, ["priority"])).toBe(false);
		expect(canEditTask(member, task, ["dueDate"])).toBe(false);
		expect(canEditTask(member, task, ["assigneeId"])).toBe(false);
		expect(canEditTask(member, task, ["status", "priority"])).toBe(false);
	});

	it("prevents removing or demoting the last admin", () => {
		expect(() =>
			ensureProjectKeepsAdmin([admin], admin.userId, "member"),
		).toThrow(/last admin/i);
		expect(() =>
			ensureProjectKeepsAdmin(
				[admin, { ...member, role: "admin" }],
				admin.userId,
				"member",
			),
		).not.toThrow();
	});

	it("keeps the project owner as an admin", () => {
		expect(() =>
			ensureProjectOwnerKeepsAdmin(admin.userId, admin.userId, "member"),
		).toThrow(/owner/i);
		try {
			ensureProjectOwnerKeepsAdmin(admin.userId, admin.userId, "member");
		} catch (error) {
			expect(error).toMatchObject({ status: 403 });
		}
		expect(() =>
			ensureProjectOwnerKeepsAdmin(admin.userId, admin.userId, "admin"),
		).not.toThrow();
		expect(() =>
			ensureProjectOwnerKeepsAdmin(admin.userId, member.userId, "member"),
		).not.toThrow();
	});

	it("requires assignees to belong to the project", () => {
		expect(() =>
			ensureAssigneeIsProjectMember(makeId(3), [admin, member]),
		).not.toThrow();
		expect(() =>
			ensureAssigneeIsProjectMember(makeId(4), [admin, member]),
		).toThrow(/assignee/i);
		try {
			ensureAssigneeIsProjectMember(makeId(4), [admin, member]);
		} catch (error) {
			expect(error).toMatchObject({ status: 400 });
		}
	});
});
