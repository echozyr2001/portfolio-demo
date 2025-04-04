"use client";

import Image from "next/image";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/sections/Header";
import { GrainEffect } from "@/components/GrainEffect";

// Color constants for consistent usage
const COLORS = {
  background: "#D9D5D2",
  text: "#2C2A25",
  accent: "#A2ABB1",
  dark: "#333333",
  light: "#ECEAE8",
};

// Reusable Logo component
const Logo = () => (
  <svg
    width="48"
    height="24"
    viewBox="0 0 48 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="12" fill={COLORS.text} />
    <path
      d="M24 0C30.6274 0 36 5.37258 36 12C36 18.6274 30.6274 24 24 24V0Z"
      fill={COLORS.text}
    />
    <path
      d="M36 0C42.6274 0 48 5.37258 48 12C48 18.6274 42.6274 24 36 24V0Z"
      fill={COLORS.text}
    />
  </svg>
);

// Contact icon component
const ContactIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M36 20C36 14.4772 31.5228 10 26 10C20.4772 10 16 14.4772 16 20C16 25.5228 20.4772 30 26 30"
      stroke={COLORS.text}
      strokeWidth="2"
    />
    <path
      d="M22 30C22 35.5228 17.5228 40 12 40C6.47715 40 2 35.5228 2 30C2 24.4772 6.47715 20 12 20"
      stroke={COLORS.text}
      strokeWidth="2"
    />
    <path d="M16 24H36" stroke={COLORS.text} strokeWidth="2" />
    <path d="M32 20L36 24L32 28" stroke={COLORS.text} strokeWidth="2" />
  </svg>
);

// Exhibition type definition
type Exhibition = {
  id: string;
  title: string;
  location: string;
};

// Social platform type
type SocialPlatform = "IG" | "FB" | "TW" | "YT";

