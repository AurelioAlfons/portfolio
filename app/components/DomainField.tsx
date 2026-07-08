"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SEAMS } from "./domainShards";
import {
  ENERGY_VERT,
  ENERGY_FRAG,
  PARTICLE_VERT,
  PARTICLE_FRAG,
} from "./domainField.glsl";

type Quality = "high" | "low";

// Slot palette (fixed by position): blue / magenta+white / green.
const COL_L = new THREE.Color(0.2, 0.65, 1.0);
const COL_C = new THREE.Color(1.0, 0.25, 0.65);
const COL_C_HI = new THREE.Color(1.0, 0.95, 0.98);
const COL_R = new THREE.Color(0.45, 0.95, 0.35);

const PARTICLE_RGB = {
  left: [0.35, 0.75, 1.0],
  center: [1.0, 0.4, 0.72],
  right: [0.55, 1.0, 0.45],
  spark: [1.0, 0.96, 0.98],
};

// uy: 0 = bottom of the band (clip space). The seam's "top" x belongs at the
// top of the band (SVG y-down), so flip when interpolating.
function seamAt(uy: number, i: number) {
  return SEAMS[i].top + (SEAMS[i].bot - SEAMS[i].top) * (1 - uy);
}

// Deterministic PRNG so the particle field is stable across renders.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildParticles(count: number): THREE.BufferGeometry | null {
  if (count === 0) return null;
  const rand = mulberry32(1337);
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const vel = new Float32Array(count * 2);
  const size = new Float32Array(count);
  const seed = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const y = rand() * 2 - 1;
    const uy = (y + 1) / 2;
    const sL = seamAt(uy, 0);
    const sR = seamAt(uy, 1);
    let x: number;
    let rgb: number[];
    let s: number;

    if (i % 3 === 0) {
      // spark: flank a seam, just OUTSIDE the black divider gap
      const seamX = i % 2 === 0 ? sL : sR;
      const side = rand() < 0.5 ? -1 : 1;
      x = (seamX + side * (0.028 + rand() * 0.02)) * 2 - 1;
      rgb = PARTICLE_RGB.spark;
      s = rand() * 4 + 3;
    } else {
      // half the orbs sit in the (denser) center domain
      const ux = i % 2 === 0 ? sL + rand() * (sR - sL) : rand();
      x = ux * 2 - 1;
      if (ux < sL) rgb = PARTICLE_RGB.left;
      else if (ux < sR) rgb = PARTICLE_RGB.center;
      else rgb = PARTICLE_RGB.right;
      s = rand() * 8 + 4;
      if (ux >= sL && ux < sR) s *= 1.4; // bigger/brighter center
    }

    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    col[i * 3] = rgb[0];
    col[i * 3 + 1] = rgb[1];
    col[i * 3 + 2] = rgb[2];
    vel[i * 2] = (rand() - 0.5) * 0.012;
    vel[i * 2 + 1] = rand() * 0.03 + 0.012; // drift up
    size[i] = s;
    seed[i] = rand();
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("aVel", new THREE.BufferAttribute(vel, 2));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  return geo;
}

