"use client";

import { useState, useCallback } from "react";
import { awardEcoPoints, getUserId } from "@/lib/rewards";
import { mintBadgeNFT, generateBadgeMetadata } from "@/lib/badgeNFT";
import { useActiveAccount } from "thirdweb/react";

interface UseRewardsReturn {
  awardPoints: (action: {
    type: 'carbon_offset' | 'calculator_use' | 'water_calculation' | 'plastic_calculation' | 'ai_tool_use' | 'investment' | 'energy_savings';
    amount?: number;
    metadata?: Record<string, any>;
  }) => Promise<{ success: boolean; points_earned?: number; new_badges?: any[] }>;
  loading: boolean;
}

/**
 * Hook for awarding rewards and handling badge minting
 */
export function useRewards(): UseRewardsReturn {
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();
  const userId = getUserId();

  const awardPoints = useCallback(async (action: {
    type: 'carbon_offset' | 'calculator_use' | 'water_calculation' | 'plastic_calculation' | 'ai_tool_use' | 'investment' | 'energy_savings';
    amount?: number;
    metadata?: Record<string, any>;
  }) => {
    if (!userId) {
      console.warn("No user ID found. Rewards will not be awarded.");
      return { success: false };
    }

    try {
      setLoading(true);
      
      // Award points
      const result = await awardEcoPoints(userId, action);
      
      if (result.success && result.new_badges && result.new_badges.length > 0) {
        // Mint NFT badges if wallet is connected
        if (account?.address) {
          for (const badge of result.new_badges) {
            try {
              const metadata = generateBadgeMetadata(badge);
              await mintBadgeNFT(account.address, badge.id, metadata);
            } catch (error) {
              console.error(`Failed to mint badge NFT for ${badge.id}:`, error);
              // Continue even if NFT minting fails
            }
          }
        }
        
        // Dispatch event for notification
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('rewardUpdate', {
              detail: {
                pointsEarned: result.points_earned,
                newBadges: result.new_badges,
              },
            })
          );
        }
      } else if (result.success && result.points_earned) {
        // Dispatch event for points only
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('rewardUpdate', {
              detail: {
                pointsEarned: result.points_earned,
                newBadges: [],
              },
            })
          );
        }
      }
      
      return result;
    } catch (error) {
      console.error("Error awarding points:", error);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [userId, account]);

  return {
    awardPoints,
    loading,
  };
}

