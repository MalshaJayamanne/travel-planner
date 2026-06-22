import { prisma } from "./prisma";

export async function logSystem({
  level,
  message,
  category,
}: {
  level: "INFO" | "WARN" | "ERROR";
  message: string;
  category: "API" | "DATABASE" | "AI" | "AUTH";
}) {
  try {
    await prisma.systemLog.create({
      data: {
        level,
        message,
        category,
      },
    });
  } catch (err) {
    console.error("Failed to write to SystemLog:", err);
  }
}
