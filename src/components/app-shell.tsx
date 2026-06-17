"use client";

import { SignOutButton } from "@/components/sign-out-button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bell, Compass, Home, LogOut, Settings, User, Wallet, Heart, DollarSign } from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/trips", label: "Trips", icon: Compass },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/currency", label: "Currency", icon: DollarSign },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
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
  backLink?: string;
};

export function AppShell({ children, userEmail, backLink }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  
  // Use session email if not provided via props (for backward compatibility)
  const displayEmail = userEmail || session?.user?.email;
  const avatarUrl = session?.user?.image || `https://api.dicebear.com/7.x/notionists/svg?seed=${displayEmail || 'User'}`;

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
          <button
            id="sidebar-new-trip-btn"
            onClick={() => router.push("/trips")}
            className="w-full bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white rounded-lg py-3 text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span className="text-lg leading-none">+</span>
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
            <button className="text-slate-400 hover:text-slate-600 transition-colors" title="Notifications">
              <Bell className="w-5 h-5" />
            </button>
            <Link href="/profile" className="text-slate-400 hover:text-[var(--color-brand-green)] transition-colors" title="Settings">
              <Settings className="w-5 h-5" />
            </Link>
            {displayEmail && (
              <SignOutButton className="text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                <LogOut className="w-5 h-5" />
              </SignOutButton>
            )}
            <Link href="/profile" className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border-2 border-transparent hover:border-[var(--color-brand-green)] transition-colors shadow-sm focus:outline-none focus:border-[var(--color-brand-green)]">
              <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-10 max-w-6xl mx-auto w-full">
          {backLink && (
            <Link href={backLink} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-[var(--color-brand-green)] mb-6 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m15 18-6-6 6-6"/></svg>
              Back
            </Link>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
