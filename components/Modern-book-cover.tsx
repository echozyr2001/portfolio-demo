"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Text,
  PerspectiveCamera,
  useCursor,
  Environment,
} from "@react-three/drei";
import { MathUtils } from "three";
import type { Group } from "three";
import {
  EffectComposer,
  DepthOfField,
  Bloom,
} from "@react-three/postprocessing";
import { TextureLoader, type Texture } from "three";

interface BookProps {
  title: string;
  description?: string;
  color?: string;
  coverImage?: string;
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
  coverImage,
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
  const [coverTexture, setCoverTexture] = useState<Texture | null>(null);

  // Target positions and rotations for animation
  const restPosition = [...position] as [number, number, number];

  // When selected, move to center of screen (x=0) but not too far forward
  const selectedPosition: [number, number, number] = [0, 0, 2];

  // Initial rotation has the opening facing the bookshelf (back) and spine facing the user
  const restRotation: [number, number, number] = [0, Math.PI, 0];

  // When selected, rotate to show the front cover with a tilt toward the right and up
  // Changed from right-down to right-up by adjusting X rotation to negative
  const selectedRotation: [number, number, number] = [
    -Math.PI / 12, // X rotation (upward tilt) - changed to negative
    Math.PI / 2 + Math.PI / 8, // Y rotation - kept the same for rightward direction
    -Math.PI / 24, // Z rotation - kept the same
  ];

  // Set cursor to pointer when hovering
  useCursor(hovered);

  useEffect(() => {
    if (coverImage) {
      const loader = new TextureLoader();
      loader.load(coverImage, (texture) => {
        setCoverTexture(texture);
      });
    }

    return () => {
      if (coverTexture) {
        coverTexture.dispose();
      }
    };
  }, [coverImage]);

  // Animate the book when selected
  useFrame(() => {
    if (!bookRef.current) return;

    // Smooth position animation
    bookRef.current.position.x = MathUtils.lerp(
      bookRef.current.position.x,
      isSelected ? selectedPosition[0] : restPosition[0],
      0.08
    );

    bookRef.current.position.y = MathUtils.lerp(
      bookRef.current.position.y,
      isSelected ? selectedPosition[1] : restPosition[1],
      0.08
    );

    bookRef.current.position.z = MathUtils.lerp(
      bookRef.current.position.z,
      isSelected ? selectedPosition[2] : restPosition[2],
      0.08
    );

    // Smooth rotation animation
    bookRef.current.rotation.x = MathUtils.lerp(
      bookRef.current.rotation.x,
      isSelected ? selectedRotation[0] : restRotation[0],
      0.08
    );

    bookRef.current.rotation.y = MathUtils.lerp(
      bookRef.current.rotation.y,
      isSelected ? selectedRotation[1] : restRotation[1],
      0.08
    );

    bookRef.current.rotation.z = MathUtils.lerp(
      bookRef.current.rotation.z,
      isSelected ? selectedRotation[2] : restRotation[2],
      0.08
    );

    // Add subtle hover animation
    if (hovered && !isSelected) {
      bookRef.current.position.z =
        restPosition[2] + Math.sin(Date.now() * 0.003) * 0.05;
    }
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
      onClick={(e) => {
        e.stopPropagation();
        onSelect(index);
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Book cover (front) - now on the right side */}
      <mesh position={[0, 0, depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.05]} />
        <meshStandardMaterial
          color={color}
          roughness={0.7}
          metalness={0.1}
          map={coverTexture}
        />

        {/* Only show text if no cover image */}
        {!coverTexture && (
          <>
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
          </>
        )}
      </mesh>

      {/* Book spine - still facing the user */}
      <mesh
        position={[width / 2, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        castShadow
        receiveShadow
      >
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
      <mesh position={[0, 0, -depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.05]} />
        <meshStandardMaterial
          color={`#${darkerColor}`}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* Book pages */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[width - 0.05, height - 0.05, depth - 0.1]} />
        <meshStandardMaterial color="#f1f1f1" roughness={0.5} />
      </mesh>
    </group>
  );
};

// Darker wooden bookshelf component to match reference
const Bookshelf = () => {
  return (
    <group>
      {/* Back panel */}
      <mesh position={[0, 0, -0.6]} receiveShadow>
        <boxGeometry args={[15, 5, 0.2]} />
        <meshStandardMaterial color="#3a2618" roughness={0.9} />
      </mesh>

      {/* Bottom shelf */}
      <mesh position={[0, -1.6, 0]} receiveShadow castShadow>
        <boxGeometry args={[15, 0.2, 1]} />
        <meshStandardMaterial color="#4a2c1a" roughness={0.8} />
      </mesh>

      {/* Top shelf */}
      <mesh position={[0, 1.6, 0]} receiveShadow castShadow>
        <boxGeometry args={[15, 0.2, 1]} />
        <meshStandardMaterial color="#4a2c1a" roughness={0.8} />
      </mesh>

      {/* Left side */}
      <mesh position={[-7.4, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 3.4, 1]} />
        <meshStandardMaterial color="#3a2618" roughness={0.9} />
      </mesh>

      {/* Right side */}
      <mesh position={[7.4, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 3.4, 1]} />
        <meshStandardMaterial color="#3a2618" roughness={0.9} />
      </mesh>
    </group>
  );
};

// Background plane to catch clicks for deselection
const BackgroundPlane = ({
  onBackgroundClick,
}: {
  onBackgroundClick: () => void;
}) => {
  return (
    <mesh position={[0, 0, -1]} onClick={onBackgroundClick}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
};

interface BookshelfSceneProps {
  books: Array<{
    title: string;
    description?: string;
    color?: string;
    coverImage?: string;
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

  // Reset camera position when component mounts - moved further back
  useEffect(() => {
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Handle background click to deselect book
  const handleBackgroundClick = () => {
    if (selectedBook !== null) {
      setSelectedBook(null);
    }
  };

  return (
    <>
      <BackgroundPlane onBackgroundClick={handleBackgroundClick} />
      <Bookshelf />

      {books.map((book, index) => (
        <Book
          key={index}
          index={index}
          title={book.title}
          description={book.description}
          color={book.color}
          coverImage={book.coverImage}
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
            bokehScale={4}
            height={480}
          />
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.9}
            luminanceSmoothing={0.9}
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
  ],
}: {
  className?: string;
  books?: Array<{
    title: string;
    description?: string;
    color?: string;
    coverImage?: string;
  }>;
}) => {
  return (
    <div className={`w-full h-[500px] ${className}`}>
      <Canvas shadows dpr={[1, 2]}>
        <color attach="background" args={["#1a1a1a"]} />
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={30} />
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-5, 5, 5]} intensity={0.3} />
        <spotLight
          position={[0, 5, 10]}
          angle={0.3}
          penumbra={0.8}
          intensity={0.5}
          castShadow
        />
        <BookshelfScene books={books} />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default ModernBookCover;
