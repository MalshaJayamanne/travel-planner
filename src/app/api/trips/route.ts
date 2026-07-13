import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const tripSchema = z.object({
  title: z.string().trim().min(2).max(120),
  destination: z.string().trim().min(2).max(120),
  country: z.string().trim().min(2).max(120).optional().default("Sri Lanka"),
  city: z.string().trim().min(2).max(120).optional().default(""),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  budget: z.coerce.number().nonnegative(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = tripSchema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide valid trip details." },
      { status: 400 }
    );
  }

  const trip = await prisma.trip.create({
    data: {
      title: parsed.data.title,
      destination: parsed.data.destination,
      country: parsed.data.country || "Sri Lanka",
      city: parsed.data.city || "",
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      budget: parsed.data.budget,
      userId: session.user.id,
    },
  });

  return NextResponse.json(trip, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trips = await prisma.trip.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(trips);
}
