"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function SlidesSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -80]);

  const slides = [
    { k: "trade", title: "Trade instantly", desc: "Best execution across pooled liquidity.", color: "from-emerald-100 to-teal-50" },
    { k: "offset", title: "Offset smartly", desc: "Automated retirements with proof.", color: "from-indigo-100 to-violet-50" },
    { k: "predict", title: "Predict prices", desc: "ML-driven forecasts and alerts.", color: "from-amber-100 to-rose-50" },
    { k: "audit", title: "Audit-ready", desc: "Transparent, verifiable records.", color: "from-cyan-100 to-sky-50" },
  ];

  return (
    <div ref={ref} className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/80 p-4">
      <motion.div style={{ x }} className="flex gap-4 will-change-transform">
        {[...slides, ...slides].map((s, i) => (
          <div
            key={`${s.k}-${i}`}
            className={`min-w-[260px] rounded-2xl border border-zinc-200 bg-gradient-to-br ${s.color} p-5 shadow-sm`}
          >
            <div className="text-xs text-zinc-600">{String(i % slides.length + 1).padStart(2, "0")}</div>
            <div className="mt-1 text-lg font-semibold text-zinc-900">{s.title}</div>
            <div className="text-sm text-zinc-700">{s.desc}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
