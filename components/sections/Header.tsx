"use client";

import { useState, useEffect } from "react";
import { MagneticBackgroundButton } from "../ui/MagneticBackgroundButton";

const Logo = () => (
  <svg
    width="48"
    height="24"
    viewBox="0 0 48 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="12" fill="#2C2A25" />
    <path
      d="M24 0C30.6274 0 36 5.37258 36 12C36 18.6274 30.6274 24 24 24V0Z"
      fill="#2C2A25"
    />
    <path
      d="M36 0C42.6274 0 48 5.37258 48 12C48 18.6274 42.6274 24 36 24V0Z"
      fill="#2C2A25"
    />
  </svg>
);

export function Header() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        const scrollPosition = window.scrollY;
        const maxScroll = 200;
        const progress = Math.min(scrollPosition / maxScroll, 1);
        setScrollProgress(progress);
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = ["Home", "About", "Portfolio", "Exhibitions", "Contact"];

  const navWidth = `${Math.max(50, 90 - scrollProgress * 40)}%`;

  return (
    <header className="hidden md:flex fixed w-full z-50 justify-center items-center top-3 text-[#2C2A25]">
      <nav
        style={{
          width: navWidth,
          transition:
            "width 0.3s ease-out, background-color 0.3s ease-out, backdrop-filter 0.3s ease-out, border-color 0.3s ease-out",
          backdropFilter: `blur(${Math.min(scrollProgress * 10, 12)}px)`,
          borderColor: `rgba(255, 255, 255, ${Math.min(
            scrollProgress * 0.5,
            0.15
          )})`,
          backgroundColor: `rgba(255, 255, 255, ${Math.min(
            scrollProgress * 0.3,
            0.1
          )})`,
        }}
        className="flex items-center px-6 py-1 gap-1 p-0.5 border rounded-full bg-white/10"
      >
        <div className="flex-1/3">
          {/* <Link href="/" className="text-xl font-semibold tracking-tight">
            BI
          </Link> */}
          <Logo />
        </div>

        <div className="flex-1/3 flex justify-center">
          <ul className="flex items-center gap-6 text-sm">
            {navItems.map((item, index) => (
              <li key={index} className="group relative">
                {/* <a className="px-2 py-1 block relative" href={item.href}>
                    {pathname === item.href && (
                      <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transform origin-left transition-all duration-300" />
                    )}

                    <span className="relative inline-flex overflow-hidden">
                      <div className="translate-y-0 transform-gpu transition-transform duration-500 ease-out group-hover:-translate-y-[110%] group-hover:skew-y-6">
                        {item.name}
                      </div>

                      <div className="absolute translate-y-[110%] skew-y-6 transform-gpu font-medium transition-transform duration-500 ease-out group-hover:translate-y-0 group-hover:skew-y-0">
                        {item.name}
                      </div>
                    </span>
                  </a> */}
                <MagneticBackgroundButton>
                  <span className="relative inline-flex overflow-hidden text-[#2C2A25]">
                    <div className="translate-y-0 transform-gpu transition-transform duration-500 ease-out group-hover:-translate-y-[110%] group-hover:skew-y-6">
                      {item}
                    </div>

                    <div className="absolute translate-y-[110%] skew-y-6 transform-gpu font-medium transition-transform duration-500 ease-out group-hover:translate-y-0 group-hover:skew-y-0">
                      {item}
                    </div>
                  </span>
                </MagneticBackgroundButton>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1/3"></div>
      </nav>
    </header>
  );
}
