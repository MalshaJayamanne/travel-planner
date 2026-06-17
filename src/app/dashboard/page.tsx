import { AppShell } from "@/components/app-shell";
import { CurrencyWidget } from "@/components/currency-widget";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { MapPin, TrendingUp, Calendar, DollarSign, Plane } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userId = session.user.id;

  const [trips, upcomingTrips, expenses] = await Promise.all([
    db.trip.count({ where: { userId } }),
    db.trip.count({ where: { userId, startDate: { gt: new Date() } } }),
    db.trip.findMany({ where: { userId }, select: { budget: true } }),
  ]);

  const totalBudget = expenses.reduce((acc, t) => acc + t.budget, 0);

  const stats = [
    {
      label: "Total Trips",
      value: trips.toString(),
      icon: Plane,
      color: "text-[var(--color-brand-green)]",
      bg: "bg-emerald-50",
    },
    {
      label: "Upcoming Trips",
      value: upcomingTrips.toString(),
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Est. Budget",
      value: `$${totalBudget.toLocaleString()}`,
      icon: DollarSign,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  return (
    <AppShell
      subtitle="Your trip planning overview"
      title="Dashboard"
      userEmail={session?.user.email}
    >
      {/* Welcome Banner */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-[var(--color-brand-green)] to-[#3d7a58] p-7 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">Welcome back</p>
            <h1 className="text-2xl font-serif font-bold mt-1">
              {session.user.name ?? session.user.email?.split("@")[0] ?? "Traveler"} ✈️
            </h1>
            <p className="text-green-100 text-sm mt-2">
              You have {upcomingTrips} upcoming {upcomingTrips === 1 ? "trip" : "trips"} planned.
            </p>
          </div>
          <div className="hidden md:flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <MapPin className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {stats.map((stat) => (
          <section
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            key={stat.label}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
          </section>
        ))}
      </div>

      {/* Main content + Utility sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: Recent Activity */}
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
              <Link
                href="/trips"
                className="text-xs font-semibold text-[var(--color-brand-green)] hover:underline"
              >
                View all trips →
              </Link>
            </div>
            <p className="text-sm text-slate-500">
              Your trip activity will appear here. Plan your first trip to get started.
            </p>
            <Link
              href="/trips"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand-green)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-brand-green-hover)] transition-colors"
            >
              <Plane className="h-4 w-4" />
              Plan a Trip
            </Link>
          </section>

          {/* Quick Links */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-4">Quick Access</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/currency", label: "Currency Converter", icon: DollarSign, desc: "Live exchange rates" },
                { href: "/budget", label: "Budget Planner", icon: TrendingUp, desc: "Track your spending" },
                { href: "/wishlist", label: "Wishlist", icon: MapPin, desc: "Places to visit" },
                { href: "/explore", label: "Explore", icon: Plane, desc: "Discover destinations" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  id={`dashboard-quick-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-[var(--color-brand-green)] hover:bg-[#EAF0EC] transition-all group"
                >
                  <item.icon className="h-5 w-5 text-[var(--color-brand-green)] group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                  <span className="text-xs text-slate-400">{item.desc}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Utility Widgets */}
        <div className="space-y-6">
          {/* Currency Widget */}
          <CurrencyWidget />
        </div>
      </div>
    </AppShell>
  );
}
