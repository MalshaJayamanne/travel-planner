import { NextResponse } from "next/server";
import { fetchExchangeRates } from "@/services/currency";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const base = searchParams.get("base") ?? "LKR";

  try {
    const rates = await fetchExchangeRates(base.toUpperCase());

    if (!rates) {
      return NextResponse.json(
        { error: "Failed to fetch exchange rates" },
        { status: 502 }
      );
    }

    return NextResponse.json(rates, { status: 200 });
  } catch (error) {
    console.error("Exchange rates API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
