"use client";

import Image from "next/image";
import { ConnectButton } from "thirdweb/react";
import thirdwebIcon from "../public/thirdweb.svg";
import { client } from "./client";
import Link from "next/link";

export default function Home() {
  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <Header />
        <div className="flex justify-center mb-20">
          <ConnectButton
            client={client}
            appMetadata={{
              name: "CarbonX",
              url: "https://carbonx.com",
            }}
          />
        </div>
        <div className="flex gap-4 justify-center mb-10">
          <Link href="/dashboard" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">Dashboard</Link>
          <Link href="/login" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Login</Link>
          <Link href="/signup" className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Sign Up</Link>
        </div>
        <ThirdwebResources />
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <Image
        src={thirdwebIcon}
        alt="CarbonX Logo"
        width={150}
        height={150}
        style={{
          filter: "drop-shadow(0px 0px 24px #a726a9a8)",
        }}
      />
      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 text-green-800">
        CarbonX
        <span className="text-zinc-300 inline-block mx-1"> | </span>
        <span className="inline-block -skew-x-6 text-blue-500">AI + Web3</span>
      </h1>
      <p className="text-zinc-700 text-lg text-center max-w-2xl">
        Empowering startups, individuals, and companies to trade carbon credits just like stocks—securely, transparently, and intelligently.
      </p>
    </header>
  );
}

function ThirdwebResources() {
  return (
    <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
      <FeatureCard title="Real-time Trading" desc="Buy and sell carbon credits instantly with live price updates." />
      <FeatureCard title="AI Footprint Calculator" desc="Calculate your carbon footprint using AI-powered tools." />
      <FeatureCard title="Price Prediction" desc="ML models predict carbon credit price trends." />
      <FeatureCard title="Fraud Detection" desc="AI engine detects anomalies and fraud in trading." />
    </section>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 border border-green-200">
      <h2 className="text-2xl font-semibold text-green-700 mb-2">{title}</h2>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}
