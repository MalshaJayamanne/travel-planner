import { AppShell } from "@/components/app-shell";
import { CurrencyWidget } from "@/components/currency-widget";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  MapPin,
  TrendingUp,
  Calendar,
  DollarSign,
  Plane,
  Sparkles,
  CheckCircle2,
  Clock,
  Circle,
  BookOpen,
  Heart,
  ArrowRight,
  Camera,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userId = session.user.id;

  const [totalTrips, upcomingTripsCount, allTrips, wishlistCount, storyCount] =
    await Promise.all([
      db.trip.count({ where: { userId } }),
      db.trip.count({ where: { userId, startDate: { gt: new Date() } } }),
      db.trip.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 4,
        include: {
          itineraries: {
            include: {
              activityItems: {
                select: { status: true },
              },
            },
          },
        },
      }),
      db.wishlist.count({ where: { userId } }),
      db.story.count({ where: { userId } }),
    ]);

  const totalBudget = allTrips.reduce((acc, t) => acc + t.budget, 0);

  const stats = [
    {
      label: "Total Trips",
      value: totalTrips.toString(),
      sub: `${upcomingTripsCount} upcoming`,
      icon: Plane,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      href: "/trips",
    },
    {
      label: "Est. Budget",
      value: `Rs. ${totalBudget.toLocaleString()}`,
      sub: "across all trips",
      icon: DollarSign,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
      href: "/budget",
    },
    {
      label: "Wishlist",
      value: wishlistCount.toString(),
      sub: "places saved",
      icon: Heart,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-100",
      href: "/wishlist",
    },
    {
      label: "Stories",
      value: storyCount.toString(),
      sub: "travel stories",
      icon: BookOpen,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      href: "/stories",
    },
  ];

  const quickActions = [
    { href: "/trips", label: "Plan a Trip", icon: Plane, desc: "Create a new trip", accent: "emerald" },
    { href: "/currency", label: "Currency", icon: DollarSign, desc: "Live exchange rates", accent: "violet" },
    { href: "/wishlist", label: "Wishlist", icon: Heart, desc: "Places to visit", accent: "rose" },
    { href: "/explore", label: "Explore", icon: MapPin, desc: "Discover Sri Lanka", accent: "blue" },
    { href: "/gallery", label: "Gallery", icon: Camera, desc: "Your travel photos", accent: "amber" },
    { href: "/stories", label: "Stories", icon: BookOpen, desc: "Share your journey", accent: "teal" },
  ];

  const accentMap: Record<string, string> = {
    emerald: "group-hover:border-emerald-300 group-hover:bg-emerald-50/60",
    violet: "group-hover:border-violet-300 group-hover:bg-violet-50/60",
    rose: "group-hover:border-rose-300 group-hover:bg-rose-50/60",
    blue: "group-hover:border-blue-300 group-hover:bg-blue-50/60",
    amber: "group-hover:border-amber-300 group-hover:bg-amber-50/60",
    teal: "group-hover:border-teal-300 group-hover:bg-teal-50/60",
  };

  const iconAccentMap: Record<string, string> = {
    emerald: "text-emerald-600 bg-emerald-50",
    violet: "text-violet-600 bg-violet-50",
    rose: "text-rose-600 bg-rose-50",
    blue: "text-blue-600 bg-blue-50",
    amber: "text-amber-600 bg-amber-50",
    teal: "text-teal-600 bg-teal-50",
  };

  return (
    <AppShell subtitle="Your trip planning overview" title="Dashboard" userEmail={session?.user.email}>

      {/* ── Welcome Banner ── */}
      <div className="mb-8 rounded-2xl overflow-hidden relative bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-7 text-white shadow-lg">
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-6 right-24 h-28 w-28 rounded-full bg-white/10 pointer-events-none" />

        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">Welcome back</p>
            <h1 className="text-2xl font-serif font-bold">
              {session.user.name ?? session.user.email?.split("@")[0] ?? "Traveler"} ✈️
            </h1>
            <p className="text-emerald-100 text-sm mt-2 max-w-sm">
              {upcomingTripsCount > 0
                ? `You have ${upcomingTripsCount} upcoming ${upcomingTripsCount === 1 ? "trip" : "trips"} — let's make them unforgettable.`
                : "Ready to plan your next adventure? Create a trip and let AI build your itinerary."}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Link
                href="/trips"
                className="inline-flex items-center gap-2 rounded-lg bg-white text-emerald-700 px-4 py-2 text-sm font-bold shadow-sm hover:bg-emerald-50 transition-colors"
              >
                <Plane className="h-4 w-4" />
                Plan a Trip
              </Link>
              {upcomingTripsCount > 0 && (
                <Link
                  href="/trips"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-100 hover:text-white transition-colors"
                >
                  View all trips <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
          <div className="hidden md:flex flex-col items-center gap-1 text-white/80">
            <div className="h-16 w-16 rounded-2xl bg-white/15 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200 mt-1">Horizon</span>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`group rounded-xl border ${stat.border} bg-white p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors mt-0.5" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{stat.label}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{stat.sub}</p>
          </Link>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">

          {/* Recent Trips */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">Recent Trips</h2>
              <Link href="/trips" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {allTrips.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-emerald-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600">No trips yet</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">Plan your first Sri Lanka adventure</p>
                <Link
                  href="/trips"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  <Plane className="h-4 w-4" />
                  Plan a Trip
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {allTrips.map((trip) => {
                  const allActivities = trip.itineraries.flatMap((it) => it.activityItems);
                  const total = allActivities.length;
                  const completed = allActivities.filter((a) => a.status === "COMPLETED").length;
                  const ongoing = allActivities.filter((a) => a.status === "ONGOING").length;
                  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;
                  const hasItinerary = trip.itineraries.length > 0;

                  const start = new Date(trip.startDate);
                  const end = new Date(trip.endDate);
                  const now = new Date();
                  const isUpcoming = start > now;
                  const isOngoing = start <= now && end >= now;
                  const isPast = end < now;

                  const statusBadge = isOngoing
                    ? { label: "Ongoing", cls: "bg-blue-100 text-blue-700" }
                    : isUpcoming
                    ? { label: "Upcoming", cls: "bg-emerald-100 text-emerald-700" }
                    : { label: "Past", cls: "bg-slate-100 text-slate-500" };

                  return (
                    <Link
                      key={trip.id}
                      href={`/trips/${trip.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                    >
                      {/* Destination icon */}
                      <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {trip.destination}
                            {trip.city ? `, ${trip.city}` : ""}
                          </p>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusBadge.cls}`}>
                            {statusBadge.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
                          {end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>

                        {/* Progress bar */}
                        {hasItinerary && total > 0 && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-500 transition-all"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                              {completed}/{total} done
                            </span>
                          </div>
                        )}

                        {hasItinerary && total === 0 && (
                          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-emerald-400" /> AI itinerary ready
                          </p>
                        )}

                        {!hasItinerary && (
                          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <Circle className="h-3 w-3" /> No itinerary yet
                          </p>
                        )}
                      </div>

                      {/* Budget */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-slate-700">Rs. {trip.budget.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400">budget</p>
                      </div>

                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-3 gap-3">
              {quickActions.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  id={`dashboard-quick-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`group flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 transition-all ${accentMap[item.accent]}`}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${iconAccentMap[item.accent]}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 leading-tight">{item.label}</span>
                  <span className="text-[11px] text-slate-400">{item.desc}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="space-y-6">
          {/* AI Tip Card */}
          <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">AI Powered</span>
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">Smart Itinerary Generator</p>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Create a trip and let Gemini AI build a full day-by-day plan. You can add specific places and the AI will rebuild around them.
            </p>
            <Link
              href="/trips"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
            >
              <Plane className="h-3.5 w-3.5" />
              Start Planning
            </Link>
          </div>

          {/* Currency Widget */}
          <CurrencyWidget />

          {/* Trip Activity Summary */}
          {allTrips.length > 0 && (() => {
            const allActs = allTrips.flatMap((t) => t.itineraries.flatMap((it) => it.activityItems));
            const done = allActs.filter((a) => a.status === "COMPLETED").length;
            const inprogress = allActs.filter((a) => a.status === "ONGOING").length;
            const upcoming = allActs.filter((a) => a.status === "UPCOMING").length;
            if (allActs.length === 0) return null;
            return (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Activity Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Completed", count: done, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
                    { label: "Ongoing", count: inprogress, icon: Clock, color: "text-blue-600", bg: "bg-blue-100" },
                    { label: "Upcoming", count: upcoming, icon: Circle, color: "text-slate-400", bg: "bg-slate-100" },
                  ].map(({ label, count, icon: Icon, color, bg }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${bg}`}>
                          <Icon className={`h-3.5 w-3.5 ${color}`} />
                        </div>
                        <span className="text-xs font-medium text-slate-600">{label}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-800">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </AppShell>
  );
}
