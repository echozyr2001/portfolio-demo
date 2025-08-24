"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectCMS } from "../app/(frontend)/types";
import { useEffect, useState } from "react";

interface ProjectsSectionProps {
	featuredProjects?: ProjectCMS[];
}

export function ProjectsSection({ featuredProjects }: ProjectsSectionProps) {
	const [projects, setProjects] = useState<ProjectCMS[]>(featuredProjects || []);
	const [loading, setLoading] = useState(!featuredProjects);

	useEffect(() => {
		if (!featuredProjects || featuredProjects.length === 0) {
			// Fetch featured projects if not provided
			const fetchFeaturedProjects = async () => {
				try {
					const response = await fetch('/api/projects/featured?limit=6');
					const data = await response.json();
					setProjects(data.docs || []);
				} catch (error) {
					console.error('Error fetching featured projects:', error);
				} finally {
					setLoading(false);
				}
			};

			fetchFeaturedProjects();
		} else {
			setLoading(false);
		}
	}, [featuredProjects]);

	if (loading) {
		return (
			<section
				id="projects"
				className="w-full py-16 pt-16 md:py-24 md:pt-20 px-4 md:px-8 bg-[#FBF9F9] relative z-10 rounded-b-[100px] mb-[-100px]"
			>
				<div className="max-w-7xl mx-auto gap-8 flex flex-col">
					<div className="overflow-hidden mb-16">
						<div>
							<h2 className="text-6xl md:text-8xl font-bold whitespace-nowrap text-[#2C2A25]">
								projects · projects · projects · projects
							</h2>
						</div>
					</div>
					<div className="animate-pulse space-y-8">
						<div className="h-32 bg-gray-200 rounded"></div>
						<div className="h-32 bg-gray-200 rounded"></div>
						<div className="h-32 bg-gray-200 rounded"></div>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section
			id="projects"
			className="w-full py-16 pt-16 md:py-24 md:pt-20 px-4 md:px-8 bg-[#FBF9F9] relative z-10 rounded-b-[100px] mb-[-100px]"
		>
			<div className="max-w-7xl mx-auto gap-8 flex flex-col">
				<div className="overflow-hidden mb-16">
					<div>
						<h2 className="text-6xl md:text-8xl font-bold whitespace-nowrap text-[#2C2A25]">
							projects · projects · projects · projects
						</h2>
					</div>
				</div>

				{/* Featured Projects Showcase */}
				{projects.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
						{projects.slice(0, 2).map((project, index) => (
							<div
								key={project.id}
								className={`${
									index === 0 ? 'col-span-2' : 'col-span-1'
								} bg-[#ECEAE8] rounded-3xl p-8 h-[400px] relative overflow-hidden group cursor-pointer`}
							>
								<Link href={`/projects/${project.slug}`}>
									{project.featuredImage && (
										<Image
											src={project.featuredImage.url}
											alt={project.featuredImage.alt}
											fill
											className="object-cover group-hover:scale-105 transition-transform duration-300"
										/>
									)}
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
									<div className="absolute bottom-8 left-8 text-white">
										<h3 className="text-2xl font-bold mb-2">{project.title}</h3>
										<p className="text-sm opacity-90 line-clamp-2">
											{project.shortDescription}
										</p>
									</div>
								</Link>
							</div>
						))}
						
						{projects.length === 1 && (
							<div className="bg-[#A2ABB1] rounded-3xl p-8 h-[400px] flex items-center justify-center">
								<div className="text-center text-white">
									<h3 className="text-xl font-semibold mb-2">More Projects Coming Soon</h3>
									<p className="text-sm opacity-90">Check back for updates!</p>
								</div>
							</div>
						)}
					</div>
				)}

				{/* Projects List */}
				<div className="space-y-8">
					{projects.map((project, index) => (
						<div
							key={project.id}
							className="border-t border-gray-200 py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
						>
							<div className="md:col-span-1 text-xl font-bold text-[#2C2A25]">
								{String(index + 1).padStart(2, '0')}
							</div>
							<div className="md:col-span-4">
								<Link href={`/projects/${project.slug}`}>
									<h3 className="text-2xl font-bold text-[#2C2A25] hover:text-[#A2ABB1] transition-colors">
										{project.title}
									</h3>
								</Link>
							</div>
							<div className="md:col-span-4 text-gray-600">
								{project.shortDescription}
							</div>
							{/* Tech Stack display */}
							<div className="md:col-span-8 md:col-start-2 mt-2 flex flex-wrap gap-2">
								{project.technologies?.slice(0, 4).map((techObj, techIndex) => (
									<Badge
										key={techIndex}
										variant="outline"
										className="text-xs"
									>
										{techObj.technology}
									</Badge>
								))}
								{project.technologies && project.technologies.length > 4 && (
									<Badge variant="outline" className="text-xs">
										+{project.technologies.length - 4}
									</Badge>
								)}
							</div>
							<div className="md:col-span-3 flex justify-end md:col-start-10">
								<Link href={`/projects/${project.slug}`}>
									<Button
										variant="outline"
										className="rounded-full border-[#A2ABB1] text-[#A2ABB1] hover:bg-[#A2ABB1] hover:text-white flex items-center gap-1"
									>
										<span>Have a look</span>
										<ArrowRight className="h-4 w-4" />
									</Button>
								</Link>
							</div>
						</div>
					))}
				</div>

				{/* View All Projects Button */}
				<div className="mt-12 flex justify-center">
					<Link href="/projects">
						<Button
							variant="default"
							className="rounded-full bg-[#A2ABB1] text-white px-8 h-12 hover:bg-[#8A9AA3] transition-colors duration-300"
						>
							<span>View All Projects</span>
							<ArrowRight className="h-4 w-4" />
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
}
