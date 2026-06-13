import { AppShell } from "@/components/app-shell";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userId = session.user.id;

  const [trips, upcomingTrips, expenses] = await Promise.all([
    db.trip.count({ where: { userId } }),
    db.trip.count({ where: { userId, startDate: { gt: new Date() } } }),
    db.trip.findMany({ where: { userId }, select: { budget: true } }) // Approximate expenses with total budget for now since Expenses aren't fully implemented
  ]);

  const totalBudget = expenses.reduce((acc, t) => acc + t.budget, 0);

  const stats = [
    { label: "Total trips", value: trips.toString() },
    { label: "Upcoming trips", value: upcomingTrips.toString() },
    { label: "Estimated expenses", value: `$${totalBudget.toLocaleString()}` },
  ];

  return (
    <AppShell
      subtitle="Your trip planning overview"
      title="Dashboard"
      userEmail={session?.user.email}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <section
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            key={stat.label}
          >
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
          </section>
        ))}
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Recent activity</h2>
        <p className="mt-2 text-sm text-slate-600">
          Trip and expense activity will appear here as the core modules are
          completed.
        </p>
      </section>
    </AppShell>
  );
}
