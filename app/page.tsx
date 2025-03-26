import { ReactLenis } from "lenis/react";

// import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Tape } from "@/components/sections/Tape";
import { Navbar } from "@/components/sections/Navbar";
import { TechStack } from "@/components/sections/TechStack";
import grainImage from "@/assets/images/grain.svg";
// import ModernBookCover, {
//   BookDescription,
//   BookHeader,
//   BookTitle,
// } from "@/components/ui/MagneticBook";
// import { BookIcon } from "lucide-react";
import { Threed } from "@/components/3D";
import BookDemo from "@/components/Book-demo";

export default function Home() {
  return (
    <ReactLenis root>
      <div className="relative">
        <div
          className="absolute inset-0 -z-30 bg-fixed opacity-5"
          style={{ backgroundImage: `url(${grainImage.src})` }}
        />
        <Navbar />
        {/* <Header /> */}
        <Hero />
        <div className="container flex items-center justify-center">
          {/* <ModernBookCover size="sm" color="neutral">
            <BookHeader>
              <BookIcon size={20} />
            </BookHeader>
            <BookTitle>Cuicui</BookTitle>
            <BookDescription>
              Learn CSS, by the creator of the language.
            </BookDescription>
          </ModernBookCover> */}
          <Threed />
          <BookDemo />
        </div>
        <TechStack />
        <Projects />
        <Tape />
        <About />
        <Contact />
      </div>
    </ReactLenis>
  );
}
