// how we tell the fluid background to change color per section
export type FluidTheme = {
  backColor: { r: number; g: number; b: number };
  palette: { h: number; s: number; v: number }[] | null;
};

// one color recipe per section => bg color + what colors the splats can be
export const FLUID_THEMES = {
  home: {
    backColor: { r: 0, g: 0, b: 0 },
    palette: null,
  },
  projects: {
    backColor: { r: 0.02, g: 0.05, b: 0.16 },
    palette: [
      { h: 0.0, s: 1.0, v: 0.75 }, // red
      { h: 0.77, s: 0.8, v: 0.75 }, // purple
      { h: 0.0, s: 0.05, v: 0.95 }, // white
    ],
  },
  contact: {
    backColor: { r: 0.16, g: 0.02, b: 0.04 },
    palette: [
      { h: 0.14, s: 1.0, v: 0.85 }, // yellow
      { h: 0.5, s: 0.85, v: 0.8 }, // cyan
      { h: 0.92, s: 0.6, v: 0.9 }, // pink
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
