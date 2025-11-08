/**
 * Automatic Rewards Tracking
 * 
 * This module provides utilities to automatically track user actions
 * when they use calculators, tools, or complete sustainability actions.
 */

import { trackAction, type ActionType } from "./rewards";

/**
 * Automatically track rewards for calculator usage
 */
export async function trackCalculatorUsage(
  userId: string | undefined,
  calculatorType: "water" | "plastic" | "ai_carbon" | "event",
  calculatedValue?: number,
  location?: string
) {
  if (!userId) {
    // Silently fail if no user ID - don't break the calculator
    return null;
  }

  try {
    const actionMap: Record<string, ActionType> = {
      water: "water_saving",
      plastic: "plastic_reduction",
      ai_carbon: "ai_eco_tool",
      event: "event_participation",
    };

    const action = actionMap[calculatorType] || "ai_eco_tool";
    
    // Calculate points based on calculator type
    let actionValue = 1; // Default to 1 action
    if (calculatedValue) {
      // Convert calculator values to meaningful action values
      switch (calculatorType) {
        case "water":
          // Water saved in liters - convert to action value
          actionValue = Math.max(1, Math.round(calculatedValue / 100)); // Every 100L = 1 action point
          break;
        case "plastic":
          // Plastic reduced in kg
          actionValue = Math.max(1, Math.round(calculatedValue));
          break;
        case "ai_carbon":
          // AI tool usage
          actionValue = 1;
          break;
        case "event":
          // Event participation
          actionValue = 1;
          break;
      }
    }

    const result = await trackAction({
      user_id: userId,
      action: action,
      action_value: actionValue,
      location: location,
    });

    return result;
  } catch (error) {
    // Silently fail - don't break the main feature
    console.error("Auto-rewards tracking failed:", error);
    return null;
  }
}

/**
 * Track carbon offset actions
 */
export async function trackCarbonOffset(
  userId: string | undefined,
  co2Tons: number,
  location?: string,
  walletAddress?: string
) {
  if (!userId) return null;

  try {
    return await trackAction({
      user_id: userId,
      action: "carbon_offset",
      action_value: co2Tons,
      location: location,
      wallet_address: walletAddress,
    });
  } catch (error) {
    console.error("Carbon offset tracking failed:", error);
    return null;
  }
}

/**
 * Track energy saving actions
 */
export async function trackEnergySaving(
  userId: string | undefined,
  kwh: number,
  location?: string
) {
  if (!userId) return null;

  try {
    return await trackAction({
      user_id: userId,
      action: "energy_saving",
      action_value: kwh,
      location: location,
    });
  } catch (error) {
    console.error("Energy saving tracking failed:", error);
    return null;
  }
}

