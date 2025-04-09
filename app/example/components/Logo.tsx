"use client";

import { COLORS } from "../types";

export function Logo() {
  return (
    <svg
      width="48"
      height="24"
      viewBox="0 0 48 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="12" fill={COLORS.text} />
      <path
        d="M24 0C30.6274 0 36 5.37258 36 12C36 18.6274 30.6274 24 24 24V0Z"
        fill={COLORS.text}
      />
      <path
        d="M36 0C42.6274 0 48 5.37258 48 12C48 18.6274 42.6274 24 36 24V0Z"
        fill={COLORS.text}
      />
    </svg>
  );
}
