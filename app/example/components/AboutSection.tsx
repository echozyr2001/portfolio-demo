"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AboutSection() {
  return (
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

                {/* Decorative crosshairs */}
                {[
                  { position: "-top-4 -left-4", border: "border-t border-l" },
                  { position: "-top-4 -right-4", border: "border-t border-r" },
                  {
                    position: "-bottom-4 -left-4",
                    border: "border-b border-l",
                  },
                  {
                    position: "-bottom-4 -right-4",
                    border: "border-b border-r",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`absolute ${item.position} w-8 h-8 border border-white rounded-full flex items-center justify-center`}
                  >
                    <div
                      className={`w-4 h-4 ${item.border} border-white`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-bold mb-6">
              A Developer with a Designer&apos;s Curiosity
            </h3>
            <p className="text-lg mb-6">
              I&apos;m a full-stack developer with a background in Computer
              Science and several years of experience building scalable web
              applications. I enjoy designing clean, user-friendly interfaces
              while also caring about performance and maintainability.
            </p>
            <p className="text-lg mb-8">
              Recently, I&apos;ve been diving into UI/UX design, learning tools
              like Figma and Framer, aiming to blend code and design into
              cohesive user experiences.
            </p>
            <Button
              variant="outline"
              className="rounded-full bg-transparent text-white border-white hover:bg-white hover:text-[#333333] px-6 h-12"
            >
              <span>Learn More</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
