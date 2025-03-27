"use client";

import { ModernBookCover } from "./Modern-book-cover";

export default function BookDemo() {
  const books = [
    {
      title: "MISSION UNKNOWN",
      description: "An adventure into the unknown",
      color: "#f5d76e",
      coverImage: "/placeholder.svg?height=400&width=250",
    },
    {
      title: "CYBER PUNK",
      description: "A journey through the digital wasteland",
      color: "#ff5e62",
      coverImage: "/placeholder.svg?height=400&width=250",
    },
    {
      title: "DARK FOREST",
      description: "Mysteries of the cosmic jungle",
      color: "#2ecc71",
      coverImage: "/placeholder.svg?height=400&width=250",
    },
    {
      title: "QUANTUM BREAK",
      description: "When time becomes your enemy",
      color: "#3498db",
      coverImage: "/placeholder.svg?height=400&width=250",
    },
    {
      title: "NEON DREAMS",
      description: "A tale of light and shadow",
      color: "#9b59b6",
      coverImage: "/placeholder.svg?height=400&width=250",
    },
    {
      title: "STELLAR WAR",
      description: "The battle for the galaxy begins",
      color: "#e74c3c",
      coverImage: "/placeholder.svg?height=400&width=250",
    },
    {
      title: "OCEAN DEEP",
      description: "Secrets beneath the waves",
      color: "#1abc9c",
      coverImage: "/placeholder.svg?height=400&width=250",
    },
    {
      title: "MIND GAMES",
      description: "A psychological thriller",
      color: "#34495e",
      coverImage: "/placeholder.svg?height=400&width=250",
    },
  ];

  return (
    <div className="w-full p-4 bg-gray-900">
      <h1 className="text-2xl font-bold mb-4 text-center text-white">
        Interactive 3D Bookshelf
      </h1>
      <p className="text-center mb-6 text-gray-300">
        Click on a book to pull it out from the shelf.
      </p>
      <ModernBookCover books={books} className="rounded-xl shadow-2xl" />
    </div>
  );
}
