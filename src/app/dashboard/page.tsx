"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const WalletPanel = dynamic(() => import("@/components/WalletPanel"), { ssr: false });
const TradePanel = dynamic(() => import("@/components/TradePanel"), { ssr: false });
const TokenPanel = dynamic(() => import("@/components/TokenPanel"), { ssr: false });
const MetaMaskConnect = dynamic(() => import("@/components/MetaMaskConnect"), { ssr: false });

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-zinc-950 p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-zinc-100 mb-6">CarbonX Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
        <MetaMaskConnect />
        <WalletPanel />
        <TradePanel />
        <TokenPanel />
      </div>
      
      {/* Recent Activity */}
      <div className="w-full max-w-7xl">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-zinc-100 mb-4">Welcome to CarbonX</h2>
          <p className="text-zinc-400 mb-4">
            Your one-stop platform for carbon credit trading, portfolio management, and sustainable investing. 
            Get started by connecting your MetaMask wallet and exploring our features.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/features" 
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg p-4 transition-all"
            >
              <h3 className="text-zinc-100 font-semibold mb-2">Explore Features</h3>
              <p className="text-zinc-400 text-sm">Discover all the tools and calculators available</p>
            </Link>
            <Link 
              href="/toucan-demo" 
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg p-4 transition-all"
            >
              <h3 className="text-zinc-100 font-semibold mb-2">Toucan Protocol Demo</h3>
              <p className="text-zinc-400 text-sm">Experience advanced carbon credit trading</p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
