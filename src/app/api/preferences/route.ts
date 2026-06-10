import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const preferenceSchema = z.object({
  interests: z.string().trim().min(2).max(200),
  travelStyle: z.string().trim().min(2).max(100),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const preferences = await prisma.preference.findFirst({
    where: { userId: session.user.id },
  });

  return NextResponse.json(preferences ?? null);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = preferenceSchema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide valid preferences." }, { status: 400 });
  }

  const existingPreference = await prisma.preference.findFirst({
    where: { userId: session.user.id },
  });

  const preference = existingPreference
    ? await prisma.preference.update({
        where: { id: existingPreference.id },
        data: {
          interests: parsed.data.interests,
          travelStyle: parsed.data.travelStyle,
        },
      })
    : await prisma.preference.create({
        data: {
          userId: session.user.id,
          interests: parsed.data.interests,
          travelStyle: parsed.data.travelStyle,
        },
      });

  return NextResponse.json(preference, { status: 201 });
}
