import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { media } from "@/lib/schema";
import { desc } from "drizzle-orm";

export async function GET() {
	try {
		const allMedia = await db
			.select()
			.from(media)
			.orderBy(desc(media.createdAt));

		return NextResponse.json(allMedia);
	} catch (error) {
		console.error("Failed to fetch media:", error);
		return NextResponse.json(
			{ error: "Failed to fetch media" },
			{ status: 500 },
		);
	}
}
