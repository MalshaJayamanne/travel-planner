"use client";

import { useEffect, useState } from "react";
import { Search, Compass, Trash2, Calendar, DollarSign, Eye, ShieldAlert, FileText, ArrowRight, AlertCircle } from "lucide-react";


type TripRecord = {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  _count: {
    itineraries: number;
    expenses: number;
    photos: number;
  };
};

type ItineraryItem = {
  id: string;
  day: number;
  activities: string;
};

export default function AdminTrips() {
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioningTripId, setActioningTripId] = useState<string | null>(null);

  // Modal states
  const [selectedTrip, setSelectedTrip] = useState<TripRecord | null>(null);
  const [itineraries, setItineraries] = useState<ItineraryItem[]>([]);
  const [loadingItineraries, setLoadingItineraries] = useState(false);
  const [deleteConfirmTrip, setDeleteConfirmTrip] = useState<TripRecord | null>(null);

  async function fetchTrips(query = "") {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/trips?search=${encodeURIComponent(query)}`);
      if (!res.ok) {
        throw new Error("Failed to load trips.");
      }
      const data = await res.json();
      setTrips(data.trips);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrips(search);
  };

  const handleViewItinerary = async (trip: TripRecord) => {
    setSelectedTrip(trip);
    setLoadingItineraries(true);
    setItineraries([]);
    try {
      const res = await fetch(`/api/admin/trips/${trip.id}/itinerary`);
      if (!res.ok) {
        throw new Error("Failed to load itinerary.");
      }
      const data = await res.json();
      setItineraries(data.itineraries);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to load itinerary.");
    } finally {
      setLoadingItineraries(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!deleteConfirmTrip) return;
    const targetId = deleteConfirmTrip.id;
    setActioningTripId(targetId);

    try {
      const res = await fetch(`/api/admin/trips?tripId=${targetId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to delete trip.");
      }

      setTrips(trips.filter(t => t.id !== targetId));
      setDeleteConfirmTrip(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete trip.");
    } finally {
      setActioningTripId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-white">Trip Management</h2>
        <p className="text-sm text-slate-500 mt-1">Inspect and moderate all user-created trips across the platform.</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
          <input
            type="text"
            placeholder="Search by title, destination, or creator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 text-sm font-semibold transition-colors"
        >
          Search
        </button>
      </form>

      {/* Trips Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-red-400 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-16 admin-stat-card">
          <Compass className="h-10 w-10 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No trips found matching the search criteria.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <div className="overflow-x-auto">
            <table className="admin-table w-full border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trip details</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">User</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Dates</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Budget</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Itinerary</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => {
                  const isActioning = actioningTripId === trip.id;
                  const duration = Math.ceil(
                    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
                  ) + 1;

                  return (
                    <tr key={trip.id} className={isActioning ? "opacity-50 pointer-events-none" : ""}>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white">{trip.title || "Untitled Trip"}</span>
                          <span className="text-emerald-400 text-xs font-semibold mt-0.5 flex items-center gap-1">
                            <Compass className="h-3 w-3" /> {trip.destination || "Not specified"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={trip.user?.image || `https://api.dicebear.com/7.x/notionists/svg?seed=${trip.user?.email}`}
                            alt={trip.user?.name || "Avatar"}
                            className="h-8 w-8 rounded-xl object-cover ring-1 ring-white/10 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{trip.user?.name || "Unnamed"}</p>
                            <p className="text-slate-500 text-[10px] truncate">{trip.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Calendar className="h-3.5 w-3.5 text-slate-600" />
                          <span>{new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                          <ArrowRight className="h-3 w-3 text-slate-700" />
                          <span>{new Date(trip.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          <span className="ml-1 text-[10px] text-slate-600 font-semibold bg-white/5 border border-white/10 rounded px-1">
                            {duration}d
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center text-xs font-bold text-slate-300">
                          <DollarSign className="h-3.5 w-3.5 text-slate-600 -mr-0.5" />
                          {trip.budget.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {trip._count.itineraries > 0 ? (
                          <button
                            onClick={() => handleViewItinerary(trip)}
                            className="inline-flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full text-xs font-semibold border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                          >
                            <FileText className="h-3 w-3" />
                            {trip._count.itineraries} Days (AI)
                          </button>
                        ) : (
                          <span className="text-slate-600 text-xs italic">No itinerary</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {trip._count.itineraries > 0 && (
                            <button
                              onClick={() => handleViewItinerary(trip)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/10 transition-all"
                              title="Inspect Itinerary"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            disabled={isActioning}
                            onClick={() => setDeleteConfirmTrip(trip)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                            title="Delete Trip"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Itinerary Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <section className="w-full max-w-xl bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-white/10 pb-4 mb-4 flex-shrink-0">
              <h3 className="text-xl font-serif font-bold text-white">
                Itinerary: {selectedTrip.title || "Untitled Trip"}
              </h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                Destination: <strong className="text-emerald-400">{selectedTrip.destination}</strong> | Creator: <strong className="text-slate-300">{selectedTrip.user?.name || selectedTrip.user?.email}</strong>
              </p>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4 py-2">
              {loadingItineraries ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : itineraries.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No itinerary activities found for this trip.
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-white/10 space-y-6">
                  {itineraries.map((day) => (
                    <div key={day.id} className="relative">
                      <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-amber-500 bg-[#0f172a]">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      </span>
                      <h4 className="text-sm font-bold text-white">Day {day.day}</h4>
                      <div className="mt-1.5 text-sm text-slate-400 leading-relaxed bg-white/3 border border-white/8 rounded-xl p-3.5">
                        {day.activities.split("\n").map((line, index) => (
                          <p key={index} className="mt-1 first:mt-0">{line}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-4 mt-4 flex-shrink-0">
              <button
                onClick={() => setSelectedTrip(null)}
                className="w-full rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 py-2.5 text-sm font-semibold transition"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <section className="w-full max-w-sm bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/20">
                <ShieldAlert className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Trip</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Permanently delete{" "}
              <strong className="text-white">{deleteConfirmTrip.title || "Untitled Trip"}</strong> to{" "}
              <strong className="text-white">{deleteConfirmTrip.destination}</strong>?
              This will remove all associated budgets, expenses, and itinerary data.{" "}
              <span className="text-red-400 font-semibold">This cannot be undone.</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmTrip(null)}
                className="flex-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 py-2.5 text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTrip}
                disabled={!!actioningTripId}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 text-white py-2.5 text-sm font-semibold transition shadow-sm disabled:opacity-60"
              >
                Delete Trip
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
