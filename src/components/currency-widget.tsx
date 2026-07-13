"use client";

import { useEffect, useState } from "react";
import { TrendingUp, ArrowRight } from "lucide-react";
import { getCurrencyInfo } from "@/services/currency";
import Link from "next/link";

type Rate = {
  from: string;
  to: string;
  rate: number;
};

const WIDGET_PAIRS: [string, string][] = [
  ["LKR", "USD"],
  ["LKR", "EUR"],
  ["LKR", "GBP"],
  ["LKR", "JPY"],
  ["LKR", "AUD"],
];

export function CurrencyWidget() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    async function loadRates() {
      try {
        setLoading(true);
        // Fetch all rates from the main system currency base
        const res = await fetch("/api/currency/rates?base=LKR");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        const fetchedRates: Rate[] = WIDGET_PAIRS.map(([from, to]) => ({
          from,
          to,
          rate: data.rates[to] ?? 0,
        }));

        setRates(fetchedRates);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch {
        // Silently fail — widget is non-critical
      } finally {
        setLoading(false);
      }
    }

    void loadRates();
    // Refresh every 15 minutes
    const interval = setInterval(() => void loadRates(), 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-pulse">
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 h-16 w-full" />
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-full rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Widget Header */}
      <div className="bg-gradient-to-r from-[var(--color-brand-green)] to-[#3d7a58] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-bold">Live Rates</span>
        </div>
        {lastUpdated && (
          <span className="text-[10px] text-green-200">{lastUpdated}</span>
        )}
      </div>

      {/* Rate List */}
      <div className="divide-y divide-slate-100">
        {rates.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">
            Exchange rates unavailable
          </div>
        ) : (
          rates.map((r) => {
            const fromInfo = getCurrencyInfo(r.from);
            const toInfo = getCurrencyInfo(r.to);
            return (
              <div
                key={`${r.from}-${r.to}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{fromInfo.flag}</span>
                  <span className="text-xs font-bold text-slate-600">{r.from}</span>
                  <ArrowRight className="h-3 w-3 text-slate-300" />
                  <span className="text-base">{toInfo.flag}</span>
                  <span className="text-xs font-bold text-slate-600">{r.to}</span>
                </div>
                <span className="text-sm font-bold text-slate-800 tabular-nums">
                  {r.rate.toFixed(r.to === "JPY" || r.to === "KRW" ? 2 : 4)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Link to full converter */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
        <Link
          href="/currency"
          id="currency-widget-open-converter"
          className="flex items-center justify-center gap-2 text-xs font-semibold text-[var(--color-brand-green)] hover:underline"
        >
          Open Converter
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
