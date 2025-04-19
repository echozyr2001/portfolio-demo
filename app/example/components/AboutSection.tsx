"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLORS } from "../types";

// Timeline data with descriptions
const timelineData = [
  {
    year: 2018,
    title: "Career Start",
    description: "Began journey as a frontend developer",
  },
  {
    year: 2020,
    title: "Full Stack",
    description: "Expanded skills to backend development",
  },
  {
    year: 2022,
    title: "Leadership",
    description: "Led development team on key projects",
  },
  {
    year: 2024,
    title: "Innovation",
    description: "Focusing on cutting-edge technologies",
  },
];

export function AboutSection() {
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    const animatedElements = document.querySelectorAll(".animate-on-scroll");
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="w-full bg-gradient-to-b from-[#333333] to-[#222222] text-white py-16 pt-32 md:py-24 md:pt-36 px-4 md:px-8 relative z-30 rounded-b-[100px] mb-[-100px] overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-[#A2ABB1] filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-[#ECEAE8] filter blur-3xl"></div>
      </div>
      <div className="max-w-7xl mx-auto relative">
        {/* Static heading */}
        <div className="overflow-hidden mb-16">
          <h2 className="text-6xl md:text-8xl font-bold whitespace-nowrap">
            about · about · about · about
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Linear Timeline */}
          <div className="relative h-auto py-8" ref={timelineRef}>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/20"></div>

              {/* Timeline points */}
              <div className="space-y-12">
                {timelineData.map((item, i) => (
                  <div
                    key={item.year}
                    className="relative pl-12"
                    onMouseEnter={() => setActiveYear(item.year)}
                    onMouseLeave={() => setActiveYear(null)}
                  >
                    {/* Year point */}
                    <div className="absolute left-0 flex items-center justify-center">
                      <div
                        className={`w-8 h-8 bg-white/10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          activeYear === item.year ? "bg-[#A2ABB1]" : ""
                        } hover:bg-[#A2ABB1]/70`}
                      >
                        <span className="text-sm font-medium">{item.year}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10 transition-all duration-300 hover:border-[#A2ABB1]/30">
                      <h4 className="text-lg font-bold text-[#A2ABB1]">
                        {item.title}
                      </h4>
                      <p className="text-white/80 mt-2">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content section */}
          <div
            className="animate-on-scroll opacity-0 transition-all duration-1000 ease-out translate-y-8"
            style={{ animationDelay: "600ms" }}
          >
            <h3 className="text-3xl font-bold mb-6 relative">
              <span className="text-[#A2ABB1] relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#A2ABB1] after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100">
                Designer
              </span>
              <span className="relative inline-block mx-2">×</span>
              <span className="text-white relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-white after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100">
                {" "}
                Developer
              </span>
            </h3>

            {/* Experience list with enhanced styling */}
            <ul className="space-y-5 mb-8">
              {[
                "5 years of full-stack development experience",
                "Background in UI/UX design",
                "Product-oriented mindset",
                "Cross-functional team collaboration",
              ].map((item, index) => (
                <li
                  key={item}
                  className="flex items-start group transition-all duration-300 hover:translate-x-1"
                  style={{ animationDelay: `${800 + index * 100}ms` }}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#A2ABB1]/20 flex items-center justify-center mr-3 group-hover:bg-[#A2ABB1]/40 transition-all duration-300">
                    <ArrowRight className="h-4 w-4 text-[#A2ABB1] group-hover:text-white transition-all duration-300" />
                  </div>
                  <p className="text-lg group-hover:text-[#ECEAE8] transition-all duration-300">
                    {item}
                  </p>
                </li>
              ))}
            </ul>

            {/* Philosophy box with enhanced styling */}
            <div className="mb-8 p-6 bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-sm rounded-lg border border-white/10 shadow-lg transform transition-all duration-500 hover:shadow-[#A2ABB1]/20 hover:border-[#A2ABB1]/30">
              <h4 className="text-xl font-semibold mb-3 flex items-center">
                <span className="inline-block w-2 h-6 bg-[#A2ABB1] mr-3"></span>
                My Philosophy
              </h4>
              <p className="italic text-xl text-[#ECEAE8] font-light">
                "Code is solidified design, design is fluid code"
              </p>
              <p className="mt-3 text-white/80 leading-relaxed">
                Striving for the perfect blend of technology and aesthetics to
                create digital experiences that are both functional and
                delightful
              </p>
            </div>

            {/* Enhanced button */}
            <Button
              variant="outline"
              className="rounded-full bg-transparent text-white border-white hover:bg-[#A2ABB1] hover:border-transparent hover:text-[#333333] px-8 h-12 transition-all duration-300 group"
            >
              <span>View Full Experience</span>
              <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        .animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </section>
  );
}
