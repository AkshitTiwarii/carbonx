"use client";

import { motion, useScroll, useTransform, useSpring, type MotionValue } from "framer-motion";
import { useRef } from "react";

export default function StickyScrollSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start center", "end center"] });
  // Smooth the scroll signal so text doesn't flip too late when reversing scroll
  const smoothRaw = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.2 });
  // Clamp to [0,1] to avoid out-of-range opacity causing a blank state
  const smooth = useTransform(smoothRaw, (v) => Math.max(0, Math.min(1, v)));

  // Opacity steps for each slide (earlier, symmetric crossfades)
  // 1: visible 0 → 0.18, fade out 0.18 → 0.33
  // 2: fade in 0.18 → 0.33, visible 0.33 → 0.66, fade out 0.66 → 0.80
  // 3: fade in 0.66 → 0.80, visible 0.80 → 1
  const o1 = useTransform(smooth, [0.0, 0.18, 0.33], [1, 1, 0]);
  const o2 = useTransform(smooth, [0.18, 0.33, 0.66, 0.8], [0, 1, 1, 0]);
  const o3 = useTransform(smooth, [0.66, 0.8, 1], [0, 1, 1]);

  // Motion transforms for a smoother slide-change effect
  const y1 = useTransform(smooth, [0.0, 0.18, 0.33], [0, 0, -30]);
  const s1 = useTransform(smooth, [0.0, 0.18, 0.33], [1, 1, 0.98]);
  const b1px = useTransform(smooth, [0.0, 0.18, 0.33], [0, 0, 3]);
  const f1 = useTransform(b1px, (v) => `blur(${v}px)`);

  const y2 = useTransform(smooth, [0.18, 0.33, 0.66, 0.8], [30, 0, 0, -30]);
  const s2 = useTransform(smooth, [0.18, 0.33, 0.66, 0.8], [0.98, 1, 1, 0.98]);
  const b2px = useTransform(smooth, [0.18, 0.33, 0.66, 0.8], [3, 0, 0, 3]);
  const f2 = useTransform(b2px, (v) => `blur(${v}px)`);

  const y3 = useTransform(smooth, [0.66, 0.8, 1], [30, 0, 0]);
  const s3 = useTransform(smooth, [0.66, 0.8, 1], [0.98, 1, 1]);
  const b3px = useTransform(smooth, [0.66, 0.8, 1], [3, 0, 0]);
  const f3 = useTransform(b3px, (v) => `blur(${v}px)`);

  // Progress indicators
  const a1 = useTransform(smooth, [0, 0.18, 0.33, 1], [1, 1, 0.35, 0.35]);
  const a2 = useTransform(smooth, [0, 0.18, 0.33, 0.66, 0.8, 1], [0.35, 0.35, 1, 1, 0.35, 0.35]);
  const a3 = useTransform(smooth, [0, 0.66, 0.8, 1], [0.35, 0.35, 1, 1]);

  return (
    <div ref={ref} className="relative">
      <div className="relative h-[150vh] md:h-[160vh]">
        <div className="sticky top-[18vh] md:top-[18vh]">
          <div className="relative h-[52vh] md:h-[52vh] rounded-3xl border border-zinc-200 bg-white p-8 overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
            {/* top/bottom vignette to smooth edges */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white to-transparent dark:from-zinc-900" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent dark:from-zinc-900" />

            <motion.div style={{ opacity: o1, y: y1, scale: s1, filter: f1 }} className="absolute inset-0 grid place-items-center p-8 will-change-transform">
              <Slide
                title="Real-time trading"
                desc="Aggregate liquidity. Best execution. One click."
                color="from-indigo-100 to-violet-50"
                progress={smooth}
                revealStart={0.02}
                revealEnd={0.14}
              />
            </motion.div>
            <motion.div style={{ opacity: o2, y: y2, scale: s2, filter: f2 }} className="absolute inset-0 grid place-items-center p-8 will-change-transform">
              <Slide
                title="AI-powered insights"
                desc="Forecasts, alerts, and anomaly detection."
                color="from-emerald-100 to-teal-50"
                progress={smooth}
                revealStart={0.33}
                revealEnd={0.47}
              />
            </motion.div>
            <motion.div style={{ opacity: o3, y: y3, scale: s3, filter: f3 }} className="absolute inset-0 grid place-items-center p-8 will-change-transform">
              <Slide
                title="On-chain proof"
                desc="Verifiable ownership and retirements."
                color="from-cyan-100 to-sky-50"
                progress={smooth}
                revealStart={0.66}
                revealEnd={0.80}
              />
            </motion.div>

            {/* progress dots */}
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
              <motion.span style={{ opacity: a1 }} className="h-1.5 w-6 rounded-full bg-zinc-400 dark:bg-zinc-500" />
              <motion.span style={{ opacity: a2 }} className="h-1.5 w-6 rounded-full bg-zinc-400 dark:bg-zinc-500" />
              <motion.span style={{ opacity: a3 }} className="h-1.5 w-6 rounded-full bg-zinc-400 dark:bg-zinc-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Fill the post-sticky gap with compact feature pills */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Pill title="0.10% average spread" info="Typical observed spreads across aggregated pools." />
        <Pill title="Multi-chain support" info="Trade on major EVM networks with seamless routing." />
        <Pill title="Audit-ready logs" info="Immutable on-chain proofs and exportable traces." />
      </div>
    </div>
  );
}

