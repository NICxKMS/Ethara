import { MemberAvatar } from "./member-avatar";
import {
	completionFromSummary,
	type DashboardSummaryView,
	type WorkspaceMember,
} from "./workspace-view-models";

export interface ProgressPanelProps {
	dashboard: DashboardSummaryView;
	members: WorkspaceMember[];
}

export function ProgressPanel({
	dashboard,
	members,
}: Readonly<ProgressPanelProps>) {
	const completion = completionFromSummary(dashboard);

	return (
		<aside aria-labelledby="summary-title" className="grid gap-5">
			<div>
				<p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-slate">
					Summary
				</p>
				<h2
					id="summary-title"
					className="font-display text-lg font-semibold text-charcoal"
				>
					Dashboard Summary
				</h2>
			</div>
			<section
				className="paper-card rounded-xl p-6"
				aria-labelledby="task-summary-title"
			>
				<h3
					id="task-summary-title"
					className="border-b border-soft-border pb-4 font-display text-xl font-semibold text-charcoal"
				>
					Task Intelligence
				</h3>
				<div className="mt-5 rounded-xl border border-soft-border bg-parchment p-5">
					<p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-slate">
						Total Tasks
					</p>
					<p className="mt-2 font-display text-4xl font-semibold text-charcoal">
						{dashboard.total}
					</p>
				</div>
				<div className="mt-5 grid gap-4">
					<ProgressLine
						label="Task completion"
						suffix="%"
						value={completion}
						tone="bg-charcoal"
					/>
					<ProgressLine
						label="Total tasks"
						max={Math.max(dashboard.total, 1)}
						suffix=""
						value={dashboard.total}
						tone="bg-command-slate"
					/>
					<ProgressLine
						label="Todo"
						max={Math.max(dashboard.total, 1)}
						suffix=""
						value={dashboard.byStatus.todo}
						tone="bg-muted-slate"
					/>
					<ProgressLine
						label="In progress"
						max={Math.max(dashboard.total, 1)}
						suffix=""
						value={dashboard.byStatus.in_progress}
						tone="bg-copper"
					/>
					<ProgressLine
						label="Done"
						max={Math.max(dashboard.total, 1)}
						suffix=""
						value={dashboard.byStatus.done}
						tone="bg-charcoal"
					/>
				</div>
			</section>
			<section
				className="rounded-xl border border-copper/20 bg-copper/5 p-5"
				aria-labelledby="overdue-title"
			>
				<h3
					id="overdue-title"
					className="font-display text-lg font-semibold text-copper"
				>
					Attention Required
				</h3>
				<p className="mt-4 font-display text-4xl font-semibold tracking-tight text-copper">
					{dashboard.overdue}
				</p>
				<p className="mt-2 text-sm leading-6 text-muted-slate">
					Open tasks with due dates before today need review.
				</p>
			</section>
			<section aria-labelledby="members-title">
				<h3
					id="members-title"
					className="font-display text-sm font-semibold text-command-slate"
				>
					Members
				</h3>
				<div className="mt-4 grid grid-cols-5 gap-2">
					{members.map((member) => (
						<MemberAvatar
							initials={member.initials}
							key={member.id}
							label={`${member.name}, ${member.role}`}
							size="lg"
							tone={member.tone}
						/>
					))}
				</div>
				{members.length === 0 ? (
					<p className="mt-3 text-sm leading-6 text-muted-slate">
						No members to show for this view.
					</p>
				) : null}
			</section>
		</aside>
	);
}

export interface ProgressLineProps {
	label: string;
	value: number;
	tone: string;
	max?: number;
	suffix?: string;
}

function ProgressLine({
	label,
	value,
	tone,
	max = 100,
	suffix = "%",
}: Readonly<ProgressLineProps>) {
	const width = Math.min(100, Math.max(0, (value / max) * 100));

	return (
		<div>
			<div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-slate">
				<span>{label}</span>
				<span>
					{value}
					{suffix}
				</span>
			</div>
			<div className="h-2.5 overflow-hidden rounded-full bg-parchment">
				<span
					className={`block h-full rounded-full ${tone}`}
					style={{ width: `${width}%` }}
				/>
			</div>
		</div>
	);
}
