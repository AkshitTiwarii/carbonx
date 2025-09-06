"use client";

import { ConnectButton } from "thirdweb/react";
import { client } from "../app/client";

export default function WalletPanel() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-zinc-100 mb-4">Wallet Connection</h3>
      <div className="space-y-4">
        <ConnectButton client={client} />
        <p className="text-zinc-400 text-sm">
          Connect your wallet to start trading carbon credits and managing your portfolio.
        </p>
      </div>
    </div>
  );
}
