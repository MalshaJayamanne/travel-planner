import { AppShell } from "@/components/app-shell";
import { TripDetails } from "@/components/trip-details";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

export default async function TripDetailsPage({ params }: { params: Promise<{ tripId: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return notFound();
  }

  const { tripId } = await params;

  const trip = await db.trip.findUnique({
    where: {
      id: tripId,
      userId: session.user.id,
    },
    include: {
      itineraries: {
        orderBy: { day: 'asc' }
      }
    }
  });

  if (!trip) {
    return notFound();
  }

  return (
    <AppShell
      subtitle={`Viewing details for ${trip.destination}`}
      title={trip.title}
      userEmail={session.user.email}
      backLink="/trips"
    >
      <TripDetails trip={trip} />
    </AppShell>
  );
}
