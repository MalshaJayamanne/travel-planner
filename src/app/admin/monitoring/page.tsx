"use client";

import { useEffect, useState } from "react";
import { 
  Activity,
  AlertCircle,
  Database,
  Globe,
  Compass,
  RefreshCw,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";

type SystemLog = {
  id: string;
  level: "INFO" | "WARN" | "ERROR";
  message: string;
  category: "API" | "DATABASE" | "AI" | "AUTH";
  timestamp: string;
};

type ServicePing = {
  name: string;
  status: "ONLINE" | "DEGRADED" | "OFFLINE";
  latency: number;
};

export default function AdminMonitoringPage() {
  const [dbLatency, setDbLatency] = useState<number | null>(null);
  const [services, setServices] = useState<ServicePing[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const fetchTelemetry = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      
      const res = await fetch("/api/admin/monitoring");
      const data = await res.json();
      
      if (res.ok) {
        setDbLatency(data.dbLatency);
        setServices(data.services || []);
        setLogs(data.logs || []);
        setError("");
      } else {
        setError(data.error || "Failed to fetch telemetry metrics.");
      }
    } catch (err) {
      setError("An error occurred while loading system telemetry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to permanently clear all system telemetry logs?")) return;
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/monitoring", {
        method: "DELETE",
      });

      if (res.ok) {
        setLogs([]);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to clear logs.");
      }
    } catch (err) {
      alert("An error occurred during clearing logs.");
    } finally {
      setRefreshing(false);
    }
  };

  // Filter logs locally
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = filterLevel === "ALL" || log.level === filterLevel;
    const matchesCategory = filterCategory === "ALL" || log.category === filterCategory;
    return matchesSearch && matchesLevel && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-800">System Monitoring</h2>
          <p className="text-sm text-slate-500 mt-1">Monitor API ping latencies, database status, and review system error telemetry logs.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchTelemetry(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={handleClearLogs}
            disabled={logs.length === 0 || refreshing}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" /> Clear Logs
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-4 border-[var(--color-brand-green)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-5 border border-red-200 p-6 text-red-700 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <>
          {/* Health status grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Database Ping */}
            <div className="admin-stat-card bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-xl border ${
                dbLatency !== null && dbLatency < 50 
                  ? "bg-green-50 border-green-100 text-green-600" 
                  : dbLatency !== null && dbLatency < 150 
                  ? "bg-amber-50 border-amber-100 text-amber-600" 
                  : "bg-red-50 border-red-100 text-red-600"
              }`}>
                <Database className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold block">DB Latency</span>
                <span className="text-lg font-bold text-slate-800">{dbLatency !== null ? `${dbLatency} ms` : "OFFLINE"}</span>
                <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${dbLatency !== null && dbLatency < 100 ? "bg-green-500" : "bg-amber-500"}`} />
                  Postgres Connection
                </span>
              </div>
            </div>

            {/* Service Pings */}
            {services.map((service, index) => (
              <div key={index} className="admin-stat-card bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
                <div className={`p-3 rounded-xl border ${
                  service.status === "ONLINE"
                    ? "bg-green-50 border-green-100 text-green-600"
                    : service.status === "DEGRADED"
                    ? "bg-amber-50 border-amber-100 text-amber-600"
                    : "bg-red-50 border-red-100 text-red-600"
                }`}>
                  {service.name.includes("AI") ? <Compass className="h-6 w-6" /> : <Globe className="h-6 w-6" />}
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block truncate w-36">{service.name.split(" ")[0]} API</span>
                  <span className="text-lg font-bold text-slate-800">{service.status === "ONLINE" ? `${service.latency} ms` : service.status}</span>
                  <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${service.status === "ONLINE" ? "bg-green-500" : service.status === "DEGRADED" ? "bg-amber-500" : "bg-red-500"}`} />
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Logs review panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">System Logs Reviewer</h3>
                <p className="text-xs text-slate-500 mt-0.5">Filter, inspect, and analyze system events and exception outputs.</p>
              </div>

              {/* Log filter controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Level selector */}
                <div>
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 outline-none transition focus:border-[var(--color-brand-green)]"
                  >
                    <option value="ALL">All Levels</option>
                    <option value="INFO">INFO</option>
                    <option value="WARN">WARN</option>
                    <option value="ERROR">ERROR</option>
                  </select>
                </div>

                {/* Category selector */}
                <div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 outline-none transition focus:border-[var(--color-brand-green)]"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="API">API</option>
                    <option value="DATABASE">DATABASE</option>
                    <option value="AI">AI</option>
                    <option value="AUTH">AUTH</option>
                  </select>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-[var(--color-brand-green)] focus:ring-4 focus:ring-[var(--color-brand-green)]/10"
                  />
                </div>
              </div>
            </div>

            {/* Logs list table */}
            {filteredLogs.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 border border-slate-150 rounded-xl">
                <Activity className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-semibold">No telemetry logs found matching the filter.</p>
              </div>
            ) : (
              <div className="border border-slate-250 rounded-xl overflow-hidden max-h-[450px] overflow-y-auto">
                <table className="w-full border-collapse text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
                      <th className="px-4 py-3 text-slate-500 font-bold uppercase w-1/12">Level</th>
                      <th className="px-4 py-3 text-slate-500 font-bold uppercase w-1/12">Category</th>
                      <th className="px-4 py-3 text-slate-500 font-bold uppercase">Log Message</th>
                      <th className="px-4 py-3 text-slate-500 font-bold uppercase w-1/5">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold">
                          <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold border ${
                            log.level === "ERROR" 
                              ? "bg-red-50 text-red-700 border-red-200" 
                              : log.level === "WARN"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-green-50 text-green-700 border-green-200"
                          }`}>
                            {log.level === "ERROR" && <XCircle className="h-2.5 w-2.5" />}
                            {log.level === "WARN" && <AlertTriangle className="h-2.5 w-2.5" />}
                            {log.level === "INFO" && <CheckCircle className="h-2.5 w-2.5" />}
                            {log.level}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-600 text-[10px]">
                          {log.category}
                        </td>
                        <td className="px-4 py-3 text-slate-650 font-sans leading-relaxed whitespace-pre-wrap">
                          {log.message}
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {new Date(log.timestamp).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            second: "2-digit"
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
