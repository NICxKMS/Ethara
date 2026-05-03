"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { BrandMark } from "./brand";
import type { WorkspaceUser } from "./workspace-view-models";

export interface WorkspaceShellProps {
	children: ReactNode;
	active: "dashboard" | "projects";
	currentUser: WorkspaceUser;
}

const navItems = [
	{ href: "/dashboard", label: "Dashboard", key: "dashboard" },
	{ href: "/projects", label: "Projects", key: "projects" },
];

export function WorkspaceShell({
	children,
	active,
	currentUser,
}: Readonly<WorkspaceShellProps>) {
	const router = useRouter();
	const [message, setMessage] = useState("");
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	async function logout() {
		setIsLoggingOut(true);
		setMessage("");
		try {
			const response = await fetch("/api/auth/logout", { method: "POST" });
			if (!response.ok) {
				throw new Error("Logout failed");
			}
			router.push("/login");
			router.refresh();
		} catch {
			setIsLoggingOut(false);
			setMessage("Logout failed. Please try again.");
		}
	}

	return (
		<div className="min-h-screen bg-parchment lg:grid lg:grid-cols-[16rem_1fr]">
			<aside className="border-b border-soft-border bg-warm-surface px-5 py-5 lg:sticky lg:top-0 lg:min-h-screen lg:border-b-0 lg:border-r">
				<div className="flex h-full flex-col">
					<BrandMark />
					<nav aria-label="Primary workspace" className="mt-8 grid gap-1">
						{navItems.map((item) => (
							<Link
								aria-current={active === item.key ? "page" : undefined}
								className={`rounded-xl px-3 py-2 font-display text-sm font-semibold transition active:scale-95 ${
									active === item.key
										? "bg-parchment text-copper"
										: "text-muted-slate hover:bg-parchment/70 hover:text-charcoal"
								}`}
								href={item.href}
								key={item.key}
							>
								{item.label}
							</Link>
						))}
					</nav>
					<section
						className="mt-auto rounded-xl border border-soft-border bg-parchment/70 p-4"
						aria-label="Current user"
					>
						<p className="text-xs font-semibold text-muted-slate">Account</p>
						<p className="mt-2 font-display text-sm font-semibold text-charcoal">
							{currentUser.name}
						</p>
						<p className="mt-1 break-all text-xs leading-5 text-muted-slate">
							{currentUser.email}
						</p>
						<button
							className="mt-4 min-h-11 w-full rounded-xl border border-soft-border bg-warm-surface px-4 text-sm font-semibold text-command-slate transition hover:border-copper hover:text-copper"
							disabled={isLoggingOut}
							onClick={logout}
							type="button"
						>
							{isLoggingOut ? "Logging out..." : "Log out"}
						</button>
						<p
							aria-live="polite"
							className="mt-2 min-h-5 text-xs text-muted-slate"
						>
							{message}
						</p>
					</section>
				</div>
			</aside>
			<div className="min-w-0">
				<header className="sticky top-0 z-40 flex min-h-16 items-center justify-between border-b border-soft-border bg-parchment/85 px-5 backdrop-blur sm:px-8 lg:px-10">
					<div className="font-display text-base font-semibold text-copper lg:hidden">
						Ethara
					</div>
					<div className="hidden lg:block" />
					<div className="flex items-center gap-3">
						<Link
							className="hidden min-h-10 items-center rounded-xl border border-soft-border bg-transparent px-4 text-sm font-semibold text-command-slate transition hover:bg-warm-surface sm:inline-flex"
							href="/projects#project-form"
						>
							Create Project
						</Link>
						<Link
							className="copper-button inline-flex min-h-10 items-center rounded-xl px-4 text-sm font-semibold"
							href="/dashboard#task-form"
						>
							Create Task
						</Link>
					</div>
				</header>
				<main>{children}</main>
			</div>
		</div>
	);
}
