"use client";

import Link from "next/link";

export default function TradePanel() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-zinc-100 mb-4">Trading Hub</h3>
      <div className="space-y-3">
        <Link 
          href="/marketplace" 
          className="block w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-center py-2 px-4 rounded transition-colors"
        >
          Carbon Marketplace
        </Link>
        <Link 
          href="/trading" 
          className="block w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-center py-2 px-4 rounded transition-colors"
        >
          Advanced Trading
        </Link>
        <Link 
          href="/toucan-demo" 
          className="block w-full bg-emerald-800 hover:bg-emerald-700 text-zinc-100 text-center py-2 px-4 rounded transition-colors"
        >
          Toucan Protocol
        </Link>
      </div>
    </div>
  );
}
