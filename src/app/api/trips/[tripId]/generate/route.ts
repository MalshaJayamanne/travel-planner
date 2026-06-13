import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { generateItinerary } from "@/services/ai";

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

    // Calculate days between start and end date
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    // Generate itinerary via AI
    const itineraryData = await generateItinerary(
      trip.destination,
      durationDays,
      trip.budget,
      preferences
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
          },
        });
      })
    );

    return NextResponse.json({ success: true, itineraries: savedItineraries }, { status: 200 });
  } catch (error) {
    console.error("Error generating itinerary:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
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
