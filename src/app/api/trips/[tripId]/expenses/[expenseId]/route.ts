import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const expenseUpdateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120).optional(),
  amount: z.coerce.number().positive("Amount must be greater than 0").optional(),
  category: z.string().trim().min(1, "Category is required").optional(),
  subcategory: z.string().trim().optional().nullable(),
  date: z.string().optional(),
  description: z.string().trim().optional().nullable(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ tripId: string; expenseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tripId, expenseId } = await params;

    // Verify expense ownership and association with trip
    const expense = await db.expense.findFirst({
      where: { id: expenseId, tripId, userId: session.user.id },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = expenseUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const updatedExpense = await db.expense.update({
      where: { id: expenseId },
      data: {
        ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
        ...(parsed.data.amount !== undefined ? { amount: parsed.data.amount } : {}),
        ...(parsed.data.category !== undefined ? { category: parsed.data.category } : {}),
        ...(parsed.data.subcategory !== undefined ? { subcategory: parsed.data.subcategory } : {}),
        ...(parsed.data.date !== undefined ? { date: new Date(parsed.data.date) } : {}),
        ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
      },
    });

    return NextResponse.json(updatedExpense, { status: 200 });
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ tripId: string; expenseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tripId, expenseId } = await params;

    // Verify expense ownership and association with trip
    const expense = await db.expense.findFirst({
      where: { id: expenseId, tripId, userId: session.user.id },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    await db.expense.delete({
      where: { id: expenseId },
    });

    return NextResponse.json({ success: true, message: "Expense deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
