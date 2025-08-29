"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export default function ScrollScenes() {
  const { scrollYProgress } = useScroll();
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  return (
    <div className="relative">
      {/* Sticky canvas-like hero */}
      <section className="sticky top-[64px] h-[70vh] grid place-items-center">
        <motion.div style={{ rotate, scale, opacity }} className="rounded-[28px] w-72 h-72 md:w-[28rem] md:h-[28rem] bg-gradient-to-tr from-indigo-500/40 to-fuchsia-500/40 border border-white/10 backdrop-blur" />
      </section>

      {/* Scene sections with copy */}
      <div className="space-y-20 pt-16">
        <Scene title="Instant, smooth, secure" copy="A buttery-smooth experience powered by modern web motion primitives. No jank, just vibes." />
        <Scene title="Scroll-driven magic" copy="Sections animate in-place as you scroll, like a sequence instead of a long page." />
        <Scene title="Cursor-aware UI" copy="Our playful mascot follows your pointer with subtle inertia for a living interface." />
      </div>
    </div>
  );
}

function Scene({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <h3 className="text-2xl md:text-3xl font-semibold">{title}</h3>
      <p className="text-zinc-300 mt-2">{copy}</p>
    </div>
  );
}
