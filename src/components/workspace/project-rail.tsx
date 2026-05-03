import Link from "next/link";
import { MemberAvatar } from "./member-avatar";
import type { WorkspaceProject } from "./workspace-view-models";

export interface ProjectRailProps {
	activeProjectId?: string;
	projects: WorkspaceProject[];
}

export function ProjectRail({
	activeProjectId,
	projects,
}: Readonly<ProjectRailProps>) {
	return (
		<section
			aria-labelledby="project-rail-title"
			className="flex flex-col gap-4"
		>
			<div className="flex items-end justify-between">
				<div>
					<p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-slate">
						Projects
					</p>
					<h2
						id="project-rail-title"
						className="font-display text-lg font-semibold text-charcoal"
					>
						Active Projects
					</h2>
				</div>
				<Link
					className="text-xs font-semibold text-copper hover:text-copper-dark"
					href="/projects"
				>
					All projects
				</Link>
			</div>
			<div className="grid gap-3">
				{projects.length === 0 ? (
					<div className="rounded-xl border border-soft-border bg-warm-surface/80 p-4 text-sm leading-6 text-muted-slate">
						Create a project to see it here.
					</div>
				) : null}
				{projects.map((project) => {
					const isActive = project.id === activeProjectId;
					const visibleMembers = project.members.slice(0, 3);

					return (
						<Link
							aria-current={isActive ? "page" : undefined}
							className={`group relative overflow-hidden rounded-xl border p-4 transition duration-200 hover:border-copper hover:shadow-[0_4px_12px_rgba(24,24,27,0.05)] ${
								isActive
									? "border-copper bg-warm-surface shadow-sm before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-copper"
									: "border-soft-border bg-warm-surface/80"
							}`}
							href={`/projects/${project.id}`}
							key={project.id}
						>
							<div className="flex items-start justify-between gap-3">
								<h3 className="font-display text-base font-semibold leading-tight text-charcoal group-hover:text-copper">
									{project.name}
								</h3>
								<span
									className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${
										project.role === "admin"
											? "bg-charcoal text-warm-surface"
											: "border border-soft-border bg-parchment text-command-slate"
									}`}
								>
									{project.role}
								</span>
							</div>
							<p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-slate">
								{project.description}
							</p>
							<div className="mt-5 flex items-center justify-between">
								<div className="flex -space-x-2">
									{visibleMembers.map((member) => (
										<MemberAvatar
											initials={member.initials}
											key={member.id}
											label={`${member.name}, ${member.role}`}
											size="sm"
											tone={member.tone}
										/>
									))}
								</div>
								<span className="text-xs font-semibold text-command-slate">
									{project.completion}%
								</span>
							</div>
							<div className="mt-3 h-1.5 overflow-hidden rounded-full bg-parchment">
								<span
									className="block h-full rounded-full bg-copper"
									style={{ width: `${project.completion}%` }}
								/>
							</div>
						</Link>
					);
				})}
			</div>
		</section>
	);
}
