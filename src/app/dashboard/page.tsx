import { AppShell } from "@/components/app-shell";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const stats = [
    { label: "Total trips", value: "0" },
    { label: "Upcoming trips", value: "0" },
    { label: "Logged expenses", value: "$0.00" },
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
