"use client";

import { useEffect, type RefObject } from "react";
import { createTimeline, stagger, splitText } from "animejs";

// splits text into words and wipes them in every time it scrolls into view =>
// replays each time you navigate back to a section, not just once ever.
// reduced motion just leaves the plain text alone, no split, no wipe.
export function useLineWipeReveal(
  ref: RefObject<HTMLElement | null>,
  reduced: boolean,
  from: string = "-100%" // which way the words wipe in from
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    let splitter: ReturnType<typeof splitText> | null = null;

    const play = () => {
      splitter?.revert(); // clean slate => no stacking splits on replay
      splitter = splitText(el, { words: { wrap: "clip" } });
      createTimeline({ defaults: { duration: 650, ease: "inOut(3)" } })
        .add(splitter.words, { y: [from, "0%"] }, stagger(60))
        .init();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) play();
      },
      { threshold: 0.4 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      splitter?.revert();
    };
  }, [ref, reduced, from]);
}
