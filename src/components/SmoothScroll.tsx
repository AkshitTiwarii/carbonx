"use client";

import { useEffect } from "react";

export default function SmoothScroll() {
  useEffect(() => {
    let cleanup = () => {};
  (async () => {
      try {
    const Lenis = (await import("lenis")).default;
    const lenis = new Lenis({ smoothWheel: true, lerp: 0.1 });
        function raf(time: number) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        cleanup = () => lenis.destroy();
      } catch {}
    })();
    return () => cleanup();
  }, []);
  return null;
}
