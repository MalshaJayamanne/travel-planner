"use client";

import { SignOutButton } from "@/components/sign-out-button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Compass, Home, LogOut, Settings, User, Wallet } from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/trips", label: "Trips", icon: Compass },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/profile", label: "Profile", icon: User },
];

const topNavItems = [
  { href: "/explore", label: "Explore" },
  { href: "/stories", label: "Stories" },
  { href: "/guides", label: "Guides" },
];

type AppShellProps = {
  children: ReactNode;
  userEmail?: string | null;
  // Kept for backward compatibility with pages that still pass these
  title?: string;
  subtitle?: string;
};

export function AppShell({ children, userEmail }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--color-brand-bg)] text-slate-900 flex font-sans">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-[var(--color-brand-border)] flex flex-col fixed inset-y-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8">
          <Link href="/dashboard" className="block">
            <h1 className="font-serif text-2xl font-bold text-[var(--color-brand-green)]">
              Horizon Travel
            </h1>
          </Link>
        </div>

        <div className="px-8 mb-8">
          <h2 className="font-serif text-lg font-bold text-slate-800">Traveler</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Global Explorer</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            // For this design mockup, we'll force '/trips' or '/stories' active logic 
            // but normally it's exact match
            const isActive = pathname === item.href || (pathname === '/stories' && item.href === '/trips');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#EAF0EC] text-[var(--color-brand-green)]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-[var(--color-brand-green)]" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
          <button className="w-full bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white rounded-lg py-3 text-sm font-medium transition-colors shadow-sm">
            New Trip
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Navigation Header */}
        <header className="h-20 flex items-center justify-between px-10 border-b border-[var(--color-brand-border)] bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <nav className="flex gap-8">
            {topNavItems.map((item) => {
              // Force active for /stories for the mockup
              const isActive = pathname === item.href || (item.href === '/stories' && pathname.startsWith('/stories'));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors relative py-2 ${
                    isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-brand-green)] rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            {userEmail && (
              <SignOutButton className="text-slate-400 hover:text-[var(--color-brand-green)] transition-colors" title="Logout">
                <LogOut className="w-5 h-5" />
              </SignOutButton>
            )}
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
              {/* Placeholder Avatar */}
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-10 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
