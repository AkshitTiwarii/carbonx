import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Water Footprint Calculator | CarbonX',
  description: 'Estimate your water consumption based on diet, daily usage, and household size. Get personalized water-saving tips and regional comparisons.',
  keywords: 'water footprint, water conservation, water calculator, sustainability, water usage, environmental impact',
};

export default function WaterCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

