import { Metadata } from 'next';
import AIPlasticCalculator from '@/components/AIPlasticCalculator';

export const metadata: Metadata = {
  title: 'AI Plastic Footprint Calculator | CarbonX',
  description: 'Get instant AI-powered plastic waste analysis for your business, event, or lifestyle with actionable reduction strategies and downloadable reports',
  keywords: 'plastic footprint, plastic waste, AI calculator, environmental impact, sustainability, plastic reduction',
};

export default function PlasticCalculatorPage() {
  return <AIPlasticCalculator />;
}
