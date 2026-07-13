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

// Currencies supported by the Frankfurter (ECB) API
// Full list: AUD BGN BRL CAD CHF CNY CZK DKK EUR GBP HKD HUF IDR ILS INR ISK JPY KRW MXN MYR NOK NZD PHP PLN RON SEK SGD THB TRY USD ZAR
// LKR is handled via Open Exchange Rates fallback in the API route
export const POPULAR_CURRENCIES = [
  { code: "USD", name: "US Dollar",          symbol: "$",    flag: "🇺🇸" },
  { code: "EUR", name: "Euro",               symbol: "€",    flag: "🇪🇺" },
  { code: "GBP", name: "British Pound",      symbol: "£",    flag: "🇬🇧" },
  { code: "LKR", name: "Sri Lankan Rupee",   symbol: "Rs",   flag: "🇱🇰" },
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
export async function fetchExchangeRates(baseCurrency = "LKR"): Promise<CurrencyRate | null> {
  try {
    const base = baseCurrency.toUpperCase();

    if (base === "LKR") {
      const [usdRatesResponse, lkrToUsdResponse] = await Promise.all([
        fetch("https://api.frankfurter.app/latest?from=USD", { next: { revalidate: 3600 } }),
        fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 3600 } }),
      ]);

      if (!usdRatesResponse.ok) {
        throw new Error(`Frankfurter API error: ${usdRatesResponse.status}`);
      }

      if (!lkrToUsdResponse.ok) {
        throw new Error(`Open Exchange API error: ${lkrToUsdResponse.status}`);
      }

      const usdRatesData = await usdRatesResponse.json() as { rates: Record<string, number> };
      const lkrData = await lkrToUsdResponse.json() as { rates: Record<string, number> };
      const lkrPerUsd = lkrData.rates?.LKR ?? 310;
      const usdToLkr = 1 / lkrPerUsd;

      const rates: Record<string, number> = {
        LKR: 1,
        USD: usdToLkr,
        ...Object.fromEntries(
          Object.entries(usdRatesData.rates).map(([currency, value]) => [currency, usdToLkr * value])
        ),
      };

      return { base: "LKR", rates, timestamp: Date.now() };
    }

    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${base}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error(`Frankfurter API error: ${response.status}`);
    }

    const data = await response.json() as { base: string; date: string; rates: Record<string, number> };

    // Include the base currency itself at rate 1
    const rates: Record<string, number> = { [base]: 1, ...data.rates };

    return { base, rates, timestamp: Date.now() };
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
// Currencies not supported by Frankfurter — handled via USD bridge with live rate
// LKR rate is fetched from exchangerate-api (free, no key needed for basic rates)
const LKR_UNSUPPORTED_BY_FRANKFURTER = ["LKR"];

async function getLKRtoUSD(): Promise<number> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json() as { rates: Record<string, number> };
      return data.rates["LKR"] || 310; // fallback ~310 LKR/USD
    }
  } catch { /* ignore */ }
  return 310; // safe fallback
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<ConversionResult | null> {
  // Same currency — no API call needed
  if (from === to) {
    return { from, to, amount, converted: amount, rate: 1, timestamp: Date.now() };
  }

  const fromIsLKR = LKR_UNSUPPORTED_BY_FRANKFURTER.includes(from);
  const toIsLKR = LKR_UNSUPPORTED_BY_FRANKFURTER.includes(to);

  // LKR proxy conversion via USD bridge
  if (fromIsLKR || toIsLKR) {
    const lkrPerUsd = await getLKRtoUSD();

    if (from === "LKR" && to === "USD") {
      const rate = 1 / lkrPerUsd;
      return { from, to, amount, converted: Math.round(amount * rate * 1e6) / 1e6, rate, timestamp: Date.now() };
    }
    if (from === "USD" && to === "LKR") {
      return { from, to, amount, converted: Math.round(amount * lkrPerUsd * 1e6) / 1e6, rate: lkrPerUsd, timestamp: Date.now() };
    }

    // Any other pair involving LKR: convert via USD bridge
    if (from === "LKR") {
      // LKR → USD → target
      const amountInUSD = amount / lkrPerUsd;
      const bridgeRes = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${to}`, { cache: "no-store" });
      if (!bridgeRes.ok) return null;
      const bridgeData = await bridgeRes.json() as { rates: Record<string, number> };
      const usdToTarget = bridgeData.rates[to];
      if (!usdToTarget) return null;
      const converted = Math.round(amountInUSD * usdToTarget * 1e6) / 1e6;
      const rate = converted / amount;
      return { from, to, amount, converted, rate, timestamp: Date.now() };
    }

    if (to === "LKR") {
      // source → USD → LKR
      const bridgeRes = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=USD`, { cache: "no-store" });
      if (!bridgeRes.ok) return null;
      const bridgeData = await bridgeRes.json() as { rates: Record<string, number> };
      const sourceToUsd = bridgeData.rates["USD"];
      if (!sourceToUsd) return null;
      const amountInUSD = amount * sourceToUsd;
      const converted = Math.round(amountInUSD * lkrPerUsd * 1e6) / 1e6;
      const rate = converted / amount;
      return { from, to, amount, converted, rate, timestamp: Date.now() };
    }
  }

  try {
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${from}&to=${to}`,
      { cache: "no-store" }
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

    const rate = data.rates[to] as number;
    const converted = Math.round(amount * rate * 1e6) / 1e6;

    return { from, to, amount, converted, rate, timestamp: Date.now() };
  } catch (error) {
    console.error("convertCurrency failed:", error);
    return null;
  }
}

