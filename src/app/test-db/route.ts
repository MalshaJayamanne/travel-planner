import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    const [userCount, tripCount, expenseCount] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.expense.count(),
    ]);

    return NextResponse.json({
      success: true,
      tables: {
        users: userCount,
        trips: tripCount,
        expenses: expenseCount,
      },
      message: "Database connected successfully",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
