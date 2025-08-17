import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// 简化的 Select 组件，使用原生 HTML select
const Select = React.forwardRef<
	HTMLSelectElement,
	React.SelectHTMLAttributes<HTMLSelectElement> & {
		onValueChange?: (value: string) => void;
	}
>(({ className, children, onValueChange, ...props }, ref) => {
	return (
		<select
			className={cn(
				"flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:ring-offset-gray-900 dark:focus:ring-blue-400",
				className,
			)}
			ref={ref}
			onChange={(e) => onValueChange?.(e.target.value)}
			{...props}
		>
			{children}
		</select>
	);
});
Select.displayName = "Select";

// 为了兼容性，保留这些组件但简化实现
const SelectTrigger = ({
	children,
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={className} {...props}>
		{children}
	</div>
);

const SelectValue = ({
	placeholder,
	className,
	...props
}: React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }) => (
	<span className={className} {...props}>
		{placeholder}
	</span>
);

const SelectContent = ({
	children,
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={className} {...props}>
		{children}
	</div>
);

const SelectItem = ({
	children,
	value,
	className,
	...props
}: React.HTMLAttributes<HTMLOptionElement> & { value: string }) => (
	<option value={value} className={className} {...props}>
		{children}
	</option>
);

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
