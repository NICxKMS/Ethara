"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { readableApiError } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { MemberAvatar } from "./member-avatar";
import {
	findTaskAssignee,
	labelForStatus,
	type TaskPriority,
	type TaskStatus,
	type WorkspaceMember,
	type WorkspaceTask,
} from "./workspace-view-models";

export interface TaskBoardProps {
	members: WorkspaceMember[];
	projectId: string;
	tasks: WorkspaceTask[];
}

const columns: Array<{ status: TaskStatus; label: string; accent: string }> = [
	{ status: "todo", label: "Todo", accent: "border-soft-border" },
	{ status: "in_progress", label: "In Progress", accent: "border-copper" },
	{ status: "done", label: "Done", accent: "border-soft-border" },
];

export function TaskBoard({
	members,
	projectId,
	tasks,
}: Readonly<TaskBoardProps>) {
	const visibleTasks = tasks.filter((task) => task.projectId === projectId);
	const activeCount = visibleTasks.filter(
		(task) => task.status !== "done",
	).length;

	return (
		<section
			aria-labelledby="task-board-title"
			className="flex min-h-[560px] flex-col gap-4"
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<h2
						id="task-board-title"
						className="font-display text-2xl font-semibold tracking-tight text-charcoal"
					>
						Task Workspace
					</h2>
					<span className="rounded-full border border-soft-border bg-parchment px-2.5 py-1 text-xs font-semibold text-muted-slate">
						{activeCount} active
					</span>
				</div>
				<a
					className="copper-button inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold"
					href="#task-form"
				>
					New task
				</a>
			</div>
			<div className="grid flex-1 gap-4 lg:grid-cols-3">
				{columns.map((column) => {
					const columnTasks = visibleTasks.filter(
						(task) => task.status === column.status,
					);
					return (
						<div
							className="flex min-h-[320px] flex-col gap-3 rounded-xl border border-soft-border bg-warm-surface/60 p-4"
							key={column.status}
						>
							<div
								className={cn(
									"flex items-center justify-between border-b pb-3",
									column.accent,
								)}
							>
								<h3 className="font-display text-lg font-semibold text-charcoal">
									{column.label}
								</h3>
								<span className="rounded-full bg-parchment px-2 py-0.5 font-mono text-xs text-muted-slate">
									{columnTasks.length}
								</span>
							</div>
							<div className="grid gap-3">
								{columnTasks.map((task) => (
									<TaskCard key={task.id} members={members} task={task} />
								))}
								{columnTasks.length === 0 ? (
									<p className="rounded-xl border border-dashed border-soft-border bg-parchment/40 p-4 text-sm leading-6 text-muted-slate">
										No tasks here yet.
									</p>
								) : null}
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}

export interface TaskCardProps {
	members: WorkspaceMember[];
	task: WorkspaceTask;
}

function TaskCard({ members, task }: Readonly<TaskCardProps>) {
	const member = findTaskAssignee(task, members);
	const isDone = task.status === "done";
	const isInProgress = task.status === "in_progress";

	return (
		<article
			className={cn(
				"group relative overflow-hidden rounded-xl border p-4 transition duration-200 hover:shadow-[0_4px_12px_rgba(24,24,27,0.05)]",
				isDone
					? "border-dashed border-soft-border bg-parchment/40 opacity-80 hover:opacity-100"
					: "border-soft-border bg-warm-surface",
			)}
		>
			{isInProgress && (
				<span className="absolute inset-y-0 left-0 w-1.5 bg-copper" />
			)}
			<div className={cn(isInProgress && "pl-2")}>
				<div className="flex items-start justify-between gap-3">
					<span
						className={cn(
							"rounded px-2 py-1 font-mono text-xs capitalize",
							priorityClass(task.priority),
						)}
					>
						{task.priority === "high" ? "High Priority" : task.priority}
					</span>
				</div>
				<div className="mt-4">
					<h4
						className={cn(
							"font-display text-base font-medium leading-6 text-charcoal group-hover:text-copper",
							isDone && "line-through",
						)}
					>
						{task.title}
					</h4>
				</div>
				<p className="mt-2 text-sm leading-6 text-muted-slate">
					{task.description}
				</p>
				<div className="mt-5 flex items-center justify-between gap-3 border-t border-soft-border pt-3">
					<span
						className={cn(
							"rounded px-2 py-1 font-mono text-xs",
							task.priority === "high" && !isDone
								? "border-brass bg-brass/20 text-command-slate"
								: "border-soft-border bg-parchment text-muted-slate",
						)}
					>
						{task.dueLabel}
					</span>
					{member ? (
						<MemberAvatar
							initials={member.initials}
							label={member.name}
							size="sm"
							tone={member.tone}
						/>
					) : (
						<span className="rounded border border-soft-border bg-parchment px-2 py-1 font-mono text-xs text-muted-slate">
							Unassigned
						</span>
					)}
				</div>
				<TaskStatusForm task={task} />
			</div>
		</article>
	);
}

function TaskStatusForm({ task }: Readonly<{ task: WorkspaceTask }>) {
	const router = useRouter();
	const [state, setState] = useState<"idle" | "submitting" | "sent" | "error">(
		"idle",
	);
	const [message, setMessage] = useState("");

	async function updateStatus(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const status = formData.get("status");

		setState("submitting");
		setMessage("");
		try {
			const response = await fetch(
				`/api/projects/${task.projectId}/tasks/${task.id}`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ status }),
				},
			);
			const body = await response.json().catch(() => null);
			if (!response.ok) {
				setState("error");
				setMessage(readableApiError(body));
				return;
			}

			setState("sent");
			setMessage("Status updated.");
			router.refresh();
		} catch (error) {
			setState("error");
			setMessage(readableApiError(error));
		}
	}

	return (
		<form className="mt-4 grid gap-2" onSubmit={updateStatus}>
			<label className="grid gap-2 text-xs font-semibold text-command-slate">
				Status
				<select
					aria-label="Update status"
					className="stitch-field min-h-10 px-3"
					defaultValue={task.status}
					name="status"
				>
					{columns.map((column) => (
						<option key={column.status} value={column.status}>
							{labelForStatus(column.status)}
						</option>
					))}
				</select>
			</label>
			<button
				className="min-h-10 rounded-xl border border-soft-border bg-warm-surface px-3 text-xs font-semibold text-command-slate transition hover:border-copper hover:text-copper"
				disabled={state === "submitting"}
				type="submit"
			>
				{state === "submitting" ? "Updating..." : "Save status"}
			</button>
			<p aria-live="polite" className="min-h-5 text-xs text-muted-slate">
				{state === "sent" || state === "error" ? message : null}
			</p>
		</form>
	);
}

function priorityClass(priority: TaskPriority) {
	if (priority === "high") {
		return "border border-copper/20 bg-copper/10 text-copper";
	}
	if (priority === "medium")
		return "border border-soft-border bg-command-slate/10 text-command-slate";
	return "border border-soft-border bg-transparent text-muted-slate";
}
