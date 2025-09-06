import SimpleMetaMaskConnect from '@/components/SimpleMetaMaskConnect';

export default function MetaMaskTestPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">MetaMask Integration Test</h1>
      <SimpleMetaMaskConnect />
    </div>
  );
}
