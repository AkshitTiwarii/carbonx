"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Zap, TrendingUp, Sparkles, RefreshCw } from "lucide-react";
import EcoPointsSummary from "@/components/rewards/EcoPointsSummary";
import BadgeCollection from "@/components/rewards/BadgeCollection";
import Leaderboard from "@/components/rewards/Leaderboard";
import RewardNotification from "@/components/rewards/RewardNotification";
import { RewardsErrorBoundary } from "@/components/rewards/ErrorBoundary";
import ToastContainer from "@/components/rewards/ToastContainer";
import BackendStatusIndicator from "@/components/rewards/BackendStatusIndicator";
import { getUserRewards, getAllBadges, getUserId } from "@/lib/rewards";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "@/lib/toast";

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
    totalPoints?: number;
    rank?: number;
    newBadges?: any[];
  } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const account = useActiveAccount();
  // Use wallet address if connected, otherwise use getUserId()
  const userId = account?.address ? `wallet_${account.address.toLowerCase()}` : getUserId();

  useEffect(() => {
    loadRewardsData();
  }, [userId]);

  const loadRewardsData = async (forceRefresh = false) => {
    try {
      if (forceRefresh || !loading) {
        setLoading(true);
      }
      
      // Load user rewards
      if (userId) {
        try {
          const rewards = await getUserRewards(userId);
          if (rewards) {
            // Ensure we're using the latest data
            setUserRewards(prev => {
              // Only update if we got new data or if it's different
              if (!prev || prev.ecoPoints !== rewards.ecoPoints || prev.rank !== rewards.rank) {
                return rewards;
              }
              return prev;
            });
          } else {
            // User might not exist yet, that's okay - initialize empty state
            setUserRewards(prev => prev || {
              user_id: userId,
              ecoPoints: 0,
              rank: 0,
              badges: [],
              stats: {
                total_actions: 0,
                carbon_offset_tons: 0,
                badge_count: 0,
              },
              recent_actions: [],
            });
          }
        } catch (error: any) {
          console.error("Error loading user rewards:", error);
          // Don't show error toast on first load, just log it
          if (userRewards === null) {
            // Initialize with empty state if first load fails
            setUserRewards({
              user_id: userId,
              ecoPoints: 0,
              rank: 0,
              badges: [],
              stats: {
                total_actions: 0,
                carbon_offset_tons: 0,
                badge_count: 0,
              },
              recent_actions: [],
            });
          }
        }
      }
      
      // Load all badges
      try {
        const badges = await getAllBadges();
        if (badges && Object.keys(badges).length > 0) {
          setAllBadges(badges);
        } else {
          // Use fallback badges if backend is down
          setAllBadges({
            carbon_saver: {
              id: "carbon_saver",
              name: "Carbon Saver",
              description: "Offset your first 1 ton of CO2",
              icon: "🌱",
              points_required: 100,
            },
            green_champion: {
              id: "green_champion",
              name: "Green Champion",
              description: "Offset 10 tons of CO2",
              icon: "🏆",
              points_required: 1000,
            },
            calculator_master: {
              id: "calculator_master",
              name: "Calculator Master",
              description: "Use all calculator tools 10+ times",
              icon: "🧮",
              points_required: 200,
            },
          });
        }
      } catch (error: any) {
        console.error("Error loading badges:", error);
        // Use fallback badges
        setAllBadges({
          carbon_saver: {
            id: "carbon_saver",
            name: "Carbon Saver",
            description: "Offset your first 1 ton of CO2",
            icon: "🌱",
            points_required: 100,
          },
        });
      }
      
      // Trigger leaderboard refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error("Error loading rewards data:", error);
      // Only show error if we had previous data
      if (userRewards) {
        toast.error("Failed to refresh rewards data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Listen for reward updates (e.g., from other pages)
  useEffect(() => {
    const handleRewardUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { pointsEarned, totalPoints, rank, newBadges } = customEvent.detail || {};
      if (pointsEarned || newBadges) {
        setNotification({ pointsEarned, totalPoints, rank, newBadges });
        
        // Optimistically update the UI if we have totalPoints
        if (totalPoints !== undefined && userRewards) {
          setUserRewards({
            ...userRewards,
            ecoPoints: totalPoints,
            rank: rank || userRewards.rank,
          });
        }
        
        // Delay refresh slightly to ensure backend has processed, then refresh to get latest data
        setTimeout(() => {
          loadRewardsData(true); // Force refresh to get latest data
        }, 800);
      }
    };

    window.addEventListener("rewardUpdate", handleRewardUpdate);
    return () => {
      window.removeEventListener("rewardUpdate", handleRewardUpdate);
    };
  }, [userRewards]);

  // Auto-refresh rewards data periodically when page is visible
  useEffect(() => {
    if (!userId) return;

    // Refresh every 15 seconds if page is visible (reduced frequency to avoid overload)
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible' && !loading) {
        loadRewardsData(true); // Force refresh
      }
    }, 15000); // 15 seconds

    // Also refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !loading) {
        loadRewardsData(true); // Force refresh
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, loading]);

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
    <RewardsErrorBoundary>
      <ToastContainer />
      <main className="min-h-screen bg-zinc-950 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
        {/* Backend Status Indicator */}
        <BackendStatusIndicator />
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
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
            <button
              onClick={() => loadRewardsData(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh rewards data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
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
            <Leaderboard currentUserId={userId || undefined} refreshTrigger={refreshTrigger} />
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
    </RewardsErrorBoundary>
  );
}

