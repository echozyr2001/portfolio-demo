"use client";

import React, { useEffect, useState } from "react";
import grainImage from "@/assets/images/grain.svg";

interface GrainEffectProps {
  opacity?: number;
  blendMode?: string;
  zIndex?: number;
}

/**
 * GrainEffect component - Adds a subtle grain texture overlay using the existing grain.svg
 * to enhance the page's visual texture and quality
 *
 * @param opacity - Controls the visibility of the grain effect (0-1)
 * @param blendMode - CSS blend mode to control how the grain blends with content beneath
 * @param zIndex - Z-index value to control stacking context
 */
export const GrainEffect: React.FC<GrainEffectProps> = ({
  opacity = 0.1,
  blendMode = "overlay",
  zIndex = 100,
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

  return (
    <div
      className="pointer-events-none fixed inset-0 bg-repeat"
      style={{
        zIndex,
        opacity,
        mixBlendMode: blendMode as any,
        backgroundImage: `url(${grainImage.src})`,
        backgroundSize: "700px 700px", // Match original SVG dimensions
        backgroundAttachment: "fixed", // Keep the grain fixed when scrolling
      }}
      aria-hidden="true"
    />
  );
};
