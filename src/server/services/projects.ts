import { and, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import {
	type Project,
	type ProjectMember,
	projectMembers,
	projects,
} from "@/db/schema";
import { forbidden, notFound } from "../http";
import { requireProjectAdmin, requireProjectMember } from "../permissions";
import type { createProjectSchema, updateProjectSchema } from "../validation";

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export async function getProjectMembership(
	projectId: string,
	userId: string,
): Promise<ProjectMember | null> {
	const [membership] = await getDb()
		.select()
		.from(projectMembers)
		.where(
			and(
				eq(projectMembers.projectId, projectId),
				eq(projectMembers.userId, userId),
			),
		)
		.limit(1);

	return membership ?? null;
}

export async function requireMembership(
	projectId: string,
	userId: string,
): Promise<ProjectMember> {
	return requireProjectMember(await getProjectMembership(projectId, userId));
}

export async function requireAdmin(
	projectId: string,
	userId: string,
): Promise<ProjectMember> {
	return requireProjectAdmin(await getProjectMembership(projectId, userId));
}

export async function listProjects(userId: string): Promise<Project[]> {
	const rows = await getDb()
		.select({ project: projects })
		.from(projectMembers)
		.innerJoin(projects, eq(projectMembers.projectId, projects.id))
		.where(eq(projectMembers.userId, userId));

	return rows.map((row) => row.project);
}

export async function createProject(
	userId: string,
	input: CreateProjectInput,
): Promise<Project> {
	return await getDb().transaction(async (tx) => {
		const [project] = await tx
			.insert(projects)
			.values({
				name: input.name,
				description: input.description ?? null,
				ownerId: userId,
			})
			.returning();

		await tx
			.insert(projectMembers)
			.values({ projectId: project.id, userId, role: "admin" });
		return project;
	});
}

export async function getProject(
	projectId: string,
	userId: string,
): Promise<Project> {
	await requireMembership(projectId, userId);
	const [project] = await getDb()
		.select()
		.from(projects)
		.where(eq(projects.id, projectId))
		.limit(1);
	if (!project) {
		notFound("Project not found");
	}

	return project;
}

export async function updateProject(
	projectId: string,
	userId: string,
	input: UpdateProjectInput,
): Promise<Project> {
	await requireAdmin(projectId, userId);
	const [project] = await getDb()
		.update(projects)
		.set({ ...input, updatedAt: new Date() })
		.where(eq(projects.id, projectId))
		.returning();

	if (!project) {
		notFound("Project not found");
	}

	return project;
}

export async function deleteProject(
	projectId: string,
	userId: string,
): Promise<void> {
	await requireAdmin(projectId, userId);
	const [project] = await getDb()
		.select({ ownerId: projects.ownerId })
		.from(projects)
		.where(eq(projects.id, projectId))
		.limit(1);
	if (!project) {
		notFound("Project not found");
	}

	if (project.ownerId !== userId) {
		forbidden("Only the project owner can delete the project");
	}

	await getDb().delete(projects).where(eq(projects.id, projectId));
}
