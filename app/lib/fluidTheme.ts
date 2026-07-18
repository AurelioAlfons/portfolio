// how we tell the fluid background to change color per section
export type FluidTheme = {
  backColor: { r: number; g: number; b: number };
  palette: { h: number; s: number; v: number }[] | null;
};

// one color recipe per section => bg color + what colors the splats can be
export const FLUID_THEMES = {
  // blue / navy / purple => a cooler, deeper splash for the hero
  home: {
    backColor: { r: 0, g: 0, b: 0 },
    palette: [
      { h: 0.62, s: 0.85, v: 1.0 }, // blue
      { h: 0.63, s: 0.65, v: 0.55 }, // navy
      { h: 0.78, s: 0.75, v: 0.9 }, // purple
    ],
  },
  // green / cyan / grey for the carousel => cooler than red/amber/green now
  projects: {
    backColor: { r: 0, g: 0, b: 0 },
    palette: [
      { h: 0.37, s: 0.75, v: 0.9 }, // green
      { h: 0.5, s: 0.85, v: 1.0 }, // cyan
      { h: 0.0, s: 0.0, v: 0.65 }, // grey
    ],
  },
  // red / orange / pink => keeps the hazard energy, drops the amber/green mix
  contact: {
    backColor: { r: 0, g: 0, b: 0 },
    palette: [
      { h: 0.0, s: 0.9, v: 0.95 }, // red
      { h: 0.08, s: 0.95, v: 1.0 }, // orange
      { h: 0.92, s: 0.6, v: 0.95 }, // pink
    ],
  },
} as const satisfies Record<string, FluidTheme>;

export type FluidThemeName = keyof typeof FLUID_THEMES;

// the fluid sim lives in an iframe, so we can't just call it => postMessage it
export function setFluidTheme(theme: FluidThemeName) {
  const iframe = document.querySelector<HTMLIFrameElement>(
    'iframe[src="/fluid/index.html"]'
  );

  iframe?.contentWindow?.postMessage(
    { type: "fluid-theme", ...FLUID_THEMES[theme] },
    window.location.origin
  );
}
