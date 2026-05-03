import Link from "next/link";
import { EndpointForm } from "@/components/workspace/endpoint-forms";

export default function SignupPage() {
	return (
		<main className="flex min-h-screen items-center justify-center px-5 py-10">
			<section className="w-full max-w-[460px]">
				<EndpointForm mode="signup" />
				<p className="mt-6 text-center font-mono text-xs uppercase tracking-[0.18em] text-muted-slate">
					Already registered?{" "}
					<Link className="text-copper hover:text-copper-dark" href="/login">
						Sign in
					</Link>
				</p>
			</section>
		</main>
	);
}
