import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const wishlistSchema = z.object({
  title: z.string().trim().min(2).max(80),
  destination: z.string().trim().min(2).max(80),
  notes: z.string().trim().min(5).max(240),
  priority: z.enum(["Low", "Medium", "High"]),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.wishlist.findMany({ where: { userId: session.user.id } });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = wishlistSchema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide valid wishlist details." }, { status: 400 });
  }

  const item = await prisma.wishlist.create({
    data: {
      userId: session.user.id,
      title: parsed.data.title,
      destination: parsed.data.destination,
      notes: parsed.data.notes,
      priority: parsed.data.priority,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
