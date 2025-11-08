"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Zap, TrendingUp, Sparkles } from "lucide-react";
import EcoPointsSummary from "@/components/rewards/EcoPointsSummary";
import BadgeCollection from "@/components/rewards/BadgeCollection";
import Leaderboard from "@/components/rewards/Leaderboard";
import RewardNotification from "@/components/rewards/RewardNotification";
import { getUserRewards, getAllBadges, getUserId } from "@/lib/rewards";
import { useActiveAccount } from "thirdweb/react";

interface UserRewards {
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

export default function RewardsPage() {
  const [userRewards, setUserRewards] = useState<UserRewards | null>(null);
  const [allBadges, setAllBadges] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    pointsEarned?: number;
    newBadges?: any[];
  } | null>(null);
  const account = useActiveAccount();
  const userId = getUserId();

  useEffect(() => {
    loadRewardsData();
  }, [userId]);

  const loadRewardsData = async () => {
    try {
      setLoading(true);
      
      // Load user rewards
      if (userId) {
        const rewards = await getUserRewards(userId);
        setUserRewards(rewards);
      }
      
      // Load all badges
      const badges = await getAllBadges();
      setAllBadges(badges);
    } catch (error) {
      console.error("Error loading rewards data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Listen for reward updates (e.g., from other pages)
  useEffect(() => {
    const handleRewardUpdate = (event: CustomEvent) => {
      const { pointsEarned, newBadges } = event.detail;
      setNotification({ pointsEarned, newBadges });
      loadRewardsData(); // Refresh data
    };

    window.addEventListener("rewardUpdate" as any, handleRewardUpdate as EventListener);
    return () => {
      window.removeEventListener("rewardUpdate" as any, handleRewardUpdate as EventListener);
    };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-zinc-400">Loading rewards...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 rounded-xl border border-indigo-500/30">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-zinc-100">
                Gamified Sustainability Rewards
              </h1>
              <p className="text-zinc-400 mt-1">
                Earn EcoPoints, unlock badges, and compete on the leaderboard
              </p>
            </div>
          </div>
        </motion.div>

        {/* Notification */}
        {notification && (
          <RewardNotification
            pointsEarned={notification.pointsEarned}
            newBadges={notification.newBadges}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - User Stats */}
          <div className="lg:col-span-2 space-y-6">
            {userRewards ? (
              <>
                <EcoPointsSummary
                  ecoPoints={userRewards.ecoPoints}
                  rank={userRewards.rank}
                  position={userRewards.position}
                />

                <BadgeCollection
                  earnedBadges={userRewards.badges}
                  allBadges={allBadges}
                />
              </>
            ) : (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
                <Sparkles className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-zinc-300 mb-2">
                  Start Earning Rewards
                </h3>
                <p className="text-zinc-500 mb-4">
                  Connect your wallet and start performing eco-friendly actions to earn EcoPoints and unlock badges!
                </p>
                {!account && (
                  <p className="text-sm text-zinc-600">
                    Connect your MetaMask wallet to get started
                  </p>
                )}
              </div>
            )}

            {/* Quick Stats */}
            {userRewards && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-zinc-100 mb-4">Your Impact</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {userRewards.stats.carbon_offset_tons.toFixed(1)}
                    </div>
                    <div className="text-sm text-zinc-400">Tons CO₂ Offset</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-400">
                      {userRewards.stats.total_actions}
                    </div>
                    <div className="text-sm text-zinc-400">Total Actions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {userRewards.stats.badge_count}
                    </div>
                    <div className="text-sm text-zinc-400">Badges Earned</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Leaderboard */}
          <div className="lg:col-span-1">
            <Leaderboard currentUserId={userId || undefined} />
          </div>
        </div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mt-6"
        >
          <h3 className="text-xl font-semibold text-zinc-100 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            How to Earn EcoPoints
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
              <div className="text-2xl mb-2">🌱</div>
              <h4 className="font-semibold text-zinc-100 mb-1">Carbon Offsetting</h4>
              <p className="text-sm text-zinc-400">50 points per ton offset</p>
            </div>
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
              <div className="text-2xl mb-2">🧮</div>
              <h4 className="font-semibold text-zinc-100 mb-1">Use Calculators</h4>
              <p className="text-sm text-zinc-400">10-20 points per use</p>
            </div>
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
              <div className="text-2xl mb-2">💚</div>
              <h4 className="font-semibold text-zinc-100 mb-1">Invest in Projects</h4>
              <p className="text-sm text-zinc-400">30 points per investment</p>
            </div>
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
              <div className="text-2xl mb-2">🤖</div>
              <h4 className="font-semibold text-zinc-100 mb-1">AI Tools</h4>
              <p className="text-sm text-zinc-400">20 points per use</p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

