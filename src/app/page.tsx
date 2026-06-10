import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6">
        <nav className="flex items-center justify-between">
          <span className="text-lg font-semibold">Travel Planner</span>
          <Link
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
            href="/auth"
          >
            Login
          </Link>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight">
              Plan trips, track budgets, and keep every travel detail together.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Create a protected workspace for destinations, dates, notes, and
              expenses before the bigger travel intelligence features arrive.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="rounded-md bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                href="/auth"
              >
                Start planning
              </Link>
              <Link
                className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
                href="/dashboard"
              >
                Open dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-200 pb-4">
              <p className="text-sm font-semibold text-slate-500">
                Upcoming trip
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Tokyo spring plan</h2>
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-slate-500">Dates</dt>
                <dd className="mt-1 font-medium">Apr 12 - Apr 21</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Budget</dt>
                <dd className="mt-1 font-medium">$2,800.00</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Status</dt>
                <dd className="mt-1 font-medium">Planning</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Expenses</dt>
                <dd className="mt-1 font-medium">$640.00 logged</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </main>
  );
}
