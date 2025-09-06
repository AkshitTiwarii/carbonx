"use client";

import { ConnectButton } from "thirdweb/react";
import { client } from "../app/client";

export default function MetaMaskConnect() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-zinc-100 mb-4">Connect Wallet</h3>
      <div className="space-y-4">
        <ConnectButton client={client} />
        <div className="text-xs text-zinc-400">
          <p>• Connect your MetaMask wallet</p>
          <p>• Access your carbon credit portfolio</p>
          <p>• Start trading and investing</p>
        </div>
      </div>
    </div>
  );
}