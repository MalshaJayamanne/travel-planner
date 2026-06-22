import { hashPassword } from "@/lib/password";
import { createUserRecord, findUserByEmail, prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  try {
    const parsed = registerSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please provide a valid name, email, and password." },
        { status: 400 }
      );
    }

    const { name, password } = parsed.data;
    const email = parsed.data.email.toLowerCase();

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { error: "An account already exists for this email." },
        { status: 409 }
      );
    }

    // Assign ADMIN role if it's the first registered user
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? "ADMIN" : "TRAVELER";

    const user = await createUserRecord({
      name,
      email,
      passwordHash: hashPassword(password),
      role,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json(
      {
        error: "Registration failed. Please try again later.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
