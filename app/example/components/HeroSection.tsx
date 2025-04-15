"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { SpinningText } from "@/components/ui/spinning-text";

// Sticker configuration
interface Sticker {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
}

const stickers: Sticker[] = [
  {
    src: "/stickers/sticker1.png",
    alt: "Sticker 1",
    width: 80,
    height: 80,
    className:
      "absolute top-[-20px] right-[30px] rotate-[-10deg] z-30 transition-transform hover:scale-110",
  },
  {
    src: "/stickers/sticker2.png",
    alt: "Sticker 2",
    width: 70,
    height: 70,
    className:
      "absolute top-[100px] left-[-30px] rotate-[15deg] z-30 transition-transform hover:scale-110",
  },
  {
    src: "/stickers/sticker3.png",
    alt: "Sticker 3",
    width: 60,
    height: 60,
    className:
      "absolute bottom-[120px] right-[-20px] rotate-[-5deg] z-30 transition-transform hover:scale-110",
  },
  {
    src: "/stickers/sticker4.png",
    alt: "Sticker 4",
    width: 75,
    height: 75,
    className:
      "absolute top-[200px] right-[10px] rotate-[-12deg] z-30 transition-transform hover:scale-110",
  },
];

export function HeroSection() {
  // 右下角社交平台数据
  const socialPlatformsData = [
    {
      name: "GitHub",
      href: "#",
      svgPath:
        "M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.166 8.84 21.49C9.34 21.581 9.52 21.272 9.52 21.006C9.52 20.765 9.512 20.046 9.508 19.192C6.726 19.79 6.139 17.777 6.139 17.777C5.684 16.598 5.029 16.29 5.029 16.29C4.121 15.633 5.098 15.646 5.098 15.646C6.101 15.719 6.629 16.72 6.629 16.72C7.521 18.276 8.97 17.825 9.54 17.569C9.629 16.89 9.889 16.44 10.175 16.187C7.954 15.931 5.62 15.07 5.62 11.265C5.62 10.179 6.01 9.293 6.649 8.603C6.549 8.35 6.201 7.399 6.749 6.052C6.749 6.052 7.587 5.785 9.497 7.047C10.29 6.825 11.15 6.714 12 6.71C12.85 6.714 13.71 6.825 14.505 7.047C16.413 5.785 17.25 6.052 17.25 6.052C17.799 7.399 17.451 8.35 17.351 8.603C17.991 9.293 18.379 10.179 18.379 11.265C18.379 15.082 16.041 15.927 13.813 16.178C14.172 16.493 14.492 17.116 14.492 18.065C14.492 19.414 14.479 20.675 14.479 21.006C14.479 21.275 14.657 21.587 15.167 21.489C19.138 20.162 22 16.417 22 12C22 6.477 17.523 2 12 2Z",
      hoverClass: "hover:bg-[#24292e]",
    },
    {
      name: "LinkedIn",
      href: "#",
      svgPath:
        "M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17A1.4 1.4 0 0 1 15.71 13.57V18.5H18.5M6.88 8.56A1.68 1.68 0 0 0 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19A1.69 1.69 0 0 0 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56M8.27 18.5V10.13H5.5V18.5H8.27Z",
      hoverClass: "hover:bg-[#0077b5]",
    },
  ];

  return (
    <section className="w-full px-4 py-16 md:py-24 md:px-8 bg-[#F6F4F1] relative z-40 rounded-b-[100px] mb-[-100px] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-10 gap-8 relative">
          {/* Left side - Large rounded card */}
          <div className="relative z-10 pt-10 flex flex-col justify-center md:col-span-6">
            <motion.div
              className="relative mb-8"
              initial="initial"
              animate="animate"
              whileHover="groupHover"
            >
              <h1 className="relative">
                <motion.span
                  className="block text-7xl md:text-9xl font-black text-[#2C2A25] tracking-tighter leading-[0.9]"
                  variants={{
                    initial: {
                      opacity: 0,
                      y: 20,
                      textShadow: "-2px -2px 0 rgba(162, 210, 226, 0.3)",
                    },
                    animate: {
                      opacity: 1,
                      y: 0,
                      textShadow: "-2px -2px 0 rgba(162, 210, 226, 0.3)",
                    },
                    groupHover: {
                      textShadow: "0 0 15px rgba(162, 210, 226, 0.6)",
                    },
                  }}
                  transition={{
                    duration: 0.6,
                  }}
                >
                  Build
                </motion.span>
                <motion.span
                  className="block text-7xl md:text-9xl font-black text-[#2C2A25] tracking-tighter leading-[0.9]"
                  variants={{
                    initial: {
                      opacity: 0,
                      y: 20,
                      textShadow: "-2px -2px 0 rgba(255, 235, 59, 0.3)",
                    },
                    animate: {
                      opacity: 1,
                      y: 0,
                      textShadow: "-2px -2px 0 rgba(255, 235, 59, 0.3)",
                      transition: { delay: 0.2 },
                    },
                    groupHover: {
                      textShadow: "0 0 15px rgba(255, 235, 59, 0.6)",
                    },
                  }}
                  transition={{
                    duration: 0.6,
                  }}
                >
                  & Design
                </motion.span>
              </h1>
            </motion.div>
            <p className="text-lg max-w-5/6 mb-8 text-[#2C2A25]">
              I&apos;m a software engineer who crafts digital experiences with
              clean code and intuitive design. Passionate about turning ideas
              into beautiful and functional products.
            </p>

            {/* View my work button */}
            <motion.a
              href="#projects"
              className="bg-[#FFEB3B] text-[#2C2A25] px-6 py-3 rounded-full font-semibold flex items-center justify-center shadow-lg mb-10 w-[200px] mx-auto sm:mx-0"
              // initial={{ opacity: 0, y: 20 }}
              // animate={{ opacity: 1, y: 0 }}
              // transition={{ duration: 0.1 }}
              whileHover={{
                scale: 1.05,
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
            >
              <span>View my work</span>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="ml-2"
              >
                <path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.a>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-3xl font-bold mb-2 text-[#2C2A25]">
                  +250k
                </h3>
                <p className="text-sm text-[#2C2A25]/70">
                  Views reaching a wide audience and giving inspiration
                </p>
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-2 text-[#2C2A25]">
                  +800k
                </h3>
                <p className="text-sm text-[#2C2A25]/70">
                  Hours watched, engaging storytelling that captivates viewers
                </p>
              </div>
            </div>

            {/* Bottom cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Receive Updates card */}
              <div className="bg-[#A2D2E2] rounded-3xl p-6 relative overflow-hidden shadow-lg group">
                <div className="absolute top-6 left-6 bg-white rounded-full w-12 h-12 flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 4V20M20 12H4"
                      stroke="#2C2A25"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="mt-16 mb-8">
                  <h3 className="text-3xl font-bold text-[#2C2A25]">Receive</h3>
                  <h3 className="text-3xl font-bold text-[#2C2A25]">Updates</h3>
                </div>
                <div className="absolute bottom-6 right-6">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="transform transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  >
                    <path
                      d="M7 17L17 7M17 7H7M17 7V17"
                      stroke="#2C2A25"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Talent Quest card */}
              <div className="bg-[#F0F0F0] rounded-3xl p-6 relative overflow-hidden shadow-lg group">
                <div className="flex items-center mb-4">
                  <div className="bg-[#FFEB3B] rounded-full w-12 h-12"></div>
                  <div className="ml-2 bg-[#FF9800] rounded-full w-10 h-10 flex items-center justify-center overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-300 to-red-300"></div>
                  </div>
                </div>
                <div className="mt-8 mb-8">
                  <h3 className="text-3xl font-bold text-[#2C2A25]">Talent</h3>
                  <h3 className="text-3xl font-bold text-[#2C2A25]">Quest</h3>
                </div>
                <div className="absolute bottom-6 right-6">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="transform transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  >
                    <path
                      d="M7 17L17 7M17 7H7M17 7V17"
                      stroke="#2C2A25"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Image with floating elements */}
          <div className="relative md:col-span-4">
            {/* Main image container */}
            <div className="relative overflow-visible mt-8 md:mt-0">
              <div className="relative min-h-[500px] flex items-center justify-center">
                {/* Stickers */}
                {stickers.map((sticker, index) => (
                  <Image
                    key={index}
                    src={sticker.src}
                    alt={sticker.alt}
                    width={sticker.width}
                    height={sticker.height}
                    className={sticker.className}
                  />
                ))}

                {/* Main background */}
                <div className="absolute inset-0 bg-[#F2E9DE] rounded-3xl"></div>

                {/* User avatar in top right */}
                <div className="absolute top-24 right-6 z-20">
                  <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                  </div>
                </div>

                {/* Fullstack dev tag */}
                <div className="absolute left-[-20px] top-1/2 transform -translate-y-1/2 z-20">
                  <div className="bg-[#333333] text-white px-4 py-3 rounded-xl shadow-lg rotate-[-12deg]">
                    <div className="flex items-center">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2"
                      >
                        <path
                          d="M8 3L4 7L8 11M16 3L20 7L16 11M7 17H17M12 3V13"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div>
                        <div className="text-xs font-medium">FULLSTACK</div>
                        <div className="text-xs font-medium">DEVELOPER</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main image */}
                <div className="relative z-10 mt-8">
                  <Image
                    src="/bibibai.png?height=500&width=400"
                    alt="Software engineer and designer"
                    width={400}
                    height={500}
                    className="object-contain"
                    priority
                  />
                </div>

                {/* Social platform buttons */}
                <div className="absolute bottom-8 right-8 z-20 flex space-x-2">
                  {socialPlatformsData.map((platform) => (
                    <a
                      key={platform.name}
                      href={platform.href}
                      className={`w-12 h-12 bg-[#333333] rounded-full flex items-center justify-center transition-colors ${platform.hoverClass}`}
                      aria-label={platform.name}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <path d={platform.svgPath} />
                      </svg>
                    </a>
                  ))}
                </div>

                {/* Circular badge in bottom left */}
                <a
                  className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-[#363433] text-white flex items-center justify-center p-6 cursor-pointer group"
                  style={{ transform: "translate(-30%, 20%)" }}
                  href="#contact"
                >
                  <div className="w-full h-full relative">
                    <SpinningText
                      duration={15}
                      className="w-full h-full text-sm"
                      radius={6.5}
                    >
                      LETS TALK • LETS TALK • LETS TALK • LETS TALK •
                    </SpinningText>

                    {/* Center arrow */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                      >
                        <path
                          d="M7 17L17 7M17 7H7M17 7V17"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    {/* Inner circle */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full border border-white/30"></div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
