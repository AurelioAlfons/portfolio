"use client";

export default function MusicPlayer() {
  return (
    <div className="flex h-full flex-col justify-center rounded-3xl border border-white/10 bg-black/55 p-4 shadow-2xl backdrop-blur-md">
      
      <p className="text-sm uppercase tracking-[0.3em] text-gray-400 px-4 pt-4">
        Now Playing
      </p>

      <div className="mt-4 h-[500px] w-full overflow-hidden rounded-2xl">
        <iframe
          src="https://open.spotify.com/embed/playlist/0B56I3kjyQNylz8s6bjFUy?utm_source=generator&theme=0"
          width="100%"
          height="100%"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-2xl"
        />
      </div>

    </div>
  );
}