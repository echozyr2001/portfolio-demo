"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Project } from "../app/types";

export function ProjectsSection() {
  const projects: Project[] = [
    {
      id: "01",
      title: "Personal Portfolio",
      description:
        "Built with Next.js and Tailwind CSS to showcase my work and skills.",
      tech: ["Next.js", "TypeScript", "Tailwind"],
      link: "https://yourdomain.com",
    },
    {
      id: "02",
      title: "Personal Portfolio",
      description:
        "Built with Next.js and Tailwind CSS to showcase my work and skills.",
      tech: ["Next.js", "TypeScript", "Tailwind"],
      link: "https://yourdomain.com",
    },
    // ...
  ];

  return (
    <section
      id="projects"
      className="w-full py-16 pt-16 md:py-24 md:pt-20 px-4 md:px-8 bg-[#FBF9F9] relative z-10 rounded-b-[100px] mb-[-100px]" // Reduced top padding: pt-32 md:pt-36 -> pt-16 md:pt-20
    >
      <div className="max-w-7xl mx-auto gap-8 flex flex-col">
        <div className="overflow-hidden mb-16">
          <div>
            <h2 className="text-6xl md:text-8xl font-bold whitespace-nowrap text-[#2C2A25]">
              projects · projects · projects · projects
            </h2>
          </div>
        </div>

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

        <div className="space-y-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border-t border-gray-200 py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
            >
              <div className="md:col-span-1 text-xl font-bold text-[#2C2A25]">
                {project.id}
              </div>
              <div className="md:col-span-4">
                <h3 className="text-2xl font-bold text-[#2C2A25]">
                  {project.title}
                </h3>
              </div>
              <div className="md:col-span-4 text-gray-600">
                {project.description}
              </div>
              {/* Add Tech Stack display */}
              <div className="md:col-span-8 md:col-start-2 mt-2 flex flex-wrap gap-2">
                {project.tech.map((techItem) => (
                  <span
                    key={techItem}
                    className="bg-[#ECEAE8] text-[#2C2A25] text-xs font-medium px-2.5 py-0.5 rounded-full"
                  >
                    {techItem}
                  </span>
                ))}
              </div>
              <div className="md:col-span-3 flex justify-end md:col-start-10">
                {/* Updated Button text and added icon */}
                <Button
                  variant="outline"
                  className="rounded-full border-[#A2ABB1] text-[#A2ABB1] hover:bg-[#A2ABB1] hover:text-white flex items-center gap-1"
                  onClick={() =>
                    project.link && window.open(project.link, "_blank")
                  }
                >
                  <span>Have a look</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            variant="default"
            className="rounded-full bg-[#A2ABB1] text-white px-8 h-12 hover:bg-[#8A9AA3] transition-colors duration-300"
          >
            <span>View All Projects</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
