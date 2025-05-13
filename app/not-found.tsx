"use client";

import Link from "next/link";
import { GrainEffect } from "./example/components/GrainEffect";
import { COLORS } from "./example/types"; // We might use some of these for consistency or define new ones

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-4"
      style={{ backgroundColor: "#111111" }} // Very dark background
    >
      <GrainEffect
        opacity={0.05} // Reduced opacity for subtlety on dark background
        blendMode="normal" // Normal blend mode for dark theme
        zIndex={0} // Behind content
        grainIntensity={0.08}
      />
      <div className="text-center relative z-10">
        <h1
          className="text-[10rem] md:text-[15rem] lg:text-[20rem] font-bold leading-none"
          style={{ color: COLORS.light }} // Using COLORS.light for main text
        >
          404
        </h1>
        <h2
          className="text-2xl md:text-3xl font-semibold mt-2 mb-6"
          style={{ color: COLORS.light }}
        >
          Page Not Found
        </h2>
        <p
          className="text-base md:text-lg mb-8 max-w-md mx-auto"
          style={{ color: "rgba(236, 234, 232, 0.8)" }} // Slightly dimmer light color for paragraph
        >
          Sorry, the page you're looking for seems to have been lost in the
          digital universe. Don't worry, we can get you back to safety.
        </p>
        <Link href="/example" legacyBehavior>
          <a
            className="inline-block px-6 py-3 rounded-md text-lg font-medium border-2 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111111]"
            style={{
              borderColor: COLORS.light,
              color: COLORS.light,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.light;
              e.currentTarget.style.color = "#111111"; // Dark text on hover
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = COLORS.light;
            }}
          >
            Take me home
          </a>
        </Link>
      </div>
    </div>
  );
}
