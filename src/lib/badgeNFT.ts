/**
 * Blockchain integration for badge NFTs using ThirdWeb
 */

import { client } from "@/app/client";
import { prepareContractCall, sendTransaction, waitForReceipt } from "thirdweb";
import { ethereum } from "thirdweb/chains";
import { getContract } from "thirdweb/contract";

// Badge NFT Contract Address (deploy this contract separately)
// For now, we'll use a placeholder address
const BADGE_NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BADGE_NFT_CONTRACT || "0x0000000000000000000000000000000000000000";

interface BadgeNFTMetadata {
  name: string;
  description: string;
  image: string; // IPFS or URL to badge image
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

/**
 * Mint an NFT badge for a user
 */
export async function mintBadgeNFT(
  walletAddress: string,
  badgeId: string,
  badgeMetadata: BadgeNFTMetadata
): Promise<{ success: boolean; txHash?: string; error?: string; code?: string }> {
  try {
    // Validate inputs
    if (!walletAddress || typeof walletAddress !== 'string' || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return {
        success: false,
        error: "Invalid wallet address provided",
        code: "INVALID_WALLET_ADDRESS"
      };
    }

    if (!badgeId || typeof badgeId !== 'string' || badgeId.trim().length === 0) {
      return {
        success: false,
        error: "Invalid badge ID provided",
        code: "INVALID_BADGE_ID"
      };
    }

    if (!badgeMetadata || !badgeMetadata.name || !badgeMetadata.description) {
      return {
        success: false,
        error: "Invalid badge metadata provided",
        code: "INVALID_METADATA"
      };
    }

    // Check if contract address is configured
    if (!BADGE_NFT_CONTRACT_ADDRESS || BADGE_NFT_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      console.warn("Badge NFT contract not configured, skipping minting");
      return {
        success: false,
        error: "Badge NFT contract not configured",
        code: "CONTRACT_NOT_CONFIGURED"
      };
    }

    // For demo purposes, we'll return a mock success
    // In production, you would:
    // 1. Deploy an ERC-721 or ERC-1155 contract for badges
    // 2. Upload badge metadata to IPFS
    // 3. Call the mint function on the contract
    
    console.log(`Minting badge NFT for ${walletAddress}:`, badgeId);
    
    try {
      // TODO: Implement actual NFT minting
      // Example implementation:
      /*
      const contract = getContract({
        client,
        chain: ethereum,
        address: BADGE_NFT_CONTRACT_ADDRESS,
      });

      // Estimate gas first
      let gasEstimate;
      try {
        const transaction = prepareContractCall({
          contract,
          method: "mintBadge",
          params: [walletAddress, badgeId, badgeMetadata],
        });
        gasEstimate = await estimateGas({ transaction });
      } catch (gasError: any) {
        if (gasError.message?.includes("insufficient funds") || gasError.message?.includes("balance")) {
          return {
            success: false,
            error: "Insufficient funds for transaction",
            code: "INSUFFICIENT_FUNDS"
          };
        }
        throw gasError;
      }

      const transaction = prepareContractCall({
        contract,
        method: "mintBadge",
        params: [walletAddress, badgeId, badgeMetadata],
      });

      const receipt = await sendTransaction({
        transaction,
        account: walletAddress,
      });

      await waitForReceipt(receipt);

      return {
        success: true,
        txHash: receipt.transactionHash,
      };
      */

      // Mock response for now (simulate network delay)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      };
    } catch (txError: any) {
      // Handle specific transaction errors
      if (txError.message?.includes("user rejected") || txError.message?.includes("User denied")) {
        return {
          success: false,
          error: "Transaction rejected by user",
          code: "USER_REJECTED"
        };
      }
      
      if (txError.message?.includes("network") || txError.message?.includes("connection")) {
        return {
          success: false,
          error: "Network error. Please check your connection and try again.",
          code: "NETWORK_ERROR"
        };
      }

      if (txError.message?.includes("gas") || txError.message?.includes("fee")) {
        return {
          success: false,
          error: "Gas estimation failed. Please try again.",
          code: "GAS_ESTIMATION_ERROR"
        };
      }

      throw txError;
    }
  } catch (error: any) {
    console.error("Error minting badge NFT:", error);
    
    // Log error for monitoring
    if (typeof window !== 'undefined' && (window as any).logError) {
      (window as any).logError('badge_mint_error', {
        walletAddress,
        badgeId,
        error: error.message,
        stack: error.stack
      });
    }
    
    return {
      success: false,
      error: error.message || "Failed to mint badge NFT. Please try again.",
      code: error.code || "MINT_ERROR"
    };
  }
}

/**
 * Check if user owns a specific badge NFT
 */
export async function checkBadgeOwnership(
  walletAddress: string,
  badgeId: string
): Promise<boolean> {
  try {
    // Validate inputs
    if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      console.warn("Invalid wallet address for ownership check");
      return false;
    }

    if (!badgeId || typeof badgeId !== 'string') {
      console.warn("Invalid badge ID for ownership check");
      return false;
    }

    // Check if contract is configured
    if (!BADGE_NFT_CONTRACT_ADDRESS || BADGE_NFT_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      return false;
    }

    // TODO: Query the NFT contract to check ownership
    // Example:
    /*
    try {
      const contract = getContract({
        client,
        chain: ethereum,
        address: BADGE_NFT_CONTRACT_ADDRESS,
      });
      
      const balance = await contract.call("balanceOf", [walletAddress, badgeId]);
      return balance > 0;
    } catch (contractError) {
      console.error("Contract query error:", contractError);
      return false;
    }
    */
    
    return false;
  } catch (error: any) {
    console.error("Error checking badge ownership:", error);
    // Log error
    if (typeof window !== 'undefined' && (window as any).logError) {
      (window as any).logError('badge_ownership_check_error', {
        walletAddress,
        badgeId,
        error: error.message
      });
    }
    return false;
  }
}

