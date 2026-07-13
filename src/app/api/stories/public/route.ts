import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Public endpoint — no auth required.
// Returns all APPROVED stories with author info + their images.
export async function GET() {
  try {
    let stories;
    try {
      // Try with images (requires StoryImage table)
      stories = await prisma.story.findMany({
        where: { status: "APPROVED", visibility: "PUBLIC" },
        orderBy: { createdAt: "desc" },
        include: {
          images: { orderBy: { order: "asc" } },
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      });
    } catch {
      // StoryImage table may not exist yet — return without images
      stories = await prisma.story.findMany({
        where: { status: "APPROVED", visibility: "PUBLIC" },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      });
    }

    return NextResponse.json(stories);
  } catch (error) {
    console.error("Failed to fetch public stories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
