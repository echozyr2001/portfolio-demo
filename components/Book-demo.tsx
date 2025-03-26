"use client";

import { ModernBookCover } from "./Modern-book-cover";

export default function BookDemo() {
  const books = [
    {
      title: "Cuicui",
      description: "Learn CSS, by the creator of the language.",
      color: "#3f3f46",
    },
    {
      title: "Design",
      description: "A practical guide to creating design systems.",
      color: "#047857",
    },
    {
      title: "React",
      description: "Advanced techniques for React developers.",
      color: "#7e22ce",
    },
    {
      title: "JavaScript",
      description: "The definitive guide to modern JavaScript.",
      color: "#ca8a04",
    },
    {
      title: "UX Design",
      description: "Principles and practices for great user experiences.",
      color: "#be185d",
    },
    {
      title: "TypeScript",
      description: "Build robust applications with TypeScript.",
      color: "#0369a1",
    },
    {
      title: "Node.js",
      description: "Server-side JavaScript for modern applications.",
      color: "#15803d",
    },
    {
      title: "GraphQL",
      description: "A new API standard for efficient data loading.",
      color: "#db2777",
    },
    {
      title: "Next.js",
      description: "The React framework for production.",
      color: "#1e293b",
    },
    {
      title: "Tailwind",
      description: "A utility-first CSS framework for rapid UI development.",
      color: "#0ea5e9",
    },
  ];

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Interactive 3D Bookshelf
      </h1>
      <p className="text-center mb-6">
        Click on a book to pull it out from the shelf.
      </p>
      <ModernBookCover books={books} className="rounded-xl shadow-lg" />
    </div>
  );
}
