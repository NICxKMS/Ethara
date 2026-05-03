import {
	completionFromSummary,
	formatDueDate,
	formatUpdatedDate,
	initialsForName,
	memberTone,
	type WorkspaceMember,
	type WorkspaceProject,
	type WorkspaceTask,
} from "@/components/workspace/workspace-view-models";
import type { Project, Task } from "@/db/schema";
import {
	type DashboardSummary,
	getProjectDashboard,
} from "@/server/services/dashboard";
import {
	listMembers,
	type ProjectMemberWithUser,
} from "@/server/services/members";
import { getProject, listProjects } from "@/server/services/projects";
import { listTasks } from "@/server/services/tasks";

export type ProjectWorkspaceData = {
	project: WorkspaceProject;
	members: WorkspaceMember[];
	tasks: WorkspaceTask[];
	dashboard: DashboardSummary;
};

export async function loadWorkspaceProjects(
	currentUserId: string,
): Promise<WorkspaceProject[]> {
	const projects = await listProjects(currentUserId);

	return await Promise.all(
		projects.map(async (project) => {
			const [members, dashboard] = await Promise.all([
				listMembers(project.id, currentUserId),
				getProjectDashboard(project.id, currentUserId),
			]);

			return projectView(project, currentUserId, members, dashboard);
		}),
	);
}

export async function loadProjectWorkspace(
	projectId: string,
	currentUserId: string,
): Promise<ProjectWorkspaceData> {
	const [project, members, tasks, dashboard] = await Promise.all([
		getProject(projectId, currentUserId),
		listMembers(projectId, currentUserId),
		listTasks(projectId, currentUserId),
		getProjectDashboard(projectId, currentUserId),
	]);
	const memberViews = membersView(members, project.ownerId);

	return {
		project: projectView(project, currentUserId, members, dashboard),
		members: memberViews,
		tasks: tasks.map(taskView),
		dashboard,
	};
}

function projectView(
	project: Project,
	currentUserId: string,
	members: ProjectMemberWithUser[],
	dashboard: DashboardSummary,
): WorkspaceProject {
	const currentMembership = members.find(
		(member) => member.userId === currentUserId,
	);

	return {
		id: project.id,
		name: project.name,
		description: project.description ?? "No description yet.",
		role: currentMembership?.role ?? "member",
		completion: completionFromSummary(dashboard),
		totalTasks: dashboard.total,
		overdueTasks: dashboard.overdue,
		updatedLabel: formatUpdatedDate(project.updatedAt),
		members: membersView(members, project.ownerId),
	};
}

function membersView(
	members: ProjectMemberWithUser[],
	ownerId: string,
): WorkspaceMember[] {
	return members.map((member, index) => ({
		id: `${member.projectId}:${member.userId}`,
		userId: member.userId,
		name: member.user.name,
		email: member.user.email,
		role: member.role,
		initials: initialsForName(member.user.name, member.user.email),
		tone: memberTone(index),
		isOwner: member.userId === ownerId,
	}));
}

function taskView(task: Task): WorkspaceTask {
	return {
		id: task.id,
		projectId: task.projectId,
		title: task.title,
		description: task.description ?? "No description provided.",
		status: task.status,
		priority: task.priority,
		assigneeId: task.assigneeId,
		dueDate: task.dueDate ? task.dueDate.toISOString().slice(0, 10) : null,
		dueLabel: formatDueDate(task.dueDate),
	};
}
