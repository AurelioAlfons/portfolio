"use client";

// the tech marquee => logos scrolling by so you know what i work with
import { motion } from "motion/react";
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
  SiFlutter,
  SiPostgresql,
  SiVercel,
  SiSalesforce,
  SiMongodb,
  SiOpenjdk,
  SiR,
} from "react-icons/si";

// default is monochrome now, brand color only shows up on hover => reads as
// texture, not a confetti wall of 16 clashing logo colors
const techs = [
  { name: "Flutter", icon: SiFlutter, hoverColor: "group-hover:text-sky-400" },
  { name: "React", icon: SiReact, hoverColor: "group-hover:text-cyan-400" },
  { name: "Next.js", icon: SiNextdotjs, hoverColor: "group-hover:text-white" },
  { name: "TypeScript", icon: SiTypescript, hoverColor: "group-hover:text-blue-500" },
  { name: "JavaScript", icon: SiJavascript, hoverColor: "group-hover:text-yellow-300" },
  { name: "Python", icon: SiPython, hoverColor: "group-hover:text-yellow-400" },
  { name: "Java", icon: SiOpenjdk, hoverColor: "group-hover:text-red-500" },
  { name: "R", icon: SiR, hoverColor: "group-hover:text-blue-400" },
  { name: "HTML", icon: SiHtml5, hoverColor: "group-hover:text-orange-500" },
  { name: "CSS", icon: SiCss, hoverColor: "group-hover:text-blue-500" },
  { name: "TailwindCSS", icon: SiTailwindcss, hoverColor: "group-hover:text-sky-400" },
  { name: "MySQL", icon: SiMysql, hoverColor: "group-hover:text-cyan-500" },
  { name: "PostgreSQL", icon: SiPostgresql, hoverColor: "group-hover:text-blue-400" },
  { name: "MongoDB", icon: SiMongodb, hoverColor: "group-hover:text-green-500" },
  { name: "Vercel", icon: SiVercel, hoverColor: "group-hover:text-white" },
  { name: "Salesforce", icon: SiSalesforce, hoverColor: "group-hover:text-sky-500" },
];

export default function TechMarquee() {
  // doubled list => when the first half scrolls out, the copy is right behind it, so it loops clean
  const repeatedTechs = [...techs, ...techs];

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="pointer-events-auto relative w-full py-8"
    >
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-black/20 backdrop-blur-sm">

        {/* dark fades on both ends so the logos melt in and out instead of getting cut off */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-linear-to-r from-black via-black/80 to-transparent sm:w-24 md:w-72" />

        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-linear-to-l from-black via-black/80 to-transparent sm:w-24 md:w-72" />

        <div className="flex w-max animate-smooth-marquee will-change-transform">
          {repeatedTechs.map((tech, index) => {
            const Icon = tech.icon;

            return (
              <div
                key={`${tech.name}-${index}`}
                className="group flex items-center gap-3 pr-24 text-3xl font-semibold"
              >
                <Icon
                  className={`text-3xl text-plate/40 opacity-70 transition-all duration-500 ease-out group-hover:scale-110 group-hover:opacity-100 ${tech.hoverColor}`}
                />
                <span className="font-mono whitespace-nowrap text-plate/50 transition-all duration-500 ease-out group-hover:text-plate/80">
                  {tech.name}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </motion.section>
  );
}