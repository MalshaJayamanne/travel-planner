import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { promises as fs } from "fs";
import path from "path";

// Configure Cloudinary only if credentials are set
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tripId = searchParams.get("tripId");

  try {
    const photos = await prisma.photo.findMany({
      where: {
        userId: session.user.id,
        ...(tripId ? { tripId } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        trip: {
          select: {
            title: true,
            destination: true,
          },
        },
      },
    });

    return NextResponse.json(photos);
  } catch (error) {
    console.error("Failed to fetch photos:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const caption = formData.get("caption") as string | null;
    const location = formData.get("location") as string | null;
    const tripId = formData.get("tripId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let imageUrl = "";
    let publicId: string | null = null;

    if (isCloudinaryConfigured) {
      // Upload to Cloudinary
      const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;
      const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "travel-planner",
      });
      imageUrl = uploadResponse.secure_url;
      publicId = uploadResponse.public_id;
    } else {
      // Local fallback upload
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      
      // Ensure local upload directory exists
      await fs.mkdir(uploadDir, { recursive: true });

      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileExtension = path.extname(file.name) || ".jpg";
      const filename = `photo-${uniqueSuffix}${fileExtension}`;
      const filePath = path.join(uploadDir, filename);

      await fs.writeFile(filePath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    // Save to Database
    const photo = await prisma.photo.create({
      data: {
        userId: session.user.id,
        url: imageUrl,
        publicId,
        caption: caption || null,
        location: location || null,
        tripId: tripId && tripId !== "null" ? tripId : null,
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("Failed to upload photo:", error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const photoId = searchParams.get("id");

    if (!photoId) {
      return NextResponse.json({ error: "Photo ID required" }, { status: 400 });
    }

    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    if (photo.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 1. Clean up storage
    if (photo.publicId && isCloudinaryConfigured) {
      try {
        await cloudinary.uploader.destroy(photo.publicId);
      } catch (err) {
        console.error("Failed to delete from Cloudinary:", err);
      }
    } else if (photo.url.startsWith("/uploads/")) {
      try {
        const filePath = path.join(process.cwd(), "public", photo.url);
        await fs.unlink(filePath);
      } catch (err) {
        console.error("Failed to delete local file:", err);
      }
    }

    // 2. Delete from DB
    await prisma.photo.delete({
      where: { id: photoId },
    });

    return NextResponse.json({ success: true, message: "Photo deleted successfully" });
  } catch (error) {
    console.error("Failed to delete photo:", error);
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
  }
}

