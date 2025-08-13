"use client";

import Link from "next/link";
import { GrainEffect } from "../components/GrainEffect";
import { COLORS } from "./types"; // We might use some of these for consistency or define new ones

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
				{/* Creative 404 with chat bubble */}
				<div className="flex items-center justify-center mb-8">
					{/* First 4 */}
					<span
						className="text-[8rem] md:text-[12rem] lg:text-[16rem] font-bold leading-none"
						style={{ color: COLORS.light }}
					>
						4
					</span>

					{/* Chat bubble replacing the 0 */}
					<div className="relative mx-4 md:mx-8">
						<div
							className="relative bg-white rounded-3xl px-6 py-4 md:px-8 md:py-6 lg:px-12 lg:py-8 shadow-lg"
							style={{
								minWidth: "120px",
								minHeight: "80px",
								transform: "translateY(-10px)",
							}}
						>
							<span
								className="text-3xl md:text-5xl lg:text-7xl font-bold"
								style={{ color: "#111111" }}
							>
								oops!
							</span>

							{/* Chat bubble tail */}
							<div
								className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full"
								style={{
									width: 0,
									height: 0,
									borderLeft: "15px solid transparent",
									borderRight: "15px solid transparent",
									borderTop: "20px solid white",
								}}
							/>
						</div>
					</div>

					{/* Second 4 */}
					<span
						className="text-[8rem] md:text-[12rem] lg:text-[16rem] font-bold leading-none"
						style={{ color: COLORS.light }}
					>
						4
					</span>
				</div>

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
					Sorry, the page you&apos;re looking for seems to have been lost in the
					digital universe. Don&apos;t worry, we can get you back to safety.
				</p>
				<Link href="/" legacyBehavior>
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
