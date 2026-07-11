// the whole page => just stacks the sections top to bottom
import Navbar from "./components/Navbar";
import IntroSection from "./components/IntroSection";
import MusicPlayer from "./components/MusicPlayer";
import ProjectSection from "./components/ProjectSection";
import ContactSection from "./components/ContactSection";
import TechMarquee from "./components/FastMarquee";

export default function Home() {
  return (
    <main className="scroll-smooth text-white">
      <Navbar />

      {/* home => intro on the left, music player on the right */}
      <section
        id="home"
        className="flex min-h-[80vh] items-center justify-center px-4 pt-24 sm:px-6 md:px-8 md:pt-28"
      >
        <div className="grid w-full max-w-7xl grid-cols-1 items-stretch gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <IntroSection />
          <MusicPlayer />
        </div>
      </section>

      {/* the scrolling strip of tech logos */}
      <TechMarquee />

      <section id="projects">
        <ProjectSection />
      </section>

      <section id="contact">
        <ContactSection />
      </section>
    </main>
  );
}