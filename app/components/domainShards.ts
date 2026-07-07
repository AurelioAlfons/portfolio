// Panel geometry for the three domain slots (Stage 1, revision 2).
//
// DIRECTION: match the anime three-panel reference — three tall, near-vertical
// panels with a slight lean, sitting tight together, split by THIN, slightly
// torn black diagonal dividers (like torn film strips). No jagged shards, no
// morph, no breakout.
//
// Single source of truth for the three regions:
//   - SHARDS: per-slot clip polygons (objectBoundingBox 0..1) for the DOM images.
//     Panels overlap a little; the center sits on top so the visible seam is
//     clean, then the torn divider ribbons are drawn over the seams.
//   - DIVIDER_PATHS: two thin torn black ribbons in band-fraction space (0..1),
//     drawn in an SVG with preserveAspectRatio="none" as the visible dividers.

export type Pt = [number, number];

// Build an SVG path `d` string from a closed ring of points.
export function toPath(points: Pt[]): string {
  return (
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ") + " Z"
  );
}

// --- Panel clip polygons (leaning strips; edges lean the same way) ---
// Left panel: outer (left) edge runs off-screen; inner edge leans.
export const LEFT_SHARD: Pt[] = [
  [0.0, 0.0],
  [1.0, 0.0],
  [0.9, 1.0],
  [0.0, 1.0],
];

// Center panel: the focused project, a bit wider; both edges lean left going down.
export const CENTER_SHARD: Pt[] = [
  [0.08, 0.0],
  [0.98, 0.0],
  [0.88, 1.0],
  [0.0, 1.0],
];

// Right panel: inner edge leans; outer (right) edge runs off-screen.
export const RIGHT_SHARD: Pt[] = [
  [0.1, 0.0],
  [1.0, 0.0],
  [1.0, 1.0],
  [0.0, 1.0],
];

export const SHARDS = {
  left: LEFT_SHARD,
  center: CENTER_SHARD,
  right: RIGHT_SHARD,
} as const;

export type ShardRole = keyof typeof SHARDS;

// --- Torn divider ribbons (band-fraction 0..1) ---
// A thin, slightly wobbly, leaning vertical ribbon between two panels.
function tornRibbon(topX: number, botX: number, halfW: number, wob: number[]): Pt[] {
  const n = wob.length;
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const cx = topX + (botX - topX) * t + wob[i];
    left.push([cx - halfW, t]);
    right.push([cx + halfW, t]);
  }
  return [...left, ...right.reverse()];
}

// Fixed (deterministic) wobble so SSR and client render identically.
// Scaled up for a more hand-torn feel.
const WOB_LEFT = [0, 0.009, -0.006, 0.01, -0.005, 0.008, -0.003, 0.006];
const WOB_RIGHT = [0, -0.008, 0.009, -0.005, 0.009, -0.006, 0.005, -0.003];

// Left divider ≈ center panel's left seam; right divider ≈ its right seam.
// Thick torn BLACK gaps (per the video reference).
export const DIVIDER_PATHS: string[] = [
  toPath(tornRibbon(0.315, 0.285, 0.009, WOB_LEFT)),
  toPath(tornRibbon(0.71, 0.665, 0.009, WOB_RIGHT)),
];

// Seam center-lines (band-fraction x at top / bottom) — the two near-vertical
// leaning boundaries between the three regions. Consumed by the WebGL energy
// field so its region masks + collision seams align to the panels/dividers.
export const SEAMS: { top: number; bot: number }[] = [
  { top: 0.315, bot: 0.285 },
  { top: 0.71, bot: 0.665 },
];

// Straight thin ribbon parallel to a seam, offset sideways by `off`.
function seamRibbon(seam: { top: number; bot: number }, off: number, halfW: number): Pt[] {
  return [
    [seam.top + off - halfW, 0],
    [seam.top + off + halfW, 0],
    [seam.bot + off + halfW, 1],
    [seam.bot + off - halfW, 1],
  ];
}

// Swap speed-line streaks: clustered around each seam, running parallel to it
// (same fraction space as the dividers, so they align at any viewport).
// Offsets sit just OUTSIDE the black gap so the streaks flank it.
const STREAK_OFFSETS = [-0.04, -0.021, 0.02, 0.042];
export const STREAK_PATHS: string[] = SEAMS.flatMap((s) =>
  STREAK_OFFSETS.map((off, i) => toPath(seamRibbon(s, off, i % 2 === 0 ? 0.0016 : 0.0028)))
);
