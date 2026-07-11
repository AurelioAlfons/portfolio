"use client";

// the 3-panel project carousel => center is the focused project, sides are prev/next,
// black ink dividers between them and the webgl energy glowing over everything
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

// how far (or how fast) you have to drag before it counts as a swipe
const DRAG_BUFFER = 40;
const VELOCITY_THRESHOLD = 500;

// one tech chip => icon + name, or just the name if there's no clean icon
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

export default function ThreeWayDomain({ projects }: { projects: Project[] }) {
  const n = projects.length;
  // all the state => which project is focused + a bunch of animation triggers
  const [selected, setSelected] = useState(0);
  const [reduced, setReduced] = useState(false); // user asked for less motion
  const [quality, setQuality] = useState<"high" | "low">("high"); // phones get the light version
  const [inView, setInView] = useState(false);
  const [seenField, setSeenField] = useState(false); // don't boot webgl until we're close
  const [dir, setDir] = useState(1); // which way the last swap went
  const [swapId, setSwapId] = useState(0); // counts swaps => the shader surges when it changes
  const [zoomId, setZoomId] = useState(0); // counts charge-ups => zoom replays when it changes
  const [seams, setSeams] = useState<Seam[]>(SEAMS);
  const movedRef = useRef(false);
  const bandRef = useRef<HTMLDivElement | null>(null);

  // check reduced-motion + decide phone or desktop quality
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

  // measure the band => the ink strokes rotate in pixels, so the shader needs
  // to know the band's shape to draw its seams at the exact same angle
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

  // watch the scroll => pause the webgl when we're off-screen, charge up when we arrive
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

  // the charge-up => slow zoom into the images while colors go faded -> vivid.
  // only the images scale, never the panels, so nothing on the page shifts
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

  // move to the next/prev project => the % math loops it around forever
  const go = (d: number) => {
    if (n < 2) return;
    setSelected((s) => (s + d + n) % n);
    setDir(d);
    if (reduced) return; // reduced motion => just switch, no fireworks
    setSwapId((x) => x + 1); // shader surge (colored)
    setZoomId((z) => z + 1); // image zoom + saturation charge-up
  };

  // open the project in a new tab
  const openLink = (p: Project) => {
    window.open(p.link, "_blank", "noopener,noreferrer");
  };

  // drag ended => was it far or fast enough to count as a swipe?
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

  // arrow keys work too => keyboard folks can browse projects
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  };

  // tap a panel => center opens the project, sides bring that one to center.
  // if you were just swiping we ignore the click so a swipe never opens a tab
  const onSlotClick = (role: ShardRole, p: Project) => {
    if (movedRef.current) return;
    if (role === "center") openLink(p);
    else go(role === "left" ? -1 : 1);
  };

  // figure out who sits where => prev on the left, selected center, next right
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
      {/* the boil filters => the animated seed makes the ink edges jitter every
          frame like hand-drawn anime. two versions so the dividers don't sync up */}
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
              {/* keyed by project id => on swap react remounts this, which is
                  what makes the incoming project slide into place */}
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
                {/* the color grade => tints each panel its domain color (blue/magenta/green) */}
                <span className={`twd-grade twd-grade-${role}`} aria-hidden="true" />
                {role === "center" && <span className="twd-hi" aria-hidden="true" />}
              </motion.div>
            </div>
          );
        })}

        {/* the webgl energy => flowing color fields + floating particles over the panels */}
        {seenField && (
          <DomainField
            active={inView}
            quality={quality}
            reduced={reduced}
            surge={swapId}
            seams={seams}
          />
        )}

        {/* the ink dividers => two black brush strokes leaning \ and /,
            each edge glows its neighbor's color (blue|magenta, magenta|green) */}
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

      {/* the caption => name, short blurb, tech chips for whatever's in the center */}
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
