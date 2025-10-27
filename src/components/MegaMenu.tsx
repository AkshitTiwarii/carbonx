"use client";

import Link from "next/link";
import { useEffect } from "react";

interface MegaMenuProps { 
  isOpen: boolean; 
  onClose: () => void; 
}

export default function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    
    // Only close on page scroll, not on menu scroll
    const onPageScroll = (e: Event) => {
      // Only respond to scroll events on the main window, not within the menu
      if (e.target === document || e.target === document.body) {
        onClose();
      }
    };
    
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onPageScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onPageScroll);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <button aria-label="Close menu" onClick={onClose} className="absolute inset-0 bg-black/50" />

      {/* Panel */}
      <div onClick={(e) => e.stopPropagation()} className="absolute left-1/2 -translate-x-1/2 top-4 md:top-8 w-[96%] md:w-[95%] max-w-6xl rounded-3xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Top bar with brand and close */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-semibold text-zinc-100">CarbonX</Link>
            <nav className="hidden md:flex items-center gap-4 text-sm text-zinc-300">
              <span className="font-medium">Menu ▾</span>
              <Link href="/developer" className="hover:underline">Developer</Link>
              <Link href="/cryptocurrencies" className="hover:underline">Cryptocurrencies</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="hidden md:inline-flex items-center rounded-full bg-white text-black px-4 py-2 text-sm">Get App</Link>
            <button onClick={onClose} className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-zinc-800 text-white">✕</button>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 p-4 md:p-6">
          {/* Left: feature tiles */}
          <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <FeatureTile title="Marketplace" text="Browse verified carbon credits" color="from-orange-500 to-red-500" href="/marketplace" badge="HOT" onClick={onClose} />
            <FeatureTile title="Trading" text="Trade carbon credits" color="from-indigo-500 to-blue-600" href="/trading" badge="NEW" onClick={onClose} />
            <FeatureTile title="Portfolio" text="Track crypto assets" color="from-violet-500 to-purple-600" href="/portfolio" badge="NEW" onClick={onClose} />
            <FeatureTile title="Toucan Protocol" text="Real blockchain carbon credits" color="from-emerald-500 to-teal-600" href="/toucan-demo" badge="NEW" onClick={onClose} />
            <FeatureTile title="AI Calculator" text="AI-powered carbon credits" color="from-green-500 to-emerald-600" href="/ai-calculator" badge="AI" onClick={onClose} />
            <FeatureTile title="Event Planner" text="Plan sustainable events" color="from-emerald-500 to-green-600" href="/event-planner" badge="NEW" onClick={onClose} />
          </div>

          {/* Right: explore more */}
          <div className="md:col-span-3">
            <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-4">
              <div className="text-sm font-semibold text-zinc-100 mb-3">Explore more</div>
              <ul className="space-y-2 text-sm">
                <li><Link onClick={onClose} href="/developer" className="text-zinc-200 hover:underline">• Developer</Link></li>
                <li><Link onClick={onClose} href="/marketplace" className="text-zinc-200 hover:underline">• Carbon Marketplace</Link></li>
                <li><Link onClick={onClose} href="/trading" className="text-zinc-200 hover:underline">• Trading Platform</Link></li>
                <li><Link onClick={onClose} href="/portfolio" className="text-zinc-200 hover:underline">📊 Crypto Portfolio</Link></li>
                <li><Link onClick={onClose} href="/toucan-demo" className="text-zinc-200 hover:underline">🌿 Toucan Protocol</Link></li>
                <li><Link onClick={onClose} href="/ai-calculator" className="text-zinc-200 hover:underline">🤖 AI Carbon Calculator</Link></li>
                <li><Link onClick={onClose} href="/plastic-calculator" className="text-zinc-200 hover:underline">♻️ Plastic Calculator</Link></li>
                <li><Link onClick={onClose} href="/event-planner" className="text-zinc-200 hover:underline">📅 Event Planner</Link></li>
                <li><Link onClick={onClose} href="/sustainable-alternatives" className="text-zinc-200 hover:underline">🌱 Sustainable Alternatives</Link></li>
                <li><Link onClick={onClose} href="/features" className="text-zinc-200 hover:underline">⭐ All Features</Link></li>
              </ul>
              
              <div className="text-sm font-semibold text-zinc-100 mb-3 mt-6">Resources</div>
              <ul className="space-y-2 text-sm">
                <li><Link onClick={onClose} href="/learn" className="text-zinc-200 hover:underline">Learn</Link></li>
                <li><Link onClick={onClose} href="/faqs" className="text-zinc-200 hover:underline">FAQs</Link></li>
                <li><Link onClick={onClose} href="/security" className="text-zinc-200 hover:underline">Security</Link></li>
                <li><Link onClick={onClose} href="/platforms" className="text-zinc-200 hover:underline">Platforms</Link></li>
              </ul>
              <div className="mt-4 pt-4 border-t border-zinc-800 text-xs text-zinc-400">
                About CarbonX
                <div className="mt-2 space-x-3">
                  <Link onClick={onClose} href="/support" className="hover:underline">Support</Link>
                  <Link onClick={onClose} href="/blog" className="hover:underline">Blog</Link>
                  <Link onClick={onClose} href="/careers" className="hover:underline">Careers</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureTile({ title, text, color, href, badge, onClick }: { title: string; text: string; color: string; href: string; badge?: string; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className={`group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br ${color} text-white p-5 min-h-[140px] flex items-end`}>
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_40%)]" />
      <div className="relative">
        <div className="text-2xl font-bold drop-shadow-sm">{title}</div>
        <div className="text-sm opacity-90">{text}</div>
      </div>
      {badge && (
        <span className="absolute top-3 right-3 text-[10px] px-2 py-1 rounded-full bg-white/90 text-zinc-800">{badge}</span>
      )}
    </Link>
  );
}
