import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const activityUpdateSchema = z.object({
  title: z.string().trim().min(1).optional(),
  timeOfDay: z.enum(["Morning", "Afternoon", "Evening"]).optional(),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED"]).optional(),
  travelTime: z.string().optional(),
  suggestedAttraction: z.string().optional(),
  restaurant: z.string().optional(),
  accommodation: z.string().optional(),
  notes: z.string().optional(),
  locked: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ tripId: string; activityId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tripId, activityId } = await params;

    // Verify trip ownership
    const trip = await db.trip.findFirst({
      where: { id: tripId, userId: session.user.id },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Verify activity existence and relation to this trip
    const activity = await db.itineraryActivity.findFirst({
      where: {
        id: activityId,
        itinerary: {
          tripId: tripId,
        },
      },
    });

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = activityUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid activity payload" }, { status: 400 });
    }

    const updatedActivity = await db.itineraryActivity.update({
      where: { id: activityId },
      data: parsed.data,
    });

    return NextResponse.json(updatedActivity, { status: 200 });
  } catch (error) {
    console.error("Error updating activity status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
