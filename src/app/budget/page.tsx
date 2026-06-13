import { AppShell } from "@/components/app-shell";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Wallet, TrendingUp, Calendar } from "lucide-react";

export default async function BudgetPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const trips = await db.trip.findMany({
    where: { userId: session.user.id },
    orderBy: { startDate: 'desc' }
  });

  const totalBudget = trips.reduce((acc, trip) => acc + trip.budget, 0);

  return (
    <AppShell
      subtitle="Track your estimated travel budgets"
      title="Budget Overview"
      userEmail={session.user.email}
    >
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Wallet className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-semibold text-slate-500">Total Estimated Budget</h2>
          </div>
          <p className="text-3xl font-bold text-slate-800">${totalBudget.toLocaleString()}</p>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2 flex flex-col justify-center">
          <div className="flex items-center gap-3">
             <TrendingUp className="h-5 w-5 text-blue-500" />
             <p className="text-slate-600 text-sm">You have <span className="font-bold text-slate-800">{trips.length}</span> trips planned. Detailed expense tracking and charts will be available in future updates.</p>
          </div>
        </section>
      </div>

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
            trips.map(trip => (
              <div key={trip.id} className="flex items-center justify-between p-5 hover:bg-slate-50 transition">
                <div>
                  <h3 className="font-semibold text-slate-800">{trip.title}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(trip.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">${trip.budget.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">Estimated</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
}
