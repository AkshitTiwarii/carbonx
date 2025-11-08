/**
 * CarbonX Gamified Sustainability Rewards System API
 * 
 * This API tracks user sustainability actions, calculates EcoPoints, manages badges,
 * maintains leaderboards, and integrates with ThirdWeb for NFT minting.
 * 
 * POST /api/rewards
 *   Track a user action and get rewards
 *   Body: { user_id, action, action_value?, timestamp?, location?, wallet_address? }
 * 
 * GET /api/rewards?user_id=<id>
 *   Get user rewards data
 * 
 * GET /api/rewards?type=global&limit=100
 *   Get global leaderboard
 * 
 * GET /api/rewards?type=regional&location=<location>&limit=100
 *   Get regional leaderboard
 * 
 * Example POST request:
 * {
 *   "user_id": "12345",
 *   "action": "carbon_offset",
 *   "action_value": 2.5,
 *   "location": "United States",
 *   "wallet_address": "0x..."
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { submitEngineTransactions, type EngineTxPayload } from "@/lib/engine";

// In-memory storage (replace with database in production)
interface UserRewards {
  userId: string;
  ecoPoints: number;
  badges: string[];
  totalActions: number;
  totalCO2Offset: number; // in tons
  totalEnergySaved: number; // in kWh
  location?: string;
  lastUpdated: string;
  actions: Array<{
    type: string;
    value: number;
    points: number;
    timestamp: string;
  }>;
}

// Global leaderboard storage
const userRewards: Map<string, UserRewards> = new Map();
const globalLeaderboard: UserRewards[] = [];
const regionalLeaderboards: Map<string, UserRewards[]> = new Map();

// Badge definitions with unlock conditions
interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockCondition: (user: UserRewards) => boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "first_step",
    name: "First Step",
    description: "Completed your first sustainability action!",
    icon: "🌱",
    unlockCondition: (user) => user.totalActions >= 1,
    rarity: "common",
  },
  {
    id: "carbon_saver",
    name: "Carbon Saver",
    description: "Offset 1 ton of CO2",
    icon: "🌍",
    unlockCondition: (user) => user.totalCO2Offset >= 1,
    rarity: "common",
  },
  {
    id: "energy_hero",
    name: "Energy Hero",
    description: "Saved 100 kWh of energy",
    icon: "⚡",
    unlockCondition: (user) => user.totalEnergySaved >= 100,
    rarity: "common",
  },
  {
    id: "green_champion",
    name: "Green Champion",
    description: "Reached 1000 EcoPoints",
    icon: "🏆",
    unlockCondition: (user) => user.ecoPoints >= 1000,
    rarity: "rare",
  },
  {
    id: "carbon_master",
    name: "Carbon Master",
    description: "Offset 10 tons of CO2",
    icon: "🌳",
    unlockCondition: (user) => user.totalCO2Offset >= 10,
    rarity: "rare",
  },
  {
    id: "ai_eco_explorer",
    name: "AI Eco Explorer",
    description: "Used AI eco tools 10 times",
    icon: "🤖",
    unlockCondition: (user) => user.actions.filter((a) => a.type === "ai_eco_tool").length >= 10,
    rarity: "rare",
  },
  {
    id: "event_organizer",
    name: "Event Organizer",
    description: "Participated in 5 sustainable events",
    icon: "📅",
    unlockCondition: (user) => user.actions.filter((a) => a.type === "event_participation").length >= 5,
    rarity: "rare",
  },
  {
    id: "eco_legend",
    name: "Eco Legend",
    description: "Reached 10,000 EcoPoints",
    icon: "👑",
    unlockCondition: (user) => user.ecoPoints >= 10000,
    rarity: "epic",
  },
  {
    id: "carbon_warrior",
    name: "Carbon Warrior",
    description: "Offset 100 tons of CO2",
    icon: "🛡️",
    unlockCondition: (user) => user.totalCO2Offset >= 100,
    rarity: "epic",
  },
  {
    id: "sustainability_guru",
    name: "Sustainability Guru",
    description: "Completed 100 sustainability actions",
    icon: "🧙",
    unlockCondition: (user) => user.totalActions >= 100,
    rarity: "epic",
  },
  {
    id: "planet_protector",
    name: "Planet Protector",
    description: "Reached 50,000 EcoPoints and offset 50 tons",
    icon: "🌎",
    unlockCondition: (user) => user.ecoPoints >= 50000 && user.totalCO2Offset >= 50,
    rarity: "legendary",
  },
];

// EcoPoints calculation based on action type and impact
function calculateEcoPoints(actionType: string, actionValue: number): number {
  const multipliers: Record<string, number> = {
    carbon_offset: 100, // 100 points per ton of CO2
    energy_saving: 2, // 2 points per kWh saved
    ai_eco_tool: 50, // 50 points per AI tool usage
    event_participation: 200, // 200 points per event
    water_saving: 0.1, // 0.1 points per liter saved
    plastic_reduction: 5, // 5 points per kg reduced
    sustainable_transport: 10, // 10 points per km
    recycling: 25, // 25 points per action
    tree_planting: 150, // 150 points per tree
    renewable_energy: 75, // 75 points per installation
  };

  const multiplier = multipliers[actionType] || 10; // Default 10 points per unit
  return Math.round(actionValue * multiplier);
}

// Check and unlock new badges
function checkBadgeUnlocks(user: UserRewards): string[] {
  const newBadges: string[] = [];
  
  for (const badge of BADGE_DEFINITIONS) {
    if (!user.badges.includes(badge.id) && badge.unlockCondition(user)) {
      newBadges.push(badge.id);
      user.badges.push(badge.id);
    }
  }
  
  return newBadges;
}

// Update leaderboards
function updateLeaderboards(user: UserRewards) {
  // Update global leaderboard
  const globalIndex = globalLeaderboard.findIndex((u) => u.userId === user.userId);
  if (globalIndex >= 0) {
    globalLeaderboard[globalIndex] = user;
  } else {
    globalLeaderboard.push(user);
  }
  globalLeaderboard.sort((a, b) => b.ecoPoints - a.ecoPoints);

  // Update regional leaderboard
  if (user.location) {
    const normalizedLocation = user.location.toLowerCase().replace(/\s+/g, "-");
    let regionalLeaderboard = regionalLeaderboards.get(normalizedLocation) || [];
    const regionalIndex = regionalLeaderboard.findIndex((u) => u.userId === user.userId);
    if (regionalIndex >= 0) {
      regionalLeaderboard[regionalIndex] = user;
    } else {
      regionalLeaderboard.push(user);
    }
    regionalLeaderboard.sort((a, b) => b.ecoPoints - a.ecoPoints);
    regionalLeaderboards.set(normalizedLocation, regionalLeaderboard);
  }
}

// Get user rank
function getUserRank(userId: string, leaderboard: UserRewards[]): number {
  const index = leaderboard.findIndex((u) => u.userId === userId);
  return index >= 0 ? index + 1 : leaderboard.length + 1;
}

// Generate milestone message
function generateMilestoneMessage(
  newBadges: string[],
  oldRank: number,
  newRank: number,
  oldPoints: number,
  newPoints: number
): string {
  const messages: string[] = [];

  if (newBadges.length > 0) {
    const badgeNames = newBadges
      .map((id) => BADGE_DEFINITIONS.find((b) => b.id === id)?.name)
      .filter(Boolean)
      .join(", ");
    messages.push(`🎉 Congratulations! You unlocked: ${badgeNames}!`);
  }

  if (newRank < oldRank) {
    messages.push(`📈 Amazing progress! You moved up ${oldRank - newRank} rank${oldRank - newRank > 1 ? "s" : ""} in the leaderboard!`);
  }

  if (newPoints >= 1000 && oldPoints < 1000) {
    messages.push("🌟 You've reached 1,000 EcoPoints! You're making a real impact!");
  } else if (newPoints >= 5000 && oldPoints < 5000) {
    messages.push("✨ Incredible! 5,000 EcoPoints achieved! You're a sustainability champion!");
  } else if (newPoints >= 10000 && oldPoints < 10000) {
    messages.push("🏆 Legendary! 10,000 EcoPoints! You're an Eco Legend!");
  }

  return messages.length > 0 ? messages.join(" ") : "Great work! Keep up the sustainable actions!";
}

// Mint NFT for EcoPoints or Badge (using ThirdWeb Engine)
async function mintRewardNFT(
  userId: string,
  type: "ecoPoints" | "badge",
  amountOrBadgeId: string | number,
  walletAddress?: string
): Promise<string | null> {
  // Only mint if wallet address is provided and ThirdWeb is configured
  if (!walletAddress) {
    return null;
  }

  try {
    const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || "31337"; // Default to localhost
    const ecoPointsContract = process.env.ECOPOINTS_NFT_CONTRACT;
    const badgeContract = process.env.BADGE_NFT_CONTRACT;

    if (type === "ecoPoints" && ecoPointsContract) {
      const payload: EngineTxPayload = {
        chainId: parseInt(chainId),
        transactions: [
          {
            type: "contractCall",
            contractAddress: ecoPointsContract,
            method: "function mintTo(address to, uint256 amount)",
            params: [walletAddress, amountOrBadgeId],
          },
        ],
      };
      const result = await submitEngineTransactions(payload);
      return result.transactionHash || result.id || null;
    } else if (type === "badge" && badgeContract) {
      const payload: EngineTxPayload = {
        chainId: parseInt(chainId),
        transactions: [
          {
            type: "contractCall",
            contractAddress: badgeContract,
            method: "function mintBadge(address to, string memory badgeId)",
            params: [walletAddress, amountOrBadgeId],
          },
        ],
      };
      const result = await submitEngineTransactions(payload);
      return result.transactionHash || result.id || null;
    }
  } catch (error) {
    console.error("NFT minting error:", error);
    // Don't fail the request if NFT minting fails
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      action,
      action_value,
      timestamp,
      location,
      wallet_address,
    } = body;

    // Validate required fields
    if (!user_id || !action) {
      return NextResponse.json(
        { success: false, error: "user_id and action are required" },
        { status: 400 }
      );
    }

    // Use defaults if not provided
    const actionValue = action_value || 1;
    const actionTimestamp = timestamp || new Date().toISOString();
    const userLocation = location;

    // Get or create user rewards
    let user = userRewards.get(user_id);
    if (!user) {
      user = {
        userId: user_id,
        ecoPoints: 0,
        badges: [],
        totalActions: 0,
        totalCO2Offset: 0,
        totalEnergySaved: 0,
        location: userLocation,
        lastUpdated: actionTimestamp,
        actions: [],
      };
      userRewards.set(user_id, user);
    }

    // Calculate EcoPoints for this action
    const pointsEarned = calculateEcoPoints(action, actionValue);
    const oldPoints = user.ecoPoints;
    const oldRank = getUserRank(user_id, globalLeaderboard);

    // Update user stats
    user.ecoPoints += pointsEarned;
    user.totalActions += 1;
    user.lastUpdated = actionTimestamp;

    // Update specific metrics based on action type
    if (action === "carbon_offset") {
      user.totalCO2Offset += actionValue;
    } else if (action === "energy_saving") {
      user.totalEnergySaved += actionValue;
    }

    // Update location if provided
    if (userLocation) {
      user.location = userLocation;
    }

    // Record the action
    user.actions.push({
      type: action,
      value: actionValue,
      points: pointsEarned,
      timestamp: actionTimestamp,
    });

    // Check for new badge unlocks
    const newBadgeIds = checkBadgeUnlocks(user);
    const newBadges = newBadgeIds
      .map((id) => BADGE_DEFINITIONS.find((b) => b.id === id))
      .filter(Boolean)
      .map((b) => b!.name);

    // Update leaderboards
    updateLeaderboards(user);
    const newRank = getUserRank(user_id, globalLeaderboard);
    const regionalRank = user.location
      ? getUserRank(
          user_id,
          regionalLeaderboards.get(
            user.location.toLowerCase().replace(/\s+/g, "-")
          ) || []
        )
      : null;

    // Generate milestone message
    const milestoneMessage = generateMilestoneMessage(
      newBadgeIds,
      oldRank,
      newRank,
      oldPoints,
      user.ecoPoints
    );

    // Mint NFTs if wallet address is provided
    const walletTx: {
      ecoPointsNFT?: string;
      badgeNFTs?: string[];
    } = {};

    if (wallet_address) {
      // Mint EcoPoints NFT if significant points earned
      if (pointsEarned >= 100) {
        const ecoPointsTx = await mintRewardNFT(
          user_id,
          "ecoPoints",
          pointsEarned,
          wallet_address
        );
        if (ecoPointsTx) {
          walletTx.ecoPointsNFT = ecoPointsTx;
        }
      }

      // Mint badge NFTs for newly unlocked badges
      if (newBadgeIds.length > 0) {
        const badgeTxs: string[] = [];
        for (const badgeId of newBadgeIds) {
          const badgeTx = await mintRewardNFT(
            user_id,
            "badge",
            badgeId,
            wallet_address
          );
          if (badgeTx) {
            badgeTxs.push(badgeTx);
          }
        }
        if (badgeTxs.length > 0) {
          walletTx.badgeNFTs = badgeTxs;
        }
      }
    }

    // Prepare response
    const response = {
      user_id: user_id,
      ecoPoints: user.ecoPoints,
      pointsEarned: pointsEarned,
      new_badges: newBadges,
      leaderboard: {
        global_rank: newRank,
        regional_rank: regionalRank,
        total_users: globalLeaderboard.length,
      },
      wallet_tx: Object.keys(walletTx).length > 0 ? walletTx : undefined,
      milestone_message: milestoneMessage,
      stats: {
        totalActions: user.totalActions,
        totalCO2Offset: user.totalCO2Offset,
        totalEnergySaved: user.totalEnergySaved,
        badges: user.badges.length,
      },
      animation_data: {
        pointsEarned: pointsEarned,
        levelUp: newBadges.length > 0,
        rankChange: newRank < oldRank ? oldRank - newRank : 0,
      },
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error: any) {
    console.error("Rewards API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve user rewards
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const leaderboardType = searchParams.get("type"); // "global" | "regional"
    const location = searchParams.get("location");
    const limit = parseInt(searchParams.get("limit") || "100");

    // Get user rewards (if user_id is provided)
    if (userId && !leaderboardType) {
      const user = userRewards.get(userId);
      if (!user) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      const globalRank = getUserRank(userId, globalLeaderboard);
      const regionalRank = user.location
        ? getUserRank(
            userId,
            regionalLeaderboards.get(
              user.location.toLowerCase().replace(/\s+/g, "-")
            ) || []
          )
        : null;

      return NextResponse.json({
        success: true,
        data: {
          user_id: user.userId,
          ecoPoints: user.ecoPoints,
          badges: user.badges.map((id) => {
            const badge = BADGE_DEFINITIONS.find((b) => b.id === id);
            return badge
              ? {
                  id: badge.id,
                  name: badge.name,
                  description: badge.description,
                  icon: badge.icon,
                  rarity: badge.rarity,
                }
              : null;
          }).filter(Boolean),
          leaderboard: {
            global_rank: globalRank,
            regional_rank: regionalRank,
          },
          stats: {
            totalActions: user.totalActions,
            totalCO2Offset: user.totalCO2Offset,
            totalEnergySaved: user.totalEnergySaved,
          },
        },
      });
    }

    // Get leaderboard
    if (leaderboardType === "global") {
      return NextResponse.json({
        success: true,
        data: {
          type: "global",
          leaderboard: globalLeaderboard.slice(0, limit).map((user, index) => ({
            rank: index + 1,
            user_id: user.userId,
            ecoPoints: user.ecoPoints,
            badges: user.badges.length,
            totalCO2Offset: user.totalCO2Offset,
          })),
        },
      });
    } else if (leaderboardType === "regional" && location) {
      const normalizedLocation = location.toLowerCase().replace(/\s+/g, "-");
      const regionalLeaderboard =
        regionalLeaderboards.get(normalizedLocation) || [];
      return NextResponse.json({
        success: true,
        data: {
          type: "regional",
          location: location,
          leaderboard: regionalLeaderboard.slice(0, limit).map((user, index) => ({
            rank: index + 1,
            user_id: user.userId,
            ecoPoints: user.ecoPoints,
            badges: user.badges.length,
            totalCO2Offset: user.totalCO2Offset,
          })),
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid request parameters" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Rewards GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

