"use client";

import { useState, useEffect } from "react";
import { trackAction, getUserRewards, getLeaderboard, type RewardsResponse, type ActionType } from "@/lib/rewards";
import { Trophy, Award, TrendingUp, Users, Zap, Leaf, Sparkles, Loader2 } from "lucide-react";

interface UserRewardsData {
  user_id: string;
  ecoPoints: number;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: string;
  }>;
  leaderboard: {
    global_rank: number;
    regional_rank: number | null;
  };
  stats: {
    totalActions: number;
    totalCO2Offset: number;
    totalEnergySaved: number;
  };
}

export default function RewardsTestPage() {
  const [userId, setUserId] = useState("test-user-123");
  const [action, setAction] = useState<ActionType>("carbon_offset");
  const [actionValue, setActionValue] = useState("1.0");
  const [location, setLocation] = useState("United States");
  const [walletAddress, setWalletAddress] = useState("");
  
  const [userData, setUserData] = useState<UserRewardsData | null>(null);
  const [lastReward, setLastReward] = useState<RewardsResponse | null>(null);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load user data on mount and when userId changes
  useEffect(() => {
    if (userId) {
      loadUserData();
    }
    loadLeaderboard();
  }, [userId]);

  const loadUserData = async () => {
    try {
      const data = await getUserRewards(userId);
      setUserData(data);
    } catch (err: any) {
      console.error("Error loading user data:", err);
      // User might not exist yet, that's okay
    }
  };

  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboard("global", undefined, 10);
      setGlobalLeaderboard(data.leaderboard || []);
    } catch (err: any) {
      console.error("Error loading leaderboard:", err);
    }
  };

  const handleTrackAction = async () => {
    if (!userId.trim()) {
      setError("Please enter a User ID");
      return;
    }

    setLoading(true);
    setError("");
    setLastReward(null);

    try {
      const value = parseFloat(actionValue) || 1.0;
      const result = await trackAction({
        user_id: userId,
        action: action,
        action_value: value,
        location: location || undefined,
        wallet_address: walletAddress || undefined,
      });

      setLastReward(result);
      
      // Small delay to ensure backend has processed
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Reload user data and leaderboard
      await Promise.all([loadUserData(), loadLeaderboard()]);
    } catch (err: any) {
      setError(err.message || "Failed to track action");
      console.error("Error tracking action:", err);
    } finally {
      setLoading(false);
    }
  };

  const actionExamples = [
    { type: "carbon_offset" as ActionType, label: "Carbon Offset", value: "2.5", desc: "Offset CO2 (tons)" },
    { type: "energy_saving" as ActionType, label: "Energy Saving", value: "50", desc: "Save energy (kWh)" },
    { type: "ai_eco_tool" as ActionType, label: "AI Eco Tool", value: "1", desc: "Use AI calculator" },
    { type: "event_participation" as ActionType, label: "Event Participation", value: "1", desc: "Join event" },
    { type: "water_saving" as ActionType, label: "Water Saving", value: "100", desc: "Save water (liters)" },
    { type: "plastic_reduction" as ActionType, label: "Plastic Reduction", value: "10", desc: "Reduce plastic (kg)" },
  ];

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 rounded-full border border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-green-500/10 backdrop-blur-sm px-6 py-2.5 text-blue-300 text-sm font-medium mb-4 shadow-lg shadow-blue-500/20">
            <span className="text-lg">🌱</span>
            <span>Gamified Sustainability Rewards</span>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-blue-500 to-green-400 bg-clip-text text-transparent mb-4">
            Track Your Impact
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Earn EcoPoints, unlock badges, and climb the leaderboard with every sustainable action
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Action Tracking */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Settings */}
            <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-zinc-900/50 backdrop-blur-sm p-6">
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-500/10 blur-2xl" />
              <h2 className="text-2xl font-semibold text-zinc-100 mb-4 relative z-10">
                User Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full px-4 py-2 border border-zinc-700 rounded-lg bg-zinc-800/50 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="test-user-123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Location (for regional leaderboard)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-zinc-700 rounded-lg bg-zinc-800/50 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="United States"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Wallet Address (optional, for NFT minting)
                  </label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-zinc-700 rounded-lg bg-zinc-800/50 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0x..."
                  />
                </div>
              </div>
            </div>

            {/* Action Tracking */}
            <div className="relative overflow-hidden rounded-2xl border border-green-500/20 bg-zinc-900/50 backdrop-blur-sm p-6">
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-green-500/10 blur-2xl" />
              <h2 className="text-2xl font-semibold text-zinc-100 mb-4 relative z-10">
                Track Action
              </h2>
              
              <div className="space-y-4 relative z-10">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Action Type
                  </label>
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value as ActionType)}
                    className="w-full px-4 py-2 border border-zinc-700 rounded-lg bg-zinc-800/50 text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {actionExamples.map((ex) => (
                      <option key={ex.type} value={ex.type} className="bg-zinc-800">
                        {ex.label} - {ex.desc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Action Value
                  </label>
                  <input
                    type="number"
                    value={actionValue}
                    onChange={(e) => setActionValue(e.target.value)}
                    className="w-full px-4 py-2 border border-zinc-700 rounded-lg bg-zinc-800/50 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1.0"
                    step="0.1"
                  />
                </div>

                <button
                  onClick={handleTrackAction}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 hover:from-blue-700 hover:via-blue-600 hover:to-green-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Tracking...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Track Action
                    </span>
                  )}
                </button>

                {error && (
                  <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-300">
                    Error: {error}
                  </div>
                )}
              </div>

              {/* Quick Action Buttons */}
              <div className="mt-6 pt-6 border-t border-zinc-800 relative z-10">
                <p className="text-sm font-medium text-zinc-300 mb-3">
                  Quick Actions:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {actionExamples.map((ex) => (
                    <button
                      key={ex.type}
                      onClick={() => {
                        setAction(ex.type);
                        setActionValue(ex.value);
                        handleTrackAction();
                      }}
                      disabled={loading}
                      className="px-3 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-all disabled:opacity-50 border border-zinc-700 hover:border-green-500/50"
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Last Reward Result */}
            {lastReward && (
              <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-600/90 via-blue-500/90 to-green-500/90 p-6 text-white shadow-xl shadow-blue-500/20">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-green-500 to-blue-600 rounded-2xl blur opacity-50"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Trophy className="w-6 h-6" />
                    Reward Result
                  </h2>
                  <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Points Earned:</span>
                    <span className="text-2xl font-bold">+{lastReward.pointsEarned}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total EcoPoints:</span>
                    <span className="text-2xl font-bold">{lastReward.ecoPoints}</span>
                  </div>
                  {lastReward.new_badges.length > 0 && (
                    <div className="mt-4 p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                      <p className="font-semibold mb-2 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        New Badges Unlocked:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {lastReward.new_badges.map((badge, idx) => (
                          <span key={idx} className="px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full text-sm border border-white/20">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-4 p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Leaderboard:
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>Global Rank: <strong>#{lastReward.leaderboard.global_rank}</strong></span>
                      {lastReward.leaderboard.regional_rank && (
                        <span>Regional Rank: <strong>#{lastReward.leaderboard.regional_rank}</strong></span>
                      )}
                    </div>
                  </div>
                  {lastReward.milestone_message && (
                    <div className="mt-4 p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                      <p className="font-semibold flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {lastReward.milestone_message}
                      </p>
                    </div>
                  )}
                  {lastReward.wallet_tx && (
                    <div className="mt-4 p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                      <p className="font-semibold mb-2">🔗 Blockchain Transactions:</p>
                      {lastReward.wallet_tx.ecoPointsNFT && (
                        <p className="text-sm">EcoPoints NFT: {lastReward.wallet_tx.ecoPointsNFT}</p>
                      )}
                      {lastReward.wallet_tx.badgeNFTs && lastReward.wallet_tx.badgeNFTs.length > 0 && (
                        <p className="text-sm">Badge NFTs: {lastReward.wallet_tx.badgeNFTs.join(", ")}</p>
                      )}
                    </div>
                  )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: User Stats & Leaderboard */}
          <div className="space-y-6">
            {/* User Stats */}
            {userData && (
              <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-zinc-900/50 backdrop-blur-sm p-6">
                <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-500/10 blur-2xl" />
                <h2 className="text-2xl font-semibold text-zinc-100 mb-4 relative z-10 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  Your Stats
                </h2>
                <div className="space-y-4 relative z-10">
                  <div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-green-400 bg-clip-text text-transparent">
                      {userData.ecoPoints.toLocaleString()}
                    </div>
                    <div className="text-sm text-zinc-400">EcoPoints</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                    <div>
                      <div className="text-xl font-semibold text-zinc-100">
                        {userData.stats.totalActions}
                      </div>
                      <div className="text-xs text-zinc-400">Actions</div>
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-zinc-100">
                        {userData.badges.length}
                      </div>
                      <div className="text-xs text-zinc-400">Badges</div>
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-zinc-100">
                        {userData.stats.totalCO2Offset.toFixed(1)}
                      </div>
                      <div className="text-xs text-zinc-400">Tons CO2</div>
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-zinc-100">
                        {userData.stats.totalEnergySaved.toFixed(0)}
                      </div>
                      <div className="text-xs text-zinc-400">kWh Saved</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-zinc-800">
                    <p className="text-sm font-medium text-zinc-300 mb-2">
                      Leaderboard Rank:
                    </p>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Global: <strong className="text-zinc-100">#{userData.leaderboard.global_rank}</strong></span>
                      {userData.leaderboard.regional_rank && (
                        <span className="text-zinc-400">Regional: <strong className="text-zinc-100">#{userData.leaderboard.regional_rank}</strong></span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Badges */}
            {userData && userData.badges.length > 0 && (
              <div className="relative overflow-hidden rounded-2xl border border-green-500/20 bg-zinc-900/50 backdrop-blur-sm p-6">
                <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-green-500/10 blur-2xl" />
                <h2 className="text-2xl font-semibold text-zinc-100 mb-4 relative z-10 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-400" />
                  Your Badges
                </h2>
                <div className="grid grid-cols-2 gap-3 relative z-10">
                  {userData.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700 text-center hover:bg-zinc-800 hover:border-green-500/50 transition-colors"
                    >
                      <div className="text-3xl mb-1">{badge.icon}</div>
                      <div className="text-sm font-semibold text-zinc-100">
                        {badge.name}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1 capitalize">
                        {badge.rarity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Global Leaderboard */}
            <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-zinc-900/50 backdrop-blur-sm p-6">
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-500/10 blur-2xl" />
              <h2 className="text-2xl font-semibold text-zinc-100 mb-4 relative z-10 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Global Leaderboard
              </h2>
              <div className="space-y-2 relative z-10">
                {globalLeaderboard.length === 0 ? (
                  <p className="text-zinc-400 text-sm">
                    No users yet. Track an action to get started!
                  </p>
                ) : (
                  globalLeaderboard.map((entry, idx) => (
                    <div
                      key={entry.user_id}
                      className={`p-3 rounded-lg flex justify-between items-center transition-all ${
                        entry.user_id === userId
                          ? "bg-gradient-to-r from-blue-500/20 to-green-500/20 border-2 border-blue-500/50"
                          : "bg-zinc-800/50 border border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                          #{entry.rank}
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-zinc-100">
                            {entry.user_id}
                          </div>
                          <div className="text-xs text-zinc-400">
                            {entry.badges} badges
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                        {entry.ecoPoints.toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

