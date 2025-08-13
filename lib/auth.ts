import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

/**
 * Authenticate user with password
 * @param password - The password to verify
 * @returns Promise<boolean> - True if authentication successful
 */
export async function authenticate(password: string): Promise<boolean> {
	if (!password || !process.env.ADMIN_PASSWORD) {
		return false;
	}

	if (password === process.env.ADMIN_PASSWORD) {
		const cookieStore = await cookies();
		cookieStore.set("admin-session", "authenticated", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 7, // 7 days
			path: "/",
		});
		return true;
	}
	return false;
}

/**
 * Check if user is authenticated
 * @returns Promise<boolean> - True if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
	try {
		const cookieStore = await cookies();
		const session = cookieStore.get("admin-session");
		return session?.value === "authenticated";
	} catch (error) {
		console.error("Error checking authentication:", error);
		return false;
	}
}

/**
 * Logout user by clearing session cookie
 */
export async function logout(): Promise<void> {
	try {
		const cookieStore = await cookies();
		cookieStore.delete("admin-session");
	} catch (error) {
		console.error("Error during logout:", error);
	}
}

/**
 * Middleware helper to check authentication from request
 * @param request - NextRequest object
 * @returns boolean - True if authenticated
 */
export function isAuthenticatedFromRequest(request: NextRequest): boolean {
	const session = request.cookies.get("admin-session");
	return session?.value === "authenticated";
}
