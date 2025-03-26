"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Text,
  PerspectiveCamera,
  OrbitControls,
  useCursor,
  Environment,
} from "@react-three/drei";
import { MathUtils } from "three";
import type { Group } from "three";
import { EffectComposer, DepthOfField } from "@react-three/postprocessing";

interface BookProps {
  title: string;
  description?: string;
  color?: string;
  width?: number;
  height?: number;
  depth?: number;
  position?: [number, number, number];
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
}

const Book = ({
  title,
  description = "",
  color = "#3f3f46",
  width = 2,
  height = 3,
  depth = 0.3,
  position = [0, 0, 0],
  index,
  isSelected,
  onSelect,
}: BookProps) => {
  const bookRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  // Target positions and rotations for animation
  const restPosition = [...position] as [number, number, number];
  const selectedPosition: [number, number, number] = [
    position[0],
    position[1],
    position[2] + 2,
  ];

  // Initial rotation has the opening facing the bookshelf (back) and spine facing the user
  const restRotation: [number, number, number] = [0, Math.PI, 0];

  // When selected, rotate to show the front cover (which is now on the right side)
  const selectedRotation: [number, number, number] = [
    0,
    Math.PI / 2 - Math.PI / 12,
    0,
  ];

  // Set cursor to pointer when hovering
  useCursor(hovered);

  // Animate the book when selected
  useFrame(() => {
    if (!bookRef.current) return;

    // Smooth position animation
    bookRef.current.position.x = MathUtils.lerp(
      bookRef.current.position.x,
      isSelected ? selectedPosition[0] : restPosition[0],
      0.1
    );

    bookRef.current.position.y = MathUtils.lerp(
      bookRef.current.position.y,
      isSelected ? selectedPosition[1] : restPosition[1],
      0.1
    );

    bookRef.current.position.z = MathUtils.lerp(
      bookRef.current.position.z,
      isSelected ? selectedPosition[2] : restPosition[2],
      0.1
    );

    // Smooth rotation animation
    bookRef.current.rotation.x = MathUtils.lerp(
      bookRef.current.rotation.x,
      isSelected ? selectedRotation[0] : restRotation[0],
      0.1
    );

    bookRef.current.rotation.y = MathUtils.lerp(
      bookRef.current.rotation.y,
      isSelected ? selectedRotation[1] : restRotation[1],
      0.1
    );

    bookRef.current.rotation.z = MathUtils.lerp(
      bookRef.current.rotation.z,
      isSelected ? selectedRotation[2] : restRotation[2],
      0.1
    );
  });

  // Darker color for spine and back
  const darkerColor =
    color
      .replace(/^#/, "")
      .match(/.{2}/g)
      ?.map((c) =>
        Math.max(0, Number.parseInt(c, 16) - 40)
          .toString(16)
          .padStart(2, "0")
      )
      .join("") || "333333";

  return (
    <group
      ref={bookRef}
      position={position}
      rotation={restRotation}
      onClick={() => onSelect(index)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Book cover (front) - now on the right side */}
      <mesh position={[0, 0, depth / 2]}>
        <boxGeometry args={[width, height, 0.05]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />

        {/* Title on front cover */}
        <Text
          position={[0, 0.5, 0.03]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={width - 0.4}
          textAlign="center"
        >
          {title}
        </Text>

        {/* Description on front cover */}
        {description && (
          <Text
            position={[0, 0, 0.03]}
            fontSize={0.1}
            color="white"
            anchorX="center"
            anchorY="middle"
            maxWidth={width - 0.4}
            textAlign="center"
          >
            {description}
          </Text>
        )}
      </mesh>

      {/* Book spine - still facing the user */}
      <mesh position={[width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[depth, height, 0.05]} />
        <meshStandardMaterial
          color={`#${darkerColor}`}
          roughness={0.8}
          metalness={0.1}
        />

        {/* Title on spine */}
        <Text
          position={[0, 0, 0.03]}
          rotation={[0, 0, Math.PI / 2]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={depth - 0.1}
        >
          {title}
        </Text>
      </mesh>

      {/* Book back - now on the left side */}
      <mesh position={[0, 0, -depth / 2]}>
        <boxGeometry args={[width, height, 0.05]} />
        <meshStandardMaterial
          color={`#${darkerColor}`}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* Book pages */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width - 0.05, height - 0.05, depth - 0.1]} />
        <meshStandardMaterial color="#f1f1f1" roughness={0.5} />
      </mesh>
    </group>
  );
};

// Simple wooden bookshelf component
const Bookshelf = () => {
  return (
    <group>
      {/* Back panel */}
      <mesh position={[0, 0, -0.6]} receiveShadow>
        <boxGeometry args={[15, 5, 0.2]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>

      {/* Bottom shelf */}
      <mesh position={[0, -1.6, 0]} receiveShadow castShadow>
        <boxGeometry args={[15, 0.2, 1]} />
        <meshStandardMaterial color="#A0522D" roughness={0.7} />
      </mesh>

      {/* Top shelf */}
      <mesh position={[0, 1.6, 0]} receiveShadow castShadow>
        <boxGeometry args={[15, 0.2, 1]} />
        <meshStandardMaterial color="#A0522D" roughness={0.7} />
      </mesh>

      {/* Left side */}
      <mesh position={[-7.4, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 3.4, 1]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>

      {/* Right side */}
      <mesh position={[7.4, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 3.4, 1]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
    </group>
  );
};

interface BookshelfSceneProps {
  books: Array<{
    title: string;
    description?: string;
    color?: string;
  }>;
}

const BookshelfScene = ({ books }: BookshelfSceneProps) => {
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const { camera } = useThree();

  // Position books side by side with minimal spacing
  const bookWidth = 0.4; // Thinner books
  const bookHeight = 2.5;
  const bookDepth = 1.5;
  const spacing = 0.05; // Minimal spacing between books

  // Calculate total width needed for all books
  const totalWidth = books.length * (bookWidth + spacing) - spacing;

  // Center the first book
  const startX = -totalWidth / 2 + bookWidth / 2;

  // Reset camera position when component mounts
  useEffect(() => {
    camera.position.set(0, 0, 6);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      <Bookshelf />

      {books.map((book, index) => (
        <Book
          key={index}
          index={index}
          title={book.title}
          description={book.description}
          color={book.color}
          width={bookWidth}
          height={bookHeight}
          depth={bookDepth}
          position={[startX + index * (bookWidth + spacing), 0, 0]}
          isSelected={selectedBook === index}
          onSelect={(idx) => setSelectedBook(idx === selectedBook ? null : idx)}
        />
      ))}

      {/* Add depth of field effect when a book is selected */}
      {selectedBook !== null && (
        <EffectComposer>
          <DepthOfField
            focusDistance={0}
            focalLength={0.02}
            bokehScale={2}
            height={480}
          />
        </EffectComposer>
      )}
    </>
  );
};

export const ModernBookCover = ({
  className = "",
  books = [
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
  ],
}: {
  className?: string;
  books?: Array<{
    title: string;
    description?: string;
    color?: string;
  }>;
}) => {
  return (
    <div className={`w-full h-[500px] ${className}`}>
      <Canvas shadows dpr={[1, 2]}>
        <color attach="background" args={["#f5f5f5"]} />
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={40} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-10, 10, 5]} intensity={0.5} />
        <BookshelfScene books={books} />
        <Environment preset="apartment" />
        <OrbitControls
          enableZoom={false}
          enableRotate={false}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
};

export default ModernBookCover;
