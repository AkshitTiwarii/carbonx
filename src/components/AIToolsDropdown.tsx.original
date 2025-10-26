"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Calculator, Recycle, Calendar, Leaf, MessageCircle, TrendingUp, BarChart3 } from "lucide-react";

interface AITool {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  status: 'available' | 'coming-soon';
}

const AI_TOOLS: AITool[] = [
  {
    id: 'carbon-calculator',
    name: 'AI Carbon Calculator',
    description: 'Get instant carbon footprint analysis with AI-powered emission calculations and credit recommendations',
    href: '/ai-calculator',
    icon: <Calculator className="w-5 h-5" />,
    badge: 'AI',
    status: 'available'
  },
  {
    id: 'plastic-calculator',
    name: 'AI Plastic Footprint',
    description: 'Analyze plastic waste impact with smart reduction strategies and sustainable alternatives',
    href: '/plastic-calculator',
    icon: <Recycle className="w-5 h-5" />,
    badge: 'AI',
    status: 'available'
  },
  {
    id: 'event-planner',
    name: 'Sustainable Event Planner',
    description: 'Plan eco-friendly events with AI-powered sustainability recommendations and carbon tracking',
    href: '/event-planner',
    icon: <Calendar className="w-5 h-5" />,
    badge: 'NEW',
    status: 'available'
  },
  {
    id: 'ai-chat',
    name: 'Sustainability Chat',
    description: 'Chat with our AI assistant for personalized sustainability advice and carbon reduction tips',
    href: '/ai-chat',
    icon: <MessageCircle className="w-5 h-5" />,
    badge: 'BETA',
    status: 'coming-soon'
  }
];

interface AIToolsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

export default function AIToolsDropdown({ isOpen, onClose, triggerRef }: AIToolsDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const availableTools = AI_TOOLS.filter(tool => tool.status === 'available');
  const comingSoonTools = AI_TOOLS.filter(tool => tool.status === 'coming-soon');

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'AI': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'NEW': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'BETA': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'COMING SOON': return 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white';
      default: return 'bg-zinc-600 text-white';
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-2 w-96 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
        <h3 className="text-lg font-semibold text-zinc-100 mb-1">AI-Powered Tools</h3>
        <p className="text-sm text-zinc-400">Intelligent solutions for sustainability management</p>
      </div>

      {/* Available Tools */}
      <div className="p-2">
        <div className="mb-3">
          <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide px-2 py-1">Available Now</h4>
        </div>
        {availableTools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            onClick={onClose}
            className="block p-3 rounded-lg hover:bg-zinc-800/60 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 bg-zinc-800/50 rounded-lg group-hover:bg-zinc-700/60 transition-colors">
                {tool.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="font-medium text-zinc-100 group-hover:text-white transition-colors">
                    {tool.name}
                  </h5>
                  {tool.badge && (
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getBadgeColor(tool.badge)}`}>
                      {tool.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Coming Soon Tools */}
      {comingSoonTools.length > 0 && (
        <>
          <div className="border-t border-zinc-800"></div>
          <div className="p-2">
            <div className="mb-3">
              <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide px-2 py-1">Coming Soon</h4>
            </div>
            {comingSoonTools.map((tool) => (
              <div
                key={tool.id}
                className="block p-3 rounded-lg opacity-60 cursor-not-allowed"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 bg-zinc-800/30 rounded-lg">
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-zinc-300">
                        {tool.name}
                      </h5>
                      {tool.badge && (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getBadgeColor(tool.badge)}`}>
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="border-t border-zinc-800 p-4 bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400">More tools coming soon</p>
            <p className="text-xs text-zinc-500">Powered by AI & sustainability science</p>
          </div>
          <Link
            href="/roadmap"
            onClick={onClose}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            View Roadmap →
          </Link>
        </div>
      </div>
    </div>
  );
}

// Hook for managing dropdown state
export function useAIToolsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    toggle,
    close,
    triggerRef
  };
}
