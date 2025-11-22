"use client";

import { motion } from "framer-motion";
import { Trophy, Lock } from "lucide-react";
import { useState, useEffect } from "react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_required?: number;
}

interface BadgeCollectionProps {
  earnedBadges: Badge[];
  allBadges?: Record<string, Badge>;
}

export default function BadgeCollection({ earnedBadges, allBadges }: BadgeCollectionProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const earnedBadgeIds = new Set(earnedBadges.map(b => b.id || b));

  useEffect(() => {
    if (allBadges && Object.keys(allBadges).length > 0) {
      // Combine earned and unearned badges
      const allBadgesList = Object.entries(allBadges).map(([badgeId, badge]) => ({
        ...badge,
        id: badge.id || badgeId,
      }));
      setBadges(allBadgesList);
    } else if (earnedBadges && earnedBadges.length > 0) {
      // If we only have earned badges, use those
      setBadges(earnedBadges.map(b => typeof b === 'string' ? { id: b, name: b, description: '', icon: '🏆' } : b));
    } else {
      setBadges([]);
    }
  }, [earnedBadges, allBadges]);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Badge Collection
        </h2>
        <span className="text-sm text-zinc-400">
          {earnedBadges.length} / {badges.length} earned
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges.map((badge, index) => {
          const isEarned = earnedBadgeIds.has(badge.id);
          
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`relative rounded-lg p-4 border-2 transition-all ${
                isEarned
                  ? "bg-gradient-to-br from-zinc-800/80 to-zinc-700/80 border-yellow-500/50 shadow-lg shadow-yellow-500/20"
                  : "bg-zinc-800/30 border-zinc-700/30 opacity-60"
              }`}
            >
              {isEarned ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: index * 0.05 }}
                  className="absolute -top-2 -right-2 bg-yellow-400 text-zinc-900 rounded-full p-1"
                >
                  <Trophy className="w-3 h-3" />
                </motion.div>
              ) : (
                <div className="absolute -top-2 -right-2 bg-zinc-700 text-zinc-400 rounded-full p-1">
                  <Lock className="w-3 h-3" />
                </div>
              )}

              <div className="text-center">
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h3 className={`font-semibold text-sm mb-1 ${
                  isEarned ? "text-zinc-100" : "text-zinc-500"
                }`}>
                  {badge.name}
                </h3>
                <p className={`text-xs ${
                  isEarned ? "text-zinc-400" : "text-zinc-600"
                }`}>
                  {badge.description}
                </p>
                {badge.points_required && !isEarned && (
                  <p className="text-xs text-zinc-500 mt-1">
                    {badge.points_required} pts needed
                  </p>
                )}
              </div>

              {isEarned && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-lg bg-gradient-to-br from-yellow-400/10 to-transparent pointer-events-none"
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {badges.length === 0 && (
        <div className="text-center py-8 text-zinc-500">
          <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No badges available yet</p>
        </div>
      )}
    </div>
  );
}

