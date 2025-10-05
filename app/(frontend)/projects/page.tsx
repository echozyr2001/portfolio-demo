import { Metadata } from "next";
import { getSortedProjectsData } from "@/lib/projects";
import { ProjectsList } from "@/components/projects/ProjectsList";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GrainEffect } from "@/components/GrainEffect";

export const metadata: Metadata = {
  title: "Projects | Portfolio",
  description:
    "Explore my portfolio of web development projects, applications, and creative coding experiments.",
};

export default function ProjectsPage() {
  const projects = getSortedProjectsData();

  return (
    <div className="min-h-screen bg-[#D9D5D2] flex flex-col">
      <GrainEffect
        opacity={0.7}
        blendMode="difference"
        zIndex={60}
        grainIntensity={0.1}
      />

      <Header />

      <main className="flex-1 bg-[#F6F4F1]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="mb-16">
            <h1 className="text-6xl md:text-8xl font-bold text-[#2C2A25] mb-4">
              Projects
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              A collection of my work spanning web development, creative coding,
              and digital experiences.
            </p>
          </div>

          <ProjectsList allProjects={projects} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
