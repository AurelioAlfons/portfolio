"use client";

// the intro card => my name, a short pitch, two buttons, socials
import { useRef } from "react";
import { motion } from "motion/react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { setFluidTheme } from "../lib/fluidTheme";
import { useReducedMotion } from "../lib/useReducedMotion";
import { useLineWipeReveal } from "../lib/useLineWipeReveal";

// parent waits a beat, then the kids fade in one after another
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} as const;

export default function IntroSection() {
  const nameRef = useRef<HTMLHeadingElement | null>(null);
  const pitchRef = useRef<HTMLParagraphElement | null>(null);
  const reduced = useReducedMotion();
  // wipes in from below, once, on load => not a global `p` selector, so
  // MusicPlayer's "Now Playing" label never gets caught in this
  useLineWipeReveal(nameRef, reduced, "100%");
  useLineWipeReveal(pitchRef, reduced, "100%");

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      // scrolling back home => flip the fluid bg back to the home colors
      onViewportEnter={() => setFluidTheme("home")}
      viewport={{ once: false, amount: 0.6 }}
      className="flex h-full flex-col justify-center rounded-3xl border border-white/10 bg-black/55 p-6 text-left shadow-2xl backdrop-blur-md sm:p-8 md:p-12"
    >

      <h1
        ref={nameRef}
        className="text-4xl font-bold text-plate sm:text-5xl md:text-6xl"
      >
        Aurelio Hevi Alfons
      </h1>

      <p
        ref={pitchRef}
        className="mt-6 max-w-xl text-lg leading-8 text-muted"
      >
        Emerging software developer who enjoys building cool projects and exploring AI, LLMs, and automation. Always learning, experimenting.
      </p>

    <motion.div variants={itemVariants} className="mt-8 flex flex-wrap gap-3 sm:gap-4">
      <motion.a
        href="#projects"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className="pointer-events-auto whitespace-nowrap rounded-full bg-white px-4 py-2 font-medium text-black hover:bg-gray-200 sm:px-6 sm:py-3"
      >
        View Projects
      </motion.a>

      <motion.a
        href="#contact"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className="pointer-events-auto whitespace-nowrap rounded-full border border-white/20 px-4 py-2 font-medium text-plate hover:bg-white/10 sm:px-6 sm:py-3"
      >
        Contact Me
      </motion.a>
    </motion.div>

    <motion.div
      variants={itemVariants}
      className="pointer-events-auto mt-8 flex gap-6 text-5xl text-muted"
    >
      <a
        href="https://github.com/AurelioAlfons"
        target="_blank"
        rel="noopener noreferrer"
        className="transition duration-300 hover:scale-125 hover:text-accent-hover"
      >
        <FaGithub />
      </a>

      <a
        href="https://www.linkedin.com/in/aurelio-alfons/"
        target="_blank"
        rel="noopener noreferrer"
        className="transition duration-300 hover:scale-125 hover:text-accent-hover"
      >
        <FaLinkedin />
      </a>

      <a
        href="mailto:yuroalfons0407@gmail.com"
        className="transition duration-300 hover:scale-125 hover:text-accent-hover"      >
        <FaEnvelope />
      </a>
    </motion.div>


    </motion.div>
  );
}
