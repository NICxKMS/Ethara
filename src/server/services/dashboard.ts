import { and, eq, lt, ne } from "drizzle-orm";
import { getDb } from "@/db";
import { projectMembers, projects, tasks, users } from "@/db/schema";
import { requireMembership } from "./projects";

export type DashboardSummary = {
  total: number;
  byStatus: Record<"todo" | "in_progress" | "done", number>;
  overdue: number;
};

const emptySummary = (): DashboardSummary => ({
  total: 0,
  byStatus: { todo: 0, in_progress: 0, done: 0 },
  overdue: 0,
});

function summarize(rows: Array<{ status: "todo" | "in_progress" | "done"; dueDate: Date | null }>): DashboardSummary {
  const summary = emptySummary();
  const now = new Date();

  for (const row of rows) {
    summary.total += 1;
    summary.byStatus[row.status] += 1;
    if (row.dueDate && row.dueDate < now && row.status !== "done") {
      summary.overdue += 1;
    }
  }

  return summary;
}

export async function getUserDashboard(userId: string): Promise<DashboardSummary> {
  const rows = await getDb()
    .select({ status: tasks.status, dueDate: tasks.dueDate })
    .from(tasks)
    .where(eq(tasks.assigneeId, userId));

  return summarize(rows);
}

export async function getProjectDashboard(projectId: string, currentUserId: string): Promise<DashboardSummary & { byAssignee: Record<string, number> }> {
  await requireMembership(projectId, currentUserId);
  const rows = await getDb()
    .select({ status: tasks.status, dueDate: tasks.dueDate, assigneeId: tasks.assigneeId })
    .from(tasks)
    .where(eq(tasks.projectId, projectId));

  const summary = summarize(rows);
  const byAssignee: Record<string, number> = {};
  for (const row of rows) {
    const key = row.assigneeId ?? "unassigned";
    byAssignee[key] = (byAssignee[key] ?? 0) + 1;
  }

  return { ...summary, byAssignee };
}

export async function getOverdueProjectTasks(projectId: string, currentUserId: string) {
  await requireMembership(projectId, currentUserId);
  return await getDb()
    .select({ task: tasks, project: projects, assignee: users })
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .leftJoin(users, eq(tasks.assigneeId, users.id))
    .innerJoin(projectMembers, and(eq(projectMembers.projectId, projects.id), eq(projectMembers.userId, currentUserId)))
    .where(and(eq(tasks.projectId, projectId), lt(tasks.dueDate, new Date()), ne(tasks.status, "done")));
}
