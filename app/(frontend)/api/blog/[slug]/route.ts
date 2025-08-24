import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const payload = await getPayload({ config });
    const { slug } = await params;

    const posts = await payload.find({
      collection: "posts" as any,
      where: {
        slug: {
          equals: slug,
        },
        status: {
          equals: "published",
        },
      },
      limit: 1,
    });

    if (posts.docs.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const post = posts.docs[0];

    const response = NextResponse.json(post);

    // Add caching headers for individual posts
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=600, stale-while-revalidate=1200"
    );

    return response;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}
