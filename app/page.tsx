import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Tape } from "@/components/sections/Tape";
import { Navbar } from "@/components/sections/Navbar";
import { TechStack } from "@/components/sections/TechStack";
import grainImage from "@/assets/images/grain.svg";

export default function Home() {
  return (
    <div className="relative">
      <div
        className="absolute inset-0 -z-30 bg-fixed opacity-5"
        style={{ backgroundImage: `url(${grainImage.src})` }}
      />
      <Navbar />
      <Header />
      <Hero />
      <TechStack />
      <Projects />
      <Tape />
      <About />
      <Contact />
    </div>
  );
}
