"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { animate, motion } from "motion/react";
import { TECH, type TechKey } from "../lib/techIcons";
import { mirroredSeams, SEAMS, type Seam, type ShardRole } from "./domainShards";
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

// Three-Way Domain showcase: straight panel strips + mirrored boiling ink
// dividers (\ /) + WebGL energy field + image-only zoom/saturation charge-up.
export default function ThreeWayDomain({ projects }: { projects: Project[] }) {
  const n = projects.length;
  const [selected, setSelected] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [quality, setQuality] = useState<"high" | "low">("high");
  const [inView, setInView] = useState(false);
  const [seenField, setSeenField] = useState(false); // lazy-init WebGL once near view
  const [dir, setDir] = useState(1); // last swap direction
  const [swapId, setSwapId] = useState(0); // bumps each swap → shader surge
  const [zoomId, setZoomId] = useState(0); // bumps on scroll-in + swap → image charge-up
  const [seams, setSeams] = useState<Seam[]>(SEAMS);
  const movedRef = useRef(false);
  const bandRef = useRef<HTMLDivElement | null>(null);

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

  // Measure the band so the shader's seams match the rotated ink strokes
  // (their slope in fraction space depends on the band's aspect ratio).
  useEffect(() => {
    const el = bandRef.current;
    if (!el) return;
    let lastTop = -1;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      const next = mirroredSeams(r.width, r.height);
      if (Math.abs(next[0].top - lastTop) < 0.002) return;
      lastTop = next[0].top;
      setSeams(next);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
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

  // Charge-up (approved recipe): IMAGE-ONLY deep zoom + saturation ramp —
  // never scales the band/panels/dividers, so the carousel bounds don't move.
  useEffect(() => {
    if (reduced || zoomId === 0) return;
    const imgs = bandRef.current?.querySelectorAll<HTMLElement>(".twd-img");
    if (!imgs || imgs.length === 0) return;
    const controls = Array.from(imgs).map((el) =>
      animate(
        el,
        {
          scale: [1, 1.36, 1],
          filter: [
            "saturate(0.45) brightness(0.8)",
            "saturate(1.45) brightness(1.16)",
            "saturate(1) brightness(1)",
          ],
        },
        { duration: 5.6, ease: [0.33, 0, 0.2, 1], times: [0, 0.6, 1] }
      )
    );
    return () => controls.forEach((c) => c.stop());
  }, [zoomId, reduced]);

  if (n === 0) return null;

  const prev = (selected - 1 + n) % n;
  const next = (selected + 1) % n;
  const current = projects[selected];

  const go = (d: number) => {
    if (n < 2) return;
    setSelected((s) => (s + d + n) % n);
    setDir(d);
    if (reduced) return; // reduced motion: instant switch, no surge/charge-up
    setSwapId((x) => x + 1); // shader surge (colored)
    setZoomId((z) => z + 1); // image zoom + saturation charge-up
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

  // A tap on a panel: center opens the link, sides slide to center.
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
      {/* Boiling ink-brush filters: animated turbulence seed = the hand-drawn
          frame-to-frame jitter. Two variants so the dividers don't boil in sync. */}
      <svg className="twd-defs" aria-hidden="true" focusable="false">
        <defs>
          <filter id="twd-inkedge" x="-40%" y="-40%" width="180%" height="180%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05 0.5" numOctaves="2" seed="4" result="n">
              {!reduced && (
                <animate
                  attributeName="seed"
                  values="4;9;2;7;3;6"
                  dur="0.42s"
                  calcMode="discrete"
                  repeatCount="indefinite"
                />
              )}
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="twd-inkedge2" x="-40%" y="-40%" width="180%" height="180%">
            <feTurbulence type="fractalNoise" baseFrequency="0.055 0.46" numOctaves="2" seed="1" result="n">
              {!reduced && (
                <animate
                  attributeName="seed"
                  values="1;5;8;3;6;2"
                  dur="0.5s"
                  calcMode="discrete"
                  repeatCount="indefinite"
                />
              )}
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" />
          </filter>
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
        {slots.map(({ idx, role }) => {
          const p = projects[idx];
          return (
            <div
              key={role}
              className={`twd-slot twd-${role}`}
              onClick={() => onSlotClick(role, p)}
              role="button"
              tabIndex={-1}
              aria-label={role === "center" ? `Open ${p.title}` : `Show ${p.title}`}
            >
              {/* Keyed by project id: on swap it remounts and the incoming
                  project slides/settles into its new slot. */}
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
                {/* Cinematic per-panel color grade (under the energy field) */}
                <span className={`twd-grade twd-grade-${role}`} aria-hidden="true" />
                {role === "center" && <span className="twd-hi" aria-hidden="true" />}
              </motion.div>
            </div>
          );
        })}

        {/* WebGL energy field (Layer A + B), blended over the panels.
            swapId drives the (colored) surge; seams follow the ink strokes. */}
        {seenField && (
          <DomainField
            active={inView}
            quality={quality}
            reduced={reduced}
            surge={swapId}
            seams={seams}
          />
        )}

        {/* Mirrored boiling BLACK ink dividers ( \ / ) with colored seam glow
            — blue|magenta on the left seam, magenta|green on the right. */}
        <div className="twd-divider twd-div-l" aria-hidden="true">
          <span className="twd-ink" />
          <span className="twd-seam-surge" />
          <span className="twd-edge twd-edge-el" />
          <span className="twd-edge twd-edge-er" />
        </div>
        <div className="twd-divider twd-div-r" aria-hidden="true">
          <span className="twd-ink" />
          <span className="twd-seam-surge" />
          <span className="twd-edge twd-edge-el" />
          <span className="twd-edge twd-edge-er" />
        </div>
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
