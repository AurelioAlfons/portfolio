"use client";

// the footer => my socials + a little copyright line
import { motion } from "motion/react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto mt-8 w-full max-w-7xl border-t border-white/10 pt-6"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">

        {/* Icons */}
        <div className="flex gap-6 text-4xl text-muted">
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
            className="transition duration-300 hover:scale-125 hover:text-accent-hover"
          >
            <FaEnvelope />
          </a>
        </div>

        {/* Tech text */}
        <p className="text-sm text-muted">
          Built with React, Next.js, TailwindCSS
        </p>
      </div>

      {/* Copyright */}
      <p className="mt-8 text-center text-sm text-muted">
        Copyright © 2026 Aurelio Hevi Alfons. All rights reserved.
      </p>
    </motion.footer>
  );
}