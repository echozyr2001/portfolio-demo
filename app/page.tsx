"use client";

import { motion } from "motion/react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { GrainEffect } from "@/components/GrainEffect";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { SkillsSection } from "@/components/SkillsSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { ContactSection } from "@/components/ContactSection";
import { ScrollToTop } from "@/components/ScrollToTop";

export default function Home() {
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
        className="w-full max-w-[1400px] mx-auto bg-[#F6F4F1] overflow-hidden"
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
          <ProjectsSection />

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
