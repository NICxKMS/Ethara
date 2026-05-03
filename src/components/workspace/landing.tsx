import Link from "next/link";
import { BrandMark } from "./brand";

export function Landing() {
	return (
		<main className="min-h-screen px-5 py-6 sm:px-8 lg:px-10">
			<nav
				className="mx-auto flex max-w-7xl items-center justify-between"
				aria-label="Landing navigation"
			>
				<BrandMark />
				<div className="flex items-center gap-3">
					<Link
						className="hidden rounded-2xl px-4 py-3 text-sm font-semibold text-command-slate hover:bg-warm-surface sm:inline-flex"
						href="/login"
					>
						Log in
					</Link>
					<Link
						className="copper-button rounded-2xl px-4 py-3 text-sm font-semibold"
						href="/signup"
					>
						Start workspace
					</Link>
				</div>
			</nav>
			<section className="mx-auto mt-12 grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(34rem,1.12fr)] lg:items-start">
				<div className="pt-8">
					<p className="text-sm font-semibold text-copper">Team task manager</p>
					<h1 className="mt-5 font-display text-5xl font-bold leading-[0.98] tracking-[-0.055em] text-charcoal sm:text-7xl">
						Calm project work, backed by real data.
					</h1>
					<p className="mt-6 max-w-xl text-lg leading-8 text-command-slate">
						Ethara gives small teams a quiet place for projects, members, tasks,
						status, and due dates without adding extra modules.
					</p>
					<div className="mt-8 flex flex-col gap-3 sm:flex-row">
						<Link
							className="copper-button inline-flex min-h-12 items-center justify-center rounded-2xl px-5 font-display text-sm font-semibold"
							href="/dashboard"
						>
							Open tasks
						</Link>
						<Link
							className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-soft-border bg-warm-surface px-5 font-display text-sm font-semibold text-charcoal hover:border-copper"
							href="/projects"
						>
							View projects
						</Link>
					</div>
					<dl className="mt-12 grid max-w-lg grid-cols-2 gap-3">
						<div className="paper-card rounded-3xl p-5">
							<dt className="text-xs font-semibold text-muted-slate">
								Workspace
							</dt>
							<dd className="mt-2 text-sm font-semibold leading-6 text-charcoal">
								Projects, members, tasks
							</dd>
						</div>
						<div className="paper-card rounded-3xl p-5">
							<dt className="text-xs font-semibold text-muted-slate">Data</dt>
							<dd className="mt-2 text-sm font-semibold leading-6 text-charcoal">
								Authenticated database records
							</dd>
						</div>
					</dl>
				</div>
				<div className="paper-card rounded-xl p-4 sm:p-6">
					<div className="grid gap-4">
						<div className="rounded-xl border border-soft-border bg-parchment/70 p-5">
							<p className="text-xs font-semibold text-muted-slate">
								Signed-in workspace
							</p>
							<h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-charcoal">
								Teams see only their real projects.
							</h2>
							<p className="mt-3 text-sm leading-6 text-command-slate">
								The workspace is protected by session auth and loads projects,
								members, tasks, assignees, due dates, and summaries from the
								backend services.
							</p>
						</div>
						<div className="grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">
							<div className="rounded-xl border border-soft-border bg-warm-surface p-4">
								<p className="font-display text-sm font-semibold text-command-slate">
									Task board
								</p>
								<div className="mt-4 grid gap-2">
									<div className="h-2 rounded-full bg-copper/30" />
									<div className="h-2 w-2/3 rounded-full bg-parchment" />
								</div>
							</div>
							<div className="rounded-xl border border-soft-border bg-warm-surface p-4">
								<p className="font-display text-sm font-semibold text-command-slate">
									Progress
								</p>
								<div className="mt-4 h-2 rounded-full bg-parchment" />
							</div>
						</div>
					</div>
				</div>
			</section>
			<section className="mx-auto mt-10 grid max-w-7xl gap-6 lg:grid-cols-[1fr_22rem]">
				<div className="paper-card rounded-xl p-6">
					<h2 className="font-display text-2xl font-semibold tracking-tight text-charcoal">
						Built around the existing app architecture.
					</h2>
					<ul className="mt-5 grid gap-3 text-sm leading-6 text-command-slate">
						{[
							"Authentication guards the workspace before server-side data loading.",
							"Project pages open real project records.",
							"Task and member forms stay wired to the app endpoints.",
						].map((note) => (
							<li className="border-l-2 border-copper pl-4" key={note}>
								{note}
							</li>
						))}
					</ul>
				</div>
				<div className="rounded-xl border border-soft-border border-l-4 border-l-copper bg-warm-surface p-6">
					<p className="text-xs font-semibold text-muted-slate">
						Minimal by design
					</p>
					<p className="mt-3 text-sm leading-6 text-command-slate">
						No chat, analytics, vanity metrics, or extra modules; just the
						project coordination flow.
					</p>
				</div>
			</section>
		</main>
	);
}
