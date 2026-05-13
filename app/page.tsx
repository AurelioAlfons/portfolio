import Navbar from "./components/Navbar";
import IntroSection from "./components/IntroSection";
import MusicPlayer from "./components/MusicPlayer";
import ProjectSection from "./components/ProjectSection";
import ContactSection from "./components/ContactSection";

export default function Home() {
  return (
    <main className="scroll-smooth text-white">
      <Navbar />

      <section
        id="home"
        className="flex min-h-screen items-center justify-center px-8 pt-24"
      >
        <div className="grid w-full max-w-7xl grid-cols-1 items-stretch gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <IntroSection />
          <MusicPlayer />
        </div>
      </section>

      <ProjectSection />
      <ContactSection />
    </main>
  );
}