import React from "react";

interface ArrowIconProps {
  type?: "horizontal" | "diagonal";
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
}

export function ArrowIcon({
  type = "horizontal",
  size = 24,
  color = "currentColor",
  className = "",
  strokeWidth = 1,
}: ArrowIconProps) {
  // 水平箭头路径
  const horizontalPath = "M5 12H19M19 12L12 5M19 12L12 19";

  // 对角线箭头路径
  const diagonalPath = "M7 17L17 7M17 7H7M17 7V17";

  // 根据类型选择路径
  const path = type === "horizontal" ? horizontalPath : diagonalPath;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
