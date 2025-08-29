import Link from "next/link";

export default function Footer() {
	return (
	<footer className="relative mt-24 border-t border-zinc-200 bg-rose-50/80 dark:border-zinc-800 dark:bg-zinc-950/70">
			<div className="relative mx-auto max-w-7xl px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
				<p className="text-sm text-zinc-600 dark:text-zinc-400">© {new Date().getFullYear()} CarbonX. All rights reserved.</p>
				<div className="flex items-center gap-4 text-sm text-zinc-700 dark:text-zinc-300">
					<Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Privacy</Link>
					<Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Terms</Link>
					<Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Contact</Link>
				</div>
			</div>
		</footer>
	);
}
