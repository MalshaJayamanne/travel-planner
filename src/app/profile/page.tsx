import { AppShell } from "@/components/app-shell";
import { ProfileManager } from "@/components/profile-manager";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Fetch some quick stats for the user
  const userId = session.user.id;
  
  const [tripsCount, tripsData, wishlistCount] = await Promise.all([
    db.trip.count({ where: { userId } }),
    db.trip.findMany({ where: { userId }, select: { budget: true } }),
    db.wishlist.count({ where: { userId } })
  ]);

  const totalBudget = tripsData.reduce((acc, trip) => acc + trip.budget, 0);

  const stats = {
    totalTrips: tripsCount,
    totalBudget,
    totalWishlist: wishlistCount
  };

  return (
    <AppShell
      subtitle="Manage your account settings and preferences"
      title="Profile"
      userEmail={session.user.email}
    >
      <ProfileManager stats={stats} />
    </AppShell>
  );
}
