import { MDXEditorDemo } from "@/components/editor/MDXEditorDemo";
import AdminLayout from "@/components/admin/AdminLayout";

export default function EditorPage() {
	return (
		<AdminLayout>
			<div className="p-6">
				<div className="mb-6">
					<h1 className="text-2xl font-bold text-gray-900">MDX Editor</h1>
					<p className="mt-2 text-gray-600">
						Create and edit content with our advanced MDX editor
					</p>
				</div>
				<div className="bg-white rounded-lg shadow">
					<MDXEditorDemo />
				</div>
			</div>
		</AdminLayout>
	);
}
