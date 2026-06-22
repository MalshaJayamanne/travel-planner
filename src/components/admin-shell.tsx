"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { SignOutButton } from "@/components/sign-out-button";
import {
  LayoutDashboard,
  Users,
  Compass,
  LogOut,
  ShieldCheck,
  Activity,
  ChevronRight,
  Bell,
} from "lucide-react";
import type { ReactNode } from "react";

const adminNavItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/trips", label: "Trips", icon: Compass },
];

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const avatarUrl =
    session?.user?.image ||
    `https://api.dicebear.com/7.x/notionists/svg?seed=${session?.user?.email || "admin"}`;

  return (
    <div className="min-h-screen admin-bg text-slate-900 flex font-sans">
      {/* ─────────── Sidebar ─────────── */}
      <aside className="w-64 admin-sidebar flex flex-col fixed inset-y-0 z-10">
        {/* Brand */}
        <div className="px-6 py-7 border-b border-slate-100">
          <Link href="/admin" className="block">
            <span className="block text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--color-brand-green)]/70 mb-1">
              Horizon Travel
            </span>
            <h1 className="font-serif text-xl font-bold text-slate-800 leading-tight">
              Admin Console
            </h1>
          </Link>
        </div>

        {/* Admin Identity Card */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={avatarUrl}
                alt="Admin"
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-[var(--color-brand-green)]/20"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {session?.user?.name || session?.user?.email?.split("@")[0] || "Admin"}
              </p>
              <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--color-brand-green)] mt-0.5">
                System Administrator
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-5 space-y-1">
          <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400">
            Management
          </p>
          {adminNavItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "admin-nav-active"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <item.icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? "text-[var(--color-brand-green)]" : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  {item.label}
                </span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--color-brand-green)]/60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* System Status & Footer */}
        <div className="px-4 py-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-3">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-emerald-500" />
              System Status
            </span>
            <span className="text-emerald-600 font-semibold">Online</span>
          </div>

          {/* Return to site shortcut */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all group"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-[var(--color-brand-green)] transition-colors" />
            Back to User Dashboard
          </Link>

          {/* Sign out */}
          <SignOutButton className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all group">
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </SignOutButton>
        </div>
      </aside>

      {/* ─────────── Main Content ─────────── */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck className="w-4 h-4 text-[var(--color-brand-green)]" />
            <span className="text-slate-400">/</span>
            <span className="text-slate-700 font-medium capitalize">
              {pathname === "/admin"
                ? "Overview"
                : pathname.split("/").filter(Boolean).slice(1).join(" / ")}
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <button
              className="text-slate-400 hover:text-slate-600 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <img
                src={avatarUrl}
                alt="Admin"
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
              />
              <span className="text-xs font-medium text-slate-500">
                {session?.user?.email}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>

      {/* Global Admin Styles */}
      <style jsx global>{`
        .admin-bg {
          background: #f8fafc;
        }
        .admin-sidebar {
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          box-shadow: 4px 0 24px rgba(0,0,0,0.04);
        }
        .admin-nav-active {
          background: #eaf0ec;
          color: var(--color-brand-green);
          border: 1px solid rgba(34,197,94,0.15);
        }
        .admin-stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          transition: all 0.3s ease;
        }
        .admin-stat-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }
        .admin-table-container {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .admin-table thead {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .admin-table tbody tr {
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.15s ease;
        }
        .admin-table tbody tr:hover {
          background: #f8fafc;
        }
        .admin-table tbody tr:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
}
