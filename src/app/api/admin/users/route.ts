import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// ─── GET /api/admin/users ──────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            trips: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Failed to fetch admin users:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// ─── PATCH /api/admin/users ────────────────────────────────────────────────
// Body: { userId, action: "suspend" | "reactivate" | "setRole", role?: "ADMIN" | "TRAVELER" }
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { userId, action, role } = body as {
      userId: string;
      action: "suspend" | "reactivate" | "setRole";
      role?: "ADMIN" | "TRAVELER";
    };

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing userId or action." },
        { status: 400 }
      );
    }

    // Prevent admin from suspending themselves
    if (userId === session.user.id && action === "suspend") {
      return NextResponse.json(
        { error: "You cannot suspend your own account." },
        { status: 400 }
      );
    }

    let updatedUser;

    if (action === "suspend") {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
        select: { id: true, isActive: true, role: true },
      });
    } else if (action === "reactivate") {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isActive: true },
        select: { id: true, isActive: true, role: true },
      });
    } else if (action === "setRole") {
      if (!role || !["ADMIN", "TRAVELER"].includes(role)) {
        return NextResponse.json(
          { error: "Invalid role. Must be ADMIN or TRAVELER." },
          { status: 400 }
        );
      }
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: { id: true, isActive: true, role: true },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Must be suspend, reactivate, or setRole." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      {
        error: "Failed to update user.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/admin/users?userId=xxx ───────────────────────────────────
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID." }, { status: 400 });
    }

    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own admin account." },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: "User and all associated data deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      {
        error: "Failed to delete user.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
