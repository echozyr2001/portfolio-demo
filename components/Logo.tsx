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
			<circle cx="12" cy="12" r="10" fill={COLORS.dark} />

			<path d="M 23,2 A 10,10 0 0,1 23,22 Z" fill={COLORS.text} opacity="0.8" />

			<path d="M 34,2 A 10,10 0 0,1 34,22 Z" fill={COLORS.text} opacity="0.6" />
		</svg>
	);
}
