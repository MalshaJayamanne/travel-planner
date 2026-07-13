import { AppShell } from "@/components/app-shell";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { Calendar, MapPin, DollarSign, ArrowRight, Wallet } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  // Fetch all trips for the authenticated traveler
  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    orderBy: { startDate: "desc" },
  });

  return (
    <AppShell
      subtitle="Select a trip to manage budget and track expenses"
      title="Expense & Budget Management"
      userEmail={session?.user.email}
    >
      <div className="space-y-6">
        {trips.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 px-4 text-center shadow-xs">
            <Wallet className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-bold text-slate-800">No Trips Found</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
              Before you can track expenses, you need to create a trip. Get started by planning your next getaway!
            </p>
            <Link
              href="/trips"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 shadow-xs"
            >
              Plan a New Trip
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => {
              const datesFormatted = `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`;
              return (
                <article
                  key={trip.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-emerald-300 hover:shadow-md flex flex-col justify-between h-full group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-emerald-700 transition">
                        {trip.title}
                      </h3>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        Rs. {trip.budget.toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-semibold text-slate-500">
                      <p className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          {trip.destination}
                          {trip.city ? `, ${trip.city}` : ""}
                          {trip.country ? `, ${trip.country}` : ""}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{datesFormatted}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-end">
                    <Link
                      href={`/trips/${trip.id}?tab=budget`}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition"
                    >
                      Manage Expenses
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
