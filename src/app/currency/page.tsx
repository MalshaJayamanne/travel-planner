import { AppShell } from "@/components/app-shell";
import { CurrencyConverter } from "@/components/currency-converter";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Currency Converter | Horizon Travel",
  description:
    "Convert currencies with live exchange rates for your travel planning needs.",
};

export default async function CurrencyPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  return (
    <AppShell
      title="Currency Converter"
      subtitle="Live exchange rates for your travel budgeting"
      userEmail={session.user.email}
    >
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-slate-800">
            Currency Converter
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            Real-time exchange rates powered by the Frankfurter API (European Central Bank data).
            Rates are updated daily.
          </p>
        </div>

        {/* Converter */}
        <CurrencyConverter />
      </div>
    </AppShell>
  );
}
