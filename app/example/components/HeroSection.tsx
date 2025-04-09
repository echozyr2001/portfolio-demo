"use client";

import Image from "next/image";
import { SpinningText } from "@/src/components/magicui/spinning-text";
import { SocialPlatform } from "../types";

export function HeroSection() {
  // Social media platforms
  const socialPlatforms: SocialPlatform[] = ["IG", "FB", "TW", "YT"];

  return (
    <section className="w-full px-4 py-16 md:py-24 md:px-8 bg-[#F6F4F1] relative z-40 rounded-b-[100px] mb-[-100px]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col justify-center">
          <h1 className="text-7xl md:text-[10rem] font-black leading-[0.9] mb-6 text-[#2C2A25] tracking-tighter">
            build
            <br />& design
          </h1>
          <p className="text-lg max-w-md mb-8 text-[#2C2A25]">
            I&apos;m a software engineer who crafts digital experiences with
            clean code and intuitive design. Passionate about turning ideas into
            beautiful and functional products.
          </p>

          {/* Social links */}
          <div className="flex space-x-4 mb-12">
            {socialPlatforms.map((social) => (
              <a
                key={social}
                href="#"
                className="w-10 h-10 rounded-full bg-[#ECEAE8] flex items-center justify-center transition-transform hover:scale-110"
                aria-label={social}
              >
                <span className="text-xs text-[#2C2A25]">{social}</span>
              </a>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-3xl font-bold mb-2 text-[#2C2A25]">+250k</h3>
              <p className="text-sm text-gray-600">
                Views reaching a wide audience and giving inspiration
              </p>
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-2 text-[#2C2A25]">+800k</h3>
              <p className="text-sm text-gray-600">
                Hours watched, engaging storytelling that captivates viewers
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="bg-[#A2ABB1] rounded-3xl relative overflow-visible">
            <div className="relative min-h-[500px] items-center justify-center flex overflow-visible">
              <Image
                src="/bibibai.png?height=500&width=400"
                alt="Software engineer and designer"
                width={400}
                height={500}
                className="object-contain w-full"
                priority
              />

              {/* Circular badge in bottom left */}
              <div
                className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-[#363433] text-white flex items-center justify-center"
                style={{ transform: "translate(-30%, 20%)" }}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
