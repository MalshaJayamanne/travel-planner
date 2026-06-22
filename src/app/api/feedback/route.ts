import { prisma } from "@/lib/prisma";
import { logSystem } from "@/lib/logger";
import { NextResponse } from "next/server";
import { z } from "zod";

const feedbackSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(10),
  category: z.enum(["FEEDBACK", "SUPPORT", "CONTACT"]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid feedback parameters. Message must be at least 10 chars." }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: parsed.data,
    });

    await logSystem({
      level: "INFO",
      message: `User feedback submitted by ${parsed.data.email} under subject: "${parsed.data.subject}"`,
      category: "API",
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
