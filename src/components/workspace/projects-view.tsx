import Link from "next/link";
import { EndpointForm } from "./endpoint-forms";
import { MemberAvatar } from "./member-avatar";
import type { WorkspaceProject } from "./workspace-view-models";

export interface ProjectsViewProps {
	projects: WorkspaceProject[];
	showForm?: boolean;
}

export function ProjectsView({
	projects,
	showForm = true,
}: Readonly<ProjectsViewProps>) {
	return (
		<div className="px-5 py-6 sm:px-8 lg:px-10 xl:py-12">
			<div className="max-w-5xl">
				<p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-slate">
					Team & Projects
				</p>
				<h1 className="mt-2 max-w-3xl font-display text-4xl font-semibold tracking-[-0.02em] text-charcoal sm:text-5xl">
					Coordinate project access and workstreams.
				</h1>
			</div>
			<div className="mt-8 grid gap-5 lg:grid-cols-2">
				{projects.map((project) => (
					<Link
						className="paper-card group relative overflow-hidden rounded-xl p-6 transition hover:border-copper hover:shadow-[0_4px_12px_rgba(24,24,27,0.05)]"
						href={`/projects/${project.id}`}
						key={project.id}
					>
						<div className="flex items-start justify-between gap-4">
							<h2 className="font-display text-2xl font-semibold tracking-tight text-charcoal group-hover:text-copper">
								{project.name}
							</h2>
							<span className="rounded bg-parchment px-2.5 py-1 font-mono text-xs capitalize text-command-slate">
								{project.role}
							</span>
						</div>
						<p className="mt-4 text-sm leading-6 text-command-slate">
							{project.description}
						</p>
						<div className="mt-6 flex items-center justify-between">
							<div className="flex -space-x-2">
								{project.members.slice(0, 4).map((member) => (
									<MemberAvatar
										initials={member.initials}
										key={member.id}
										label={`${member.name}, ${member.role}`}
										size="sm"
										tone={member.tone}
									/>
								))}
							</div>
							<span className="text-sm font-semibold text-command-slate">
								{project.completion}% done
							</span>
						</div>
						<div className="mt-4 h-2 overflow-hidden rounded-full bg-parchment">
							<span
								className="block h-full rounded-full bg-copper"
								style={{ width: `${project.completion}%` }}
							/>
						</div>
						<p className="mt-4 text-xs font-semibold text-muted-slate">
							{project.totalTasks} tasks, {project.overdueTasks} overdue
						</p>
					</Link>
				))}
			</div>
			{projects.length === 0 ? (
				<div className="paper-card mt-8 rounded-xl p-6">
					<h2 className="font-display text-2xl font-semibold tracking-tight text-charcoal">
						No projects yet.
					</h2>
					<p className="mt-2 text-sm leading-6 text-command-slate">
						Create a project to begin tracking real tasks, members, and
						summaries.
					</p>
				</div>
			) : null}
			{showForm && (
				<div className="mt-8 max-w-3xl" id="project-form">
					<EndpointForm mode="project" />
				</div>
			)}
		</div>
	);
}
