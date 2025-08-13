"use client";

import { COLORS } from "../app/types";

export function ContactIcon() {
	return (
		<svg
			width="48"
			height="48"
			viewBox="0 0 48 48"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M36 20C36 14.4772 31.5228 10 26 10C20.4772 10 16 14.4772 16 20C16 25.5228 20.4772 30 26 30"
				stroke={COLORS.text}
				strokeWidth="2"
			/>
			<path
				d="M22 30C22 35.5228 17.5228 40 12 40C6.47715 40 2 35.5228 2 30C2 24.4772 6.47715 20 12 20"
				stroke={COLORS.text}
				strokeWidth="2"
			/>
			<path d="M16 24H36" stroke={COLORS.text} strokeWidth="2" />
			<path d="M32 20L36 24L32 28" stroke={COLORS.text} strokeWidth="2" />
		</svg>
	);
}
