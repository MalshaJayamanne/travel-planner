import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { generateItinerary, MustIncludePlace } from "@/services/ai";

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

    // Parse optional body for must-include places
    let mustIncludePlaces: MustIncludePlace[] | undefined;
    try {
      const body = await req.json();
      if (body?.mustIncludePlaces && Array.isArray(body.mustIncludePlaces)) {
        mustIncludePlaces = body.mustIncludePlaces as MustIncludePlace[];
      }
    } catch {
      // No body or invalid JSON — that's fine
    }

    // Fetch the trip

    const trip = await db.trip.findUnique({
      where: {
        id: tripId,
        userId: session.user.id,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Fetch user preferences
    const preferences = await db.preference.findFirst({
      where: { userId: session.user.id },
    });

    // Calculate trip duration in days (nights between startDate and endDate)
    // e.g. July 13 → July 16 = 3 nights = 3 days of activities
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffMs = end.getTime() - start.getTime();
    const durationDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));

    // Generate itinerary via AI
    const itineraryData = await generateItinerary(
      trip.destination,
      durationDays,
      trip.budget,
      preferences,
      mustIncludePlaces
    );

    // Delete existing itinerary for this trip (replace it)
    await db.itinerary.deleteMany({
      where: { tripId: trip.id },
    });

    // Save new itinerary to DB
    const savedItineraries = await Promise.all(
      itineraryData.map(async (item) => {
        return db.itinerary.create({
          data: {
            tripId: trip.id,
            day: item.day,
            activities: item.activities,
            activityItems: {
              create: item.activityItems ? item.activityItems.map((act, idx) => ({
                title: act.title,
                timeOfDay: act.timeOfDay,
                order: idx,
                status: act.status ?? "UPCOMING",
                travelTime: act.travelTime ?? "",
                suggestedAttraction: act.suggestedAttraction ?? "",
                notes: act.notes ?? "",
                locked: act.locked ?? false,
              })) : [],
            },
          },
          include: {
            activityItems: true,
          },
        });
      })
    );

    return NextResponse.json({ success: true, itineraries: savedItineraries }, { status: 200 });
  } catch (error) {
    console.error("Error generating itinerary:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function GET(
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
    const trip = await db.trip.findUnique({
      where: { id: tripId, userId: session.user.id },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const itineraries = await db.itinerary.findMany({
      where: { tripId: trip.id },
      include: {
        activityItems: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { day: 'asc' },
    });

    return NextResponse.json(itineraries, { status: 200 });
  } catch (error) {
    console.error("Error fetching itineraries:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
