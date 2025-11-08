import { NextRequest, NextResponse } from 'next/server';

const DIET_WATER_FOOTPRINT = {
  vegetarian: 1500,
  'non-vegetarian': 3800,
  vegan: 1200,
};

const DIRECT_WATER_USAGE = {
  shower: { perMinute: 9, defaultMinutes: 8 },
  laundry: { perLoad: 50, defaultLoads: 3 },
  dishwashing: { perLoad: 15, handWash: 30, defaultLoads: 1 },
};

const REGIONAL_AVERAGES: Record<string, number> = {
  'united-states': 300,
  'canada': 280,
  'mexico': 200,
  'united-kingdom': 150,
  'germany': 120,
  'france': 150,
  'spain': 130,
  'italy': 200,
  'china': 200,
  'india': 135,
  'japan': 250,
  'south-korea': 280,
  'australia': 300,
  'brazil': 150,
  'south-africa': 100,
  'global-average': 200,
};

interface WaterCalculatorInputs {
  dietType?: 'vegetarian' | 'non-vegetarian' | 'vegan';
  dailyWaterUsage?: {
    showerMinutes?: number;
    laundryLoadsPerWeek?: number;
    dishwashingLoadsPerDay?: number;
    handWashDishes?: boolean;
  };
  householdSize?: number;
  location?: string;
}

function calculateDirectWaterUsage(inputs: WaterCalculatorInputs): number {
  const { dailyWaterUsage } = inputs;
  if (!dailyWaterUsage) return 0;
  let dailyLiters = 0;
  const showerMinutes = dailyWaterUsage.showerMinutes ?? DIRECT_WATER_USAGE.shower.defaultMinutes;
  dailyLiters += DIRECT_WATER_USAGE.shower.perMinute * showerMinutes;
  const laundryLoadsPerWeek = dailyWaterUsage.laundryLoadsPerWeek ?? DIRECT_WATER_USAGE.laundry.defaultLoads;
  dailyLiters += (DIRECT_WATER_USAGE.laundry.perLoad * laundryLoadsPerWeek) / 7;
  if (dailyWaterUsage.handWashDishes) {
    dailyLiters += DIRECT_WATER_USAGE.dishwashing.handWash * 2.5;
  } else {
    const dishwashingLoads = dailyWaterUsage.dishwashingLoadsPerDay ?? DIRECT_WATER_USAGE.dishwashing.defaultLoads;
    dailyLiters += DIRECT_WATER_USAGE.dishwashing.perLoad * dishwashingLoads;
  }
  return dailyLiters;
}

function calculateDietWaterFootprint(inputs: WaterCalculatorInputs): number {
  const dietType = inputs.dietType ?? 'non-vegetarian';
  return DIET_WATER_FOOTPRINT[dietType] ?? DIET_WATER_FOOTPRINT['non-vegetarian'];
}

function getRegionalAverage(location?: string): number {
  if (!location) return REGIONAL_AVERAGES['global-average'];
  const normalizedLocation = location.toLowerCase().replace(/\s+/g, '-');
  return REGIONAL_AVERAGES[normalizedLocation] ?? REGIONAL_AVERAGES['global-average'];
}

