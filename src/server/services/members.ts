import { and, eq, ne } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import {
	type ProjectMember,
	projectMembers,
	projects,
	type User,
	users,
} from "@/db/schema";
import { badRequest, forbidden, notFound } from "../http";
import {
	ensureProjectKeepsAdmin,
	ensureProjectOwnerKeepsAdmin,
} from "../permissions";
import type { addMemberSchema, updateMemberSchema } from "../validation";
import { requireAdmin, requireMembership } from "./projects";

export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type ProjectMemberWithUser = ProjectMember & {
	user: Pick<User, "id" | "name" | "email">;
};

export async function listMembers(
	projectId: string,
	currentUserId: string,
): Promise<ProjectMemberWithUser[]> {
	await requireMembership(projectId, currentUserId);
	const rows = await getDb()
		.select({
			membership: projectMembers,
			user: { id: users.id, name: users.name, email: users.email },
		})
		.from(projectMembers)
		.innerJoin(users, eq(projectMembers.userId, users.id))
		.where(eq(projectMembers.projectId, projectId));

	return rows.map((row) => ({ ...row.membership, user: row.user }));
}

async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
	return await getDb()
		.select()
		.from(projectMembers)
		.where(eq(projectMembers.projectId, projectId));
}

export async function addMember(
	projectId: string,
	currentUserId: string,
	input: AddMemberInput,
): Promise<ProjectMemberWithUser> {
	await requireAdmin(projectId, currentUserId);

	const [user] = await getDb()
		.select({ id: users.id, name: users.name, email: users.email })
		.from(users)
		.where(eq(users.email, input.email))
		.limit(1);
	if (!user) {
		notFound("User not found");
	}

	const [existing] = await getDb()
		.select()
		.from(projectMembers)
		.where(
			and(
				eq(projectMembers.projectId, projectId),
				eq(projectMembers.userId, user.id),
			),
		)
		.limit(1);
	if (existing) {
		badRequest("User is already a project member");
	}

	const [membership] = await getDb()
		.insert(projectMembers)
		.values({ projectId, userId: user.id, role: input.role })
		.returning();

	return { ...membership, user };
}

export async function updateMemberRole(
	projectId: string,
	targetUserId: string,
	currentUserId: string,
	input: UpdateMemberInput,
): Promise<ProjectMemberWithUser> {
	await requireAdmin(projectId, currentUserId);
	const [project] = await getDb()
		.select({ ownerId: projects.ownerId })
		.from(projects)
		.where(eq(projects.id, projectId))
		.limit(1);
	if (!project) {
		notFound("Project not found");
	}

	const memberships = await getProjectMembers(projectId);
	const target = memberships.find(
		(membership) => membership.userId === targetUserId,
	);
	if (!target) {
		notFound("Project member not found");
	}

	ensureProjectOwnerKeepsAdmin(project.ownerId, targetUserId, input.role);
	ensureProjectKeepsAdmin(memberships, targetUserId, input.role);
	const [membership] = await getDb()
		.update(projectMembers)
		.set({ role: input.role })
		.where(
			and(
				eq(projectMembers.projectId, projectId),
				eq(projectMembers.userId, targetUserId),
			),
		)
		.returning();

	const [user] = await getDb()
		.select({ id: users.id, name: users.name, email: users.email })
		.from(users)
		.where(eq(users.id, targetUserId))
		.limit(1);
	if (!user) {
		notFound("Project member user not found");
	}

	return { ...membership, user };
}

export async function removeMember(
	projectId: string,
	targetUserId: string,
	currentUserId: string,
): Promise<void> {
	await requireAdmin(projectId, currentUserId);
	const [project] = await getDb()
		.select({ ownerId: projects.ownerId })
		.from(projects)
		.where(eq(projects.id, projectId))
		.limit(1);
	if (!project) {
		notFound("Project not found");
	}

	if (project.ownerId === targetUserId) {
		forbidden("Cannot remove the project owner");
	}

	const memberships = await getProjectMembers(projectId);
	const target = memberships.find(
		(membership) => membership.userId === targetUserId,
	);
	if (!target) {
		notFound("Project member not found");
	}

	ensureProjectKeepsAdmin(memberships, targetUserId, undefined);
	await getDb()
		.delete(projectMembers)
		.where(
			and(
				eq(projectMembers.projectId, projectId),
				eq(projectMembers.userId, targetUserId),
				ne(projectMembers.userId, project.ownerId),
			),
		);
}
