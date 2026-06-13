"use client";

import { useState } from "react";
import MapView from "@/components/map-view-dynamic";
import { WeatherWidget } from "@/components/weather-widget";
import { Sparkles, Calendar, DollarSign, MapPin } from "lucide-react";
import type { Trip, Itinerary } from "@prisma/client";

type TripWithItinerary = Trip & { itineraries: Itinerary[] };

export function TripDetails({ trip }: { trip: TripWithItinerary }) {
  const [itineraries, setItineraries] = useState<Itinerary[]>(trip.itineraries);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateItinerary = async () => {
    setIsGenerating(true);
    setError("");
    try {
      const res = await fetch(`/api/trips/${trip.id}/generate`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate itinerary");
      setItineraries(data.itineraries);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Details & Weather */}
        <div className="space-y-6 md:col-span-1">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800">Trip Overview</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span className="font-medium">Destination:</span> {trip.destination}
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-600" />
                <span className="font-medium">Dates:</span> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
              </p>
              <p className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span className="font-medium">Budget:</span> ${trip.budget.toLocaleString()}
              </p>
            </div>
          </section>

          <WeatherWidget destination={trip.destination} />
        </div>

        {/* Right Column: Map */}
        <div className="md:col-span-2">
          <MapView destination={trip.destination} />
        </div>
      </div>

      {/* Itinerary Section */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Smart Itinerary</h2>
            <p className="text-sm text-slate-500">AI-powered daily plan tailored to your preferences.</p>
          </div>
          <button
            onClick={handleGenerateItinerary}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-70"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? "Generating..." : itineraries.length > 0 ? "Regenerate Plan" : "Generate Plan"}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {itineraries.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 py-12 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No itinerary generated yet. Click the button to create one!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {itineraries.map((day) => (
                <div key={day.id} className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                  <h3 className="font-bold text-emerald-700 text-lg">Day {day.day}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {day.activities}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
