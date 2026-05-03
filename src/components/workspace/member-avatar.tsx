import { cn } from "@/lib/utils";

export interface MemberAvatarProps {
	initials: string;
	label: string;
	tone: string;
	size?: "sm" | "md" | "lg";
}

const sizes = {
	sm: "size-7 text-[10px]",
	md: "size-10 text-xs",
	lg: "size-14 text-sm",
};

export function MemberAvatar({
	initials,
	label,
	tone,
	size = "md",
}: Readonly<MemberAvatarProps>) {
	return (
		<span
			aria-label={label}
			className={cn(
				"inline-grid shrink-0 place-items-center rounded-full border border-soft-border font-mono font-semibold text-charcoal shadow-sm",
				tone,
				sizes[size],
			)}
			title={label}
			role="img"
		>
			{initials}
		</span>
	);
}
