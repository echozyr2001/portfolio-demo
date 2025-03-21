"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Home, LucideListFilterPlus, Activity } from "lucide-react";

export function Navbar() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const pathname = usePathname();

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

  const navItems = [
    { name: "Home", href: "/", icon: <Home size={20} /> },
    // { name: "Projects", href: "/404", icon: <Grid size={20} /> },
    {
      name: "Docs",
      href: "/docs/introduction",
      icon: <LucideListFilterPlus size={20} />,
    },
    {
      name: "Hackathon",
      href: "/hackathon",
      icon: <Activity size={20} />,
    },
    // { name: "Contact", href: "/contact", icon: <Send size={24} /> },
  ];

  const navWidth = `${Math.max(50, 90 - scrollProgress * 40)}%`;

  return (
    <>
      {/* 桌面端 */}
      {/* <header className="flex justify-center items-center fixed top-3 w-full"> */}
      <header className="hidden md:flex fixed w-full z-50 justify-center items-center top-3">
        <nav
          style={{ width: navWidth }}
          className={`flex items-center px-6 py-1 transition-all duration-500 ease-in-out
            ${
              scrollProgress > 0
                ? "lex gap-1 p-0.5 border border-white/15 rounded-full bg-white/10 backdrop-blur-lg"
                : "lex gap-1 p-0.5 border border-white/15 rounded-full bg-white/10"
            }
          `}
        >
          <div className="flex-1">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              CFCO
            </Link>
          </div>

          <div className="flex-1 flex justify-center">
            <ul className="flex items-center gap-6">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`relative flex items-center gap-1 text-sm transition-colors duration-300 
                    ${
                      pathname === item.href
                        ? "text-foreground font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                  >
                    {pathname === item.href && (
                      <span className="absolute -left-3 w-1.5 h-1.5 rounded-full bg-green-500" />
                    )}
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 flex justify-end">
            {/* <button
              // onClick={toggleTheme}
              className="p-2 rounded-md transition-all duration-300 hover:bg-accent hover:text-accent-foreground"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </button> */}
            {/* <WalletButton /> */}
            {/* <appkit-button balance="hide" /> */}
            {/* <UserButton /> */}
          </div>
        </nav>
      </header>

      {/* 移动端 */}
      <nav
        className="fixed bottom-0 left-0 right-0 backdrop-blur-md shadow-lg
                   md:hidden flex justify-around items-center py-4 z-50"
      >
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center text-white transition-colors
              ${pathname === item.href ? "text-MutedSage-500" : "text-gray-400"}
            `}
          >
            <div>{item.icon}</div>
            <span className="text-sm">{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="md:hidden fixed top-4 right-4 z-50">
        {/* <appkit-button balance="hide" /> */}
        {/* <UserButton /> */}
      </div>
    </>
  );
}
