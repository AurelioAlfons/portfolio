"use client";

import { motion } from "motion/react";

export default function MusicPlayer() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
      className="pointer-events-auto flex h-full flex-col justify-center rounded-3xl border border-white/10 bg-black/55 p-4 shadow-2xl backdrop-blur-md"
    >

      <p className="text-sm uppercase tracking-[0.3em] text-gray-400 px-4 pt-4">
        Now Playing
      </p>

      <div className="mt-4 h-125 w-full overflow-hidden rounded-2xl">
        <iframe
          src="https://open.spotify.com/embed/playlist/0B56I3kjyQNylz8s6bjFUy?utm_source=generator&theme=0"
          width="100%"
          height="100%"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="pointer-events-auto rounded-2xl"
        />
      </div>

    </motion.div>
  );
}