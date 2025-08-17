import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminDashboard() {
	return (
		<AdminLayout>
			<div className="p-6">
				<div className="text-center py-12">
					<h2 className="text-2xl font-semibold text-gray-900 mb-4">
						Welcome to the Admin Dashboard
					</h2>
					<p className="text-gray-600 mb-6">
						Manage your blog posts, projects, categories, tags, and media files.
					</p>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
						<div className="bg-indigo-50 p-6 rounded-lg">
							<div className="text-3xl mb-2">📝</div>
							<h3 className="text-lg font-medium text-gray-900 mb-2">Posts</h3>
							<p className="text-sm text-gray-600">
								Create and manage your blog posts with MDX support.
							</p>
						</div>

						<div className="bg-green-50 p-6 rounded-lg">
							<div className="text-3xl mb-2">🚀</div>
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								Projects
							</h3>
							<p className="text-sm text-gray-600">
								Showcase your projects with detailed descriptions.
							</p>
						</div>

						<div className="bg-yellow-50 p-6 rounded-lg">
							<div className="text-3xl mb-2">📁</div>
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								Categories
							</h3>
							<p className="text-sm text-gray-600">
								Organize your content with categories.
							</p>
						</div>

						<div className="bg-purple-50 p-6 rounded-lg">
							<div className="text-3xl mb-2">🏷️</div>
							<h3 className="text-lg font-medium text-gray-900 mb-2">Tags</h3>
							<p className="text-sm text-gray-600">
								Add tags to help visitors discover content.
							</p>
						</div>

						<div className="bg-blue-50 p-6 rounded-lg">
							<div className="text-3xl mb-2">🖼️</div>
							<h3 className="text-lg font-medium text-gray-900 mb-2">Media</h3>
							<p className="text-sm text-gray-600">
								Upload and manage images and media files.
							</p>
						</div>

						<div className="bg-gray-50 p-6 rounded-lg">
							<div className="text-3xl mb-2">📊</div>
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								Analytics
							</h3>
							<p className="text-sm text-gray-600">
								View content statistics and performance.
							</p>
						</div>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
}
