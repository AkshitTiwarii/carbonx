import Link from "next/link";

export default function Footer() {
	return (
	<footer className="relative mt-24 border-t border-zinc-200 bg-rose-50/80 dark:border-zinc-800 dark:bg-zinc-950/70">
			<div className="relative mx-auto max-w-7xl px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
				<div className="flex flex-col md:flex-row items-center gap-4 w-full md:justify-between">
					<p className="text-sm text-zinc-600 dark:text-zinc-400">© {new Date().getFullYear()} CarbonX. All rights reserved.</p>
					<div className="flex items-center gap-4 text-sm text-zinc-700 dark:text-zinc-300">
						<Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Privacy</Link>
						<Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Terms</Link>
						<Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Contact</Link>
					</div>
				</div>

				{/* Developer credit */}
				<div className="relative mx-auto max-w-7xl px-4 py-2 flex items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
					<span className="mr-3">Developed by <Link href="/developer" className="underline">Akshit Tiwarii</Link></span>
					<span className="flex items-center gap-3">
						<Link href="https://github.com/AkshitTiwarii" className="hover:underline">GitHub</Link>
						<Link href="https://www.linkedin.com/in/akshit-tiwarii/" className="hover:underline">LinkedIn</Link>
					</span>
				</div>
			</div>
		</footer>
	);
}
