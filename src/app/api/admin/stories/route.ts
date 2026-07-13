import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logSystem } from "@/lib/logger";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    let stories;
    try {
      stories = await prisma.story.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          images: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      // Fallback if StoryImage does not exist yet
      stories = await prisma.story.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ stories });
  } catch (error) {
    console.error("Failed to load stories for moderation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const body = await req.json();
    const { storyId, status } = body;

    if (!storyId || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Story ID and valid status are required." }, { status: 400 });
    }

    const story = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found." }, { status: 404 });
    }

    const updatedStory = await prisma.story.update({
      where: { id: storyId },
      data: { status },
    });

    await logSystem({
      level: "INFO",
      message: `Story "${story.title}" status updated to ${status} by admin ${session.user.email}`,
      category: "API",
    });

    return NextResponse.json(updatedStory);
  } catch (error) {
    console.error("Failed to update story status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const storyId = searchParams.get("storyId");

    if (!storyId) {
      return NextResponse.json({ error: "Story ID is required." }, { status: 400 });
    }

    const story = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found." }, { status: 404 });
    }

    await prisma.story.delete({
      where: { id: storyId },
    });

    await logSystem({
      level: "WARN",
      message: `Story "${story.title}" deleted by admin ${session.user.email}`,
      category: "API",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete story:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