function Slide({ title, desc, color, progress, revealStart, revealEnd }: { title: string; desc: string; color: string; progress: MotionValue<number>; revealStart: number; revealEnd: number; }) {
  // Per-line reveal synced to scroll within [revealStart, revealEnd]
  const mid = (revealStart + revealEnd) / 2;
  const titleOpacity = useTransform(progress, [revealStart, mid, revealEnd], [0, 1, 1]);
  const titleY = useTransform(progress, [revealStart, revealEnd], [16, 0]);
  const descOpacity = useTransform(progress, [revealStart + 0.04, mid + 0.04, revealEnd + 0.04], [0, 1, 1]);
  const descY = useTransform(progress, [revealStart + 0.04, revealEnd + 0.04], [16, 0]);
  return (
    <div className="max-w-3xl w-full text-center">
      {/* Light mode card */}
      <div className={`block dark:hidden rounded-2xl border border-zinc-200 bg-gradient-to-br ${color} p-8 shadow-sm`}> 
        <motion.h3 style={{ opacity: titleOpacity, y: titleY }} className="text-2xl md:text-3xl font-semibold text-zinc-900 will-change-transform">{title}</motion.h3>
        <motion.p style={{ opacity: descOpacity, y: descY }} className="mt-2 text-zinc-700 will-change-transform">{desc}</motion.p>
      </div>
      {/* Dark mode card with higher contrast */}
      <div className="hidden dark:block rounded-2xl border border-zinc-700 bg-zinc-800/70 backdrop-blur p-8 shadow-inner">
        <motion.h3 style={{ opacity: titleOpacity, y: titleY }} className="text-2xl md:text-3xl font-semibold text-zinc-100 will-change-transform">{title}</motion.h3>
        <motion.p style={{ opacity: descOpacity, y: descY }} className="mt-2 text-zinc-300 will-change-transform">{desc}</motion.p>
      </div>
    </div>
  );
}

function Pill({ title, info }: { title: string; info?: string }) {
  return (
    <div className="rounded-xl border px-4 py-3 text-sm text-zinc-700 bg-rose-50 border-rose-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 flex items-center justify-between gap-3">
      <span>{title}</span>
      {info ? <Bobble content={info} /> : null}
    </div>
  );
}

function Bobble({ content }: { content: string }) {
  return (
    <div className="relative group">
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 420, damping: 22 }}
        className="h-6 w-6 rounded-full grid place-items-center bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100 shadow-sm"
        aria-label="More info"
      >
        i
      </motion.button>
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-pre-line opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[11px] px-2 py-1 rounded-md bg-white text-zinc-800 border border-zinc-200 shadow dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700">
        {content}
      </div>
    </div>
  );
}
