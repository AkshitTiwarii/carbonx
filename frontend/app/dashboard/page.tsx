"use client";

import { useState } from "react";
import { ConnectButton } from "thirdweb/react";
import { client } from "../client";

export default function Dashboard() {
  // Placeholder for user data, trading, and analytics
  const [carbonCredits, setCarbonCredits] = useState(120);
  const [greenScore, setGreenScore] = useState(78);

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-green-800 mb-4">CarbonX Dashboard</h1>
      <ConnectButton client={client} appMetadata={{ name: "CarbonX", url: "https://carbonx.com" }} />
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="bg-white rounded shadow p-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold text-green-700 mb-2">Your Carbon Credits</h2>
          <p className="text-4xl font-bold text-blue-700">{carbonCredits}</p>
          <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Buy More</button>
        </div>
        <div className="bg-white rounded shadow p-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold text-green-700 mb-2">GreenScore</h2>
          <p className="text-4xl font-bold text-green-600">{greenScore}</p>
          <span className="text-gray-500">Eco Rating</span>
        </div>
        <div className="bg-white rounded shadow p-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold text-green-700 mb-2">Live Trading</h2>
          <p className="text-gray-700">Trade carbon credits in real time. (Coming soon!)</p>
        </div>
        <div className="bg-white rounded shadow p-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold text-green-700 mb-2">Analytics</h2>
          <p className="text-gray-700">Track your emissions, trades, and sustainability trends.</p>
        </div>
      </div>
    </main>
  );
}
