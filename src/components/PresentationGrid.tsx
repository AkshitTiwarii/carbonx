"use client";

import { motion } from "framer-motion";

type Tile = {
  title: string;
  subtitle?: string;
  bg: string; // tailwind bg classes
  fg?: string; // text color
  corner?: React.ReactNode;
};

const tileBase = "rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.2)] border";

export default function PresentationGrid() {
  const tiles: Tile[] = [
    {
      title: "Best execution, aggregated liquidity",
      subtitle: "Trade carbon credits at the best available price.",
      bg: "bg-gradient-to-br from-indigo-900 to-violet-800",
      fg: "text-white",
    },
    {
      title: "Configure anything, down to every detail",
      subtitle: "Slippage, expiry, intents — you’re in control.",
      bg: "bg-teal-900",
      fg: "text-white",
    },
    {
      title: "All your accounts and assets in one place",
      subtitle: "Centralize portfolios across chains and registries.",
      bg: "bg-violet-200",
      fg: "text-zinc-900",
    },
    {
      title: "Privacy‑first: you set the terms for your data",
      subtitle: "Client‑side analytics with on‑chain proofs.",
      bg: "bg-gradient-to-br from-orange-300 to-orange-500",
      fg: "text-zinc-900",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-rose-50 text-zinc-900 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800">
      {/* Grid */}
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top-left */}
          <Tile motionDelay={0} className={`${tileBase} ${tiles[0].bg} ${tiles[0].fg} border-black/10`}>
            <h3 className="text-2xl md:text-3xl font-semibold leading-tight">{tiles[0].title}</h3>
            <p className="mt-3 opacity-90">{tiles[0].subtitle}</p>
            <div className="mt-6 rounded-2xl bg-white/15 backdrop-blur px-4 py-3 inline-flex items-center gap-3 border border-white/20">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/20">🌿</span>
              <span className="text-sm opacity-90">Carbon Market</span>
              <span className="text-xs opacity-80">≈ best price</span>
            </div>
          </Tile>

          {/* Center billboard */}
      <Tile motionDelay={0.05} className={`${tileBase} bg-white border-zinc-200 md:row-span-2 md:order-none order-last grid place-items-center relative dark:bg-zinc-950 dark:border-zinc-800`}> 
            <div className="text-center">
        <div className="text-4xl md:text-6xl font-extrabold tracking-tight uppercase text-violet-900 dark:text-violet-200">
                GET MORE
                <br /> OUT OF
                <br /> CARBON
              </div>
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">Smart trading • Offsets • Proof</p>
            </div>
            {/* small mascot badge */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
              <MascotBadge />
            </div>
          </Tile>

          {/* Top-right */}
          <Tile motionDelay={0.1} className={`${tileBase} ${tiles[1].bg} ${tiles[1].fg} border-black/10`}>
            <h3 className="text-2xl md:text-3xl font-semibold leading-tight">{tiles[1].title}</h3>
            <p className="mt-3 opacity-90">{tiles[1].subtitle}</p>
            <div className="mt-6 rounded-2xl bg-white/10 backdrop-blur px-4 py-3 inline-flex items-center gap-3 border border-white/20">
              <span className="text-sm">Slippage: 0.50%</span>
              <span className="h-5 w-px bg-white/30" />
              <span className="text-sm">Expiry: 5m</span>
            </div>
          </Tile>

          {/* Bottom-left */}
          <Tile motionDelay={0.15} className={`${tileBase} ${tiles[2].bg} ${tiles[2].fg} border-black/10`}>
            <h3 className="text-2xl md:text-3xl font-semibold leading-tight">{tiles[2].title}</h3>
            <p className="mt-3 opacity-90">{tiles[2].subtitle}</p>
            <div className="mt-6 flex items-center gap-3">
              <Badge>ETH</Badge>
              <Badge>USDC</Badge>
              <Badge>tCO₂e</Badge>
            </div>
          </Tile>

          {/* Bottom-right */}
          <Tile motionDelay={0.2} className={`${tileBase} ${tiles[3].bg} ${tiles[3].fg} border-black/10`}>
            <h3 className="text-2xl md:text-3xl font-semibold leading-tight">{tiles[3].title}</h3>
            <p className="mt-3 opacity-90">{tiles[3].subtitle}</p>
            <div className="mt-6 rounded-2xl bg-white/90 text-zinc-900 px-4 py-3 inline-flex items-center gap-3 border border-black/10">
              <span className="text-lg">🔒</span>
              <span className="text-sm font-medium">Local‑first analytics</span>
            </div>
          </Tile>
        </div>
      </div>
    </div>
  );
}

function Tile({ children, className, motionDelay = 0 }: { children: React.ReactNode; className?: string; motionDelay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: motionDelay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/70 text-zinc-900 px-3 py-1 text-xs font-medium border border-black/10">
      {children}
    </span>
  );
}

function MascotBadge() {
  return (
    <div className="h-16 w-20 grid place-items-center rounded-xl bg-gradient-to-b from-orange-400 to-orange-600 shadow-lg border border-black/10">
      {/* simple geometric fox/leaf */}
      <svg width="44" height="36" viewBox="0 0 44 36" fill="none">
        <path d="M22 0 L32 8 L28 24 L22 20 L16 24 L12 8 Z" fill="#6b21a8" opacity=".25" />
        <path d="M22 4 L30 10 L27 22 L22 19 L17 22 L14 10 Z" fill="#fff" />
      </svg>
    </div>
  );
}
