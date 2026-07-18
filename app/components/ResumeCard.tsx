"use client";

// the resume card => a little pdf card that tilts in 3d, plus view/download buttons
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { FaFileAlt, FaDownload, FaExternalLinkAlt } from "react-icons/fa";

export default function ResumeCard() {
  const cardRef = useRef<HTMLDivElement | null>(null);

  // all the 3d tilt math lives here => x/y is where the mouse is on the card (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // mouse position becomes rotation, springs make it feel bouncy instead of stiff
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [14, -14]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-14, 14]), {
    stiffness: 200,
    damping: 20,
  });
  // the accent glow follows the mouse too
  const glowX = useTransform(x, [-0.5, 0.5], [0, 100]);
  const glowY = useTransform(y, [-0.5, 0.5], [0, 100]);

  // grabs the mouse position => this is what tilts the card in 3d
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  // mouse gone => card settles back flat
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="pointer-events-auto flex h-full flex-col justify-center rounded-3xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur-md sm:p-8">
      <p className="font-mono text-sm uppercase tracking-[0.3em] text-muted">
        Resume
      </p>

      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: 800 }}
        className="mt-8 flex flex-1 items-center justify-center"
      >
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
            backgroundImage: useTransform(
              [glowX, glowY],
              // glow reads off the same accent token now, not a raw rgb copy of it
              ([gx, gy]) =>
                `radial-gradient(circle at ${gx}% ${gy}%, color-mix(in srgb, var(--color-accent) 35%, transparent), transparent 60%)`
            ),
          }}
          className="flex aspect-3/4 w-44 flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/5 text-plate shadow-xl"
        >
          <FaFileAlt className="text-5xl text-accent" />
          <span className="px-4 text-center font-mono text-sm font-medium">
            Aurelio_Alfons_CV.pdf
          </span>
        </motion.div>
      </div>

      <p className="mt-8 text-sm text-muted">
        Grab a copy of my resume for the full rundown of my experience and
        skills.
      </p>

      <div className="mt-4 flex gap-4">
        <motion.a
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="pointer-events-auto flex flex-1 items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2 font-medium text-plate transition hover:bg-white/10 sm:px-6 sm:py-3"
        >
          <FaExternalLinkAlt /> View
        </motion.a>

        <motion.a
          href="/resume.pdf"
          download
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="pointer-events-auto flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 py-2 font-medium text-black transition hover:bg-gray-200 sm:px-6 sm:py-3"
        >
          <FaDownload /> Download
        </motion.a>
      </div>
    </div>
  );
}
