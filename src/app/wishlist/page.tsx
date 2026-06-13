import { AppShell } from "@/components/app-shell";
import { WishlistManager } from "@/components/wishlist-manager";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);

  return (
    <AppShell
      subtitle="Curate your next dream destination list"
      title="Wishlist"
      userEmail={session?.user.email}
    >
      <WishlistManager />
    </AppShell>
  );
}
