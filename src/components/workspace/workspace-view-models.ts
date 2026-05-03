export const taskStatuses = ["todo", "in_progress", "done"] as const;
export const taskPriorities = ["low", "medium", "high"] as const;
export const memberRoles = ["admin", "member"] as const;

export type TaskStatus = (typeof taskStatuses)[number];
export type TaskPriority = (typeof taskPriorities)[number];
export type MemberRole = (typeof memberRoles)[number];

export type DashboardSummaryView = {
  total: number;
  byStatus: Record<TaskStatus, number>;
  overdue: number;
};

export type WorkspaceUser = {
  id: string;
  name: string;
  email: string;
};

export type WorkspaceMember = {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: MemberRole;
  initials: string;
  tone: string;
  isOwner: boolean;
};

export type WorkspaceProject = {
  id: string;
  name: string;
  description: string;
  role: MemberRole;
  completion: number;
  totalTasks: number;
  overdueTasks: number;
  updatedLabel: string;
  members: WorkspaceMember[];
};

export type WorkspaceTask = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: string | null;
  dueLabel: string;
};

const memberTones = [
  "bg-warm-muted",
  "bg-parchment",
  "bg-warm-surface",
  "bg-copper/10",
  "bg-brass/20",
] as const;

export function completionFromSummary(summary: DashboardSummaryView): number {
  if (summary.total === 0) {
    return 0;
  }

  return Math.round((summary.byStatus.done / summary.total) * 100);
}

export function formatDueDate(date: Date | string | null | undefined): string {
  if (!date) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatUpdatedDate(date: Date | string | null | undefined): string {
  if (!date) {
    return "No updates yet";
  }

  return `Updated ${formatDueDate(date)}`;
}

export function initialsForName(name: string, email: string): string {
  const source = name.trim() || email.trim().split("@")[0] || email.trim();
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? [parts[0][0], parts[1][0]] : [source[0], source[1]];

  return letters.join("").toUpperCase();
}

export function memberTone(index: number): string {
  return memberTones[index % memberTones.length];
}

export function findTaskAssignee(
  task: Pick<WorkspaceTask, "assigneeId">,
  members: WorkspaceMember[],
): WorkspaceMember | null {
  if (!task.assigneeId) {
    return null;
  }

  return members.find((member) => member.userId === task.assigneeId) ?? null;
}

export function labelForStatus(status: TaskStatus): string {
  if (status === "in_progress") {
    return "In progress";
  }

  return status[0].toUpperCase() + status.slice(1);
}

export function taskStatusCompletion(status: TaskStatus): number {
  if (status === "done") {
    return 100;
  }
  if (status === "in_progress") {
    return 50;
  }

  return 0;
}
