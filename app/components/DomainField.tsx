"use client";

// the webgl energy canvas => paints the three flowing color fields + the
// floating particles that sit over the carousel panels
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SEAMS, type Seam } from "./domainShards";
import {
  ENERGY_VERT,
  ENERGY_FRAG,
  PARTICLE_VERT,
  PARTICLE_FRAG,
} from "./domainField.glsl";

type Quality = "high" | "low";

// each slot owns a color => left is always blue, center magenta, right green
const COL_L = new THREE.Color(0.2, 0.65, 1.0);
const COL_C = new THREE.Color(1.0, 0.25, 0.65);
const COL_C_HI = new THREE.Color(1.0, 0.95, 0.98);
const COL_R = new THREE.Color(0.45, 0.95, 0.35);

const PARTICLE_RGB = {
  left: [0.35, 0.75, 1.0],
  center: [1.0, 0.4, 0.72],
  right: [0.55, 1.0, 0.45],
};

// uy: 0 = bottom of the band (clip space). The seam's "top" x belongs at the
// top of the band (CSS y-down), so flip when interpolating.
function seamAt(uy: number, i: number, seams: Seam[]) {
  return seams[i].top + (seams[i].bot - seams[i].top) * (1 - uy);
}

// seeded random => same "random" particles every render, no flicker on remount
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// builds all the particles once => position, color, drift speed, size, twinkle seed
function buildParticles(count: number, seams: Seam[]): THREE.BufferGeometry | null {
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
    const sL = seamAt(uy, 0, seams);
    const sR = seamAt(uy, 1, seams);
    let x: number;
    let rgb: number[];
    let s: number;

    if (i % 3 === 0) {
      // spark: flank a seam, outside the ink stroke — colored, never white
      const isLeftSeam = i % 2 === 0;
      const seamX = isLeftSeam ? sL : sR;
      const side = rand() < 0.5 ? -1 : 1;
      x = (seamX + side * (0.05 + rand() * 0.02)) * 2 - 1;
      rgb = isLeftSeam
        ? side < 0
          ? PARTICLE_RGB.left
          : PARTICLE_RGB.center
        : side < 0
        ? PARTICLE_RGB.center
        : PARTICLE_RGB.right;
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

// the actual scene => one big quad running the energy shader + the particle cloud
function FieldScene({
  quality,
  reduced,
  surge,
  active,
  seams,
}: {
  quality: Quality;
  reduced: boolean;
  surge: number;
  active: boolean;
  seams: Seam[];
}) {
  // phones get less noise detail and fewer particles => keeps the fps up
  const octaves = quality === "low" ? 3 : 5;
  const count = reduced ? 0 : quality === "low" ? 55 : 170;

  const energyRef = useRef<THREE.ShaderMaterial>(null);
  const partRef = useRef<THREE.ShaderMaterial>(null);
  const surgeVal = useRef(0);
  const lastSurge = useRef(surge);
  const chargeT = useRef(0); // seconds since the section came into view
  const wasActive = useRef(false);

  const planeGeo = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
  const particleGeo = useMemo(() => buildParticles(count, seams), [count, seams]);

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

  // seams moved (window resized) => tell the shader so its gaps stay under the ink
  useEffect(() => {
    const e = energyRef.current;
    if (!e) return;
    e.uniforms.uSeamLTop.value = seams[0].top;
    e.uniforms.uSeamLBot.value = seams[0].bot;
    e.uniforms.uSeamRTop.value = seams[1].top;
    e.uniforms.uSeamRBot.value = seams[1].bot;
  }, [seams]);

  const particleUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uPix: { value: 1.5 } }),
    []
  );

  // runs every frame => ticks the clock and feeds the shader its numbers
  useFrame((_, delta) => {
    if (reduced) return;
    const d = Math.min(delta, 0.05);
    // swap happened => kick the surge to full, then let it fade out (~half a sec)
    if (surge !== lastSurge.current) {
      surgeVal.current = 1;
      lastSurge.current = surge;
      chargeT.current = 0;
    }
    if (surgeVal.current > 0) surgeVal.current = Math.max(0, surgeVal.current - d / 0.55);
    // the charge-up => energy goes dim -> full over 5.6s, same timing as the image zoom
    if (active && !wasActive.current) chargeT.current = 0;
    wasActive.current = active;
    chargeT.current += d;
    const ct = Math.min(chargeT.current / 5.6, 1);
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

// phone mode => instead of the full 60fps loop we ask for a frame every 33ms (~30fps)
function Throttle30({ active }: { active: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => invalidate(), 33);
    return () => clearInterval(t);
  }, [active, invalidate]);
  return null;
}

// can this browser even do webgl? => if not we just skip the whole canvas
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
  seams = SEAMS,
}: {
  active: boolean;
  quality: Quality;
  reduced: boolean;
  surge: number;
  seams?: Seam[];
}) {
  const [supported] = useState(checkWebGL);
  const [lost, setLost] = useState(false);
  // no webgl or the gpu bailed => just render nothing, the tinted panels
  // underneath still look fine so the section never breaks
  if (!supported || lost) return null;

  const low = quality === "low";

  return (
    <Canvas
      className="twd-field"
      // scrolled away => stop rendering. reduced motion => one calm frame.
      // phones => ~30fps via Throttle30. desktop => full 60fps loop
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
      <FieldScene quality={quality} reduced={reduced} surge={surge} active={active} seams={seams} />
    </Canvas>
  );
}
