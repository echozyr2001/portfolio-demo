"use client";

import { Logo } from "./Logo";

export function Footer() {
  // Navigation items
  const navItems = ["Home", "About", "Skills", "Projects", "Contact"];

  return (
    <footer className="w-full py-8 px-8 bg-[#D9D5D2] relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <Logo />
        </div>

        <nav className="flex flex-wrap justify-center space-x-4 md:space-x-8 mb-4 md:mb-0">
          {navItems.map((item) => (
            <a
              key={item}
              href={item === "Home" ? "#" : `#${item.toLowerCase()}`}
              className="text-[#2C2A25] hover:text-gray-600 text-sm"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="text-sm text-gray-500">
          © {new Date().getFullYear()} All rights reserved.
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 overflow-hidden">
        <h2 className="text-6xl md:text-8xl font-bold opacity-20 text-[#2C2A25]">
          Full-stack · UI-curious
        </h2>
      </div>
    </footer>
  );
}