function generateTips(inputs: WaterCalculatorInputs, dailyLiters: number): string[] {
  const tips: string[] = [];
  const { dietType, dailyWaterUsage, householdSize } = inputs;
  const showerMinutes = dailyWaterUsage?.showerMinutes ?? DIRECT_WATER_USAGE.shower.defaultMinutes;
  if (showerMinutes > 10) {
    tips.push(`Reduce shower time from ${showerMinutes} to 5 minutes to save ${(showerMinutes - 5) * DIRECT_WATER_USAGE.shower.perMinute} liters per day.`);
  } else if (showerMinutes > 5) {
    tips.push(`Consider reducing shower time to 5 minutes to save water.`);
  }
  tips.push('Install a low-flow showerhead to reduce water usage by up to 40% without sacrificing comfort.');
  const laundryLoads = dailyWaterUsage?.laundryLoadsPerWeek ?? DIRECT_WATER_USAGE.laundry.defaultLoads;
  if (laundryLoads > 4) {
    tips.push(`Run full loads of laundry instead of partial loads. You're currently doing ${laundryLoads} loads per week.`);
  } else {
    tips.push('Always run full loads of laundry to maximize water efficiency.');
  }
  tips.push('Use cold water for laundry when possible - it saves energy and is often just as effective.');
  if (dailyWaterUsage?.handWashDishes) {
    tips.push('Switch to an efficient dishwasher - it uses 50% less water than hand washing.');
    tips.push('If hand washing, fill one basin with soapy water and one with rinse water instead of running the tap.');
  } else {
    tips.push('Only run the dishwasher when it\'s completely full to maximize efficiency.');
  }
  if (dietType === 'non-vegetarian') {
    tips.push('Consider reducing meat consumption - vegetarian diets use 60% less water than meat-based diets.');
    tips.push('Meat production is water-intensive. Try "Meatless Mondays" to reduce your water footprint.');
  } else if (dietType === 'vegetarian') {
    tips.push('Great choice! Your vegetarian diet already has a lower water footprint than meat-based diets.');
  } else if (dietType === 'vegan') {
    tips.push('Excellent! Your vegan diet has the lowest water footprint among all diet types.');
  }
  if (householdSize && householdSize > 1) {
    tips.push(`With ${householdSize} people in your household, small changes add up quickly. Coordinate shower times and laundry schedules.`);
  }
  tips.push('Fix leaky faucets immediately - a single drip can waste 20 liters per day.');
  tips.push('Collect rainwater for gardening and outdoor use.');
  tips.push('Turn off the tap while brushing teeth or washing hands - save 6-8 liters per minute.');
  return tips.slice(0, 8);
}

function getRegionalComparison(dailyLiters: number, location?: string, householdSize: number = 1): string {
  const regionalAverage = getRegionalAverage(location);
  const perPersonDaily = dailyLiters / householdSize;
  const difference = perPersonDaily - regionalAverage;
  const percentDifference = (difference / regionalAverage) * 100;
  const locationName = location ? `in ${location}` : 'globally';
  if (Math.abs(percentDifference) < 5) {
    return `Your water usage is very close to the average ${locationName}. Keep up the good work!`;
  } else if (percentDifference > 0) {
    return `You use ${Math.abs(percentDifference).toFixed(0)}% more water than the average household ${locationName}. Consider implementing some water-saving tips.`;
  } else {
    return `You use ${Math.abs(percentDifference).toFixed(0)}% less water than the average household ${locationName}. Great job conserving water!`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const inputs: WaterCalculatorInputs = await request.json();
    const dietType = inputs.dietType ?? 'non-vegetarian';
    const householdSize = inputs.householdSize ?? 1;
    const location = inputs.location;
    const dietWaterFootprint = calculateDietWaterFootprint(inputs);
    const directWaterUsage = calculateDirectWaterUsage(inputs);
    const dailyLitersPerPerson = dietWaterFootprint + directWaterUsage;
    const dailyLiters = dailyLitersPerPerson * householdSize;
    const monthlyLiters = dailyLiters * 30;
    const yearlyLiters = dailyLiters * 365;
    const tips = generateTips(inputs, dailyLiters);
    const regionalComparison = getRegionalComparison(dailyLiters, location, householdSize);
    const response = {
      daily_liters: Math.round(dailyLiters),
      monthly_liters: Math.round(monthlyLiters),
      yearly_liters: Math.round(yearlyLiters),
      breakdown: {
        diet_water_footprint: Math.round(dietWaterFootprint * householdSize),
        direct_water_usage: Math.round(directWaterUsage * householdSize),
        per_person_daily: Math.round(dailyLitersPerPerson),
      },
      tips,
      regional_comparison: regionalComparison,
      regional_average: getRegionalAverage(location),
      assumptions: {
        diet_type: dietType,
        household_size: householdSize,
        location: location || 'global-average',
        note: inputs.dietType ? undefined : 'Diet type defaulted to non-vegetarian. Please specify your diet type for accurate calculations.',
      },
    };
    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Water Calculator error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
