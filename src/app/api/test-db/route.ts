import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Missing Authorization header" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  try {
    verifyToken(token);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
  }

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
