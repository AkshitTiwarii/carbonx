"use client";

import Link from "next/link";
import { useEffect } from "react";

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuItem = ({ children, href }: { children: React.ReactNode, href: string }) => (
  <li>
    <Link
      href={href}
      className="text-zinc-200 hover:text-white transition-all duration-200 flex items-center gap-2 py-1"
    >
      {children}
    </Link>
  </li>
);

const FeatureTile = ({
  title,
  text,
  color,
  href,
  badge
}: {
  title: string;
  text: string;
  color: string;
  href: string;
  badge?: string;
}) => (
  <Link
    href={href}
    className={`group relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br ${color} text-white p-5 min-h-[140px] flex flex-col justify-end w-full transition-all duration-300 hover:shadow-lg`}
  >
    <div className="relative z-10">
      <div className="text-2xl font-bold drop-shadow-sm">{title}</div>
      <div className="text-sm opacity-90">{text}</div>
    </div>
    
    {badge && (
      <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-white/90 text-zinc-800 font-medium">
        {badge}
      </span>
    )}
  </Link>
);

export default function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  useEffect(() => {
    if (!isOpen) return;
    
    // Close on escape key
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    // Lock body scroll when menu is open
    document.body.style.overflow = 'hidden';
    
    window.addEventListener("keydown", onKey);
    
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Centered Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="mega-menu-container bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-zinc-800/50">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-bold text-xl text-white hover:text-emerald-300 transition-colors">
                CarbonX
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-300">
                <span className="font-medium text-emerald-400">Menu ▾</span>
                <Link href="/developer" className="hover:text-emerald-300 transition-colors">
                  Developer
                </Link>
                <Link href="/cryptocurrencies" className="hover:text-emerald-300 transition-colors">
                  Cryptocurrencies
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard" 
                className="hidden md:inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2 text-sm font-medium hover:shadow-lg hover:from-emerald-400 hover:to-emerald-500 transition-all"
              >
                Get App
              </Link>
              <button
                onClick={onClose}
                aria-label="Close menu"
                title="Close menu"
                className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 p-4 md:p-8">
            {/* Left: Feature Tiles */}
            <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureTile 
                title="Marketplace" 
                text="Browse verified carbon credits" 
                color="from-orange-500 to-red-500" 
                href="/marketplace" 
                badge="HOT"
              />
              <FeatureTile 
                title="Trading" 
                text="Trade carbon credits" 
                color="from-indigo-500 to-blue-600" 
                href="/trading" 
                badge="NEW"
              />
              <FeatureTile 
                title="Portfolio" 
                text="Track crypto assets" 
                color="from-violet-500 to-purple-600" 
                href="/portfolio" 
                badge="NEW"
              />
              <FeatureTile 
                title="Toucan Protocol" 
                text="Real blockchain carbon credits" 
                color="from-emerald-500 to-teal-600" 
                href="/toucan-demo" 
                badge="NEW"
              />
              <FeatureTile 
                title="AI Calculator" 
                text="AI-powered carbon credits" 
                color="from-green-500 to-emerald-600" 
                href="/ai-calculator" 
                badge="AI"
              />
              <FeatureTile 
                title="Event Planner" 
                text="Plan sustainable events" 
                color="from-emerald-500 to-green-600" 
                href="/event-planner" 
                badge="NEW"
              />
            </div>
            
            {/* Right: Links */}
            <div className="md:col-span-3">
              <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-5 shadow-lg">
                <div className="text-sm font-bold text-emerald-400 mb-4 uppercase tracking-wider">
                  Explore more
                </div>
                
                <ul className="space-y-2 text-sm">
                  <MenuItem href="/marketplace">💰 Carbon Marketplace</MenuItem>
                  <MenuItem href="/trading">📈 Trading Platform</MenuItem>
                  <MenuItem href="/portfolio">📊 Crypto Portfolio</MenuItem>
                  <MenuItem href="/toucan-demo">🌿 Toucan Protocol</MenuItem>
                  <MenuItem href="/ai-calculator">🤖 AI Carbon Calculator</MenuItem>
                  <MenuItem href="/plastic-calculator">♻️ Plastic Calculator</MenuItem>
                  <MenuItem href="/event-planner">📅 Event Planner</MenuItem>
                  <MenuItem href="/sustainable-alternatives">🌱 Sustainable Alternatives</MenuItem>
                  <MenuItem href="/features">⭐ All Features</MenuItem>
                </ul>
                
                <div className="text-sm font-bold text-emerald-400 mb-4 mt-8 uppercase tracking-wider">
                  Resources
                </div>
                
                <ul className="space-y-2 text-sm">
                  <MenuItem href="/learn">Learn</MenuItem>
                  <MenuItem href="/faqs">FAQs</MenuItem>
                  <MenuItem href="/security">Security</MenuItem>
                  <MenuItem href="/platforms">Platforms</MenuItem>
                </ul>
                
                <div className="mt-6 pt-5 border-t border-zinc-800/50 text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-300">About CarbonX</span>
                  <div className="mt-3 flex gap-4">
                    <Link onClick={onClose} href="/support" className="hover:text-emerald-300 transition-colors">Support</Link>
                    <Link onClick={onClose} href="/blog" className="hover:text-emerald-300 transition-colors">Blog</Link>
                    <Link onClick={onClose} href="/careers" className="hover:text-emerald-300 transition-colors">Careers</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
