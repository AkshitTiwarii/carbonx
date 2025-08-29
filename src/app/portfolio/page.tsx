import { Metadata } from 'next';
import CryptoPortfolio from '@/components/CryptoPortfolio';

export const metadata: Metadata = {
  title: 'Crypto Portfolio | CarbonX',
  description: 'Track your cryptocurrency and carbon credit portfolio with real-time market data and MetaMask integration',
};

export default function CryptoPortfolioPage() {
  return <CryptoPortfolio />;
}
