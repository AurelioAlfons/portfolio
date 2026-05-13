"use client";

import { useEffect, useRef, useState } from "react";

const songs = [
  { name: "IDC", title: "IDC - Jordan Ward & Joony", path: "/song/IDC.mp3" },
  { name: "Skyline", title: "Skyline - Khalid", path: "/song/Skyline.mp3" },
  {
    name: "Sometimes",
    title: "Sometimes - Maximus Love",
    path: "/song/Sometimes.mp3",
  },
];

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(songs[0]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const playOnLoad = async () => {
      try {
        if (!audioRef.current) return;
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    };

    playOnLoad();
  }, []);

  const formatTime = (time: number) => {
    if (!time) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const playSong = async () => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const toggleMusic = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      await playSong();
    }
  };

  const changeSong = async (song: (typeof songs)[number]) => {
    setCurrentSong(song);
    setIsPlaying(false);
    setCurrentTime(0);

    setTimeout(async () => {
      if (!audioRef.current) return;
      audioRef.current.currentTime = 0;
      await playSong();
    }, 100);
  };

  const nextSong = async () => {
    const currentIndex = songs.findIndex(
      (song) => song.path === currentSong.path
    );

    const nextIndex = (currentIndex + 1) % songs.length;
    await changeSong(songs[nextIndex]);
  };

  const previousSong = async () => {
    if (!audioRef.current) return;

    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const currentIndex = songs.findIndex(
      (song) => song.path === currentSong.path
    );

    const previousIndex = (currentIndex - 1 + songs.length) % songs.length;
    await changeSong(songs[previousIndex]);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;

    const newTime = Number(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="flex h-full flex-col justify-center rounded-3xl border border-white/10 bg-black/55 p-10 shadow-2xl backdrop-blur-md">
      <audio
        ref={audioRef}
        src={currentSong.path}
        loop
        autoPlay
        onLoadedMetadata={() => {
          if (!audioRef.current) return;
          setDuration(audioRef.current.duration);
        }}
        onTimeUpdate={() => {
          if (!audioRef.current) return;
          setCurrentTime(audioRef.current.currentTime);
        }}
      />

      <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
        Now Playing
      </p>

      <h2 className="mt-4 text-3xl font-bold">{currentSong.title}</h2>

      <div className="mt-10 flex justify-center">
        <div
          className={`relative flex h-56 w-56 items-center justify-center rounded-full bg-[radial-gradient(circle,_#1f1f1f_0%,_#111_45%,_#050505_100%)] shadow-2xl ${
            isPlaying ? "animate-spin" : ""
          }`}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-30" />

          <div className="absolute h-48 w-48 rounded-full border border-white/10" />
          <div className="absolute h-40 w-40 rounded-full border border-white/10" />
          <div className="absolute h-32 w-32 rounded-full border border-white/10" />
          <div className="absolute h-24 w-24 rounded-full border border-white/10" />

          <div className="absolute top-10 h-3 w-3 rounded-full bg-white/70" />

          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white">
            <div className="h-6 w-6 rounded-full bg-black" />
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="pointer-events-auto w-full"
        />

        <div className="mt-2 flex justify-between text-sm text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            onClick={previousSong}
            className="pointer-events-auto rounded-full border border-white/20 px-5 py-3 font-medium text-white hover:bg-white/10"
          >
            ⏮
          </button>

          <button
            onClick={toggleMusic}
            className="pointer-events-auto rounded-full bg-white px-6 py-3 font-medium text-black hover:bg-gray-200"
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>

          <button
            onClick={nextSong}
            className="pointer-events-auto rounded-full border border-white/20 px-5 py-3 font-medium text-white hover:bg-white/10"
          >
            ⏭
          </button>
        </div>
      </div>
    </div>
  );
}