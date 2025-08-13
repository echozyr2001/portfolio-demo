import { type NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { password } = body;

		if (!password) {
			return NextResponse.json(
				{ success: false, error: "Password is required" },
				{ status: 400 },
			);
		}

		const isValid = await authenticate(password);

		if (isValid) {
			return NextResponse.json({
				success: true,
				message: "Authentication successful",
			});
		} else {
			return NextResponse.json(
				{ success: false, error: "Invalid password" },
				{ status: 401 },
			);
		}
	} catch (error) {
		console.error("Login error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 },
		);
	}
}
