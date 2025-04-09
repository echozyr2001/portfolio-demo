// Shared types for the example page components

export type Project = {
  id: string;
  title: string;
  description: string;
  tech: string[];
  link?: string;
};

// Social platform type
export type SocialPlatform = "IG" | "FB" | "TW" | "YT";

// Color constants for consistent usage
export const COLORS = {
  background: "#D9D5D2",
  text: "#2C2A25",
  accent: "#A2ABB1",
  dark: "#333333",
  light: "#ECEAE8",
};
