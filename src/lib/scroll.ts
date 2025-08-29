"use client";

import { useEffect, useRef, useState } from "react";

export function clamp(n: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, n));
}
export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function useRaf(callback: (t: number) => void) {
  const rafRef = useRef<number>();
  const cbRef = useRef(callback);
  cbRef.current = callback;
  useEffect(() => {
    const loop = (t: number) => {
      cbRef.current(t);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);
}

export function useScrollProgress(container?: React.RefObject<HTMLElement>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = container?.current || document.documentElement;
    const onScroll = () => {
      if (!el) return;
      const docH = el.scrollHeight - window.innerHeight;
      const p = docH > 0 ? window.scrollY / docH : 0;
      setProgress(Math.min(1, Math.max(0, p)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [container]);

  return progress;
}
