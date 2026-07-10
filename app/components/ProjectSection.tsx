"use client";

import { motion } from "motion/react";
import ThreeWayDomain, { type Project } from "./ThreeWayDomain";
import { setFluidTheme } from "../lib/fluidTheme";

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
  return (
    <motion.section
      id="projects"
      onViewportEnter={() => setFluidTheme("projects")}
      viewport={{ once: false, amount: 0.35 }}
      className="twd-section relative z-20000 text-white"
    >
      <div className="twd-heading">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl font-bold md:text-5xl"
        >
          Project Showcase
        </motion.h2>
      </div>

      <ThreeWayDomain projects={projects} />
    </motion.section>
  );
}
