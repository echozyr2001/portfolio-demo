interface StatusBadgeProps {
	status: "draft" | "published" | "archived";
	className?: string;
}

export default function StatusBadge({
	status,
	className = "",
}: StatusBadgeProps) {
	const getStatusStyles = (status: string) => {
		switch (status) {
			case "published":
				return "bg-green-100 text-green-800 border-green-200";
			case "draft":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "archived":
				return "bg-gray-100 text-gray-800 border-gray-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "published":
				return "✓";
			case "draft":
				return "✏️";
			case "archived":
				return "📦";
			default:
				return "?";
		}
	};

	return (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(
				status,
			)} ${className}`}
		>
			<span className="mr-1">{getStatusIcon(status)}</span>
			{status.charAt(0).toUpperCase() + status.slice(1)}
		</span>
	);
}
