import type { IconType } from "react-icons";
import {
  SiReact,
  SiTypescript,
  SiPython,
  SiFastapi,
  SiFlutter,
  SiTailwindcss,
  SiDocker,
  SiNextdotjs,
  SiGooglegemini,
  SiThemoviedatabase,
} from "react-icons/si";

export type TechKey =
  | "react"
  | "typescript"
  | "python"
  | "fastapi"
  | "flutter"
  | "tailwind"
  | "docker"
  | "nextjs"
  | "gemini"
  | "tmdb";

// Tech key -> label, icon, brand color.
// Icon is optional: a tech with no clean brand icon renders as a text-only chip.
export const TECH: Record<TechKey, { label: string; Icon?: IconType; color: string }> = {
  react: { label: "React", Icon: SiReact, color: "#61dafb" },
  typescript: { label: "TypeScript", Icon: SiTypescript, color: "#3178c6" },
  python: { label: "Python", Icon: SiPython, color: "#ffd343" },
  fastapi: { label: "FastAPI", Icon: SiFastapi, color: "#05998b" },
  flutter: { label: "Flutter", Icon: SiFlutter, color: "#47c5fb" },
  tailwind: { label: "Tailwind CSS", Icon: SiTailwindcss, color: "#38bdf8" },
  docker: { label: "Docker", Icon: SiDocker, color: "#2496ed" },
  nextjs: { label: "Next.js", Icon: SiNextdotjs, color: "#ffffff" },
  gemini: { label: "Gemini", Icon: SiGooglegemini, color: "#8e7bf6" },
  tmdb: { label: "TMDB", Icon: SiThemoviedatabase, color: "#01b4e4" },
};
