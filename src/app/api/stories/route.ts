import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const storyImageSchema = z.object({
  url: z.string().trim(),
  publicId: z.string().trim().optional().nullable(),
  order: z.number().int().default(0),
});

const storySchema = z.object({
  title: z.string().trim().min(2).max(150),
  content: z.string().trim().min(5),
  location: z.string().trim().optional().nullable(),
  coverUrl: z.string().trim().optional().nullable(),
  date: z.string().optional().nullable(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
  images: z.array(storyImageSchema).optional().default([]),
});

// GET — current user's stories with their images
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let stories;
    try {
      // Try with images (requires StoryImage table to exist)
      stories = await prisma.story.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: { images: { orderBy: { order: "asc" } } },
      });
    } catch {
      // StoryImage table may not exist yet — fall back without images
      stories = await prisma.story.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      });
    }
    return NextResponse.json(stories);
  } catch (error) {
    console.error("Failed to fetch stories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST — create a new story (with optional multiple images)
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

    const { images, ...storyData } = parsed.data;

    let story;
    try {
      story = await prisma.story.create({
        data: {
          title: storyData.title,
          content: storyData.content,
          location: storyData.location || null,
          coverUrl: storyData.coverUrl || null,
          date: storyData.date ? new Date(storyData.date) : new Date(),
          visibility: storyData.visibility,
          userId: session.user.id,
          status: "PENDING",
          images: images && images.length > 0
            ? { create: images.map((img, idx) => ({ url: img.url, publicId: img.publicId || null, order: img.order ?? idx })) }
            : undefined,
        },
        include: { images: { orderBy: { order: "asc" } } },
      });
    } catch {
      // StoryImage table may not exist yet — create without images
      story = await prisma.story.create({
        data: {
          title: storyData.title,
          content: storyData.content,
          location: storyData.location || null,
          coverUrl: storyData.coverUrl || null,
          date: storyData.date ? new Date(storyData.date) : new Date(),
          visibility: storyData.visibility,
          userId: session.user.id,
          status: "PENDING",
        },
      });
    }

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error("Failed to create story:", error);
    return NextResponse.json({ error: "Failed to create story" }, { status: 500 });
  }
}

// PUT — update an existing story
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, images, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Story ID is required" }, { status: 400 });
    }

    const story = await prisma.story.findUnique({ where: { id } });

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

    // Update story + replace images if provided
    let updatedStory;
    let imagesSupported = true;
    try {
      updatedStory = await prisma.story.update({
        where: { id },
        data: {
          ...parsed.data,
          images: undefined, // exclude from base update
          date: parsed.data.date ? new Date(parsed.data.date) : undefined,
          // Reset status to PENDING on edit
          status: "PENDING",
        },
        include: {
          images: { orderBy: { order: "asc" } },
        },
      });
    } catch {
      imagesSupported = false;
      updatedStory = await prisma.story.update({
        where: { id },
        data: {
          ...parsed.data,
          images: undefined, // exclude from base update
          date: parsed.data.date ? new Date(parsed.data.date) : undefined,
          // Reset status to PENDING on edit
          status: "PENDING",
        },
      });
    }

    // Replace images if new set provided
    if (imagesSupported && Array.isArray(images)) {
      try {
        await prisma.storyImage.deleteMany({ where: { storyId: id } });

        if (images.length > 0) {
          await prisma.storyImage.createMany({
            data: images.map((img: { url: string; publicId?: string; order?: number }, idx: number) => ({
              storyId: id,
              url: img.url,
              publicId: img.publicId || null,
              order: img.order ?? idx,
            })),
          });
        }

        return NextResponse.json({
          ...updatedStory,
          images: await prisma.storyImage.findMany({ where: { storyId: id }, orderBy: { order: "asc" } }),
        });
      } catch (err) {
        console.error("Failed to update story images:", err);
      }
    }

    return NextResponse.json(updatedStory);
  } catch (error) {
    console.error("Failed to update story:", error);
    return NextResponse.json({ error: "Failed to update story" }, { status: 500 });
  }
}

// DELETE — remove a story (images cascade via DB)
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

    const story = await prisma.story.findUnique({ where: { id } });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    if (story.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.story.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Story deleted successfully" });
  } catch (error) {
    console.error("Failed to delete story:", error);
    return NextResponse.json({ error: "Failed to delete story" }, { status: 500 });
  }
}
