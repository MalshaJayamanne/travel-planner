import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const storySchema = z.object({
  title: z.string().trim().min(2).max(150),
  content: z.string().trim().min(5),
  location: z.string().trim().optional().nullable(),
  coverUrl: z.string().trim().optional().nullable(),
  date: z.string().optional().nullable(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stories = await prisma.story.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(stories);
  } catch (error) {
    console.error("Failed to fetch stories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = storySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid story details. Title (min 2 chars) and content (min 5 chars) are required." },
        { status: 400 }
      );
    }

    const story = await prisma.story.create({
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        location: parsed.data.location || null,
        coverUrl: parsed.data.coverUrl || null,
        date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
        userId: session.user.id,
      },
    });

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error("Failed to create story:", error);
    return NextResponse.json({ error: "Failed to create story" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Story ID is required" }, { status: 400 });
    }

    const story = await prisma.story.findUnique({
      where: { id },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    if (story.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parsed = storySchema.partial().safeParse(updateData);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid updates" }, { status: 400 });
    }

    const updatedStory = await prisma.story.update({
      where: { id },
      data: {
        ...parsed.data,
        date: parsed.data.date ? new Date(parsed.data.date) : undefined,
      },
    });

    return NextResponse.json(updatedStory);
  } catch (error) {
    console.error("Failed to update story:", error);
    return NextResponse.json({ error: "Failed to update story" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Story ID is required" }, { status: 400 });
    }

    const story = await prisma.story.findUnique({
      where: { id },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    if (story.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.story.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Story deleted successfully" });
  } catch (error) {
    console.error("Failed to delete story:", error);
    return NextResponse.json({ error: "Failed to delete story" }, { status: 500 });
  }
}
