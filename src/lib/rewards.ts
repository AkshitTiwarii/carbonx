/**
 * Rewards system utilities
 */

export interface RewardAction {
  type: 'carbon_offset' | 'calculator_use' | 'water_calculation' | 'plastic_calculation' | 'ai_tool_use' | 'investment' | 'energy_savings';
  amount?: number;
  metadata?: Record<string, any>;
}

export interface UserRewards {
  user_id: string;
  ecoPoints: number;
  rank: number;
  position?: number;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
  }>;
  stats: {
    total_actions: number;
    carbon_offset_tons: number;
    badge_count: number;
  };
  recent_actions: Array<any>;
}

/**
 * Award EcoPoints to a user for performing an eco-action
 */
export async function awardEcoPoints(
  user_id: string,
  action: RewardAction
): Promise<{ success: boolean; points_earned?: number; total_points?: number; rank?: number; new_badges?: any[]; error?: string; code?: string }> {
  try {
    // Validate inputs
    if (!user_id || typeof user_id !== 'string' || user_id.trim().length === 0) {
      return { 
        success: false, 
        error: 'Invalid user ID',
        code: 'INVALID_USER_ID'
      };
    }

    if (!action || !action.type) {
      return { 
        success: false, 
        error: 'Invalid action',
        code: 'INVALID_ACTION'
      };
    }

    let response: Response;
    try {
      response = await fetch('/api/rewards/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id,
          action_type: action.type,
          amount: action.amount || 1.0,
          metadata: action.metadata || {},
        }),
      });
    } catch (fetchError: any) {
      // Network error
      if (fetchError.message?.includes('fetch') || fetchError.message?.includes('network')) {
        throw new Error('Network error. Please check your connection.');
      }
      throw fetchError;
    }

    // Handle HTTP errors
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: { message: `HTTP ${response.status}: ${response.statusText}` } };
      }

      const errorDetail = errorData.detail || errorData;
      const errorMessage = typeof errorDetail === 'string' 
        ? errorDetail 
        : errorDetail.message || `Server error (${response.status})`;
      
      return {
        success: false,
        error: errorMessage,
        code: errorDetail.code || `HTTP_${response.status}`
      };
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || typeof data !== 'object') {
      return {
        success: false,
        error: 'Invalid response from server',
        code: 'INVALID_RESPONSE'
      };
    }

    return data;
  } catch (error: any) {
    console.error('Error awarding EcoPoints:', error);
    
    // Log error
    if (typeof window !== 'undefined' && (window as any).logError) {
      (window as any).logError('award_ecopoints_error', {
        user_id,
        action,
        error: error.message,
        stack: error.stack
      });
    }
    
    return { 
      success: false, 
      error: error.message || 'Failed to award points. Please try again.',
      code: error.code || 'UNKNOWN_ERROR'
    };
  }
}

/**
 * Get user's rewards data
 */
export async function getUserRewards(user_id: string): Promise<UserRewards | null> {
  try {
    // Clean user_id - remove any cache-busting parameters if present
    const cleanUserId = user_id.includes('&_t=') ? user_id.split('&_t=')[0] : user_id;
    
    if (!cleanUserId || typeof cleanUserId !== 'string' || cleanUserId.trim().length === 0) {
      console.warn('Invalid user_id provided to getUserRewards');
      return null;
    }

    // Add cache-busting to ensure fresh data
    const cacheBuster = `&_t=${Date.now()}`;
    const response = await fetch(`/api/rewards/user?user_id=${encodeURIComponent(cleanUserId)}${cacheBuster}`, {
      cache: 'no-store', // Ensure we don't get cached data
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to fetch user rewards:', errorData);
      return null;
    }

    const data = await response.json();
    
    if (data && data.success) {
      // Ensure badges have id field
      const badges = (data.badges || []).map((badge: any) => {
        if (typeof badge === 'string') {
          return { id: badge, name: badge, description: '', icon: '🏆' };
        }
        return badge.id ? badge : { ...badge, id: badge.name || 'unknown' };
      });
      
      // Ensure ecoPoints is a number
      const ecoPoints = typeof data.ecoPoints === 'number' ? data.ecoPoints : parseInt(data.ecoPoints) || 0;
      const rank = typeof data.rank === 'number' ? data.rank : parseInt(data.rank) || 0;
      
      return {
        ...data,
        ecoPoints,
        rank,
        badges,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user rewards:', error);
    return null;
  }
}

/**
 * Get leaderboard data
 */
export async function getLeaderboard(limit: number = 100, region?: string) {
  try {
    const url = `/api/rewards/leaderboard?limit=${limit}${region ? `&region=${region}` : ''}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success) {
      return data.leaderboard || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

/**
 * Get all available badges
 */
export async function getAllBadges() {
  try {
    const response = await fetch('/api/rewards/badges');
    
    if (!response.ok) {
      console.warn('Failed to fetch badges, using empty set');
      return {};
    }

    const data = await response.json();
    
    if (data && data.success) {
      const badges = data.badges || {};
      // Ensure all badges have id field
      const normalizedBadges: Record<string, any> = {};
      for (const [badgeId, badge] of Object.entries(badges)) {
        normalizedBadges[badgeId] = {
          id: badgeId,
          ...(badge as any),
        };
      }
      return normalizedBadges;
    }
    return {};
  } catch (error) {
    console.error('Error fetching badges:', error);
    return {};
  }
}

/**
 * Helper to get user ID from authentication
 * This is a placeholder - integrate with your actual auth system
 */
export function getUserId(): string | null {
  // Use wallet address if connected, otherwise use localStorage
  if (typeof window !== 'undefined') {
    // Try to get wallet address from thirdweb
    const walletAddress = (window as any).thirdwebWalletAddress;
    if (walletAddress) {
      return `wallet_${walletAddress.toLowerCase()}`;
    }
    
    // Fallback to localStorage for non-wallet users
    let userId = localStorage.getItem('carbonx_user_id');
    if (!userId) {
      // Generate a temporary user ID for demo purposes using secure randomness
      const array = new Uint8Array(9);
      window.crypto.getRandomValues(array);
      const randomStr = Array.from(array).map(b => b.toString(36)).join('');
      userId = `user_${Date.now()}_${randomStr}`;
      localStorage.setItem('carbonx_user_id', userId);
    }
    return userId;
  }
  return null;
}

