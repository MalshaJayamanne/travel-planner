import { NextResponse } from "next/server";
import { fetchWeather } from "@/services/weather";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const destination = searchParams.get("destination");

  if (!destination) {
    return NextResponse.json({ error: "Destination is required" }, { status: 400 });
  }

  try {
    const weatherData = await fetchWeather(destination);
    
    if (!weatherData) {
      return NextResponse.json({ error: "Weather data not found" }, { status: 404 });
    }

    return NextResponse.json(weatherData, { status: 200 });
  } catch (error) {
    console.error("Error in weather API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
