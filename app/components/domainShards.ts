// the seam math => where the two dividers sit and how much they lean.
// the ink strokes lean \ and / in pixels, but the shader thinks in 0..1
// band coordinates => so we convert the angle based on the band's real size,
// and everything (ink, energy, particles) lines up on the same two lines

export type ShardRole = "left" | "center" | "right";

export type Seam = { top: number; bot: number };

// the dividers cross the middle at 30% and 70% of the band width
export const SEAM_POS = [0.3, 0.7];

// how much the ink strokes lean => -9deg looks like \ , +9deg looks like /
export const SEAM_ANGLE_DEG = 9;

// turn the lean into actual seam lines for a band of this pixel size
// => each seam is just "x at the top" and "x at the bottom"
export function mirroredSeams(bandW: number, bandH: number): Seam[] {
  const dx = (Math.tan((SEAM_ANGLE_DEG * Math.PI) / 180) * (bandH / 2)) / bandW;
  return [
    { top: SEAM_POS[0] - dx, bot: SEAM_POS[0] + dx },
    { top: SEAM_POS[1] + dx, bot: SEAM_POS[1] - dx },
  ];
}

// default seams before we've measured the real band => desktop-ish guess
export const SEAMS: Seam[] = mirroredSeams(1400, 570);
