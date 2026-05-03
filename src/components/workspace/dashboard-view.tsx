import Link from "next/link";
import { EndpointForm } from "./endpoint-forms";
import { MemberManagement } from "./member-management";
import { ProgressPanel } from "./progress-panel";
import { ProjectRail } from "./project-rail";
import { TaskBoard } from "./task-board";
import type {
	DashboardSummaryView,
	WorkspaceMember,
	WorkspaceProject,
	WorkspaceTask,
} from "./workspace-view-models";

export interface DashboardViewProps {
	canManageMembers?: boolean;
	dashboard: DashboardSummaryView;
	members: WorkspaceMember[];
	project: WorkspaceProject | null;
	projects: WorkspaceProject[];
	tasks: WorkspaceTask[];
}

export function DashboardView({
	canManageMembers = false,
	dashboard,
	members,
	project,
	projects,
	tasks,
}: Readonly<DashboardViewProps>) {
	return (
		<div className="px-5 py-6 sm:px-8 lg:px-10 xl:py-12">
			<header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-slate">
						Workspace Overview
					</p>
					<h1 className="mt-2 max-w-3xl font-display text-4xl font-semibold tracking-[-0.02em] text-charcoal sm:text-5xl">
						{project ? project.name : "Good Morning"}
					</h1>
					<p className="mt-2 text-base leading-7 text-command-slate">
						{project
							? project.description
							: "Administrator overview for active projects and task flow."}
					</p>
				</div>
				<div className="paper-card w-full max-w-sm rounded-xl p-4">
					<div className="flex items-center gap-2">
						{project ? (
							<span className="rounded-full bg-charcoal px-3 py-1 font-mono text-xs text-warm-surface capitalize">
								{project.role}
							</span>
						) : null}
						<p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-slate">
							Private Workspace
						</p>
					</div>
					<p className="mt-3 font-display text-sm font-semibold text-charcoal">
						{project?.updatedLabel ?? "Create your first project"}
					</p>
					<p className="mt-1 text-sm leading-6 text-command-slate">
						Projects, members, tasks, due dates, and summary values are loaded
						from the app services.
					</p>
				</div>
			</header>
			<div className="grid gap-6 xl:grid-cols-[16rem_minmax(0,1fr)_21rem]">
				<ProjectRail activeProjectId={project?.id} projects={projects} />
				{project ? (
					<TaskBoard members={members} projectId={project.id} tasks={tasks} />
				) : (
					<section
						className="paper-card flex min-h-[28rem] flex-col justify-center rounded-3xl p-8 text-center"
						aria-labelledby="empty-dashboard-title"
					>
						<p className="text-sm font-semibold text-muted-slate">
							No project yet
						</p>
						<h2
							id="empty-dashboard-title"
							className="mt-3 font-display text-3xl font-semibold tracking-tight text-charcoal"
						>
							Create a project to start organizing tasks.
						</h2>
						<p className="mx-auto mt-3 max-w-md text-sm leading-6 text-command-slate">
							The dashboard will load its real tasks, members, assignees, due
							dates, and summary from the app data.
						</p>
						<Link
							className="copper-button mx-auto mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl px-5 font-display text-sm font-bold"
							href="/projects#project-form"
						>
							Create project
						</Link>
					</section>
				)}
				<ProgressPanel dashboard={dashboard} members={members} />
			</div>
			{project ? (
				<div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
					<div className="max-w-3xl" id="task-form">
						<EndpointForm
							assignees={members}
							mode="task"
							projectId={project.id}
						/>
					</div>
					{canManageMembers ? (
						<MemberManagement members={members} projectId={project.id} />
					) : null}
				</div>
			) : null}
		</div>
	);
}
