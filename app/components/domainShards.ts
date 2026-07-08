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
// A thick, solid black leaning ribbon between two panels. Each edge carries
// its own gentle meander (no alternating zigzag) so it reads as one torn
// black gap, not a jagged mark.
function tornRibbon(
  topX: number,
  botX: number,
  halfW: number,
  wobA: number[],
  wobB: number[]
): Pt[] {
  const n = wobA.length;
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const cx = topX + (botX - topX) * t;
    left.push([cx - halfW + wobA[i], t]);
    right.push([cx + halfW + wobB[i], t]);
  }
  return [...left, ...right.reverse()];
}

// Fixed (deterministic) gentle meanders — independent per edge, small and
// same-signed so the edges stay subtly irregular but never zigzag.
const WOB_EDGE_A1 = [0, 0.003, 0.005, 0.002, 0.006, 0.003, 0.005, 0.002];
const WOB_EDGE_B1 = [0.002, 0.005, 0.002, 0.006, 0.003, 0.006, 0.002, 0.004];
const WOB_EDGE_A2 = [0.001, 0.004, 0.002, 0.005, 0.002, 0.006, 0.003, 0.001];
const WOB_EDGE_B2 = [0.003, 0.001, 0.005, 0.002, 0.006, 0.002, 0.005, 0.003];

// Left divider ≈ center panel's left seam; right divider ≈ its right seam.
// Thick, fully-opaque BLACK gaps that block the view between panels.
export const DIVIDER_HALF_W = 0.016;
export const DIVIDER_PATHS: string[] = [
  toPath(tornRibbon(0.315, 0.285, DIVIDER_HALF_W, WOB_EDGE_A1, WOB_EDGE_B1)),
  toPath(tornRibbon(0.71, 0.665, DIVIDER_HALF_W, WOB_EDGE_A2, WOB_EDGE_B2)),
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
// Offsets sit clearly OUTSIDE the black gap — never on the seam itself.
const STREAK_OFFSETS = [-0.056, -0.034, 0.033, 0.057];
export const STREAK_PATHS: string[] = SEAMS.flatMap((s) =>
  STREAK_OFFSETS.map((off, i) => toPath(seamRibbon(s, off, i % 2 === 0 ? 0.0016 : 0.0028)))
);
