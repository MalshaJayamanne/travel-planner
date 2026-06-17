import { NextResponse } from "next/server";
import { convertCurrency } from "@/services/currency";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const amountStr = searchParams.get("amount");

  if (!from || !to || !amountStr) {
    return NextResponse.json(
      { error: "Missing required params: from, to, amount" },
      { status: 400 }
    );
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount < 0) {
    return NextResponse.json(
      { error: "Invalid amount value" },
      { status: 400 }
    );
  }

  try {
    const result = await convertCurrency(amount, from.toUpperCase(), to.toUpperCase());

    if (!result) {
      return NextResponse.json(
        { error: "Currency conversion failed. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Currency conversion API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
