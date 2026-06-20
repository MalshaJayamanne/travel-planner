// Currency Converter Service
// Powered by Frankfurter API (European Central Bank data, free, no key required)
// Supported currencies: https://api.frankfurter.app/currencies

export type CurrencyRate = {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
};

export type ConversionResult = {
  from: string;
  to: string;
  amount: number;
  converted: number;
  rate: number;
  timestamp: number;
};

// Only currencies supported by the Frankfurter (ECB) API
// Full list: AUD BGN BRL CAD CHF CNY CZK DKK EUR GBP HKD HUF IDR ILS INR ISK JPY KRW MXN MYR NOK NZD PHP PLN RON SEK SGD THB TRY USD ZAR
export const POPULAR_CURRENCIES = [
  { code: "USD", name: "US Dollar",          symbol: "$",    flag: "🇺🇸" },
  { code: "EUR", name: "Euro",               symbol: "€",    flag: "🇪🇺" },
  { code: "GBP", name: "British Pound",      symbol: "£",    flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen",       symbol: "¥",    flag: "🇯🇵" },
  { code: "AUD", name: "Australian Dollar",  symbol: "A$",   flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar",    symbol: "C$",   flag: "🇨🇦" },
  { code: "CHF", name: "Swiss Franc",        symbol: "Fr",   flag: "🇨🇭" },
  { code: "CNY", name: "Chinese Yuan",       symbol: "¥",    flag: "🇨🇳" },
  { code: "INR", name: "Indian Rupee",       symbol: "₹",    flag: "🇮🇳" },
  { code: "SGD", name: "Singapore Dollar",   symbol: "S$",   flag: "🇸🇬" },
  { code: "HKD", name: "Hong Kong Dollar",   symbol: "HK$",  flag: "🇭🇰" },
  { code: "MYR", name: "Malaysian Ringgit",  symbol: "RM",   flag: "🇲🇾" },
  { code: "THB", name: "Thai Baht",          symbol: "฿",    flag: "🇹🇭" },
  { code: "IDR", name: "Indonesian Rupiah",  symbol: "Rp",   flag: "🇮🇩" },
  { code: "PHP", name: "Philippine Peso",    symbol: "₱",    flag: "🇵🇭" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$",  flag: "🇳🇿" },
  { code: "KRW", name: "South Korean Won",   symbol: "₩",    flag: "🇰🇷" },
  { code: "MXN", name: "Mexican Peso",       symbol: "$",    flag: "🇲🇽" },
  { code: "BRL", name: "Brazilian Real",     symbol: "R$",   flag: "🇧🇷" },
  { code: "ZAR", name: "South African Rand", symbol: "R",    flag: "🇿🇦" },
];

export function getCurrencyInfo(code: string) {
  return (
    POPULAR_CURRENCIES.find((c) => c.code === code) ?? {
      code,
      name: code,
      symbol: code,
      flag: "🌐",
    }
  );
}

/**
 * Fetches all exchange rates for a given base currency.
 * Cached for 1 hour since rates update once per ECB business day.
 */
export async function fetchExchangeRates(baseCurrency = "USD"): Promise<CurrencyRate | null> {
  try {
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${baseCurrency}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error(`Frankfurter API error: ${response.status}`);
    }

    const data = await response.json() as { base: string; date: string; rates: Record<string, number> };

    // Include the base currency itself at rate 1
    const rates: Record<string, number> = { [baseCurrency]: 1, ...data.rates };

    return { base: baseCurrency, rates, timestamp: Date.now() };
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
    return null;
  }
}

/**
 * Converts an amount between two currencies using live rates.
 * Uses cache: 'no-store' so every call gets fresh data — critical for
 * accurate results when the user changes amount/pair rapidly.
 */
export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<ConversionResult | null> {
  // Same currency — no API call needed
  if (from === to) {
    return { from, to, amount, converted: amount, rate: 1, timestamp: Date.now() };
  }

  try {
    // Fetch base rate only (amount=1) so we can calculate any amount client-side
    // This avoids cache misses for every unique amount value
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${from}&to=${to}`,
      { cache: "no-store" } // Always fresh — no stale conversion results
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`Frankfurter error ${response.status}:`, errBody);
      throw new Error(`API error ${response.status}: currency may not be supported`);
    }

    const data = await response.json() as { base: string; date: string; rates: Record<string, number> };

    if (!data.rates || !(to in data.rates)) {
      throw new Error(`No rate found for ${from} → ${to}`);
    }

    // data.rates[to] = rate for 1 unit of `from` → multiply by requested amount
    const rate = data.rates[to] as number;
    const converted = Math.round(amount * rate * 1e6) / 1e6; // 6 dp precision

    return { from, to, amount, converted, rate, timestamp: Date.now() };
  } catch (error) {
    console.error("convertCurrency failed:", error);
    return null;
  }
}
