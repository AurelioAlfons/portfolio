"use client";

import Carousel from "./Carousel";

const projects = [
  {
    id: 1,
    title: "PokeSim",
    description: "Gen 4 Pokémon battle simulator",
    website: "https://example.com",
    linkedin: "#",
  },
  {
    id: 2,
    title: "Traffic System",
    description: "Smart traffic heatmap system",
    website: "https://example.com",
    linkedin: "#",
  },
  {
    id: 3,
    title: "Terna",
    description: "Internship platform UI",
    website: "https://example.com",
    linkedin: "#",
  },
];

export default function ProjectSection() {
  return (
    <section className="relative z-20000 pt-35 pb-20 text-white">
      <div className="mx-auto max-w-[1600px]">
        <h2 className="mb-10 text-center text-4xl font-bold">
          Project Showcase
        </h2>

        <Carousel
          items={projects}
          baseWidth={1000}
          autoplay={true}
          autoplayDelay={3000}
          pauseOnHover={true}
          loop={true}
        />
      </div>
    </section>
  );
}