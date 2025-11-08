"use client";

import { motion } from "framer-motion";
import { TrendingUp, Award, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface EcoPointsSummaryProps {
  ecoPoints: number;
  rank: number;
  position?: number;
}

export default function EcoPointsSummary({ ecoPoints, rank, position }: EcoPointsSummaryProps) {
  const [animatedPoints, setAnimatedPoints] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = ecoPoints / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(ecoPoints, increment * step);
      setAnimatedPoints(Math.floor(current));
      
      if (step >= steps) {
        clearInterval(timer);
        setAnimatedPoints(ecoPoints);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [ecoPoints]);

  return (
    <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-800/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-zinc-100 mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        EcoPoints Summary
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Total Points</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <motion.div
            key={animatedPoints}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-green-400"
          >
            {animatedPoints.toLocaleString()}
          </motion.div>
        </motion.div>

        {/* Rank */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Level</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold text-indigo-400">{rank}</div>
        </motion.div>

        {/* Leaderboard Position */}
        {position && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">Global Rank</span>
              <span className="text-xs text-zinc-500">#{position}</span>
            </div>
            <div className="text-3xl font-bold text-fuchsia-400">#{position}</div>
          </motion.div>
        )}
      </div>

      {/* Progress to next rank */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-zinc-400">Progress to Level {rank + 1}</span>
          <span className="text-zinc-300">
            {ecoPoints % 100} / 100 points
          </span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((ecoPoints % 100) / 100) * 100}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

