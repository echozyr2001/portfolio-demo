import { NextResponse } from "next/server";
import { logout } from "@/lib/auth";

export async function POST() {
	try {
		await logout();
		return NextResponse.json({
			success: true,
			message: "Logout successful",
		});
	} catch (error) {
		console.error("Logout error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 },
		);
	}
}
