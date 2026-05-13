"use client";

import Carousel from "./Carousel";

const projects = [
  {
    id: 1,
    title: "PokeSim",
    description: "Gen 4 Pokémon battle simulator built with React + FastAPI.",
    link: "https://poke-aznezhjd0-aurelio-alfons-projects.vercel.app",
    image: "/images/PokeSim.png",
  },
  {
    id: 2,
    title: "Traffic System",
    description: "Smart traffic heatmap system using Python, MySQL, and Folium.",
    link: "#",
    image: "/projects/traffic-preview.png",
  },
  {
    id: 3,
    title: "Terna",
    description: "Internship platform UI concept.",
    link: "#",
    image: "/projects/terna-preview.png",
  },
  {
    id: 4,
    title: "Cat Mail",
    description: "A small fun Valentine-themed web project.",
    link: "https://cat-mail-git-main-aurelio-alfons-projects.vercel.app",
    image: "/images/Valentine.png",
  },
];

export default function ProjectSection() {
  return (
    <section
      id="projects"
      className="relative z-[20000] pt-27 pb-20 text-white"
    >
      <div className="mx-auto max-w-[1600px] px-10">
        <h2 className="mb-10 text-center text-4xl font-bold md:text-5xl">
          Project Showcase
        </h2>

        <Carousel
          items={projects}
          autoplay={true}
          autoplayDelay={3000}
          pauseOnHover={true}
        />
      </div>
    </section>
  );
}