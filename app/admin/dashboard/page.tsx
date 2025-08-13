"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminDashboard() {
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const router = useRouter();

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

	return (
		<div className="min-h-screen bg-gray-50">
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
				<div className="px-4 py-6 sm:px-0">
					<div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
						<div className="text-center">
							<h2 className="text-2xl font-semibold text-gray-900 mb-4">
								Welcome to the Admin Dashboard
							</h2>
							<p className="text-gray-600">
								Authentication is working! You are now logged in as an
								administrator.
							</p>
							<p className="text-sm text-gray-500 mt-2">
								This dashboard will be expanded with blog management features in
								future tasks.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
