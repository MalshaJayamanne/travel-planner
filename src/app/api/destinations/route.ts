import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const DEFAULT_DESTINATIONS = [
  {
    name: "Kyoto, Japan",
    description: "Experience the historic temples, sublime gardens, and traditional wooden houses of Japan's cultural heart.",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop",
    category: "Cultural",
  },
  {
    name: "Santorini, Greece",
    description: "Famous for its whitewashed houses, blue-domed churches, and iconic sunset views over the Aegean Sea.",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=600&auto=format&fit=crop",
    category: "Beach",
  },
  {
    name: "Banff, Canada",
    description: "Nestled in the Rocky Mountains, featuring majestic turquoise lakes, snowcapped peaks, and abundant wildlife.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
    category: "Nature",
  },
  {
    name: "Machu Picchu, Peru",
    description: "Explore the legendary 15th-century Incan citadel set high in the Andes mountains, rich with ancient mystery.",
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=600&auto=format&fit=crop",
    category: "Historical",
  },
  {
    name: "Reykjavik, Iceland",
    description: "The gateway to Iceland's dramatic volcanic landscape, hot springs, waterfalls, and the spectacular Northern Lights.",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=600&auto=format&fit=crop",
    category: "Adventure",
  },
  {
    name: "Bali, Indonesia",
    description: "A tropical oasis renowned for its forested volcanic mountains, iconic rice paddies, beaches, and coral reefs.",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=600&auto=format&fit=crop",
    category: "Adventure",
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    let count = await prisma.destination.count();

    if (count === 0) {
      await prisma.destination.createMany({
        data: DEFAULT_DESTINATIONS,
      });
    }

    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "All") {
      whereClause.category = category;
    }

    const destinations = await prisma.destination.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(destinations);
  } catch (error) {
    console.error("Failed to fetch public destinations:", error);
    return NextResponse.json({ error: "Failed to fetch destinations" }, { status: 500 });
  }
}
