"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { readableApiError } from "@/lib/api-error";
import type { MemberRole, WorkspaceMember } from "./workspace-view-models";

export interface MemberManagementProps {
	members: WorkspaceMember[];
	projectId: string;
}

type SubmitState = "idle" | "submitting" | "sent" | "error";

export function MemberManagement({
	members,
	projectId,
}: Readonly<MemberManagementProps>) {
	const router = useRouter();
	const [state, setState] = useState<SubmitState>("idle");
	const [message, setMessage] = useState("");
	const [busyAction, setBusyAction] = useState<string | null>(null);

	async function request(
		path: string,
		init: RequestInit,
		successMessage: string,
	): Promise<boolean> {
		setBusyAction(path);
		setState("submitting");
		setMessage("");
		try {
			const response = await fetch(path, init);
			const body = await response.json().catch(() => null);
			if (!response.ok) {
				setState("error");
				setMessage(readableApiError(body));
				return false;
			}

			setState("sent");
			setMessage(successMessage);
			router.refresh();
			return true;
		} catch (error) {
			setState("error");
			setMessage(readableApiError(error));
			return false;
		} finally {
			setBusyAction(null);
		}
	}

	async function addMember(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const formData = new FormData(form);
		const email = String(formData.get("email") ?? "");
		const role = String(formData.get("role") ?? "member") as MemberRole;

		const added = await request(
			`/api/projects/${projectId}/members`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, role }),
			},
			"Member added.",
		);
		if (added) {
			form.reset();
		}
	}

	async function changeRole(userId: string, role: MemberRole) {
		await request(
			`/api/projects/${projectId}/members/${userId}`,
			{
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ role }),
			},
			"Role updated.",
		);
	}

	async function removeMember(userId: string) {
		await request(
			`/api/projects/${projectId}/members/${userId}`,
			{ method: "DELETE" },
			"Member removed.",
		);
	}

	return (
		<aside
			className="paper-card rounded-xl p-5"
			aria-labelledby="member-management-title"
		>
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-slate">
						Members
					</p>
					<h2
						id="member-management-title"
						className="mt-2 font-display text-xl font-semibold tracking-tight text-charcoal"
					>
						Member Management
					</h2>
				</div>
				<span className="rounded bg-parchment px-2 py-1 font-mono text-xs text-command-slate">
					{members.length} Active Members
				</span>
			</div>
			<form className="mt-5 grid gap-3" onSubmit={addMember}>
				<label className="grid gap-2 text-sm font-semibold text-command-slate">
					Registered user email
					<input
						className="stitch-field min-h-11 px-3"
						name="email"
						placeholder="teammate@example.com"
						required
						type="email"
					/>
				</label>
				<label className="grid gap-2 text-sm font-semibold text-command-slate">
					Role
					<select
						className="stitch-field min-h-11 px-3"
						defaultValue="member"
						name="role"
					>
						<option value="member">Member</option>
						<option value="admin">Admin</option>
					</select>
				</label>
				<button
					className="copper-button min-h-11 rounded-xl px-4 text-sm font-semibold"
					disabled={state === "submitting"}
					type="submit"
				>
					Add member
				</button>
			</form>
			<ul className="mt-5 grid gap-3">
				{members.map((member) => (
					<li
						className="rounded-xl border border-soft-border bg-parchment/60 p-3"
						key={member.id}
					>
						<div>
							<p className="font-display text-sm font-semibold text-charcoal">
								{member.name}
							</p>
							<p className="mt-1 break-all text-xs text-muted-slate">
								{member.email}
							</p>
							{member.isOwner ? (
								<p className="mt-1 text-xs font-semibold text-copper">Owner</p>
							) : null}
						</div>
						<div className="mt-3 grid gap-2">
							<label className="grid gap-2 text-xs font-semibold text-command-slate">
								Role
								<select
									className="stitch-field min-h-10 px-3"
									defaultValue={member.role}
									disabled={
										member.isOwner ||
										busyAction ===
											`/api/projects/${projectId}/members/${member.userId}`
									}
									onChange={(event) =>
										void changeRole(
											member.userId,
											event.target.value as MemberRole,
										)
									}
								>
									<option value="member">Member</option>
									<option value="admin">Admin</option>
								</select>
							</label>
							{!member.isOwner ? (
								<button
									className="min-h-10 rounded-xl border border-soft-border bg-warm-surface px-3 text-xs font-semibold text-command-slate transition hover:border-copper hover:text-copper"
									disabled={
										busyAction ===
										`/api/projects/${projectId}/members/${member.userId}`
									}
									onClick={() => void removeMember(member.userId)}
									type="button"
								>
									Remove member
								</button>
							) : null}
						</div>
					</li>
				))}
			</ul>
			<p aria-live="polite" className="mt-4 min-h-5 text-sm text-muted-slate">
				{state === "sent" || state === "error" ? message : null}
			</p>
		</aside>
	);
}
