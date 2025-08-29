"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../utils/api";

export default function TradePanel() {
  const [price, setPrice] = useState<number | null>(null);
  const [amount, setAmount] = useState(10);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    apiGet<{ symbol: string; price: number }>("/api/credits/price").then((d) => setPrice(d.price));
  }, []);

  async function trade(action: "buy" | "sell") {
    setStatus("Submitting...");
    try {
      const res = await apiPost<{ status: string }>("/api/credits/trade", { amount, action });
      setStatus(`Trade ${res.status}`);
    } catch (e: any) {
      setStatus(e.message);
    }
  }

  return (
    <div className="bg-white rounded shadow p-6">
      <h3 className="text-lg font-semibold text-green-700 mb-2">Trade CO2C</h3>
      <p className="text-gray-700 mb-2">Current Price: {price ? `$${price}` : "..."}</p>
      <div className="flex gap-2 items-center mb-4">
        <input type="number" className="border p-2 rounded w-24" value={amount} onChange={(e) => setAmount(parseInt(e.target.value))} />
        <button onClick={() => trade("buy")} className="px-4 py-2 bg-green-600 text-white rounded">Buy</button>
        <button onClick={() => trade("sell")} className="px-4 py-2 bg-red-600 text-white rounded">Sell</button>
      </div>
      <p className="text-sm text-gray-500">{status}</p>
    </div>
  );
}
