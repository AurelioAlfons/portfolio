"use client";

import {
  SiMysql,
  SiReact,
  SiTypescript,
  SiNextdotjs,
  SiTailwindcss,
  SiPython,
  SiJavascript,
  SiHtml5,
  SiCss,
} from "react-icons/si";

const techs = [
  { name: "MySQL", icon: SiMysql, color: "text-cyan-500" },
  { name: "React", icon: SiReact, color: "text-cyan-400" },
  { name: "TypeScript", icon: SiTypescript, color: "text-blue-500" },
  { name: "Next.js", icon: SiNextdotjs, color: "text-white" },
  { name: "TailwindCSS", icon: SiTailwindcss, color: "text-sky-400" },
  { name: "Python", icon: SiPython, color: "text-yellow-400" },
  { name: "JavaScript", icon: SiJavascript, color: "text-yellow-300" },
  { name: "HTML", icon: SiHtml5, color: "text-orange-500" },
  { name: "CSS", icon: SiCss, color: "text-blue-500" },
];

export default function TechMarquee() {
  const repeatedTechs = [...techs, ...techs];

  return (
    <section className="pointer-events-auto relative w-full py-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-black/20 backdrop-blur-sm">

        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-72 bg-gradient-to-r from-black via-black/80 to-transparent" />

        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-72 bg-gradient-to-l from-black via-black/80 to-transparent" />

        <div className="flex w-max animate-smooth-marquee will-change-transform">
          {repeatedTechs.map((tech, index) => {
            const Icon = tech.icon;

            return (
              <div
                key={`${tech.name}-${index}`}
                className="group flex items-center gap-3 pr-20 text-4xl font-semibold"
              >
                <Icon
                  className={`text-3xl ${tech.color} opacity-70 transition-all duration-500 ease-out group-hover:scale-110 group-hover:opacity-100`}
                />
                <span className="whitespace-nowrap text-white/50 transition-all duration-500 ease-out group-hover:text-white/80">
                  {tech.name}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}