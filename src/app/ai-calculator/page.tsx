import { Metadata } from 'next';
import AICarbonCalculator from '@/components/AICarbonCalculator';

export const metadata: Metadata = {
  title: 'AI Carbon Credits Calculator | CarbonX',
  description: 'Get instant AI-powered carbon credit calculations for your industry using natural language processing and industry-specific emission factors',
  keywords: 'carbon credits, AI calculator, emissions, carbon footprint, sustainability',
};

export default function AICalculatorPage() {
  return <AICarbonCalculator />;
}
