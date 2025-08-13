"use client";

import { motion, useAnimationControls } from "motion/react";
import Image from "next/image";
import { Fragment, useCallback, useEffect, useRef } from "react";

// Color constants to match the example page
// const COLORS = {
//   background: "#D9D5D2",
//   text: "#2C2A25",
//   accent: "#A2ABB1",
//   dark: "#333333",
//   light: "#ECEAE8",
// };

import DockerIcon from "@/assets/icons/logos-docker.svg";
import GitIcon from "@/assets/icons/logos-git.svg";
import GoIcon from "@/assets/icons/logos-go.svg";
import JavaScriptIcon from "@/assets/icons/logos-javascript.svg";
import MongodbIcon from "@/assets/icons/logos-mongodb.svg";
import NextjsIcon from "@/assets/icons/logos-nextjs.svg";
import PostgresqlIcon from "@/assets/icons/logos-postgresql.svg";
import ReactIcon from "@/assets/icons/logos-react.svg";
import RustIcon from "@/assets/icons/logos-rust.svg";
import TailwindIcon from "@/assets/icons/logos-tailwindcss.svg";
import TypeScriptIcon from "@/assets/icons/logos-typescript.svg";

const techStack = [
	{ name: "Rust", icon: RustIcon },
	{ name: "Go", icon: GoIcon },
	{ name: "Next.js", icon: NextjsIcon },
	{ name: "React.js", icon: ReactIcon },
	{ name: "TypeScript", icon: TypeScriptIcon },
	{ name: "JavaScript", icon: JavaScriptIcon },
	{ name: "Tailwind CSS", icon: TailwindIcon },
	{ name: "PostgreSQL", icon: PostgresqlIcon },
	{ name: "MongoDB", icon: MongodbIcon },
	{ name: "Docker", icon: DockerIcon },
	{ name: "Git", icon: GitIcon },
];

export function TechStack() {
	const containerRef = useRef<HTMLDivElement>(null);
	const controls = useAnimationControls();

	// Define consistent animation speeds
	const normalSpeed = 30; // Faster speed when not hovering (30 seconds)
	const hoverSpeed = 120; // Slower speed when hovering (120 seconds - 4x slower)

	// Function to start or restart the animation with a specific duration
	// Memoize with useCallback to prevent recreation on each render
	const startScrollAnimation = useCallback(
		async (duration: number) => {
			if (!containerRef.current) return;

			const containerWidth = containerRef.current.scrollWidth / 2;

			// Start the infinite scroll animation
			controls.start({
				x: -containerWidth,
				transition: {
					duration: duration,
					ease: "linear",
					repeat: Infinity,
					repeatType: "loop",
				},
			});
		},
		[controls],
	);

	useEffect(() => {
		// Start with the normal (faster) speed on initial load
		startScrollAnimation(normalSpeed);

		// Cleanup
		return () => {
			controls.stop();
		};
	}, [controls, normalSpeed, startScrollAnimation]);

	// Handle hover to slow down the animation
	const handleMouseEnter = () => {
		startScrollAnimation(hoverSpeed);
	};

	// Handle mouse leave to speed up the animation
	const handleMouseLeave = () => {
		startScrollAnimation(normalSpeed);
	};

	return (
		<div className="py-4 lg:py-8">
			<div className="overflow-x-clip border-y border-[#A2ABB1]/30 relative">
				{/* Add gradient overlays for smoother fade effect */}
				<div className="absolute inset-y-0 left-0 w-[100px] bg-gradient-to-r from-[#FBF9F9] to-transparent z-10"></div>
				<div className="absolute inset-y-0 right-0 w-[100px] bg-gradient-to-l from-[#FBF9F9] to-transparent z-10"></div>

				<div className="flex [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
					<motion.div
						ref={containerRef}
						animate={controls}
						className="flex flex-none gap-4 pr-4 py-6 hover:cursor-pointer"
						onMouseEnter={handleMouseEnter}
						onMouseLeave={handleMouseLeave}
					>
						{[...new Array(2)].fill(0).map((_, arrayIndex) => (
							<Fragment key={arrayIndex}>
								{techStack.map((tech, index) => {
									return (
										<motion.div
											key={`${arrayIndex}-${index}`}
											className="inline-flex gap-2 items-center bg-[#A2ABB1]/10 rounded-full px-4 py-2 border border-[#A2ABB1]/20 shadow-sm"
											whileHover={{
												scale: 1.05,
												backgroundColor: "rgba(162, 171, 177, 0.3)",
												borderColor: "rgba(162, 171, 177, 0.4)",
												boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
												transition: { duration: 0.3 },
											}}
										>
											<Image
												src={tech.icon}
												alt={tech.name}
												width={24}
												height={24}
												className="object-contain"
											/>
											<span className="text-[#2C2A25] uppercase font-extrabold text-sm">
												{tech.name}
											</span>
										</motion.div>
									);
								})}
							</Fragment>
						))}
					</motion.div>
				</div>
			</div>
		</div>
	);
}
