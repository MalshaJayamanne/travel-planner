import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const [totalUsers, activeUsers, totalTrips, totalItineraries] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.trip.count(),
      prisma.itinerary.count(),
    ]);

    // Popular destinations grouping
    const popularDestGroups = await prisma.trip.groupBy({
      by: ["destination"],
      _count: {
        destination: true,
      },
      orderBy: {
        _count: {
          destination: "desc",
        },
      },
      take: 5,
    });

    const popularDestinations = popularDestGroups.map((g) => ({
      name: g.destination || "Unknown",
      trips: g._count.destination,
    }));

    // AI Itinerary usage history over the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      return d;
    }).reverse();

    const aiHistory = await Promise.all(
      last7Days.map(async (date) => {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const count = await prisma.itinerary.count({
          where: {
            trip: {
              createdAt: {
                gte: date,
                lt: nextDate,
              },
            },
          },
        });

        return {
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          requests: count,
        };
      })
    );

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        totalTrips,
        totalItineraries,
      },
      popularDestinations,
      aiHistory,
    });
  } catch (error) {
    console.error("Failed to fetch admin analytics:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
