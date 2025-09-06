"use client";

import { useState } from "react";

export default function TokenPanel() {
  const [balance] = useState("0");

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-zinc-100 mb-4">Token Portfolio</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-zinc-300">Carbon Credits</span>
          <span className="text-zinc-100 font-semibold">{balance} CCT</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-300">Portfolio Value</span>
          <span className="text-zinc-100 font-semibold">$0.00</span>
        </div>
        <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-2 px-4 rounded transition-colors">
          View Portfolio
        </button>
      </div>
    </div>
  );
}
