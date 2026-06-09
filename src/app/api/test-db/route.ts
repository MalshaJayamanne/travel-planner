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
    const users = await prisma.user.findMany();
    return NextResponse.json({
      success: true,
      data: users,
      message: "Database connected successfully",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed",
      },
      { status: 500 }
    );
  }
}
