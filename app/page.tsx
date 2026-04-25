"use client";

import { useEffect, useRef, useState } from "react";
import emailjs from "emailjs-com";

export default function Home() {
  const songs = [
    { name: "IDC", title: "IDC - Jordan Ward & Joony", path: "/song/IDC.mp3" },
    { name: "Skyline", title: "Skyline - Khalid", path: "/song/Skyline.mp3" },
    {
      name: "Sometimes",
      title: "Sometimes - Maximus Love",
      path: "/song/Sometimes.mp3",
    },
  ];

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(songs[0]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [form, setForm] = useState({
    email: "",
    subject: "",
    message: "",
  });

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

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    emailjs
      .send(
        "YOUR_SERVICE_ID",
        "YOUR_TEMPLATE_ID",
        {
          email: form.email,
          subject: form.subject,
          message: form.message,
        },
        "YOUR_PUBLIC_KEY"
      )
      .then(() => {
        alert("Message sent!");
        setForm({ email: "", subject: "", message: "" });
      })
      .catch(() => {
        alert("Failed to send message.");
      });
  };

  return (
    <main className="scroll-smooth text-white">
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

      <nav className="pointer-events-auto fixed left-0 top-0 z-50 flex w-full justify-center px-8 py-6">
        <div className="flex gap-8 rounded-full border border-white/10 bg-black/50 px-8 py-3 backdrop-blur-md">
          <a href="#home" className="hover:text-gray-300">
            Home
          </a>
          <a href="#projects" className="hover:text-gray-300">
            Projects
          </a>
          <a href="#contact" className="hover:text-gray-300">
            Contact
          </a>
        </div>
      </nav>

      <section
        id="home"
        className="flex min-h-screen items-center justify-center px-8 pt-24"
      >
        <div className="grid w-full max-w-7xl grid-cols-1 items-stretch gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <div className="flex h-full flex-col justify-center rounded-3xl border border-white/10 bg-black/55 p-12 text-left shadow-2xl backdrop-blur-md">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-gray-400">
              Portfolio
            </p>

            <h1 className="text-5xl font-bold text-white md:text-6xl">
              Aurelio Hevi Alfons
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-300">
              I’m a junior software developer. I like to build cool projects and
              design websites. I also enjoy music. Feel free to send me a
              message, keen to collaborate or just chat!
            </p>

            <div className="mt-8 flex gap-4">
              <a
                href="#projects"
                className="pointer-events-auto rounded-full bg-white px-6 py-3 font-medium text-black hover:bg-gray-200"
              >
                View Projects
              </a>

              <a
                href="#contact"
                className="pointer-events-auto rounded-full border border-white/20 px-6 py-3 font-medium text-white hover:bg-white/10"
              >
                Contact Me
              </a>
            </div>
          </div>

          <div className="flex h-full flex-col justify-center rounded-3xl border border-white/10 bg-black/55 p-10 shadow-2xl backdrop-blur-md">
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
              <div>
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
        </div>
      </section>

      <section
        id="projects"
        className="flex min-h-screen items-center justify-center px-8 text-center"
      >
        <div className="rounded-3xl border border-white/10 bg-black/50 p-10 backdrop-blur-md">
          <h2 className="text-4xl font-bold text-white">Projects</h2>
          <p className="mt-4 text-gray-400">
            Cat Mail • PokeSim • Smart Foot Traffic • Terna
          </p>
        </div>
      </section>

<section id="contact" className="h-screen overflow-hidden px-8 py-20 text-white flex flex-col justify-between">  
  <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-[0.9fr_1.1fr]">
    {/* LEFT: contact form with glass box */}
    <div className="pointer-events-auto max-w-xl mt-20">
      <div className="rounded-3xl border border-white/10 bg-black/40 p-8 shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-lg">
        
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-purple-300">
          Let's talk
        </p>

        <h2 className="text-5xl font-bold">Contact</h2>

        <p className="mt-6 text-gray-300">
          Have a question or a project in mind? Feel free to reach out.
        </p>

        <form onSubmit={handleFormSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleFormChange}
            className="mt-8 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-gray-400 focus:border-white/40"
            required
          />

          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={form.subject}
            onChange={handleFormChange}
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-gray-400 focus:border-white/40"
            required
          />

          <textarea
            name="message"
            placeholder="Message"
            value={form.message}
            onChange={handleFormChange}
            rows={6}
            className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-gray-400 focus:border-white/40"
            required
          />

          <button
            type="submit"
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/10 px-6 py-3 text-gray-200 hover:bg-white/20 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>

    {/* RIGHT: empty space for balance */}
    <div className="hidden md:block" />
  </div>

  {/* BOTTOM */}
  <footer className="mx-auto mt-24 max-w-7xl border-t border-white/10 pt-6">
    <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
      
      {/* socials */}
      <div className="flex gap-6 text-sm text-gray-300">
        <a href="https://github.com/AurelioAlfons" target="_blank" className="hover:text-purple-300 transition">
          GitHub
        </a>
        <a href="#" target="_blank" className="hover:text-purple-300 transition">
          LinkedIn
        </a>
        <a href="mailto:YOUR_EMAIL@gmail.com" className="hover:text-purple-300 transition">
          Gmail
        </a>
      </div>

      <p className="text-sm text-gray-400">
        Built with React, Next.js, TailwindCSS
      </p>
    </div>

    <p className="mt-7 text-center text-sm text-gray-500">
      Copyright © 2026 Aurelio Hevi Alfons. All rights reserved.
    </p>
  </footer>
</section>
    </main>
  );
}