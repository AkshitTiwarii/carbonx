"use client";

import { useRef, useState } from "react";
import { useRaf } from "@/lib/scroll";

// Simple cursor-following mascot (SVG "cube fox" placeholder)
export default function CursorMascot() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [target, setTarget] = useState({ x: 0, y: 0 });

  // Track mouse
  function onMove(e: React.MouseEvent) {
    setTarget({ x: e.clientX, y: e.clientY });
  }

  // Ease toward cursor
  useRaf(() => {
    setPos((p) => ({ x: p.x + (target.x - p.x) * 0.08, y: p.y + (target.y - p.y) * 0.08 }));
  });

  return (
    <div onMouseMove={onMove} className="pointer-events-none fixed inset-0 z-[60]">
      <div
        ref={ref}
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        className="-translate-x-1/2 -translate-y-1/2 drop-shadow-[0_10px_30px_rgba(99,102,241,0.5)]"
      >
        <FoxHead />
      </div>
    </div>
  );
}

function FoxHead() {
  return (
    <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>
      </defs>
      <path d="M8 10l12 10 12-6 12 6 12-10-8 28-16 14-16-14L8 10z" fill="url(#g)" opacity="0.9" />
      <circle cx="28" cy="32" r="2" fill="#0A0A0A" />
      <circle cx="36" cy="32" r="2" fill="#0A0A0A" />
    </svg>
  );
}
