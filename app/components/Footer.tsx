import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="mx-auto mt-10 w-full max-w-7xl border-t border-white/10 pt-6">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 md:flex-row md:items-center">

        {/* Icons */}
        <div className="flex gap-6 text-4xl text-gray-300">
          <a
            href="https://github.com/AurelioAlfons"
            target="_blank"
            rel="noopener noreferrer"
            className="transition duration-300 hover:scale-125 hover:text-yellow-400"
          >
            <FaGithub />
          </a>

          <a
            href="https://www.linkedin.com/in/aurelio-alfons/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition duration-300 hover:scale-125 hover:text-yellow-400"
          >
            <FaLinkedin />
          </a>

          <a
            href="mailto:yuroalfons0407@gmail.com"
            className="transition duration-300 hover:scale-125 hover:text-yellow-400"
          >
            <FaEnvelope />
          </a>
        </div>

        {/* Tech text */}
        <p className="text-sm text-gray-400">
          Built with React, Next.js, TailwindCSS
        </p>
      </div>

      {/* Copyright */}
      <p className="mt-8 text-center text-sm text-gray-500">
        Copyright © 2026 Aurelio Hevi Alfons. All rights reserved.
      </p>
    </footer>
  );
}