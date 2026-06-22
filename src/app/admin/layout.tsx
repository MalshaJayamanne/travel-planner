import { AdminShell } from "@/components/admin-shell";
import { AdminTabs } from "@/components/admin-tabs";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Sub Navigation Tabs */}
        <AdminTabs />

        {/* Child Pages */}
        <div className="min-h-[50vh]">{children}</div>
      </div>
    </AdminShell>
  );
}
