"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import MegaMenu from "./MegaMenu";

// Simplified NavBar component without thirdweb dependencies
export default function NavBar() {
	const [open, setOpen] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [aiToolsOpen, setAIToolsOpen] = useState(false);
	const triggerRef = useState<HTMLButtonElement | null>(null);

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
					<button 
						onClick={() => setOpen(true)} 
						className="px-3 py-1.5 rounded-full hover:bg-zinc-800/60 transition-colors"
						aria-label="Open menu"
						title="Open menu"
					>Menu</button>
					
					{/* AI Tools Dropdown */}
					<div className="relative">
						<button 
							ref={(el) => triggerRef[1](el)}
							onClick={() => setAIToolsOpen(!aiToolsOpen)}
							className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-zinc-800/60 transition-colors"
							aria-label="Toggle AI Tools dropdown"
							aria-expanded={aiToolsOpen}
							title="AI Tools menu"
						>
							AI Tools
							<ChevronDown className={`w-3 h-3 transition-transform ${aiToolsOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
						</button>
						{aiToolsOpen && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-3">
                                <h4 className="text-xs text-zinc-400 font-semibold uppercase mb-2">AI Tools</h4>
                                <div className="space-y-1">
                                    <Link href="/ai-calculator" 
                                        className="block px-3 py-2 rounded-md text-zinc-200 hover:bg-zinc-800"
                                        onClick={() => setAIToolsOpen(false)}
                                    >
                                        🧮 AI Carbon Calculator
                                    </Link>
                                    <Link href="/plastic-calculator" 
                                        className="block px-3 py-2 rounded-md text-zinc-200 hover:bg-zinc-800"
                                        onClick={() => setAIToolsOpen(false)}
                                    >
                                        ♻️ AI Plastic Calculator
                                    </Link>
                                    <Link href="/event-planner" 
                                        className="block px-3 py-2 rounded-md text-zinc-200 hover:bg-zinc-800"
                                        onClick={() => setAIToolsOpen(false)}
                                    >
                                        📅 Event Planner
                                    </Link>
                                </div>
                            </div>
                        )}
					</div>
					
					<Link href="#how-it-works" className="px-3 py-1.5 rounded-full hover:bg-zinc-800/60 transition-colors">How it works</Link>
					<Link href="#why" className="px-3 py-1.5 rounded-full hover:bg-zinc-800/60 transition-colors">Why CarbonX</Link>
				</nav>

				<div className="flex items-center gap-3">
					{/* Mobile hamburger menu */}
					<button 
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className="lg:hidden p-2 rounded-lg hover:bg-zinc-800/60 transition-colors"
						aria-label="Toggle mobile menu"
						aria-expanded={mobileMenuOpen}
						title="Toggle mobile menu"
					>
						<svg className="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							{mobileMenuOpen ? (
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							) : (
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
							)}
						</svg>
					</button>

					{/* Connect Button - Simple version */}
					<button
                        className="text-sm bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white px-5 py-2 rounded-full hover:from-indigo-600 hover:to-fuchsia-600 transition-all"
                    >
                        Connect Wallet
                    </button>
				</div>
			</div>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<div className="lg:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur">
					<div className="px-4 py-4 space-y-2">
						<button 
							onClick={() => { setOpen(true); setMobileMenuOpen(false); }}
							className="block w-full text-left px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800/60 transition-colors"
							aria-label="Open main menu"
							title="Open main menu"
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
