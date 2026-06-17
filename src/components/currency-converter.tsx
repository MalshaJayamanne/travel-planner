"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeftRight, TrendingUp, RefreshCw, ChevronDown } from "lucide-react";
import { POPULAR_CURRENCIES, getCurrencyInfo } from "@/services/currency";

type ConversionResult = {
  from: string;
  to: string;
  amount: number;
  converted: number;
  rate: number;
  timestamp: number;
};

type CurrencySelectProps = {
  value: string;
  onChange: (code: string) => void;
  id: string;
};

function CurrencySelect({ value, onChange, id }: CurrencySelectProps) {
  const selected = getCurrencyInfo(value);
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-10 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent transition-all cursor-pointer hover:bg-slate-100"
      >
        {POPULAR_CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code} — {c.name}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl">
        {selected.flag}
      </span>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
    </div>
  );
}

export function CurrencyConverter() {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Quick conversion pairs for travel
  const quickPairs = [
    { from: "USD", to: "EUR" },
    { from: "USD", to: "GBP" },
    { from: "USD", to: "JPY" },
    { from: "EUR", to: "USD" },
    { from: "GBP", to: "USD" },
    { from: "AUD", to: "USD" },
  ];

  const handleConvert = useCallback(async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    setLoading(true);
    setError(null);
    // Clear previous result immediately so stale data never shows
    setResult(null);

    try {
      const res = await fetch(
        `/api/currency/convert?from=${from}&to=${to}&amount=${numAmount}`
      );
      if (!res.ok) {
        const errData = await res.json() as { error?: string };
        throw new Error(errData.error ?? "Conversion failed");
      }
      const data = await res.json() as ConversionResult;
      setResult(data);
      setLastUpdated(new Date(data.timestamp).toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [amount, from, to]);

  // Auto-convert when inputs change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const num = parseFloat(amount);
      if (!isNaN(num) && num > 0) {
        void handleConvert();
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [amount, from, to, handleConvert]);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const fromInfo = getCurrencyInfo(from);
  const toInfo = getCurrencyInfo(to);

  return (
    <div className="space-y-6">
      {/* Converter Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--color-brand-green)] to-[#3d7a58] p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Currency Converter</h2>
              <p className="text-sm text-green-100">Live exchange rates via Frankfurter API</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Amount Input */}
          <div>
            <label htmlFor="currency-amount" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                {fromInfo.symbol}
              </span>
              <input
                id="currency-amount"
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 text-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Currency Selectors */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
            <div>
              <label htmlFor="currency-from" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                From
              </label>
              <CurrencySelect value={from} onChange={setFrom} id="currency-from" />
            </div>

            {/* Swap Button */}
            <button
              id="currency-swap-btn"
              onClick={handleSwap}
              className="mb-0.5 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-all hover:bg-[var(--color-brand-green)] hover:text-white hover:border-[var(--color-brand-green)] hover:rotate-180 duration-300"
              title="Swap currencies"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>

            <div>
              <label htmlFor="currency-to" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                To
              </label>
              <CurrencySelect value={to} onChange={setTo} id="currency-to" />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              ⚠️ {error}
            </div>
          )}

          {/* Result */}
          {loading ? (
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 animate-pulse">
              <div className="h-4 w-32 rounded bg-slate-200 mb-3" />
              <div className="h-10 w-48 rounded bg-slate-200" />
            </div>
          ) : result ? (
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                    Converted Amount
                  </p>
                  <p className="text-4xl font-bold text-slate-800">
                    <span className="text-2xl text-slate-500 mr-1">{toInfo.symbol}</span>
                    {result.converted.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {fromInfo.flag} {parseFloat(amount).toLocaleString()} {from}{" = "}
                    {toInfo.flag}{" "}
                    {result.converted.toLocaleString(undefined, { maximumFractionDigits: 4 })} {to}
                  </p>
                </div>
                <button
                  id="currency-refresh-btn"
                  onClick={() => void handleConvert()}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-100 transition-colors"
                  title="Refresh rates"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-emerald-200 flex items-center justify-between text-xs text-slate-500">
                <span>
                  1 {from} = {result.rate.toFixed(6)} {to}
                </span>
                {lastUpdated && <span>Updated {lastUpdated}</span>}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Quick Conversion Pairs */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
          Quick Conversions
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {quickPairs.map((pair) => (
            <button
              key={`${pair.from}-${pair.to}`}
              id={`quick-pair-${pair.from}-${pair.to}`}
              onClick={() => {
                setFrom(pair.from);
                setTo(pair.to);
              }}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all hover:shadow-sm ${
                from === pair.from && to === pair.to
                  ? "border-[var(--color-brand-green)] bg-[#EAF0EC] text-[var(--color-brand-green)]"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[var(--color-brand-green)] hover:bg-[#EAF0EC]"
              }`}
            >
              <span>{getCurrencyInfo(pair.from).flag} {pair.from}</span>
              <ArrowLeftRight className="h-3 w-3 mx-2 text-slate-400" />
              <span>{getCurrencyInfo(pair.to).flag} {pair.to}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rate Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            {fromInfo.flag} Popular Rates vs {from}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Based on current conversion</p>
        </div>
        {result ? (
          <div className="divide-y divide-slate-100">
            {[
              { code: "EUR", name: "Euro" },
              { code: "GBP", name: "British Pound" },
              { code: "JPY", name: "Japanese Yen" },
              { code: "AUD", name: "Australian Dollar" },
              { code: "INR", name: "Indian Rupee" },
              { code: "SGD", name: "Singapore Dollar" },
            ]
              .filter((c) => c.code !== from)
              .slice(0, 5)
              .map((currency) => {
                const info = getCurrencyInfo(currency.code);
                // We only have the current pair result, show estimated relative value
                const isCurrentTo = currency.code === to;
                return (
                  <div
                    key={currency.code}
                    className={`flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors ${isCurrentTo ? "bg-emerald-50/50" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{info.flag}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{info.code}</p>
                        <p className="text-xs text-slate-400">{info.name}</p>
                      </div>
                    </div>
                    <button
                      id={`rate-table-select-${currency.code}`}
                      onClick={() => setTo(currency.code)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                        isCurrentTo
                          ? "bg-[var(--color-brand-green)] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-[#EAF0EC] hover:text-[var(--color-brand-green)]"
                      }`}
                    >
                      {isCurrentTo ? "Selected" : "Convert"}
                    </button>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="p-6 text-center text-sm text-slate-400">
            Enter an amount above to see rates
          </div>
        )}
      </div>
    </div>
  );
}
