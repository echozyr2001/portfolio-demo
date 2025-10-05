import { Metadata } from "next";
import { getSortedGadgets, getAllGadgetCategories } from "@/lib/gadgets";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GrainEffect } from "@/components/GrainEffect";
import { GadgetsClientPage } from "./GadgetsClientPage";

export const metadata: Metadata = {
  title: "Gadgets | Portfolio",
  description:
    "A curated list of interesting libraries, tools, and other gadgets I've come across.",
};

export default function GadgetsPage() {
  const gadgets = getSortedGadgets();
  const categories = getAllGadgetCategories();

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
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
          <div className="mb-16">
            <h1 className="text-6xl md:text-8xl font-bold text-[#2C2A25] mb-4">
              Gadgets
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              A curated list of interesting libraries, tools, and other gadgets
              I've come across.
            </p>
          </div>
          <GadgetsClientPage gadgets={gadgets} categories={categories} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
