"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

interface AdminLayoutProps {
	children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const router = useRouter();
	const pathname = usePathname();

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			const response = await fetch("/api/auth/logout", {
				method: "POST",
			});

			if (response.ok) {
				router.push("/admin/login");
				router.refresh();
			}
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			setIsLoggingOut(false);
		}
	};

	const navigation = [
		{ name: "Dashboard", href: "/admin/dashboard", icon: "🏠" },
		{ name: "Posts", href: "/admin/posts", icon: "📝" },
		{ name: "Projects", href: "/admin/projects", icon: "🚀" },
		{ name: "Categories", href: "/admin/categories", icon: "📁" },
		{ name: "Tags", href: "/admin/tags", icon: "🏷️" },
		{ name: "Media", href: "/admin/media", icon: "🖼️" },
		{ name: "Import/Export", href: "/admin/import-export", icon: "📦" },
	];

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Top Navigation */}
			<div className="bg-white shadow">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-6">
						<h1 className="text-3xl font-bold text-gray-900">
							Admin Dashboard
						</h1>
						<button
							onClick={handleLogout}
							disabled={isLoggingOut}
							className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
						>
							{isLoggingOut ? "Logging out..." : "Logout"}
						</button>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
				<div className="flex gap-6">
					{/* Sidebar Navigation */}
					<div className="w-64 flex-shrink-0">
						<nav className="bg-white rounded-lg shadow p-4">
							<ul className="space-y-2">
								{navigation.map((item) => {
									const isActive = pathname === item.href;
									return (
										<li key={item.name}>
											<Link
												href={item.href}
												className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
													isActive
														? "bg-indigo-100 text-indigo-700"
														: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
												}`}
											>
												<span className="mr-3">{item.icon}</span>
												{item.name}
											</Link>
										</li>
									);
								})}
							</ul>
						</nav>
					</div>

					{/* Main Content */}
					<div className="flex-1">
						<div className="bg-white rounded-lg shadow">{children}</div>
					</div>
				</div>
			</div>
		</div>
	);
}
