export default function Navbar() {
  return (
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
  );
}