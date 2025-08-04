"use client";

import { COLORS } from "../app/types";

export function Logo() {
  return (
    <svg
      width="48"
      height="24"
      viewBox="0 0 48 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="modernGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={COLORS.text} />
          <stop offset="100%" stopColor={COLORS.dark} />
        </linearGradient>
      </defs>

      <circle cx="12" cy="12" r="10" fill="url(#modernGradient)" />

      <path d="M 23 2 A 10 10 0 0 1 23 22 Z" fill={COLORS.text} opacity="0.8" />

      <path d="M 34 2 A 10 10 0 0 1 34 22 Z" fill={COLORS.text} opacity="0.6" />
    </svg>
  );
}
