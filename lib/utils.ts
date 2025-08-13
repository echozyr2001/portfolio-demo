import { type ClassValue, clsx } from "clsx";
import { NextResponse } from "next/server";
import { twMerge } from "tailwind-merge";
import type { ZodError } from "zod";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// API response utilities
export function createSuccessResponse(
	data: any,
	message?: string,
	status = 200,
) {
	return NextResponse.json(
		{
			success: true,
			message,
			data,
		},
		{ status },
	);
}

export function createErrorResponse(
	error: string,
	message: string,
	status = 400,
	details?: any,
) {
	return NextResponse.json(
		{
			success: false,
			error,
			message,
			details,
		},
		{ status },
	);
}

// Handle Zod validation errors
export function handleValidationError(error: ZodError) {
	if (!error || !error.errors || !Array.isArray(error.errors)) {
		return createErrorResponse("VALIDATION_ERROR", "Invalid input data", 400, {
			message: "Unknown validation error",
		});
	}

	const details = error.errors.map((err) => ({
		field: err.path ? err.path.join(".") : "unknown",
		message: err.message || "Invalid value",
	}));

	return createErrorResponse(
		"VALIDATION_ERROR",
		"Invalid input data",
		400,
		details,
	);
}

// Generate unique ID
export function generateId(): string {
	return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Generate slug from text
export function generateSlug(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "") // Remove special characters
		.replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
		.replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

// Get current timestamp
export function getCurrentTimestamp(): Date {
	return new Date();
}
