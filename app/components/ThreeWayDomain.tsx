"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { animate, motion } from "motion/react";
import { TECH, type TechKey } from "../lib/techIcons";
import { SHARDS, toPath, DIVIDER_PATHS, STREAK_PATHS, type ShardRole } from "./domainShards";
import DomainField from "./DomainField";
import "./ThreeWayDomain.css";

export type Project = {
  id: number;
  title: string;
  description: string;
  link: string; // single link, opens in new tab
  image: string; // e.g. "/images/PokeSim.png"
  tech: string[]; // keys into TECH
};

// Same swipe feel as Carousel.tsx (offset/velocity).
const DRAG_BUFFER = 40;
const VELOCITY_THRESHOLD = 500;

// One tech chip. Falls back to text-only when a tech has no icon / unknown key.
function TechChip({ k }: { k: string }) {
  const t = TECH[k as TechKey];
  if (!t) return <span className="twd-chip">{k}</span>;
  const Icon = t.Icon;
  return (
    <span className="twd-chip">
      {Icon ? <Icon className="twd-chip-icon" style={{ color: t.color }} /> : null}
      <span>{t.label}</span>
    </span>
  );
}

// STAGE 1: static jagged shards only. Each project image is clipped into a
// fixed slot shard with a placeholder color tint. No energy shader, particles,
// morph, or transitions yet (those are Stages 2-4).
export default function ThreeWayDomain({ projects }: { projects: Project[] }) {
  const n = projects.length;
  const [selected, setSelected] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [quality, setQuality] = useState<"high" | "low">("high");
  const [inView, setInView] = useState(false);
  const [seenField, setSeenField] = useState(false); // lazy-init WebGL once near view
  const [dir, setDir] = useState(1); // last swap direction
  const [swapId, setSwapId] = useState(0); // bumps each swap → drives surge + flash
  const [swapping, setSwapping] = useState(false); // flash/streaks overlay active
  const [zoomId, setZoomId] = useState(0); // bumps on scroll-in + swap → zoom/saturate
  const movedRef = useRef(false);
  const bandRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef<HTMLDivElement | null>(null);
  const swapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track prefers-reduced-motion + pick a quality tier from the viewport width.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduced(mq.matches);
      setQuality(window.innerWidth < 768 ? "low" : "high");
    };
    update();
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Pause the energy field when the band is off-screen; lazy-init on first sight.
  useEffect(() => {
    const el = bandRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) {
          setSeenField(true);
          setZoomId((z) => z + 1); // charge-up on each scroll-into-view
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Clear the swap timer on unmount.
  useEffect(() => {
    return () => {
      if (swapTimer.current) clearTimeout(swapTimer.current);
    };
  }, []);

  // Charge-up: quick zoom-in that eases back out, while the color grade
  // saturates from faded to full (~1.8s). Plays on scroll-in and every swap.
  useEffect(() => {
    if (reduced || zoomId === 0) return;
    const el = zoomRef.current;
    if (!el) return;
    const zoom = animate(
      el,
      { scale: [1, 1.07, 1] },
      { duration: 1.8, ease: "easeOut", times: [0, 0.3, 1] }
    );
    const sat = animate(
      el,
      { filter: ["saturate(0.6)", "saturate(1)"] },
      { duration: 1.8, ease: "easeOut" }
    );
    return () => {
      zoom.stop();
      sat.stop();
    };
  }, [zoomId, reduced]);

  if (n === 0) return null;

  const prev = (selected - 1 + n) % n;
  const next = (selected + 1) % n;
  const current = projects[selected];

  const go = (d: number) => {
    if (n < 2) return;
    setSelected((s) => (s + d + n) % n);
    setDir(d);
    if (reduced) return; // reduced motion: instant switch, no surge/flash
    // Fire the swap: bumps the shader surge + shows the flash/streaks overlay,
    // and replays the zoom/saturation charge-up.
    setSwapId((x) => x + 1);
    setZoomId((z) => z + 1);
    setSwapping(true);
    if (swapTimer.current) clearTimeout(swapTimer.current);
    swapTimer.current = setTimeout(() => setSwapping(false), 620);
  };

  const openLink = (p: Project) => {
    window.open(p.link, "_blank", "noopener,noreferrer");
  };

  const handleDragEnd = (
    _: unknown,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    const { offset, velocity } = info;
    const d =
      offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD
        ? 1
        : offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD
        ? -1
        : 0;
    if (d !== 0) go(d);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  };

  // A tap on a shard: center opens the link, sides slide to center.
  // Ignore the click if a drag just happened (swipe should not open).
  const onSlotClick = (role: ShardRole, p: Project) => {
    if (movedRef.current) return;
    if (role === "center") openLink(p);
    else go(role === "left" ? -1 : 1);
  };

  // Which projects sit in which slot (defensive for small n).
  const slots: { idx: number; role: ShardRole }[] =
    n === 1
      ? [{ idx: selected, role: "center" }]
      : n === 2
      ? [
          { idx: prev, role: "left" },
          { idx: selected, role: "center" },
        ]
      : [
          { idx: prev, role: "left" },
          { idx: selected, role: "center" },
          { idx: next, role: "right" },
        ];

  return (
    <div className="twd-root" tabIndex={0} onKeyDown={onKeyDown} aria-roledescription="Project showcase">
      {/* Shard clip-path definitions (Stage 1 source of truth = domainShards.ts) */}
      <svg className="twd-defs" aria-hidden="true" focusable="false">
        <defs>
          {(Object.keys(SHARDS) as ShardRole[]).map((role) => (
            <clipPath key={role} id={`twd-shard-${role}`} clipPathUnits="objectBoundingBox">
              <path d={toPath(SHARDS[role])} />
            </clipPath>
          ))}
        </defs>
      </svg>

      <motion.div
        ref={bandRef}
        className="twd-band"
        drag={n > 1 ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.16}
        onDragStart={() => (movedRef.current = false)}
        onDrag={(_, info) => {
          if (Math.abs(info.offset.x) > 6) movedRef.current = true;
        }}
        onDragEnd={handleDragEnd}
      >
        {/* Zoom/saturation wrapper: charge-up scales this and ramps its filter
            (imperative animate — no remount, the WebGL canvas survives). */}
        <div
          ref={zoomRef}
          className="twd-zoom"
          style={{ filter: reduced ? undefined : "saturate(0.6)" }}
        >
        {slots.map(({ idx, role }) => {
          const p = projects[idx];
          const clip = `url(#twd-shard-${role})`;
          return (
            <div
              key={role}
              className={`twd-slot twd-${role}`}
              style={{ clipPath: clip, WebkitClipPath: clip }}
              onClick={() => onSlotClick(role, p)}
              role="button"
              tabIndex={-1}
              aria-label={role === "center" ? `Open ${p.title}` : `Show ${p.title}`}
            >
              {/* Keyed by project id: on swap it remounts and the incoming
                  project grows/settles into its new slot (Stage 3). */}
              <motion.div
                key={p.id}
                className="twd-inner"
                initial={
                  reduced
                    ? false
                    : role === "center"
                    ? { scale: 1.16, x: dir > 0 ? 55 : -55, opacity: 0.5 }
                    : { scale: 1, x: dir > 0 ? 18 : -18, opacity: 0.35 }
                }
                animate={{ scale: 1, x: 0, opacity: 1 }}
                transition={{ duration: reduced ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <img
                  className="twd-img"
                  src={p.image}
                  alt={p.title}
                  draggable={false}
                  loading={role === "center" ? undefined : "lazy"}
                />
                {/* Cinematic per-panel color grade (under the Stage 2 energy) */}
                <span className={`twd-grade twd-grade-${role}`} aria-hidden="true" />
                {role === "center" && <span className="twd-hi" aria-hidden="true" />}
              </motion.div>
            </div>
          );
        })}

        {/* Thin torn black dividers between the panels */}
        <svg
          className="twd-dividers"
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          {DIVIDER_PATHS.map((d, i) => (
            <path key={i} d={d} fill="#000" />
          ))}
        </svg>

        {/* Stage 2 — WebGL energy field (Layer A + B), blended over the panels.
            Stage 3: swapId drives the surge on each project change. */}
        {seenField && (
          <DomainField
            active={inView}
            quality={quality}
            reduced={reduced}
            surge={swapId}
          />
        )}
        </div>

        {/* Stage 3 — impact flash + speed-line streaks on swap */}
        {swapping && !reduced && (
          <div className="twd-swap" key={swapId} aria-hidden="true">
            <motion.div
              className="twd-flash"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.9, 0] }}
              transition={{ duration: 0.34, times: [0, 0.25, 1], ease: "easeOut" }}
            />
            {/* Friction light concentrated at the seams, parallel to the dividers */}
            <motion.svg
              className="twd-streaks"
              viewBox="0 0 1 1"
              preserveAspectRatio="none"
              initial={{ opacity: 0, x: dir > 0 ? "1.5%" : "-1.5%" }}
              animate={{ opacity: [0, 0.85, 0], x: dir > 0 ? "-1.5%" : "1.5%" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {STREAK_PATHS.map((d, i) => (
                <path key={i} d={d} fill="rgba(255, 255, 255, 0.7)" />
              ))}
            </motion.svg>
          </div>
        )}
      </motion.div>

      {/* Caption row (below the band) */}
      <motion.div
        key={current.id}
        className="twd-caption"
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.3, ease: "easeOut" }}
      >
        <h3 className="twd-title">{current.title}</h3>
        <p className="twd-desc">{current.description}</p>
        <div className="twd-chips">
          {current.tech.map((k) => (
            <TechChip key={k} k={k} />
          ))}
        </div>
        <a className="twd-open-btn" href={current.link} target="_blank" rel="noreferrer">
          Open&nbsp;↗
        </a>
      </motion.div>
    </div>
  );
}
