"use client";

import { useState, useMemo } from "react";
import type { GadgetFrontmatter } from "@/lib/gadgets";
import { Content } from "@/lib/content";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface GadgetsClientPageProps {
  gadgets: Content<GadgetFrontmatter>[];
  categories: string[];
}

export function GadgetsClientPage({
  gadgets,
  categories,
}: GadgetsClientPageProps) {
  const [filter, setFilter] = useState("All");

  const filteredGadgets = useMemo(() => {
    if (filter === "All") {
      return gadgets;
    }
    return gadgets.filter((g) => g.frontmatter.category === filter);
  }, [gadgets, filter]);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category}
            variant={filter === category ? "default" : "outline"}
            onClick={() => setFilter(category)}
            className={
              filter === category
                ? "bg-[#A2ABB1] text-white hover:bg-[#8A9AA3]"
                : "border-[#A2ABB1] text-[#A2ABB1] hover:bg-[#A2ABB1] hover:text-white"
            }
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredGadgets.length > 0 ? (
          filteredGadgets.map((gadget) => (
            <Card
              key={gadget.slug}
              className="bg-white shadow-md flex flex-col"
            >
              <CardHeader>
                <CardTitle className="text-xl font-bold text-[#2C2A25]">
                  {gadget.frontmatter.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-500 pt-1">
                  {gadget.frontmatter.category}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <p className="text-base text-gray-700 flex-grow">
                  {gadget.frontmatter.notes}
                </p>
                <a
                  href={gadget.frontmatter.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4"
                >
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-[#A2ABB1] text-[#A2ABB1] hover:bg-[#A2ABB1] hover:text-white"
                  >
                    Visit
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <h2 className="text-2xl font-semibold text-[#2C2A25] mb-4">
              No gadgets found for this category.
            </h2>
          </div>
        )}
      </div>
    </>
  );
}
