"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface RewardNotificationProps {
  pointsEarned?: number;
  newBadges?: Badge[];
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function RewardNotification({
  pointsEarned,
  newBadges = [],
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
}: RewardNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose && (pointsEarned || newBadges.length > 0)) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose, pointsEarned, newBadges]);

  if (!isVisible && !pointsEarned && newBadges.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (pointsEarned || newBadges.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 right-4 z-50 max-w-md w-full"
        >
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-2 border-yellow-500/50 rounded-xl p-6 shadow-2xl backdrop-blur-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </motion.div>
                <h3 className="text-lg font-semibold text-zinc-100">
                  {newBadges.length > 0 ? "Badge Unlocked!" : "Points Earned!"}
                </h3>
              </div>
              {onClose && (
                <button
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(() => onClose(), 300);
                  }}
                  className="text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Points Earned */}
            {pointsEarned && pointsEarned > 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">✨</div>
                  <div>
                    <div className="text-sm text-zinc-400">EcoPoints Earned</div>
                    <div className="text-2xl font-bold text-green-400">
                      +{pointsEarned.toLocaleString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* New Badges */}
            {newBadges.length > 0 && (
              <div className="space-y-3">
                {newBadges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ scale: 0.8, opacity: 0, x: -20 }}
                    animate={{ scale: 1, opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-lg"
                  >
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                      className="text-4xl"
                    >
                      {badge.icon}
                    </motion.div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <h4 className="font-semibold text-zinc-100">{badge.name}</h4>
                      </div>
                      <p className="text-sm text-zinc-400">{badge.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Confetti Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  initial={{
                    x: "50%",
                    y: "50%",
                    opacity: 1,
                  }}
                  animate={{
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: Math.random() * 0.5,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

