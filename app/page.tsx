import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Tape } from "@/components/sections/Tape";
import grainImage from "@/assets/images/grain.svg";

export default function Home() {
  return (
    <div className="relative">
      <div
        className="absolute inset-0 -z-30 bg-fixed opacity-5"
        style={{ backgroundImage: `url(${grainImage.src})` }}
      />
      <Header />
      <Hero />
      <Projects />
      <Tape />
    </div>
  );
}
