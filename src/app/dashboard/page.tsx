"use client";

import dynamic from "next/dynamic";

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
      
      {/* Trading Section */}
      <div className="mt-8 w-full max-w-7xl">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-zinc-100">Carbon Credits Trading</h2>
            <a 
              href="/trading" 
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
            >
              Open Trading Platform
            </a>
          </div>
          <p className="text-zinc-400 text-sm">
            Trade verified carbon credits with real-time market data and MetaMask integration. 
            Connect your wallet above to get started with carbon credit trading.
          </p>
        </div>
      </div>
    </main>
  );
}
