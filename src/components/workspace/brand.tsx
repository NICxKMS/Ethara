import Link from "next/link";

export interface BrandMarkProps {
	compact?: boolean;
	inverse?: boolean;
}

export function BrandMark({
	compact = false,
	inverse = false,
}: Readonly<BrandMarkProps>) {
	return (
		<Link
			className="group flex items-center gap-3"
			href="/"
			aria-label="Ethara home"
		>
			<span className="relative grid size-9 place-items-center overflow-hidden rounded-xl bg-copper text-sm font-bold text-warm-surface shadow-sm">
				E
			</span>
			{!compact && (
				<span>
					<span
						className={`block font-display text-xl font-bold tracking-tight group-hover:text-copper ${inverse ? "text-warm-surface" : "text-copper"}`}
					>
						Ethara
					</span>
					<span
						className={`block font-mono text-xs ${inverse ? "text-warm-muted" : "text-muted-slate"}`}
					>
						Workspace
					</span>
				</span>
			)}
		</Link>
	);
}
