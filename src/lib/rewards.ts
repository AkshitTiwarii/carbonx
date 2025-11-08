/**
 * CarbonX Gamified Sustainability Rewards System
 * 
 * This module provides utilities and types for the rewards system.
 * Use the /api/rewards endpoint to track actions and get rewards.
 */

export interface RewardAction {
  user_id: string;
  action: ActionType;
  action_value?: number;
  timestamp?: string;
  location?: string;
  wallet_address?: string;
}

export type ActionType =
  | "carbon_offset"
  | "energy_saving"
  | "ai_eco_tool"
  | "event_participation"
  | "water_saving"
  | "plastic_reduction"
  | "sustainable_transport"
  | "recycling"
  | "tree_planting"
  | "renewable_energy";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface RewardsResponse {
  user_id: string;
  ecoPoints: number;
  pointsEarned: number;
  new_badges: string[];
  leaderboard: {
    global_rank: number;
    regional_rank: number | null;
    total_users: number;
  };
  wallet_tx?: {
    ecoPointsNFT?: string;
    badgeNFTs?: string[];
  };
  milestone_message: string;
  stats: {
    totalActions: number;
    totalCO2Offset: number;
    totalEnergySaved: number;
    badges: number;
  };
  animation_data: {
    pointsEarned: number;
    levelUp: boolean;
    rankChange: number;
  };
}

/**
 * Calculate estimated EcoPoints for an action (client-side helper)
 */
export function estimateEcoPoints(actionType: ActionType, actionValue: number): number {
  const multipliers: Record<ActionType, number> = {
    carbon_offset: 100,
    energy_saving: 2,
    ai_eco_tool: 50,
    event_participation: 200,
    water_saving: 0.1,
    plastic_reduction: 5,
    sustainable_transport: 10,
    recycling: 25,
    tree_planting: 150,
    renewable_energy: 75,
  };

  return Math.round(actionValue * (multipliers[actionType] || 10));
}

/**
 * Track a user action and get rewards
 */
export async function trackAction(
  action: RewardAction
): Promise<RewardsResponse> {
  const response = await fetch("/api/rewards", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: action.user_id,
      action: action.action,
      action_value: action.action_value || 1,
      timestamp: action.timestamp || new Date().toISOString(),
      location: action.location,
      wallet_address: action.wallet_address,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get user rewards data
 */
export async function getUserRewards(userId: string) {
  const response = await fetch(`/api/rewards?user_id=${encodeURIComponent(userId)}`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get leaderboard data
 */
export async function getLeaderboard(
  type: "global" | "regional" = "global",
  location?: string,
  limit: number = 100
) {
  const params = new URLSearchParams({
    type,
    limit: limit.toString(),
  });
  if (location) {
    params.append("location", location);
  }

  const response = await fetch(`/api/rewards?${params.toString()}`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

