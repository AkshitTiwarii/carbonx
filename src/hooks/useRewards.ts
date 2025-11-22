"use client";

import { useState, useCallback } from "react";
import { awardEcoPoints, getUserId } from "@/lib/rewards";
import { mintBadgeNFT, generateBadgeMetadata } from "@/lib/badgeNFT";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "@/lib/toast";

interface UseRewardsReturn {
  awardPoints: (action: {
    type: 'carbon_offset' | 'calculator_use' | 'water_calculation' | 'plastic_calculation' | 'ai_tool_use' | 'investment' | 'energy_savings';
    amount?: number;
    metadata?: Record<string, any>;
  }) => Promise<{ success: boolean; points_earned?: number; total_points?: number; rank?: number; new_badges?: any[]; error?: string }>;
  loading: boolean;
}

/**
 * Hook for awarding rewards and handling badge minting
 */
export function useRewards(): UseRewardsReturn {
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();
  // Use wallet address if connected, otherwise use getUserId()
  const userId = account?.address ? `wallet_${account.address.toLowerCase()}` : getUserId();

  const awardPoints = useCallback(async (action: {
    type: 'carbon_offset' | 'calculator_use' | 'water_calculation' | 'plastic_calculation' | 'ai_tool_use' | 'investment' | 'energy_savings';
    amount?: number;
    metadata?: Record<string, any>;
  }) => {
    if (!userId) {
      const errorMsg = "User ID not found. Please refresh the page and try again.";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Validate action
    if (!action.type) {
      const errorMsg = "Invalid action type";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      setLoading(true);
      
      // Award points with error handling
      let result;
      try {
        result = await awardEcoPoints(userId, action);
      } catch (apiError: any) {
        console.error("API error awarding points:", apiError);
        
        // Handle network errors
        if (apiError.message?.includes("fetch") || apiError.message?.includes("network") || apiError.message?.includes("ECONNREFUSED")) {
          toast.error("Cannot connect to backend. Please ensure the backend server is running on port 8000.");
          return { success: false, error: "Backend connection error", code: "BACKEND_DOWN" };
        }
        
        // Handle API errors
        const errorMsg = apiError.message || "Failed to award points. Please try again.";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
      
      if (!result) {
        toast.error("Failed to award points. Please try again.");
        return { success: false, error: "No response from server" };
      }

      // Handle API response errors
      if (!result.success) {
        const errorMsg = result.error || "Failed to award points";
        toast.error(errorMsg);
        return result;
      }
      
      // Success - show points earned
      if (result.points_earned && result.points_earned > 0) {
        toast.success(`Earned ${result.points_earned} EcoPoints! 🎉`);
      }
      
      // Handle badge minting if badges were earned
      if (result.success && result.new_badges && result.new_badges.length > 0) {
        // Mint NFT badges if wallet is connected
        if (account?.address) {
          for (const badge of result.new_badges) {
            try {
              const metadata = generateBadgeMetadata(badge);
              const mintResult = await mintBadgeNFT(account.address, badge.id, metadata);
              
              if (!mintResult.success) {
                // Log but don't fail the whole operation
                console.warn(`Failed to mint badge NFT for ${badge.id}:`, mintResult.error);
                
                // Show user-friendly error based on error code
                if (mintResult.code === "USER_REJECTED") {
                  toast.warning("Badge NFT minting was cancelled. You can try again later.");
                } else if (mintResult.code === "INSUFFICIENT_FUNDS") {
                  toast.warning("Insufficient funds to mint badge NFT. Points were still awarded.");
                } else if (mintResult.code === "NETWORK_ERROR") {
                  toast.warning("Network error while minting badge NFT. Points were still awarded.");
                } else if (mintResult.code !== "CONTRACT_NOT_CONFIGURED") {
                  // Don't show error if contract is just not configured
                  toast.warning("Could not mint badge NFT, but points were still awarded.");
                }
              } else {
                toast.success(`Badge "${badge.name}" minted as NFT! 🏆`);
              }
            } catch (error: any) {
              console.error(`Error minting badge NFT for ${badge.id}:`, error);
              // Continue even if NFT minting fails - points were already awarded
              toast.warning("Points awarded, but badge NFT minting failed. You can try again later.");
            }
          }
        } else {
          // Wallet not connected - just inform user
          console.info("Wallet not connected, skipping NFT minting");
        }
        
        // Dispatch event for notification with total_points
        if (typeof window !== 'undefined') {
          try {
            window.dispatchEvent(
              new CustomEvent('rewardUpdate', {
                detail: {
                  pointsEarned: result.points_earned,
                  totalPoints: (result as any).total_points || result.points_earned || 0,
                  rank: (result as any).rank || 0,
                  newBadges: result.new_badges || [],
                },
              })
            );
          } catch (eventError) {
            console.warn('Failed to dispatch rewardUpdate event:', eventError);
          }
        }
      } else if (result.success && result.points_earned) {
        // Dispatch event for points only with total_points
        if (typeof window !== 'undefined') {
          try {
            window.dispatchEvent(
              new CustomEvent('rewardUpdate', {
                detail: {
                  pointsEarned: result.points_earned,
                  totalPoints: (result as any).total_points || result.points_earned || 0,
                  rank: (result as any).rank || 0,
                  newBadges: [],
                },
              })
            );
          } catch (eventError) {
            console.warn('Failed to dispatch rewardUpdate event:', eventError);
          }
        }
      }
      
      return result;
    } catch (error: any) {
      console.error("Unexpected error awarding points:", error);
      
      // Log error
      if (typeof window !== 'undefined' && (window as any).logError) {
        (window as any).logError('award_points_error', {
          userId,
          action,
          error: error.message,
          stack: error.stack
        });
      }
      
      const errorMsg = error.message || "An unexpected error occurred. Please try again.";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [userId, account]);

  return {
    awardPoints,
    loading,
  };
}

