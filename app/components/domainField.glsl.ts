// the shaders => tiny programs the gpu runs for every pixel of the energy canvas.
// this is where the flowing color fields actually get painted

// vertex shader => just stretches one quad over the whole band, no camera math
export const ENERGY_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// fragment shader => decides the color of every single pixel in the band
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

// hash + noise + fbm => the classic random-smoke recipe, layered noise on noise
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

  // figure out where the two seams are at this pixel's height.
  // heads up: webgl counts y from the bottom, our divider math counts from
  // the top => flip it or the seams lean the wrong way (learned that one)
  float yDown = 1.0 - y;
  float seamL = mix(uSeamLTop, uSeamLBot, yDown);
  float seamR = mix(uSeamRTop, uSeamRBot, yDown);

  // the flowing energy => noise warped by more noise, drifting over time
  vec2 p = uv * vec2(3.0, 2.0);
  float t = uTime * 0.12;
  vec2 warp = vec2(
    fbm(p + vec2(0.0, t), uOctaves),
    fbm(p + vec2(5.2, -t), uOctaves)
  );
  float e = fbm(p + warp * 1.6 + vec2(t * 0.6, 0.0), uOctaves);
  e = pow(clamp(e, 0.0, 1.0), 1.6);

  // which side of the seams are we on? => that decides the color.
  // center burns brightest, it's the star of the show
  vec3 col;
  float bright;
  bool isCenter = false;
  if (uv.x < seamL) { col = uColL; bright = 0.9; }
  else if (uv.x < seamR) { col = uColC; bright = 1.5; isCenter = true; }
  else { col = uColR; bright = 1.0; }

  vec3 energy = col * e * bright;

  // center only => white-hot highlights sweeping through the magenta
  if (isCenter) {
    float hi = smoothstep(0.6, 1.0, fbm(p * 1.5 + vec2(-t * 1.2, t), uOctaves));
    energy += uColCHi * hi * 0.5;
  }

  // signed distance to each seam => used to carve the black gaps below
  float sdL = uv.x - seamL;
  float sdR = uv.x - seamR;

  // project just swapped => the center flares up for a moment (colored, never white)
  energy += uColC * uSurge * 0.4;

  // the charge-up => colors start washed out, ramp to full, then breathe slowly
  float breathe = uCharge * 0.05 * sin(uTime * 0.45);
  float satL = mix(0.55, 1.0, uCharge) + breathe;
  float intenL = mix(0.6, 1.0, uCharge) + breathe;
  float lumE = dot(energy, vec3(0.299, 0.587, 0.114));
  energy = mix(vec3(lumE), energy, satL) * intenL;

  // kill all light where the ink dividers sit => the seams stay pure black
  float gap = min(smoothstep(0.014, 0.024, abs(sdL)), smoothstep(0.014, 0.024, abs(sdR)));
  energy *= gap;

  // reduced motion => everything chills out
  energy *= (1.0 - 0.45 * uReduced);

  float lum = clamp(dot(energy, vec3(0.33)), 0.0, 1.0);
  float alpha = clamp(lum * 1.3, 0.0, 0.9);
  gl_FragColor = vec4(energy, alpha);
}
`;

// the particles => little glowing orbs drifting up, twinkling as they go
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
  // floated off the edge? => wrap around and come back from the other side
  pos = mod(pos + 1.0, 2.0) - 1.0;
  gl_Position = vec4(pos, 0.0, 1.0);

  float tw = 0.55 + 0.45 * sin(uTime * 2.0 + aSeed * 6.2831);
  vAlpha = clamp(tw, 0.0, 1.0);
  vColor = aColor;
  gl_PointSize = aSize * uPix * (0.7 + 0.5 * tw);
}
`;

// each particle is drawn as a soft round glow => bright middle, fades at the edge
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