export default function Home() {
  // Navigation items
  const navItems = ["Home", "About", "Portfolio", "Exhibitions", "Contact"];

  // Social media platforms
  const socialPlatforms: SocialPlatform[] = ["IG", "FB", "TW", "YT"];

  // Exhibition data
  const exhibitions: Exhibition[] = [
    {
      id: "01",
      title: "Cinematic Visions Unveiled",
      location: "Madrid Gallery, Spain, 21 Nov 2023",
    },
    {
      id: "02",
      title: "Frames in Motion",
      location: "Manchester Museum, UK, 20 Nov 2023",
    },
    {
      id: "03",
      title: "Journey Through Time",
      location: "Milan Gallery, Italy, 19 Nov 2023",
    },
    {
      id: "04",
      title: "Experimental Narratives",
      location: "Paris Museum, France, 18 Nov 2023",
    },
  ];

  return (
    <div className="min-h-screen bg-[#D9D5D2] flex flex-col">
      {/* Header */}
      <Header />
      <div className="w-full max-w-[1400px] mx-auto bg-[#F6F4F1] overflow-hidden">
        {/* Grain texture overlay - using the original grain.svg for texture */}
        <GrainEffect opacity={0.5} blendMode="soft-light" zIndex={60} />

        {/* <header className="w-full py-6 px-8 flex fixed justify-between items-center z-50">
          <div className="flex items-center">
            <Logo />
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#2C2A25]"
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <a
                key={item}
                href={item === "Home" ? "#" : `#${item.toLowerCase()}`}
                className="text-[#2C2A25] hover:text-gray-600"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center">
            <span className="text-sm mr-2 text-[#2C2A25]">
              Sam Cano, 22 Nov 23
            </span>
            <div className="w-8 h-8 rounded-full bg-[#A2ABB1] flex items-center justify-center">
              <span className="text-white text-xs">SC</span>
            </div>
          </div>
        </header> */}

        <main className="flex-1 relative">
          {/* Hero Section */}
          <section className="w-full px-4 py-16 md:py-24 md:px-8 bg-[#F6F4F1] relative z-40 rounded-b-[100px] mb-[-100px]">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col justify-center">
                <h1 className="text-7xl md:text-[10rem] font-black leading-[0.9] mb-6 text-[#2C2A25] tracking-tighter">
                  visual
                  <br />
                  poetry
                </h1>
                <p className="text-lg max-w-md mb-8 text-[#2C2A25]">
                  Welcome to a visual journey that transcends time and space.
                  Discover the artistry of moments captured in motion.
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

                {/* Stats - fixed grammar in text */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-3xl font-bold mb-2 text-[#2C2A25]">
                      +250k
                    </h3>
                    <p className="text-sm text-gray-600">
                      Views reaching a wide audience and giving inspiration
                    </p>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-2 text-[#2C2A25]">
                      +800k
                    </h3>
                    <p className="text-sm text-gray-600">
                      Hours watched, engaging storytelling that captivates
                      viewers
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-[#A2ABB1] rounded-3xl overflow-hidden h-[500px] relative">
                  <Image
                    src="/placeholder.svg?height=500&width=400"
                    alt="Photographer with camera"
                    width={400}
                    height={500}
                    className="object-cover h-full w-full"
                    priority
                  />
                </div>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section
            id="about"
            className="w-full bg-[#333333] text-white py-16 pt-32 md:py-24 md:pt-36 px-4 md:px-8 relative z-30 rounded-b-[100px] mb-[-100px]"
          >
            <div className="max-w-7xl mx-auto">
              <div className="overflow-hidden mb-16">
                <div>
                  <h2 className="text-6xl md:text-8xl font-bold whitespace-nowrap">
                    about · about · about · about
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="relative h-[500px] flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[400px] h-[400px] relative">
                      {/* Radial shapes */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-full h-full bg-contain bg-center bg-no-repeat"
                          style={{
                            backgroundImage:
                              "url('/placeholder.svg?height=400&width=400')",
                          }}
                        ></div>
                      </div>

                      {/* Center figure */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image
                          src="/placeholder.svg?height=300&width=200"
                          alt="Photographer with camera"
                          width={200}
                          height={300}
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Decorative crosshairs */}
                  {[
                    "top-4 left-4 border-t border-l",
                    "top-4 right-4 border-t border-r",
                    "bottom-4 left-4 border-b border-l",
                    "bottom-4 right-4 border-b border-r",
                  ].map((position, index) => (
                    <div
                      key={index}
                      className={`absolute ${position
                        .split(" ")
                        .slice(0, 2)
                        .join(
                          " "
                        )} w-8 h-8 border border-white rounded-full flex items-center justify-center`}
                    >
                      <div
                        className={`w-4 h-4 ${position
                          .split(" ")
                          .slice(2)
                          .join(" ")} border-white`}
                      ></div>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-3xl font-bold mb-6">
                    The Art of Visual Storytelling
                  </h3>
                  <p className="text-lg mb-6">
                    With over a decade of experience capturing moments that
                    matter, I&apos;ve developed a unique perspective that blends
                    technical precision with artistic vision.
                  </p>
                  <p className="text-lg mb-8">
                    My work explores the intersection of light, emotion, and
                    narrative, creating visual poetry that resonates with
                    viewers on a profound level.
                  </p>
                  <Button
                    variant="outline"
                    className="rounded-full bg-transparent text-white border-white hover:bg-white hover:text-[#333333] px-6 h-12"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Portfolio Section */}
          <section
            id="portfolio"
            className="w-full py-16 pt-32 md:py-24 md:pt-36 px-4 md:px-8 bg-[#FBF9F9] relative z-20 rounded-b-[100px] mb-[-100px]"
          >
            <div className="max-w-7xl mx-auto">
              <h2 className="text-6xl md:text-8xl font-bold mb-16 text-[#2C2A25]">
                portfolio
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="col-span-2 bg-[#ECEAE8] rounded-3xl p-8 h-[400px] relative">
                  <Image
                    src="/placeholder.svg?height=300&width=300"
                    alt="Minimalist tree"
                    width={300}
                    height={300}
                    className="absolute bottom-8 left-8"
                  />
                  <Image
                    src="/placeholder.svg?height=200&width=200"
                    alt="London Eye"
                    width={200}
                    height={200}
                    className="absolute bottom-8 right-8"
                  />
                </div>

                <div className="bg-[#A2ABB1] rounded-3xl p-8 h-[400px] flex items-end">
                  <Image
                    src="/placeholder.svg?height=300&width=200"
                    alt="Yellow palm leaf"
                    width={200}
                    height={300}
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="mt-12 flex justify-center">
                <Button
                  variant="default"
                  className="rounded-full bg-[#A2ABB1] text-white px-8 h-12"
                >
                  <span>View All Projects</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </section>

          {/* Exhibitions Section */}
          <section
            id="exhibitions"
            className="w-full py-16 pt-32 md:py-24 md:pt-36 px-4 md:px-8 bg-[#FBF9F9] relative z-10 rounded-b-[100px] mb-[-100px]"
          >
            <div className="max-w-7xl mx-auto">
              <div className="overflow-hidden mb-16">
                <div>
                  <h2 className="text-6xl md:text-8xl font-bold whitespace-nowrap text-[#2C2A25]">
                    exhibitions · exhibitions
                  </h2>
                </div>
              </div>

              <div className="space-y-8">
                {exhibitions.map((exhibition) => (
                  <div
                    key={exhibition.id}
                    className="border-t border-gray-200 py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                  >
                    <div className="md:col-span-1 text-xl font-bold text-[#2C2A25]">
                      {exhibition.id}
                    </div>
                    <div className="md:col-span-4">
                      <h3 className="text-2xl font-bold text-[#2C2A25]">
                        {exhibition.title}
                      </h3>
                    </div>
                    <div className="md:col-span-4 text-gray-600">
                      {exhibition.location}
                    </div>
                    <div className="md:col-span-3 flex justify-end">
                      <Button
                        variant="outline"
                        className="rounded-full border-[#A2ABB1] text-[#A2ABB1] hover:bg-[#A2ABB1] hover:text-white"
                      >
                        Buy Ticket
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section
            id="contact"
            className="w-full py-16 pt-32 md:py-24 md:pt-36 px-4 md:px-8 bg-[#D9D5D2] relative z-0"
          >
            <div className="max-w-6xl mx-auto bg-[#ECEAE8] rounded-[40px] shadow-sm p-8 md:p-10 text-center hover-lift">
              <div className="inline-block mx-auto mb-6">
                <ContactIcon />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold max-w-2xl mx-auto mb-6 sm:mb-8 text-[#2C2A25]">
                Tell me about your <span className="text-[#A2ABB1]">next</span>{" "}
                project
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="rounded-full bg-[#A2ABB1] text-white px-6 h-10 sm:h-12 border border-black/5 hover:bg-[#8A9AA3] transition-colors duration-300">
                  <Mail className="mr-2 h-4 w-4" />
                  <span>Email Me</span>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full h-10 sm:h-12 border-[#A2ABB1] text-[#A2ABB1] hover:bg-[#A2ABB1] hover:text-white transition-colors duration-300"
                >
                  WhatsApp
                </Button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
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
              vidéaste
            </h2>
          </div>
        </footer>
      </div>
    </div>
  );
}
