import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const tripSchema = z
  .object({
    title: z.string().trim().min(2).max(120).optional(),
    destination: z.string().trim().min(2).max(120).optional(),
    country: z.string().trim().min(2).max(120).optional(),
    city: z.string().trim().min(2).max(120).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    budget: z.coerce.number().nonnegative().optional(),
  })
  .partial();

export async function GET(_req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId } = await params;
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: session.user.id },
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  return NextResponse.json(trip);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId } = await params;

  // Verify ownership before update
  const existing = await prisma.trip.findFirst({
    where: { id: tripId, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const parsed = tripSchema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide valid trip updates." }, { status: 400 });
  }

  const updatedTrip = await prisma.trip.update({
    where: { id: tripId },
    data: {
      ...(parsed.data.title ? { title: parsed.data.title } : {}),
      ...(parsed.data.destination ? { destination: parsed.data.destination } : {}),
      ...(parsed.data.country ? { country: parsed.data.country } : {}),
      ...(parsed.data.city ? { city: parsed.data.city } : {}),
      ...(parsed.data.startDate ? { startDate: new Date(parsed.data.startDate) } : {}),
      ...(parsed.data.endDate ? { endDate: new Date(parsed.data.endDate) } : {}),
      ...(parsed.data.budget !== undefined ? { budget: parsed.data.budget } : {}),
    },
  });

  return NextResponse.json(updatedTrip);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId } = await params;

  // Verify ownership before delete
  const existing = await prisma.trip.findFirst({
    where: { id: tripId, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const deletedTrip = await prisma.trip.delete({ where: { id: tripId } });

  return NextResponse.json(deletedTrip);
}
