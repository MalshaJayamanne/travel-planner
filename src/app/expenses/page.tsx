import { AppShell } from "@/components/app-shell";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions);

  return (
    <AppShell
      subtitle="Track travel spending by trip"
      title="Expenses"
      userEmail={session?.user.email}
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Expense tracker</h2>
            <p className="mt-1 text-sm text-slate-600">
              Expense forms, category filters, and charts belong in the next
              implementation slice.
            </p>
          </div>
          <button className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800">
            Add expense
          </button>
        </div>
      </section>
    </AppShell>
  );
}
