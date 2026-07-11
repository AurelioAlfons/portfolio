"use client";

// the intro card => my name, a short pitch, two buttons, socials
import { motion } from "motion/react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { setFluidTheme } from "../lib/fluidTheme";

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

      <motion.h1
        variants={itemVariants}
        className="text-4xl font-bold text-white sm:text-5xl md:text-6xl"
      >
        Aurelio Hevi Alfons
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="mt-6 max-w-xl text-lg leading-8 text-gray-300"
      >
        Emerging software developer who enjoys building cool projects and exploring AI, LLMs, and automation. Always learning, experimenting.
      </motion.p>

    <motion.div variants={itemVariants} className="mt-8 flex flex-wrap gap-3 sm:gap-4">
      <motion.a
        href="#projects"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className="pointer-events-auto whitespace-nowrap rounded-full bg-white px-4 py-2.5 font-medium text-black hover:bg-gray-200 sm:px-6 sm:py-3"
      >
        View Projects
      </motion.a>

      <motion.a
        href="#contact"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className="pointer-events-auto whitespace-nowrap rounded-full border border-white/20 px-4 py-2.5 font-medium text-white hover:bg-white/10 sm:px-6 sm:py-3"
      >
        Contact Me
      </motion.a>
    </motion.div>

    <motion.div
      variants={itemVariants}
      className="pointer-events-auto mt-8 flex gap-6 text-5xl text-gray-300"
    >
      <a
        href="https://github.com/AurelioAlfons"
        target="_blank"
        rel="noopener noreferrer"
        className="transition duration-300 hover:scale-125 hover:text-[#7f31fd]"
      >
        <FaGithub />
      </a>

      <a
        href="https://www.linkedin.com/in/aurelio-alfons/"
        target="_blank"
        rel="noopener noreferrer"
        className="transition duration-300 hover:scale-125 hover:text-[#7f31fd]"
      >
        <FaLinkedin />
      </a>

      <a
        href="mailto:yuroalfons0407@gmail.com"
        className="transition duration-300 hover:scale-125 hover:text-[#7f31fd]"      >
        <FaEnvelope />
      </a>
    </motion.div>


    </motion.div>
  );
}
