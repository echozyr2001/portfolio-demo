"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ContentList from "@/components/admin/ContentList";
import { Project } from "@/lib/schema";

export default function ProjectsPage() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchProjects();
	}, []);

	const fetchProjects = async () => {
		try {
			const response = await fetch("/api/admin/projects");
			if (response.ok) {
				const data = await response.json();
				setProjects(data.data?.projects || []);
			}
		} catch (error) {
			console.error("Failed to fetch projects:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleStatusChange = async (id: string, status: string) => {
		try {
			const response = await fetch(`/api/admin/projects/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ status }),
			});

			if (response.ok) {
				setProjects(
					projects.map((project) =>
						project.id === id
							? {
									...project,
									status: status as "draft" | "published" | "archived",
								}
							: project,
					),
				);
			}
		} catch (error) {
			console.error("Failed to update project status:", error);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			const response = await fetch(`/api/admin/projects/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setProjects(projects.filter((project) => project.id !== id));
			}
		} catch (error) {
			console.error("Failed to delete project:", error);
		}
	};

	if (loading) {
		return (
			<AdminLayout>
				<div className="p-6">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
						<div className="space-y-4">
							{Array.from({ length: 5 }, () => crypto.randomUUID()).map(
								(key) => (
									<div key={key} className="h-16 bg-gray-200 rounded"></div>
								),
							)}
						</div>
					</div>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<ContentList
				type="projects"
				items={projects}
				onStatusChange={handleStatusChange}
				onDelete={handleDelete}
			/>
		</AdminLayout>
	);
}
