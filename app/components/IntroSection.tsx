import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

export default function IntroSection() {
  return (
    <div className="flex h-full flex-col justify-center rounded-3xl border border-white/10 bg-black/55 p-12 text-left shadow-2xl backdrop-blur-md">

      <h1 className="text-5xl font-bold text-white md:text-6xl">
        Aurelio Hevi Alfons
      </h1>

      <p className="mt-6 max-w-xl text-lg leading-8 text-gray-300">
        I’m a junior software developer. I like to build cool projects and
        design websites. I also enjoy music. Feel free to send me a message,
        keen to collaborate.
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

    <div className="pointer-events-auto mt-8 flex gap-6 text-5xl text-gray-300">
      <a
        href="https://github.com/AurelioAlfons"
        target="_blank"
        rel="noopener noreferrer"
        className="transition duration-300 hover:scale-125 hover:text-[#7f31fd]"
      >
        <FaGithub />
      </a>

      <a
        href="https://www.linkedin.com/in/aurelio-alfons/"
        target="_blank"
        rel="noopener noreferrer"
        className="transition duration-300 hover:scale-125 hover:text-[#7f31fd]"
      >
        <FaLinkedin />
      </a>

      <a
        href="mailto:yuroalfons0407@gmail.com"
        className="transition duration-300 hover:scale-125 hover:text-[#7f31fd]"      >
        <FaEnvelope />
      </a>
    </div>

          
    </div>
  );
}