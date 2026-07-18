"use client";

// the projects section => heading up top, the three-way domain carousel below
import { useRef } from "react";
import { motion } from "motion/react";
import ThreeWayDomain, { type Project } from "./ThreeWayDomain";
import { setFluidTheme } from "../lib/fluidTheme";
import { useReducedMotion } from "../lib/useReducedMotion";
import { useLineWipeReveal } from "../lib/useLineWipeReveal";

// the projects list => add a new one here and the carousel just picks it up
const projects: Project[] = [
  {
    id: 1,
    title: "PokeSim",
    description: "Gen 4 Pokémon battle simulator built with React + FastAPI.",
    link: "https://poke-sim-two.vercel.app",
    image: "/images/PokeSim.png",
    tech: ["react", "fastapi", "python"],
  },
  {
    id: 2,
    title: "Smart Foot Traffic - Capstone Project",
    description: "Interactive heatmap system with filtering, built using Python + Flutter UI.",
    link: "https://www.linkedin.com/posts/aurelio-alfons_uidesign-frontendmagic-flutterdev-ugcPost-7351905548038033408-BzZO",
    image: "/images/SFT.jpg",
    tech: ["python", "flutter"],
  },
  {
    id: 3,
    title: "Cat Mail",
    description: "A small fun Valentine-themed web project.",
    link: "https://cat-mail-git-main-aurelio-alfons-projects.vercel.app",
    image: "/images/Valentine.png",
    tech: ["react", "typescript"],
  },
  {
    id: 4,
    title: "WatchWise AI",
    description:
      "AI movie recommendations powered by Gemini + TMDB.",
    link: "https://watchwise-ai-puce.vercel.app",
    image: "/images/WatchWise.jpeg",
    tech: ["react", "typescript", "tailwind", "docker", "gemini", "tmdb"],
  },
];

export default function ProjectSection() {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const reduced = useReducedMotion();
  useLineWipeReveal(headingRef, reduced);

  return (
    <motion.section
      id="projects"
      // scrolled here => switch the fluid bg to the cool projects colors
      onViewportEnter={() => setFluidTheme("projects")}
      viewport={{ once: false, amount: 0.35 }}
      // z-20000 was dead weight => .twd-band already isolates its own stacking
      // context, and nothing else on the page overlaps this section anyway
      className="twd-section text-plate"
    >
      <div className="twd-heading">
        <h2 ref={headingRef} className="text-4xl font-bold md:text-5xl">
          Project Showcase
        </h2>
      </div>

      <ThreeWayDomain projects={projects} />
    </motion.section>
  );
}
