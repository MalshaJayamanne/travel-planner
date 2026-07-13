import { AppShell } from "@/components/app-shell";
import { CurrencyWidget } from "@/components/currency-widget";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Wallet, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";

export default async function BudgetPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const trips = await db.trip.findMany({
    where: { userId: session.user.id },
    orderBy: { startDate: "desc" },
  });

  const totalBudget = trips.reduce((acc, trip) => acc + trip.budget, 0);

  return (
    <AppShell
      subtitle="Track your estimated travel budgets"
      title="Budget Overview"
      userEmail={session.user.email}
    >
      {/* Two-column layout: main + sidebar */}
      <div className="grid gap-8 lg:grid-cols-[1fr_320px] items-start">
        {/* Main budget content */}
        <div className="space-y-6">
          {/* Stats Row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Wallet className="h-5 w-5" />
                </div>
                <h2 className="text-sm font-semibold text-slate-500">Total Estimated Budget</h2>
              </div>
              <p className="text-3xl font-bold text-slate-800">Rs. {totalBudget.toLocaleString()}</p>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <p className="text-slate-600 text-sm">
                  You have{" "}
                  <span className="font-bold text-slate-800">{trips.length}</span>{" "}
                  trips planned. Use the currency converter to compare budgets across currencies.
                </p>
              </div>
              <Link
                href="/currency"
                id="budget-open-currency"
                className="mt-3 text-xs font-semibold text-[var(--color-brand-green)] hover:underline self-start"
              >
                Open Currency Converter →
              </Link>
            </section>
          </div>

          {/* Trip Budgets Table */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 p-5 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Trip Budgets</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {trips.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No trips planned yet. Start planning to see your budgets here.
                </div>
              ) : (
                trips.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between p-5 hover:bg-slate-50 transition"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-800">{trip.title}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(trip.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">
                        Rs. {trip.budget.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400">Estimated</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Sidebar: Currency Widget */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Quick Currency Check
          </h3>
          <CurrencyWidget />
          <p className="text-xs text-slate-400 text-center">
            Rates updated hourly · Powered by ECB
          </p>
        </div>
      </div>
    </AppShell>
  );
}
