"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { readableApiError } from "@/lib/api-error";
import { endpointPayloadFromEntries } from "@/lib/form-payload";
import {
	type EndpointFormMode,
	successMessageForMode,
	successRedirectForMode,
} from "@/lib/form-success";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brand";
import type { WorkspaceMember } from "./workspace-view-models";

export interface EndpointFormProps {
	assignees?: WorkspaceMember[];
	mode: EndpointFormMode;
	projectId?: string;
}

type SubmitState = "idle" | "submitting" | "sent" | "error";

const endpointByMode = {
	login: "/api/auth/login",
	signup: "/api/auth/signup",
	project: "/api/projects",
	task: "",
};

export function EndpointForm({
	assignees = [],
	mode,
	projectId,
}: Readonly<EndpointFormProps>) {
	const router = useRouter();
	const [state, setState] = useState<SubmitState>("idle");
	const [message, setMessage] = useState("");
	const endpoint =
		mode === "task"
			? `/api/projects/${projectId ?? ""}/tasks`
			: endpointByMode[mode];
	const isAuth = mode === "login" || mode === "signup";

	async function submitForm(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const formData = new FormData(form);
		const payload = endpointPayloadFromEntries(mode, formData.entries());

		setState("submitting");
		setMessage("");
		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			const body = await response.json().catch(() => null);
			if (response.ok) {
				const redirectPath = successRedirectForMode(mode);
				setState("sent");
				setMessage(successMessageForMode(mode));
				form.reset();
				if (redirectPath) {
					router.push(redirectPath);
				}
				router.refresh();
				return;
			}

			setState("error");
			setMessage(readableApiError(body));
		} catch (error) {
			setState("error");
			setMessage(readableApiError(error));
		}
	}

	return (
		<form
			className={cn(
				"paper-card grid gap-5 rounded-xl p-6 sm:p-8",
				isAuth &&
					"relative overflow-hidden border-soft-border bg-warm-surface text-center",
			)}
			id={`${mode}-form`}
			onSubmit={submitForm}
		>
			{isAuth ? (
				<div className="absolute inset-x-0 top-0 h-1 bg-copper/20" />
			) : null}
			<div className={cn(isAuth && "grid justify-items-center gap-3")}>
				{isAuth ? (
					<BrandMark />
				) : (
					<p className="text-xs font-semibold text-muted-slate">Form</p>
				)}
				<h2
					className={cn(
						"font-display text-2xl font-semibold tracking-tight text-charcoal",
						!isAuth && "mt-2",
					)}
				>
					{titleByMode[mode]}
				</h2>
				<p
					className={cn(
						"text-sm leading-6 text-muted-slate",
						isAuth ? "max-w-[280px]" : "mt-2",
					)}
				>
					{descriptionByMode[mode]}
				</p>
			</div>
			{isAuth && mode === "signup" && (
				<TextField
					autoComplete="name"
					label="Full name"
					name="name"
					placeholder="Your name"
				/>
			)}
			{isAuth && (
				<TextField
					autoComplete="email"
					label="Email"
					name="email"
					placeholder="name@company.com"
					type="email"
				/>
			)}
			{isAuth && (
				<TextField
					autoComplete={mode === "login" ? "current-password" : "new-password"}
					label="Password"
					name="password"
					type="password"
				/>
			)}
			{mode === "project" && (
				<>
					<TextField
						label="Project name"
						name="name"
						placeholder="Project name"
					/>
					<TextArea
						label="Description"
						name="description"
						placeholder="Scope, team context, and current delivery window."
					/>
				</>
			)}
			{mode === "task" && (
				<>
					<TextField label="Task title" name="title" placeholder="Task title" />
					<TextArea
						label="Description"
						name="description"
						placeholder="What needs to happen before the next coordination review?"
					/>
					<div className="grid gap-4 sm:grid-cols-2">
						<SelectField
							label="Status"
							name="status"
							options={[
								{ label: "Todo", value: "todo" },
								{ label: "In progress", value: "in_progress" },
								{ label: "Done", value: "done" },
							]}
						/>
						<SelectField
							label="Priority"
							name="priority"
							options={[
								{ label: "Low", value: "low" },
								{ label: "Medium", value: "medium" },
								{ label: "High", value: "high" },
							]}
						/>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<SelectField
							label="Assignee"
							name="assigneeId"
							options={[
								{ label: "Unassigned", value: "" },
								...assignees.map((member) => ({
									label: `${member.name} (${member.email})`,
									value: member.userId,
								})),
							]}
						/>
						<TextField
							label="Due date"
							name="dueDate"
							type="date"
							required={false}
						/>
					</div>
				</>
			)}
			<button
				className="copper-button min-h-12 rounded-xl px-5 font-display text-sm font-semibold"
				disabled={state === "submitting"}
				type="submit"
			>
				{state === "submitting" ? "Sending..." : ctaByMode[mode]}
			</button>
			<p aria-live="polite" className="min-h-5 text-sm text-muted-slate">
				{state === "sent" || state === "error" ? message : null}
			</p>
		</form>
	);
}

export interface TextFieldProps {
	label: string;
	name: string;
	autoComplete?: string;
	placeholder?: string;
	type?: string;
	required?: boolean;
}

function TextField({
	label,
	name,
	autoComplete,
	placeholder,
	type = "text",
	required = true,
}: Readonly<TextFieldProps>) {
	return (
		<label className="grid gap-2 text-left text-sm font-semibold text-command-slate">
			{label}
			<input
				autoComplete={autoComplete}
				className="stitch-field min-h-12 px-4"
				name={name}
				placeholder={placeholder}
				required={required}
				type={type}
			/>
		</label>
	);
}

export interface TextAreaProps {
	label: string;
	name: string;
	placeholder: string;
}

function TextArea({ label, name, placeholder }: Readonly<TextAreaProps>) {
	return (
		<label className="grid gap-2 text-left text-sm font-semibold text-command-slate">
			{label}
			<textarea
				className="stitch-field min-h-28 px-4 py-3"
				name={name}
				placeholder={placeholder}
			/>
		</label>
	);
}

export interface SelectFieldProps {
	label: string;
	name: string;
	options: Array<{ label: string; value: string }>;
}

function SelectField({ label, name, options }: Readonly<SelectFieldProps>) {
	return (
		<label className="grid gap-2 text-left text-sm font-semibold text-command-slate">
			{label}
			<select className="stitch-field min-h-12 px-4" name={name}>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</label>
	);
}

const titleByMode = {
	login: "Welcome back",
	signup: "Create account",
	project: "New project",
	task: "New task",
};

const descriptionByMode = {
	login: "Sign in to your workspace to continue your projects.",
	signup: "Create a first-party email account for your workspace.",
	project: "Save a project with its own members, tasks, and summary.",
	task: "Add a task to this project with status, priority, assignee, and due date.",
};

const ctaByMode = {
	login: "Sign In",
	signup: "Create account",
	project: "Create project",
	task: "Create task",
};
