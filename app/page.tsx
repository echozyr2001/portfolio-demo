import { ReactLenis } from "lenis/react";

import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Tape } from "@/components/sections/Tape";
import { Navbar } from "@/components/sections/Navbar";
import { TechStack } from "@/components/sections/TechStack";
import grainImage from "@/assets/images/grain.svg";
// import { Threed } from "@/components/3D";
// import BookDemo from "@/components/Book-demo";

export default function Home() {
  return (
    <ReactLenis root>
      <div className="relative">
        <div
          className="absolute inset-0 -z-30 bg-fixed opacity-5"
          style={{ backgroundImage: `url(${grainImage.src})` }}
        />
        <Navbar />
        <Hero />
        {/* <div className="container flex items-center justify-center">
          <Threed />
          <BookDemo />
        </div> */}
        <TechStack />
        <Projects />
        <Tape />
        <About />
        <Contact />
      </div>
    </ReactLenis>
  );
}
