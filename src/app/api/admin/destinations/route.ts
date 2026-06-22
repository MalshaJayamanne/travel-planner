import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logSystem } from "@/lib/logger";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const destinationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(5),
  image: z.string().trim().url().or(z.literal("")),
  category: z.string().trim().min(2).max(50),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const destinations = await prisma.destination.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ destinations });
  } catch (error) {
    console.error("Failed to load destinations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = destinationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid destination details. Name, category and description are required." }, { status: 400 });
    }

    const destination = await prisma.destination.create({
      data: parsed.data,
    });

    await logSystem({
      level: "INFO",
      message: `Destination added: "${parsed.data.name}" by admin ${session.user.email}`,
      category: "API",
    });

    return NextResponse.json(destination, { status: 201 });
  } catch (error) {
    console.error("Failed to create destination:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Destination ID is required." }, { status: 400 });
    }

    const parsed = destinationSchema.safeParse(updateData);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid destination details." }, { status: 400 });
    }

    const destination = await prisma.destination.update({
      where: { id },
      data: parsed.data,
    });

    await logSystem({
      level: "INFO",
      message: `Destination updated: "${parsed.data.name}" by admin ${session.user.email}`,
      category: "API",
    });

    return NextResponse.json(destination);
  } catch (error) {
    console.error("Failed to update destination:", error);
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Destination ID is required." }, { status: 400 });
    }

    const dest = await prisma.destination.findUnique({ where: { id } });
    if (!dest) {
      return NextResponse.json({ error: "Destination not found." }, { status: 404 });
    }

    await prisma.destination.delete({
      where: { id },
    });

    await logSystem({
      level: "INFO",
      message: `Destination deleted: "${dest.name}" by admin ${session.user.email}`,
      category: "API",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete destination:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
