"use client";

import { TechStack } from "@/components/sections/TechStack";

export function SkillsSection() {
  return (
    <section
      id="skills"
      className="w-full py-16 pt-32 md:py-24 md:pt-36 px-4 md:px-8 bg-[#FBF9F9] relative z-20 rounded-b-[100px] mb-[-100px]"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-6xl md:text-8xl font-bold mb-16 text-[#2C2A25]">
          Skills
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-[#2C2A25] text-lg">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 bg-[#A2ABB1] text-white rounded-full flex items-center justify-center text-xl font-bold">
            💻
          </div>
          <div>
            <h3 className="font-bold mb-1">Frontend</h3>
            <p>React, Next.js, TypeScript, Tailwind CSS</p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 bg-[#A2ABB1] text-white rounded-full flex items-center justify-center text-xl font-bold">
            🛠️
          </div>
          <div>
            <h3 className="font-bold mb-1">Backend</h3>
            <p>Node.js, Express, MongoDB</p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 bg-[#A2ABB1] text-white rounded-full flex items-center justify-center text-xl font-bold">
            ⚙️
          </div>
          <div>
            <h3 className="font-bold mb-1">Tools</h3>
            <p>Git, Docker, Figma, Vercel</p>
          </div>
        </div>
      </div>

      <TechStack />
    </section>
  );
}
