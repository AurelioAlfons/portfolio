// Divider / seam geometry for the three domain slots.
//
// FINAL POLISH (approved, see pipeline/reference/ink-divider-demo.html):
// the dividers are MIRRORED black ink strokes — left leans \ , right leans / —
// rendered as rotated DOM elements with boiling feTurbulence edges. The panels
// themselves are straight strips; all slant comes from the ink strokes.
//
// The WebGL energy field still needs the seam lines (region split + black gap
// + particle placement). Because the ink strokes rotate in PIXEL space, their
// slope in band-fraction space depends on the band's aspect ratio — so the
// component measures the band and derives the seams with mirroredSeams().

export type ShardRole = "left" | "center" | "right";

export type Seam = { top: number; bot: number };

// Where the two seams cross the band's vertical center (band-fraction x).
export const SEAM_POS = [0.3, 0.7];

// Ink stroke rotation (degrees). Left divider -9deg = \ , right +9deg = / .
export const SEAM_ANGLE_DEG = 9;

// Seam lines in band-fraction space for a band of the given pixel size.
// Left seam \ : top-left, bottom-right. Right seam / : mirrored.
export function mirroredSeams(bandW: number, bandH: number): Seam[] {
  const dx = (Math.tan((SEAM_ANGLE_DEG * Math.PI) / 180) * (bandH / 2)) / bandW;
  return [
    { top: SEAM_POS[0] - dx, bot: SEAM_POS[0] + dx },
    { top: SEAM_POS[1] + dx, bot: SEAM_POS[1] - dx },
  ];
}

// Fallback for before the band has been measured (desktop-ish aspect).
export const SEAMS: Seam[] = mirroredSeams(1400, 570);
