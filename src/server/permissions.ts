import { badRequest, forbidden } from "./http";
import type { MemberRole } from "./validation";

export type ProjectMembership = {
	projectId: string;
	userId: string;
	role: MemberRole;
};

export type TaskOwnership = {
	createdById: string;
};

const creatorEditableTaskFields = new Set([
	"title",
	"description",
	"status",
	"priority",
	"dueDate",
]);
const memberStatusFields = new Set(["status"]);

export function requireProjectMember<T extends ProjectMembership>(
	membership: T | null | undefined,
): T {
	if (!membership) {
		forbidden("Project member access is required");
	}

	return membership;
}

export function requireProjectAdmin<T extends ProjectMembership>(
	membership: T | null | undefined,
): T {
	const existingMembership = requireProjectMember(membership);
	if (existingMembership.role !== "admin") {
		forbidden("Project admin access is required");
	}

	return existingMembership;
}

export function canManageTask(membership: ProjectMembership): boolean {
	return membership.role === "admin";
}

export function canEditTask(
	membership: ProjectMembership,
	task: TaskOwnership,
	fields: string[],
): boolean {
	if (canManageTask(membership)) {
		return true;
	}

	if (fields.every((field) => memberStatusFields.has(field))) {
		return true;
	}

	return (
		task.createdById === membership.userId &&
		fields.every((field) => creatorEditableTaskFields.has(field))
	);
}

export function ensureProjectKeepsAdmin(
	memberships: ProjectMembership[],
	targetUserId: string,
	nextRole?: MemberRole,
): void {
	const adminCountAfterChange = memberships.filter((membership) => {
		if (membership.userId !== targetUserId) {
			return membership.role === "admin";
		}

		return nextRole === "admin";
	}).length;

	if (adminCountAfterChange < 1) {
		forbidden("Cannot remove or demote the last admin");
	}
}

export function ensureProjectOwnerKeepsAdmin(
	ownerId: string,
	targetUserId: string,
	nextRole?: MemberRole,
): void {
	if (ownerId === targetUserId && nextRole !== "admin") {
		forbidden("Project owner must remain an admin");
	}
}

export function ensureAssigneeIsProjectMember(
	assigneeId: string | null | undefined,
	memberships: ProjectMembership[],
): void {
	if (!assigneeId) {
		return;
	}

	if (!memberships.some((membership) => membership.userId === assigneeId)) {
		badRequest("Task assignee must be a project member");
	}
}
