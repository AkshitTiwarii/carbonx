/**
 * Example integration of rewards system with existing features
 * 
 * This file shows how to integrate the rewards system with:
 * - Calculator usage
 * - Carbon offsetting
 * - AI tool usage
 * - Water/Plastic calculations
 */

import { useRewards } from "@/hooks/useRewards";

/**
 * Example: Award points when user uses AI calculator
 */
export async function onAICalculatorUse() {
  // In your calculator component:
  // const { awardPoints } = useRewards();
  
  // After successful calculation:
  // await awardPoints({
  //   type: 'ai_tool_use',
  //   amount: 1,
  //   metadata: {
  //     calculator_type: 'carbon',
  //     query: userQuery,
  //   },
  // });
}

/**
 * Example: Award points when user offsets carbon
 */
export async function onCarbonOffset(amountInTons: number) {
  // In your offsetting component:
  // const { awardPoints } = useRewards();
  
  // After successful offset:
  // await awardPoints({
  //   type: 'carbon_offset',
  //   amount: amountInTons,
  //   metadata: {
  //     project_id: projectId,
  //     transaction_hash: txHash,
  //   },
  // });
}

/**
 * Example: Award points when user uses water calculator
 */
export async function onWaterCalculatorUse() {
  // const { awardPoints } = useRewards();
  // await awardPoints({
  //   type: 'water_calculation',
  //   amount: 1,
  // });
}

/**
 * Example: Award points when user uses plastic calculator
 */
export async function onPlasticCalculatorUse() {
  // const { awardPoints } = useRewards();
  // await awardPoints({
  //   type: 'plastic_calculation',
  //   amount: 1,
  // });
}

/**
 * Example: Award points when user invests in carbon credit project
 */
export async function onInvestment(projectId: string, amount: number) {
  // const { awardPoints } = useRewards();
  // await awardPoints({
  //   type: 'investment',
  //   amount: 1,
  //   metadata: {
  //     project_id: projectId,
  //     investment_amount: amount,
  //   },
  // });
}

/**
 * Example: Award points for energy savings
 */
export async function onEnergySavings(mwhSaved: number) {
  // const { awardPoints } = useRewards();
  // await awardPoints({
  //   type: 'energy_savings',
  //   amount: mwhSaved,
  //   metadata: {
  //     savings_type: 'renewable_energy',
  //   },
  // });
}

