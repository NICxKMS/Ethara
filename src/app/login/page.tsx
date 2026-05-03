import Link from "next/link";
import { EndpointForm } from "@/components/workspace/endpoint-forms";

export default function LoginPage() {
	return (
		<main className="flex min-h-screen items-center justify-center px-5 py-10">
			<section className="w-full max-w-[420px]">
				<EndpointForm mode="login" />
				<p className="mt-6 text-center font-mono text-xs uppercase tracking-[0.18em] text-muted-slate">
					Need an account?{" "}
					<Link className="text-copper hover:text-copper-dark" href="/signup">
						Request access
					</Link>
				</p>
			</section>
		</main>
	);
}
