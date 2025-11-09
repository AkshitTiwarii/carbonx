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
): Promise<{ success: boolean; points_earned?: number; new_badges?: any[]; error?: string }> {
  try {
    const response = await fetch('/api/rewards/update', {
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error awarding EcoPoints:', error);
    return { success: false, error: 'Failed to award points' };
  }
}

/**
 * Get user's rewards data
 */
export async function getUserRewards(user_id: string): Promise<UserRewards | null> {
  try {
    const response = await fetch(`/api/rewards/user?user_id=${user_id}`);
    const data = await response.json();
    
    if (data.success) {
      return data;
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
    const data = await response.json();
    
    if (data.success) {
      return data.badges || {};
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
  // TODO: Integrate with actual authentication
  // For now, use localStorage or session storage
  if (typeof window !== 'undefined') {
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

