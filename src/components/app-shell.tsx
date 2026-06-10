import { SignOutButton } from "@/components/sign-out-button";
import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/trips", label: "Trips" },
  { href: "/expenses", label: "Expenses" },
];

type AppShellProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  userEmail?: string | null;
};

export function AppShell({
  children,
  title,
  subtitle,
  userEmail,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[240px_1fr]">
        <aside className="border-b border-slate-200 bg-white px-5 py-4 lg:border-b-0 lg:border-r">
          <Link className="block text-lg font-semibold" href="/dashboard">
            Travel Planner
          </Link>
          <nav className="mt-5 flex gap-2 lg:flex-col">
            {navItems.map((item) => (
              <Link
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="flex flex-col gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{title}</h1>
              {subtitle ? (
                <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              {userEmail ? (
                <span className="text-sm text-slate-600">{userEmail}</span>
              ) : null}
              <SignOutButton />
            </div>
          </header>

          <main className="flex-1 px-5 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
