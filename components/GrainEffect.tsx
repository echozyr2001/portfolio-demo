"use client";

import React, { useEffect, useState } from "react";
import grainImage from "@/public/grain-transparent.svg";

interface GrainEffectProps {
  opacity?: number;
  blendMode?: string;
  zIndex?: number;
  preserveLuminosity?: boolean;
  grainIntensity?: number;
}

/**
 * GrainEffect component - Adds a subtle grain texture overlay using a transparent SVG
 * to enhance the page's visual texture and quality without darkening the content
 *
 * @param opacity - Controls the contrast of the grain effect (0-1)
 * @param blendMode - CSS blend mode to control how the grain blends with content beneath
 * @param zIndex - Z-index value to control stacking context
 * @param preserveLuminosity - When true, prevents darkening of the page as opacity increases
 * @param grainIntensity - Controls the visibility of the grain pattern (0-1)
 */
export const GrainEffect: React.FC<GrainEffectProps> = ({
  opacity = 0.3,
  blendMode = "overlay",
  zIndex = 100,
  preserveLuminosity = true,
  grainIntensity = 0.3,
}) => {
  // Client-side only code to avoid hydration mismatch
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true once component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only render the full component on the client side
  if (!isClient) {
    return (
      <div
        className="pointer-events-none fixed inset-0"
        style={{ opacity: 0 }}
        aria-hidden="true"
      />
    );
  }

  // With our transparent SVG, we can use a simpler approach
  if (preserveLuminosity) {
    // For transparent grain SVG, we use optimized blend modes that won't darken
    const bestBlendModes = {
      light: "screen",
      medium: "overlay",
      dark: "soft-light",
    };

    // Determine optimal blend mode for grain based on desired intensity
    const optimalBlendMode =
      grainIntensity < 0.3
        ? bestBlendModes.light
        : grainIntensity < 0.6
        ? bestBlendModes.medium
        : bestBlendModes.dark;

    return (
      <div
        className="pointer-events-none fixed inset-0 bg-repeat"
        style={{
          zIndex,
          backgroundImage: `url(${grainImage.src})`,
          backgroundSize: "700px 700px",
          backgroundAttachment: "fixed",
          mixBlendMode: (blendMode ||
            optimalBlendMode) as React.CSSProperties["mixBlendMode"],
          opacity: grainIntensity,
          filter: `contrast(${100 + opacity * 70}%)`,
          backgroundColor: "transparent",
        }}
        aria-hidden="true"
      />
    );
  }

  // Fallback implementation for when preserveLuminosity is false
  return (
    <div
      className="pointer-events-none fixed inset-0 bg-repeat"
      style={{
        zIndex,
        opacity,
        mixBlendMode: blendMode as React.CSSProperties["mixBlendMode"],
        backgroundImage: `url(${grainImage.src})`,
        backgroundSize: "700px 700px",
        backgroundAttachment: "fixed",
      }}
      aria-hidden="true"
    />
  );
};
