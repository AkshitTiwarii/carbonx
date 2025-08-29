import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 flex flex-col items-center justify-center">
      <Head>
        <title>CarbonX | AI + Web3 Carbon Credit Exchange</title>
        <meta name="description" content="Buy, sell, and offset carbon credits with AI and blockchain." />
      </Head>
      <main className="flex flex-col items-center gap-8">
        <h1 className="text-5xl font-bold text-green-800">CarbonX Demo</h1>
        <p className="text-xl text-gray-700 max-w-xl text-center">
          Empowering startups, individuals, and companies to trade carbon credits just like stocks—securely, transparently, and intelligently.
        </p>
        <div className="flex gap-4">
          <Link href="/login" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">Login</Link>
          <Link href="/signup" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Sign Up</Link>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <FeatureCard title="Real-time Trading" desc="Buy and sell carbon credits instantly with live price updates." />
          <FeatureCard title="AI Footprint Calculator" desc="Calculate your carbon footprint using AI-powered tools." />
          <FeatureCard title="Price Prediction" desc="ML models predict carbon credit price trends." />
          <FeatureCard title="Fraud Detection" desc="AI engine detects anomalies and fraud in trading." />
        </div>
      </main>
    </div>
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
