"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Compass,
  BrainCircuit,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";

type Stats = {
  totalUsers: number;
  activeUsers: number;
  totalTrips: number;
  totalItineraries: number;
};

type Destination = {
  name: string;
  trips: number;
};

type AIHistory = {
  date: string;
  requests: number;
};

type AnalyticsData = {
  stats: Stats;
  popularDestinations: Destination[];
  aiHistory: AIHistory[];
};

export default function AdminOverview() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/admin/analytics");
        if (!res.ok) throw new Error("Failed to load analytics.");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl bg-red-50 p-6 border border-red-200 text-red-700 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold">Error Loading Analytics</h3>
          <p className="text-sm mt-1 text-red-500">{error || "Unable to display analytics."}</p>
        </div>
      </div>
    );
  }

  const { stats, popularDestinations, aiHistory } = data;

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      sub: `${stats.activeUsers} active`,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      label: "Active Users",
      value: stats.activeUsers.toLocaleString(),
      sub: `${stats.totalUsers - stats.activeUsers} suspended`,
      icon: ShieldCheck,
      color: "text-[var(--color-brand-green)]",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      label: "Total Trips",
      value: stats.totalTrips.toLocaleString(),
      sub: "all time",
      icon: Compass,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
    },
    {
      label: "AI Itineraries",
      value: stats.totalItineraries.toLocaleString(),
      sub: "generated",
      icon: BrainCircuit,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
  ];

  const tooltipStyle = {
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#334155",
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-slate-800">Platform Overview</h2>
        <p className="text-sm text-slate-500 mt-1">Real-time platform analytics and telemetry</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="admin-stat-card p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.label}
                </p>
                <p className="mt-3 text-3xl font-bold text-slate-800 tracking-tight">
                  {card.value}
                </p>
                <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg} border ${card.border}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Request Volume */}
        <div className="admin-stat-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-serif font-bold text-slate-800">AI Request Volume</h3>
              <p className="text-xs text-slate-400 mt-0.5">Itineraries generated — last 7 days</p>
            </div>
            <TrendingUp className="h-5 w-5 text-slate-400" />
          </div>
          <div className="h-64 w-full">
            {aiHistory.some((d) => d.requests > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={aiHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#e2e8f0" fontSize={11} tickLine={false} tick={{ fill: "#94a3b8" }} />
                  <YAxis stroke="#e2e8f0" fontSize={11} tickLine={false} allowDecimals={false} tick={{ fill: "#94a3b8" }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRequests)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                No AI request data for the last 7 days.
              </div>
            )}
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="admin-stat-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-serif font-bold text-slate-800">Popular Destinations</h3>
              <p className="text-xs text-slate-400 mt-0.5">Top 5 locations planned by users</p>
            </div>
            <Compass className="h-5 w-5 text-slate-400" />
          </div>
          <div className="h-64 w-full">
            {popularDestinations.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularDestinations} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#e2e8f0" fontSize={11} tickLine={false} tick={{ fill: "#94a3b8" }} />
                  <YAxis stroke="#e2e8f0" fontSize={11} tickLine={false} allowDecimals={false} tick={{ fill: "#94a3b8" }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="trips" radius={[4, 4, 0, 0]}>
                    {popularDestinations.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#10b981" : "#0d9488"}
                        opacity={1 - index * 0.12}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                No destination data available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
