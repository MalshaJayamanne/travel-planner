import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const level = searchParams.get("level") || "";
    const category = searchParams.get("category") || "";

    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;

    const logWhere: any = {};
    if (level) logWhere.level = level;
    if (category) logWhere.category = category;

    const logs = await prisma.systemLog.findMany({
      where: logWhere,
      orderBy: { timestamp: "desc" },
      take: 100,
    });

    const externalServices = [
      {
        name: "Currency Rates (Frankfurter)",
        url: "https://api.frankfurter.app/latest",
      },
      {
        name: "Weather Forecast (OpenWeather)",
        url: "https://api.openweathermap.org/data/2.5/weather?q=London&appid=dummy",
      },
      {
        name: "AI Recommendation (Gemini)",
        url: "https://generativelanguage.googleapis.com",
      },
    ];

    const servicePings = await Promise.all(
      externalServices.map(async (service) => {
        const start = Date.now();
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);
          
          const res = await fetch(service.url, { 
            method: "GET",
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          const latency = Date.now() - start;
          return {
            name: service.name,
            status: res.status >= 200 && res.status < 500 ? "ONLINE" : "DEGRADED",
            latency,
          };
        } catch (err) {
          return {
            name: service.name,
            status: "OFFLINE",
            latency: Date.now() - start,
          };
        }
      })
    );

    return NextResponse.json({
      dbLatency,
      logs,
      services: servicePings,
    });
  } catch (error) {
    console.error("Failed to collect telemetry statistics:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    await prisma.systemLog.deleteMany({});
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to clear system logs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