// Energy quad + particles, animated in one R3F scene.
function FieldScene({
  quality,
  reduced,
  surge,
  active,
}: {
  quality: Quality;
  reduced: boolean;
  surge: number;
  active: boolean;
}) {
  const octaves = quality === "low" ? 3 : 5;
  const count = reduced ? 0 : quality === "low" ? 55 : 170;

  const energyRef = useRef<THREE.ShaderMaterial>(null);
  const partRef = useRef<THREE.ShaderMaterial>(null);
  const surgeVal = useRef(0);
  const lastSurge = useRef(surge);
  const chargeT = useRef(0); // seconds since the section came into view
  const wasActive = useRef(false);

  const planeGeo = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
  const particleGeo = useMemo(() => buildParticles(count), [count]);

  const energyUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColL: { value: COL_L },
      uColC: { value: COL_C },
      uColCHi: { value: COL_C_HI },
      uColR: { value: COL_R },
      uSeamLTop: { value: SEAMS[0].top },
      uSeamLBot: { value: SEAMS[0].bot },
      uSeamRTop: { value: SEAMS[1].top },
      uSeamRBot: { value: SEAMS[1].bot },
      uOctaves: { value: octaves },
      uReduced: { value: reduced ? 1 : 0 },
      uSurge: { value: 0 },
      uCharge: { value: reduced ? 1 : 0 }, // reduced motion: start fully charged
    }),
    [octaves, reduced]
  );

  const particleUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uPix: { value: 1.5 } }),
    []
  );

  useFrame((_, delta) => {
    if (reduced) return;
    const d = Math.min(delta, 0.05);
    // Trigger a surge when the swap counter changes, then decay it (~0.55s).
    // A swap also restarts the charge-up ramp (matches the DOM zoom/saturate).
    if (surge !== lastSurge.current) {
      surgeVal.current = 1;
      lastSurge.current = surge;
      chargeT.current = 0;
    }
    if (surgeVal.current > 0) surgeVal.current = Math.max(0, surgeVal.current - d / 0.55);
    // Charge-up: restart the ~1.8s power-up ramp each time the section enters view.
    if (active && !wasActive.current) chargeT.current = 0;
    wasActive.current = active;
    chargeT.current += d;
    const ct = Math.min(chargeT.current / 1.8, 1);
    const charge = 1 - Math.pow(1 - ct, 3); // ease-out
    const e = energyRef.current;
    if (e) {
      e.uniforms.uTime.value += d;
      e.uniforms.uSurge.value = surgeVal.current;
      e.uniforms.uCharge.value = charge;
    }
    const pm = partRef.current;
    if (pm) pm.uniforms.uTime.value += d;
  });

  return (
    <>
      <mesh frustumCulled={false} geometry={planeGeo}>
        <shaderMaterial
          ref={energyRef}
          vertexShader={ENERGY_VERT}
          fragmentShader={ENERGY_FRAG}
          uniforms={energyUniforms}
          transparent
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
      {particleGeo && (
        <points frustumCulled={false} geometry={particleGeo}>
          <shaderMaterial
            ref={partRef}
            vertexShader={PARTICLE_VERT}
            fragmentShader={PARTICLE_FRAG}
            uniforms={particleUniforms}
            transparent
            depthTest={false}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </>
  );
}

// Low tier renders on demand at ~30fps: an interval requests each frame
// instead of the default 60fps loop.
function Throttle30({ active }: { active: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => invalidate(), 33);
    return () => clearInterval(t);
  }, [active, invalidate]);
  return null;
}

function checkWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function DomainField({
  active,
  quality,
  reduced,
  surge,
}: {
  active: boolean;
  quality: Quality;
  reduced: boolean;
  surge: number;
}) {
  const [supported] = useState(checkWebGL);
  const [lost, setLost] = useState(false);
  // Graceful fallback (unsupported or context lost): render nothing — the
  // graded Stage-1 panels remain, so the band is never blank/broken.
  if (!supported || lost) return null;

  const low = quality === "low";

  return (
    <Canvas
      className="twd-field"
      // Off-screen: paused. Reduced motion: one calm static frame.
      // Low tier: demand-driven ~30fps (see Throttle30). High: 60fps loop.
      frameloop={reduced || low ? "demand" : active ? "always" : "never"}
      dpr={low ? 0.75 : [1, 1.5]}
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 5] }}
      onCreated={({ gl }) => {
        gl.setClearAlpha(0);
        gl.domElement.addEventListener(
          "webglcontextlost",
          (e) => {
            e.preventDefault();
            setLost(true);
          },
          { once: true }
        );
      }}
    >
      {low && <Throttle30 active={active && !reduced} />}
      <FieldScene quality={quality} reduced={reduced} surge={surge} active={active} />
    </Canvas>
  );
}
