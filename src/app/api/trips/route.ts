import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// CREATE TRIP
export async function POST(req: Request) {
  const body = await req.json();

  const trip = await prisma.trip.create({
    data: {
      title: body.title,
      destination: body.destination,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      budget: body.budget,
      userId: body.userId,
    },
  });

  return NextResponse.json(trip);
}

// GET TRIPS
export async function GET() {
  const trips = await prisma.trip.findMany();
  return NextResponse.json(trips);
}