"use client";

import Link from "next/link";
import { ConnectButton } from "thirdweb/react";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import MegaMenu from "./MegaMenu";
import AIToolsDropdown, { useAIToolsDropdown } from "./AIToolsDropdown";

export default function NavBar() {
	const [twClient, setTwClient] = useState<any | null>(null);
	const [open, setOpen] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const aiToolsDropdown = useAIToolsDropdown();

	useEffect(() => {
		let mounted = true;
		import("../app/client")
			.then((m) => {
				if (mounted) setTwClient(m.client);
			})
			.catch(() => setTwClient(null));
		return () => {
			mounted = false;
		};
	}, []);

	return (
		<header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/70 bg-zinc-950/80 border-b border-zinc-800">
			<div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
				<Link href="/" className="group inline-flex items-center gap-2">
					<span className="relative inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500/80 to-fuchsia-500/80">
						<span className="absolute inset-0 rounded-md blur-sm bg-indigo-400/50" />
						<span className="relative h-2 w-2 rounded-sm bg-white/95" />
					</span>
					<span className="font-semibold tracking-tight text-zinc-100">CarbonX</span>
				</Link>

				{/* Desktop Navigation */}
				<nav className="hidden lg:flex items-center text-sm text-zinc-300 space-x-2 nav-links">
					<button onClick={() => setOpen(true)} className="px-3 py-1.5 rounded-full hover:bg-zinc-800/60 transition-colors">Menu</button>
					
					{/* AI Tools Dropdown */}
					<div className="relative">
						<button 
							ref={aiToolsDropdown.triggerRef}
							onClick={aiToolsDropdown.toggle}
							className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-zinc-800/60 transition-colors"
						>
							AI Tools
							<ChevronDown className={`w-3 h-3 transition-transform ${aiToolsDropdown.isOpen ? 'rotate-180' : ''}`} />
						</button>
						<AIToolsDropdown 
							isOpen={aiToolsDropdown.isOpen} 
							onClose={aiToolsDropdown.close} 
							triggerRef={aiToolsDropdown.triggerRef}
						/>
					</div>
					
					<Link href="#how-it-works" className="px-3 py-1.5 rounded-full hover:bg-zinc-800/60 transition-colors">How it works</Link>
					<Link href="#why" className="px-3 py-1.5 rounded-full hover:bg-zinc-800/60 transition-colors">Why CarbonX</Link>
				</nav>

				<div className="flex items-center gap-3">
					{/* Mobile hamburger menu */}
					<button 
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className="lg:hidden p-2 rounded-lg hover:bg-zinc-800/60 transition-colors"
						aria-label="Toggle menu"
					>
						<svg className="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							{mobileMenuOpen ? (
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							) : (
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
							)}
						</svg>
					</button>

					{/* Connect Button - Always visible */}
					{twClient ? (
						<ConnectButton client={twClient} appMetadata={{ name: "CarbonX", url: "https://carbonx.local" }} />
					) : (
						<span className="text-sm text-zinc-400">Connect</span>
					)}
				</div>
			</div>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<div className="lg:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur">
					<div className="px-4 py-4 space-y-2">
						<button 
							onClick={() => { setOpen(true); setMobileMenuOpen(false); }}
							className="block w-full text-left px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800/60 transition-colors"
						>
							Menu
						</button>
						
						{/* AI Tools Section */}
						<div className="py-2">
							<div className="text-xs font-medium text-zinc-500 uppercase tracking-wide px-3 py-1 mb-1">AI Tools</div>
							<Link 
								href="/ai-calculator" 
								onClick={() => setMobileMenuOpen(false)}
								className="block px-3 py-2 ml-3 rounded-lg text-zinc-300 hover:bg-zinc-800/60 transition-colors"
							>
								🧮 AI Carbon Calculator
							</Link>
							<Link 
								href="/plastic-calculator" 
								onClick={() => setMobileMenuOpen(false)}
								className="block px-3 py-2 ml-3 rounded-lg text-zinc-300 hover:bg-zinc-800/60 transition-colors"
							>
								♻️ AI Plastic Calculator
							</Link>
							<Link 
								href="/event-planner" 
								onClick={() => setMobileMenuOpen(false)}
								className="block px-3 py-2 ml-3 rounded-lg text-zinc-300 hover:bg-zinc-800/60 transition-colors"
							>
								📅 Event Planner
							</Link>
							<Link 
								href="/plastic-tracker" 
								onClick={() => setMobileMenuOpen(false)}
								className="block px-3 py-2 ml-3 rounded-lg text-zinc-300 hover:bg-zinc-800/60 transition-colors"
							>
								🗑️ Plastic Tracker
							</Link>
						</div>
						
						<Link 
							href="#how-it-works" 
							onClick={() => setMobileMenuOpen(false)}
							className="block px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800/60 transition-colors"
						>
							How it works
						</Link>
						<Link 
							href="#why" 
							onClick={() => setMobileMenuOpen(false)}
							className="block px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800/60 transition-colors"
						>
							Why CarbonX
						</Link>
						<Link 
							href="/dashboard" 
							onClick={() => setMobileMenuOpen(false)}
							className="block px-3 py-2 rounded-lg text-white bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:opacity-90 transition text-center"
						>
							Dashboard
						</Link>
					</div>
				</div>
			)}

			<MegaMenu isOpen={open} onClose={() => setOpen(false)} />
		</header>
	);
}