/**
 * Get all badge NFTs owned by a user
 */
export async function getUserBadgeNFTs(walletAddress: string): Promise<string[]> {
  try {
    // Validate wallet address
    if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      console.warn("Invalid wallet address for badge fetch");
      return [];
    }

    // Check if contract is configured
    if (!BADGE_NFT_CONTRACT_ADDRESS || BADGE_NFT_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      return [];
    }

    // TODO: Query the NFT contract for all badges owned by the user
    // Example:
    /*
    try {
      const contract = getContract({
        client,
        chain: ethereum,
        address: BADGE_NFT_CONTRACT_ADDRESS,
      });
      
      const tokenIds = await contract.call("getOwnedBadges", [walletAddress]);
      return tokenIds.map(id => id.toString());
    } catch (contractError) {
      console.error("Contract query error:", contractError);
      return [];
    }
    */
    
    return [];
  } catch (error: any) {
    console.error("Error fetching user badge NFTs:", error);
    // Log error
    if (typeof window !== 'undefined' && (window as any).logError) {
      (window as any).logError('fetch_badges_error', {
        walletAddress,
        error: error.message
      });
    }
    return [];
  }
}

/**
 * Generate badge NFT metadata
 */
export function generateBadgeMetadata(badge: {
  id: string;
  name: string;
  description: string;
  icon: string;
}): BadgeNFTMetadata {
  return {
    name: badge.name,
    description: badge.description,
    image: `https://carbonx.app/badges/${badge.id}.png`, // Replace with actual image URL or IPFS hash
    attributes: [
      {
        trait_type: "Badge ID",
        value: badge.id,
      },
      {
        trait_type: "Icon",
        value: badge.icon,
      },
      {
        trait_type: "Collection",
        value: "CarbonX Sustainability Badges",
      },
    ],
  };
}

