import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const resolvedParams = await params;
    const tripId = resolvedParams.tripId;

    if (!tripId) {
      return NextResponse.json({ error: "Missing trip ID." }, { status: 400 });
    }

    const itineraries = await prisma.itinerary.findMany({
      where: { tripId },
      orderBy: { day: "asc" },
    });

    return NextResponse.json({ itineraries });
  } catch (error) {
    console.error("Failed to fetch trip itinerary:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
