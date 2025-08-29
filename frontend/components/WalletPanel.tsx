"use client";

import { useState } from "react";
import { getSigner } from "../utils/web3";

export default function WalletPanel() {
  const [address, setAddress] = useState<string | null>(null);

  async function connect() {
    try {
      const signer = await getSigner();
      const addr = await signer.getAddress();
      setAddress(addr);
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="bg-white rounded shadow p-6">
      <h3 className="text-lg font-semibold text-green-700 mb-2">Wallet</h3>
      {address ? (
        <p className="text-gray-700">Connected: {address}</p>
      ) : (
        <button onClick={connect} className="px-4 py-2 bg-blue-600 text-white rounded">Connect MetaMask</button>
      )}
    </div>
  );
}
