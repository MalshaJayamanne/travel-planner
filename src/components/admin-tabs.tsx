"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Compass, Users, MapPin, BookOpen, MessageSquare, Activity } from "lucide-react";

export function AdminTabs() {
  const pathname = usePathname();

  const tabs = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/trips", label: "Trips", icon: Compass },
    { href: "/admin/destinations", label: "Destinations", icon: MapPin },
    { href: "/admin/stories", label: "Stories", icon: BookOpen },
    { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
    { href: "/admin/monitoring", label: "Health Logs", icon: Activity },
  ];

  return (
    <div className="border-b border-white/10 mb-6">
      <nav className="flex space-x-1">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(tab.href + "/");

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all border-b-2 -mb-px ${
                isActive
                  ? "text-emerald-400 border-emerald-500 bg-white/5"
                  : "text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
