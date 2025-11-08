"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface LeaderboardEntry {
  user_id: string;
  ecoPoints: number;
  rank: number;
  position: number;
  badges: string[];
  badge_count: number;
}

interface LeaderboardProps {
  currentUserId?: string;
}

export default function Leaderboard({ currentUserId }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<string>("global");

  useEffect(() => {
    fetchLeaderboard();
  }, [region]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/rewards/leaderboard?limit=100&region=${region}`);
      const data = await response.json();
      
      if (data.success) {
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (position === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (position === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-zinc-500 font-semibold">#{position}</span>;
  };

  const getPositionStyle = (position: number) => {
    if (position === 1) return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50";
    if (position === 2) return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50";
    if (position === 3) return "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/50";
    return "bg-zinc-800/30 border-zinc-700/50";
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          Leaderboard
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setRegion("global")}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              region === "global"
                ? "bg-indigo-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Global
          </button>
          <button
            onClick={() => setRegion("regional")}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              region === "regional"
                ? "bg-indigo-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Regional
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-zinc-500">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2" />
          <p>Loading leaderboard...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-8 text-zinc-500">
          <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No entries yet. Be the first to earn EcoPoints!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {leaderboard.map((entry, index) => {
            const isCurrentUser = currentUserId === entry.user_id;
            
            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                  getPositionStyle(entry.position)
                } ${isCurrentUser ? "ring-2 ring-indigo-500" : ""}`}
              >
                {/* Position */}
                <div className="flex-shrink-0 w-12 flex items-center justify-center">
                  {getPositionIcon(entry.position)}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold truncate ${
                      isCurrentUser ? "text-indigo-400" : "text-zinc-100"
                    }`}>
                      {isCurrentUser ? "You" : `User ${entry.user_id.slice(0, 8)}`}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-zinc-400">
                    <span>{entry.ecoPoints.toLocaleString()} pts</span>
                    <span>•</span>
                    <span>Level {entry.rank}</span>
                    {entry.badge_count > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          {entry.badge_count} badges
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Points Display */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-lg font-bold text-green-400">
                    {entry.ecoPoints.toLocaleString()}
                  </div>
                  <div className="text-xs text-zinc-500">points</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

