// GLSL for the Domain energy field (Stage 2). Written for three's default
// GLSL ES 1.0 ShaderMaterial. The quad is drawn straight in clip space (the
// vertex shader ignores the camera), so it always fills the band.

// --- Energy field (Layer A): three colliding domains + seam clash ---
export const ENERGY_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const ENERGY_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;

uniform float uTime;
uniform vec3 uColL;   // left  = blue / cyan
uniform vec3 uColC;   // center = magenta
uniform vec3 uColCHi; // center white highlight
uniform vec3 uColR;   // right = green / yellow
uniform float uSeamLTop, uSeamLBot; // left seam x at top / bottom
uniform float uSeamRTop, uSeamRBot; // right seam x at top / bottom
uniform int  uOctaves;
uniform float uReduced;
uniform float uSurge;  // 0..1 swap surge, decays after each transition
uniform float uCharge; // 0..1 power-up ramp when the section scrolls into view

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// fractal noise; loop bound is constant (WebGL1), broken early per uOctaves
float fbm(vec2 p, int oct) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 6; i++) {
    if (i >= oct) break;
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  float y = uv.y;

  // Near-vertical leaning seams + a little organic wobble.
  // vUv.y = 0 at the BOTTOM (WebGL), but the divider geometry's "top" x is at
  // the top of the band (SVG y-down) — flip so the energy sits ON the dividers.
  float yDown = 1.0 - y;
  float seamL = mix(uSeamLTop, uSeamLBot, yDown);
  float seamR = mix(uSeamRTop, uSeamRBot, yDown);
  float wob = (noise(vec2(y * 6.0, uTime * 0.15)) - 0.5) * 0.02;
  seamL += wob;
  seamR += wob * 0.8;

  // Flowing, domain-warped energy.
  vec2 p = uv * vec2(3.0, 2.0);
  float t = uTime * 0.12;
  vec2 warp = vec2(
    fbm(p + vec2(0.0, t), uOctaves),
    fbm(p + vec2(5.2, -t), uOctaves)
  );
  float e = fbm(p + warp * 1.6 + vec2(t * 0.6, 0.0), uOctaves);
  e = pow(clamp(e, 0.0, 1.0), 1.6);

  // Region base color + brightness (center dominates).
  vec3 col;
  float bright;
  bool isCenter = false;
  if (uv.x < seamL) { col = uColL; bright = 0.9; }
  else if (uv.x < seamR) { col = uColC; bright = 1.5; isCenter = true; }
  else { col = uColR; bright = 1.0; }

  vec3 energy = col * e * bright;

  // Center: sweeping white-hot highlights, more turbulence.
  if (isCenter) {
    float hi = smoothstep(0.6, 1.0, fbm(p * 1.5 + vec2(-t * 1.2, t), uOctaves));
    energy += uColCHi * hi * 0.5;
  }

  // Seams: thick torn BLACK gap. No white core — each panel's edge carries a
  // thin rim-light in its own domain color (blue / magenta / green).
  float sdL = uv.x - seamL;
  float sdR = uv.x - seamR;
  float flicker = 0.6 + 0.4 * sin(uTime * 6.0 + y * 20.0)
                + 0.3 * noise(vec2(y * 30.0, uTime * 3.0));
  // Surge intensifies the rim collision during a swap.
  float clashBoost = 1.0 + uSurge * 3.0;
  float rimL = smoothstep(0.04, 0.008, abs(sdL));
  float rimR = smoothstep(0.04, 0.008, abs(sdR));
  vec3 rimColL = (sdL < 0.0) ? uColL : uColC; // left seam: blue | magenta
  vec3 rimColR = (sdR < 0.0) ? uColC : uColR; // right seam: magenta | green
  energy += rimColL * rimL * (0.55 + 0.45 * flicker) * clashBoost;
  energy += rimColR * rimR * (0.55 + 0.45 * flicker) * clashBoost;

  // Swap surge: brighten the center, and send a bright ring outward from the
  // middle that expands as the surge decays, then settles.
  energy += uColC * uSurge * 0.35;
  float ringPos = (1.0 - uSurge) * 0.55;
  float ripple = smoothstep(0.045, 0.0, abs(abs(uv.x - 0.5) - ringPos)) * uSurge;
  energy += vec3(1.0, 0.92, 0.96) * ripple * 1.3;

  // Charge-up: muted -> vivid as uCharge ramps in, then a slow breathe.
  float breathe = uCharge * 0.05 * sin(uTime * 0.45);
  float satL = mix(0.55, 1.0, uCharge) + breathe;
  float intenL = mix(0.6, 1.0, uCharge) + breathe;
  float lumE = dot(energy, vec3(0.299, 0.587, 0.114));
  energy = mix(vec3(lumE), energy, satL) * intenL;

  // BLACK torn gap: kill all light inside the divider core so the seam stays
  // a black gap (the DOM divider ribbon shows through).
  float gap = min(smoothstep(0.006, 0.016, abs(sdL)), smoothstep(0.006, 0.016, abs(sdR)));
  energy *= gap;

  // Calmer for reduced-motion.
  energy *= (1.0 - 0.45 * uReduced);

  float lum = clamp(dot(energy, vec3(0.33)), 0.0, 1.0);
  float alpha = clamp(lum * 1.3, 0.0, 0.9);
  gl_FragColor = vec4(energy, alpha);
}
`;

// --- Particles (Layer B): drifting glowing orbs + seam sparks, additive ---
export const PARTICLE_VERT = /* glsl */ `
attribute vec3 aColor;
attribute vec2 aVel;
attribute float aSize;
attribute float aSeed;

uniform float uTime;
uniform float uPix;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 pos = position.xy + aVel * uTime;
  // wrap back into the band
  pos = mod(pos + 1.0, 2.0) - 1.0;
  gl_Position = vec4(pos, 0.0, 1.0);

  float tw = 0.55 + 0.45 * sin(uTime * 2.0 + aSeed * 6.2831);
  vAlpha = clamp(tw, 0.0, 1.0);
  vColor = aColor;
  gl_PointSize = aSize * uPix * (0.7 + 0.5 * tw);
}
`;

export const PARTICLE_FRAG = /* glsl */ `
precision mediump float;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float r = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, r) * vAlpha;
  gl_FragColor = vec4(vColor * a, a);
}
`;
