"use client";

import Image from "next/image";
import { SpinningText } from "@/components/ui/spinning-text";
import { SocialPlatform } from "../types";

export function HeroSection() {
  // Social media platforms
  const socialPlatforms: SocialPlatform[] = ["IG", "FB", "TW", "YT"];

  return (
    <section className="w-full px-4 py-16 md:py-24 md:px-8 bg-[#F6F4F1] relative z-40 rounded-b-[100px] mb-[-100px] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          {/* Left side - Title and cards */}
          <div className="relative z-10 flex flex-col justify-between">
            {/* Main title */}
            <div className="mb-12">
              <div className="flex items-center mb-4">
                <h2 className="text-3xl font-bold text-[#2C2A25] mr-4">
                  Hiring.
                </h2>
                <span className="text-xl font-medium text-[#2C2A25]">Jobs</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black leading-[1.1] text-[#2C2A25] tracking-tight">
                Transforming
                <br />
                The Job Search
                <br />
                Experience
              </h1>
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
          <div className="relative">
            {/* Main image container */}
            <div className="relative overflow-visible mt-8 md:mt-0">
              <div className="relative min-h-[500px] flex items-center justify-center">
                {/* Main background */}
                <div className="absolute inset-0 bg-[#F2E9DE] rounded-3xl"></div>

                {/* Social links in top right */}
                <div className="absolute top-6 right-6 flex space-x-4 z-20">
                  <div className="text-center">
                    <span className="block text-sm font-medium mb-1">
                      Connect
                    </span>
                    <span className="block text-sm font-medium">with us</span>
                  </div>
                  {socialPlatforms.slice(0, 3).map((social) => (
                    <a
                      key={social}
                      href="#"
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-transform hover:scale-110 shadow-md"
                      aria-label={social}
                    >
                      {social === "FB" && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
                        </svg>
                      )}
                      {social === "IG" && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2175 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2ZM12 7C10.6739 7 9.40215 7.52678 8.46447 8.46447C7.52678 9.40215 7 10.6739 7 12C7 13.3261 7.52678 14.5979 8.46447 15.5355C9.40215 16.4732 10.6739 17 12 17C13.3261 17 14.5979 16.4732 15.5355 15.5355C16.4732 14.5979 17 13.3261 17 12C17 10.6739 16.4732 9.40215 15.5355 8.46447C14.5979 7.52678 13.3261 7 12 7ZM18.5 6.75C18.5 6.41848 18.3683 6.10054 18.1339 5.86612C17.8995 5.6317 17.5815 5.5 17.25 5.5C16.9185 5.5 16.6005 5.6317 16.3661 5.86612C16.1317 6.10054 16 6.41848 16 6.75C16 7.08152 16.1317 7.39946 16.3661 7.63388C16.6005 7.8683 16.9185 8 17.25 8C17.5815 8 17.8995 7.8683 18.1339 7.63388C18.3683 7.39946 18.5 7.08152 18.5 6.75ZM12 9C12.7956 9 13.5587 9.31607 14.1213 9.87868C14.6839 10.4413 15 11.2044 15 12C15 12.7956 14.6839 13.5587 14.1213 14.1213C13.5587 14.6839 12.7956 15 12 15C11.2044 15 10.4413 14.6839 9.87868 14.1213C9.31607 13.5587 9 12.7956 9 12C9 11.2044 9.31607 10.4413 9.87868 9.87868C10.4413 9.31607 11.2044 9 12 9Z" />
                        </svg>
                      )}
                      {social === "TW" && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M22.46 6C21.69 6.35 20.86 6.58 20 6.69C20.88 6.16 21.56 5.32 21.88 4.31C21.05 4.81 20.13 5.16 19.16 5.36C18.37 4.5 17.26 4 16 4C13.65 4 11.73 5.92 11.73 8.29C11.73 8.63 11.77 8.96 11.84 9.27C8.28 9.09 5.11 7.38 3 4.79C2.63 5.42 2.42 6.16 2.42 6.94C2.42 8.43 3.17 9.75 4.33 10.5C3.62 10.5 2.96 10.3 2.38 10C2.38 10 2.38 10 2.38 10.03C2.38 12.11 3.86 13.85 5.82 14.24C5.46 14.34 5.08 14.39 4.69 14.39C4.42 14.39 4.15 14.36 3.89 14.31C4.43 16 6 17.26 7.89 17.29C6.43 18.45 4.58 19.13 2.56 19.13C2.22 19.13 1.88 19.11 1.54 19.07C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79C20.33 8.6 20.33 8.42 20.32 8.23C21.16 7.63 21.88 6.87 22.46 6Z" />
                        </svg>
                      )}
                    </a>
                  ))}
                </div>

                {/* User avatar in top right */}
                <div className="absolute top-24 right-6 z-20">
                  <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                  </div>
                </div>

                {/* Resume building tag */}
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
                          d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z"
                          fill="white"
                        />
                      </svg>
                      <div>
                        <div className="text-xs font-medium">RESUME</div>
                        <div className="text-xs font-medium">BUILDING</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main image */}
                <div className="relative z-10 mt-8">
                  <Image
                    src="/bibibai.png?height=500&width=400"
                    alt="Job seeker with laptop"
                    width={400}
                    height={500}
                    className="object-contain"
                    priority
                  />
                </div>

                {/* Download app button */}
                <div className="absolute bottom-8 left-8 z-20">
                  <a
                    href="#"
                    className="bg-[#FFEB3B] text-[#2C2A25] px-6 py-3 rounded-full font-semibold flex items-center shadow-lg hover:shadow-xl transition-all"
                  >
                    Download the app
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
                  </a>
                </div>

                {/* App store buttons */}
                <div className="absolute bottom-8 right-8 z-20 flex space-x-2">
                  <a
                    href="#"
                    className="w-12 h-12 bg-[#333333] rounded-full flex items-center justify-center"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5V7.5L16 12L10 16.5Z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-[#333333] rounded-full flex items-center justify-center"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M17.05 20.28C16.07 21.23 15 21 15 21C14.09 21 13.13 20.33 12.25 20.33C11.24 20.33 10.4 21 9.5 21C8.6 21 7.8 20.33 6.8 20.33C5.8 20.33 4.3 21.86 3.14 19.64C1.3 16.07 2.86 10.5 5.5 8.45C6.6 7.5 8.15 7 9.5 7C10.72 7 11.44 7.67 12.42 7.67C13.37 7.67 13.97 7 15.34 7C16.43 7 17.89 7.4 18.91 8.24C15.03 10.21 15.97 15.75 17.05 20.28ZM12.77 3.3C13.42 2.5 14.7 1.9 15.7 2C15.95 3.25 15.38 4.5 14.74 5.3C14.1 6.1 13 6.7 12 6.6C11.75 5.35 12.5 4.1 12.77 3.3Z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
