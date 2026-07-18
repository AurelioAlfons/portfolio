"use client";

import { useEffect, useState } from "react";

// tracks the OS/browser prefers-reduced-motion setting, live => one shared
// check instead of every component rolling its own matchMedia listener
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}
