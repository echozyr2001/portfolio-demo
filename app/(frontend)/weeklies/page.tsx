import { Metadata } from "next";
import Link from "next/link";
import { getSortedWeeklies } from "@/lib/weeklies";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GrainEffect } from "@/components/GrainEffect";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Weeklies | Portfolio",
  description: "My weekly reports on learnings, progress, and thoughts.",
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function WeekliesPage() {
  const weeklies = getSortedWeeklies();

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
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
          <div className="mb-16">
            <h1 className="text-6xl md:text-8xl font-bold text-[#2C2A25] mb-4">
              Weeklies
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              A regular log of my journey. What I'm learning, building, and
              thinking about each week.
            </p>
          </div>

          <div className="space-y-8">
            {weeklies.length > 0 ? (
              weeklies.map((weekly) => (
                <Card
                  key={weekly.slug}
                  className="bg-white shadow-md hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-[#2C2A25] hover:text-[#A2ABB1] transition-colors">
                      <Link href={`/weeklies/${weekly.slug}`}>
                        {weekly.title}
                      </Link>
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-500 pt-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(weekly.date)}</span>
                    </div>
                    <CardDescription className="pt-4 text-base">
                      {weekly.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <div className="p-6 pt-0">
                    <Link href={`/weeklies/${weekly.slug}`}>
                      <Button
                        variant="outline"
                        className="rounded-full border-[#A2ABB1] text-[#A2ABB1] hover:bg-[#A2ABB1] hover:text-white"
                      >
                        Read More
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-16">
                <h2 className="text-2xl font-semibold text-[#2C2A25] mb-4">
                  No weekly reports yet.
                </h2>
                <p className="text-gray-600">Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
