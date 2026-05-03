import { and, eq, lte, type SQL } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import {
	type ProjectMember,
	projectMembers,
	type Task,
	tasks,
} from "@/db/schema";
import { forbidden, notFound } from "../http";
import {
	canEditTask,
	canManageTask,
	ensureAssigneeIsProjectMember,
} from "../permissions";
import type {
	createTaskSchema,
	taskFilterSchema,
	updateTaskSchema,
} from "../validation";
import { requireMembership } from "./projects";

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskFilters = z.infer<typeof taskFilterSchema>;

async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
	return await getDb()
		.select()
		.from(projectMembers)
		.where(eq(projectMembers.projectId, projectId));
}

function taskWhere(projectId: string, filters?: TaskFilters): SQL {
	const conditions: SQL[] = [eq(tasks.projectId, projectId)];
	if (filters?.status) {
		conditions.push(eq(tasks.status, filters.status));
	}
	if (filters?.assigneeId) {
		conditions.push(eq(tasks.assigneeId, filters.assigneeId));
	}
	if (filters?.dueBefore) {
		conditions.push(lte(tasks.dueDate, filters.dueBefore));
	}

	const combined = and(...conditions);
	if (!combined) {
		throw new Error("Task query requires project scope");
	}

	return combined;
}

async function findProjectTask(
	projectId: string,
	taskId: string,
): Promise<Task> {
	const [task] = await getDb()
		.select()
		.from(tasks)
		.where(and(eq(tasks.projectId, projectId), eq(tasks.id, taskId)))
		.limit(1);

	if (!task) {
		notFound("Task not found");
	}

	return task;
}

export async function listTasks(
	projectId: string,
	currentUserId: string,
	filters?: TaskFilters,
): Promise<Task[]> {
	await requireMembership(projectId, currentUserId);
	return await getDb()
		.select()
		.from(tasks)
		.where(taskWhere(projectId, filters));
}

export async function createTask(
	projectId: string,
	currentUserId: string,
	input: CreateTaskInput,
): Promise<Task> {
	await requireMembership(projectId, currentUserId);
	ensureAssigneeIsProjectMember(
		input.assigneeId,
		await getProjectMembers(projectId),
	);

	const [task] = await getDb()
		.insert(tasks)
		.values({
			projectId,
			title: input.title,
			description: input.description ?? null,
			status: input.status,
			priority: input.priority,
			assigneeId: input.assigneeId ?? null,
			createdById: currentUserId,
			dueDate: input.dueDate ?? null,
		})
		.returning();

	return task;
}

export async function getTask(
	projectId: string,
	taskId: string,
	currentUserId: string,
): Promise<Task> {
	await requireMembership(projectId, currentUserId);
	return await findProjectTask(projectId, taskId);
}

export async function updateTask(
	projectId: string,
	taskId: string,
	currentUserId: string,
	input: UpdateTaskInput,
): Promise<Task> {
	const membership = await requireMembership(projectId, currentUserId);
	const existingTask = await findProjectTask(projectId, taskId);
	const fields = Object.keys(input);

	if (!canEditTask(membership, existingTask, fields)) {
		forbidden("You cannot edit these task fields");
	}

	if (input.assigneeId !== undefined) {
		ensureAssigneeIsProjectMember(
			input.assigneeId,
			await getProjectMembers(projectId),
		);
	}

	const [task] = await getDb()
		.update(tasks)
		.set({
			...input,
			description:
				input.description === undefined
					? existingTask.description
					: input.description,
			assigneeId:
				input.assigneeId === undefined
					? existingTask.assigneeId
					: input.assigneeId,
			dueDate:
				input.dueDate === undefined ? existingTask.dueDate : input.dueDate,
			updatedAt: new Date(),
		})
		.where(and(eq(tasks.projectId, projectId), eq(tasks.id, taskId)))
		.returning();

	return task;
}

export async function deleteTask(
	projectId: string,
	taskId: string,
	currentUserId: string,
): Promise<void> {
	const membership = await requireMembership(projectId, currentUserId);
	if (!canManageTask(membership)) {
		forbidden("Only admins can delete tasks");
	}

	await findProjectTask(projectId, taskId);
	await getDb()
		.delete(tasks)
		.where(and(eq(tasks.projectId, projectId), eq(tasks.id, taskId)));
}
