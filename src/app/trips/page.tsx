import { AppShell } from "@/components/app-shell";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function TripsPage() {
  const session = await getServerSession(authOptions);

  return (
    <AppShell
      subtitle="Create and manage travel plans"
      title="Trips"
      userEmail={session?.user.email}
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Trip list</h2>
            <p className="mt-1 text-sm text-slate-600">
              Trip CRUD is ready at the API layer and can be connected to this
              page next.
            </p>
          </div>
          <button className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800">
            New trip
          </button>
        </div>
      </section>
    </AppShell>
  );
}
