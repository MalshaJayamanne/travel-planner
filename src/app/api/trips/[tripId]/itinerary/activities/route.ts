import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const activityCreateSchema = z.object({
  itineraryId: z.string().min(1),
  title: z.string().trim().min(1),
  timeOfDay: z.enum(["Morning", "Afternoon", "Evening"]).default("Afternoon"),
  travelTime: z.string().optional().default(""),
  suggestedAttraction: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  order: z.number().int().optional().default(0),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tripId } = await params;

    // Verify trip ownership
    const trip = await db.trip.findFirst({
      where: { id: tripId, userId: session.user.id },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = activityCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid activity payload", details: parsed.error.flatten() }, { status: 400 });
    }

    // Verify itinerary belongs to this trip
    const itinerary = await db.itinerary.findFirst({
      where: { id: parsed.data.itineraryId, tripId },
    });

    if (!itinerary) {
      return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
    }

    const newActivity = await db.itineraryActivity.create({
      data: {
        itineraryId: parsed.data.itineraryId,
        title: parsed.data.title,
        timeOfDay: parsed.data.timeOfDay,
        travelTime: parsed.data.travelTime,
        suggestedAttraction: parsed.data.suggestedAttraction,
        notes: parsed.data.notes,
        order: parsed.data.order,
        status: "UPCOMING",
        locked: false,
      },
    });

    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
