'use client';

import { motion } from 'motion/react';
import { AboutSection } from '@/components/AboutSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { GrainEffect } from '@/components/GrainEffect';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { ProjectsSection } from '@/components/ProjectsSection';
import { ScrollToTop } from '@/components/ScrollToTop';
import { SkillsSection } from '@/components/SkillsSection';
import type { ProjectData } from '@/lib/projects';

interface HomeClientProps {
  featuredProjects: ProjectData[];
}

export function HomeClient({ featuredProjects }: HomeClientProps) {
  return (
    <div className="min-h-screen bg-[#D9D5D2] flex flex-col">
      {/* Grain texture overlay - using transparent SVG for better results */}
      <GrainEffect
        opacity={0.7}
        blendMode="difference"
        zIndex={60}
        grainIntensity={0.1}
      />

      {/* Header */}
      <Header />

      <motion.div
        // className="w-full max-w-7xl mx-auto bg-[#F6F4F1] overflow-hidden"
        className="w-full mx-auto bg-[#F6F4F1] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <motion.main className="flex-1 relative">
          {/* Hero Section */}
          <HeroSection />

          {/* About Section */}
          <AboutSection />

          {/* Skills Section */}
          <SkillsSection />

          {/* Projects Section */}
          <ProjectsSection projects={featuredProjects} />

          {/* Contact Section */}
          <ContactSection />
        </motion.main>

        {/* Footer */}
        <Footer />
      </motion.div>
      {/* Scroll to top button */}
      <ScrollToTop />
    </div>
  );
}