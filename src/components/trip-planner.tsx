"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import type { Trip } from "@/types/trip";

type Preference = {
  id: string;
  interests: string;
  travelStyle: string;
};

type TripFormState = {
  title: string;
  startLocation: string;
  country: string;
  city: string;
  destination: string;
  startDate: string;
  endDate: string;
};

type BudgetFormState = {
  travelers: string;
  dailyBudget: string;
  durationDays: string;
};

type PreferenceFormState = {
  interests: string;
  travelStyle: string;
};

const emptyTripForm: TripFormState = {
  title: "",
  startLocation: "",
  country: "Sri Lanka",
  city: "",
  destination: "",
  startDate: "",
  endDate: "",
};

const emptyBudgetForm: BudgetFormState = {
  travelers: "2",
  dailyBudget: "12000",
  durationDays: "5",
};

const emptyPreferenceForm: PreferenceFormState = {
  interests: "",
  travelStyle: "",
};

export function TripPlanner() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [preferences, setPreferences] = useState<Preference | null>(null);
  const [tripForm, setTripForm] = useState<TripFormState>(emptyTripForm);
  const [budgetForm, setBudgetForm] = useState<BudgetFormState>(emptyBudgetForm);
  const [preferenceForm, setPreferenceForm] = useState<PreferenceFormState>(emptyPreferenceForm);
  const [isSavingTrip, setIsSavingTrip] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [message, setMessage] = useState("");
  const [startLocationSuggestions, setStartLocationSuggestions] = useState<string[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    const query = tripForm.startLocation.trim();
    if (!query) {
      setStartLocationSuggestions([]);
      return;
    }

    const timeout = window.setTimeout(() => {
      void fetch(`/api/destinations?search=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => setStartLocationSuggestions((data || []).map((item: { name: string }) => item.name)))
        .catch(() => setStartLocationSuggestions([]));
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [tripForm.startLocation]);

  useEffect(() => {
    const query = tripForm.destination.trim();
    if (!query) {
      setDestinationSuggestions([]);
      return;
    }

    const timeout = window.setTimeout(() => {
      void fetch(`/api/destinations?search=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => setDestinationSuggestions((data || []).map((item: { name: string }) => item.name)))
        .catch(() => setDestinationSuggestions([]));
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [tripForm.destination]);

  async function loadData() {
    const [tripResponse, preferencesResponse] = await Promise.all([
      fetch("/api/trips"),
      fetch("/api/preferences"),
    ]);

    if (tripResponse.ok) {
      const tripData = (await tripResponse.json()) as Trip[];
      setTrips(tripData);
    }

    if (preferencesResponse.ok) {
      const preferenceData = (await preferencesResponse.json()) as Preference | null;
      if (preferenceData) {
        setPreferences(preferenceData);
        setPreferenceForm({
          interests: preferenceData.interests,
          travelStyle: preferenceData.travelStyle,
        });
      }
    }
  }

  const estimatedBudget = useMemo(() => {
    const travelers = Number(budgetForm.travelers || 1);
    const dailyBudget = Number(budgetForm.dailyBudget || 0);
    const durationDays = Number(budgetForm.durationDays || 1);

    return travelers * dailyBudget * durationDays;
  }, [budgetForm]);

  async function handleCreateTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingTrip(true);
    setMessage("");

    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: tripForm.title,
          startLocation: tripForm.startLocation,
          destination: tripForm.destination,
          country: tripForm.country,
          city: tripForm.city,
          startDate: tripForm.startDate
            ? new Date(`${tripForm.startDate}T00:00:00`).toISOString()
            : new Date().toISOString(),
          endDate: tripForm.endDate
            ? new Date(`${tripForm.endDate}T00:00:00`).toISOString()
            : new Date().toISOString(),
          budget: estimatedBudget,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save trip.");
      }

      setTrips((currentTrips) => [data, ...currentTrips]);
      setTripForm(emptyTripForm);
      setMessage("Trip saved successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save trip.");
    } finally {
      setIsSavingTrip(false);
    }
  }

  async function handleSavePreferences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingPreferences(true);
    setMessage("");

    try {
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interests: preferenceForm.interests,
          travelStyle: preferenceForm.travelStyle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save preferences.");
      }

      setPreferences(data);
      setMessage("Travel preferences saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save preferences.");
    } finally {
      setIsSavingPreferences(false);
    }
  }

  return (
    <div className="space-y-6">
      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Plan a new trip</h2>
              <p className="mt-1 text-sm text-slate-600">
                Add your next adventure and estimate a rough budget instantly.
              </p>
            </div>
          </div>

          <form className="mt-5 space-y-4" onSubmit={handleCreateTrip}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-1.5 block">Trip title</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  onChange={(event) => setTripForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Kandy Spiritual Journey"
                  required
                  value={tripForm.title}
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-1.5 block">Start Location</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  list="start-location-suggestions"
                  onChange={(event) => setTripForm((current) => ({ ...current, startLocation: event.target.value }))}
                  placeholder="Colombo, Sri Lanka"
                  value={tripForm.startLocation}
                />
                <datalist id="start-location-suggestions">
                  {startLocationSuggestions.map((suggestion) => (
                    <option key={suggestion} value={suggestion} />
                  ))}
                </datalist>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-1.5 block">Country</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  onChange={(event) => setTripForm((current) => ({ ...current, country: event.target.value }))}
                  placeholder="Sri Lanka"
                  required
                  value={tripForm.country}
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-1.5 block">City</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  onChange={(event) => setTripForm((current) => ({ ...current, city: event.target.value }))}
                  placeholder="Kandy"
                  required
                  value={tripForm.city}
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1.5 block">Final Destination</span>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                list="destination-suggestions"
                onChange={(event) => setTripForm((current) => ({ ...current, destination: event.target.value }))}
                placeholder="Temple of the Sacred Tooth Relic"
                required
                value={tripForm.destination}
              />
              <datalist id="destination-suggestions">
                {destinationSuggestions.map((suggestion) => (
                  <option key={suggestion} value={suggestion} />
                ))}
              </datalist>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-1.5 block">Start date</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  onChange={(event) => setTripForm((current) => ({ ...current, startDate: event.target.value }))}
                  required
                  type="date"
                  value={tripForm.startDate}
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-1.5 block">End date</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  onChange={(event) => setTripForm((current) => ({ ...current, endDate: event.target.value }))}
                  required
                  type="date"
                  value={tripForm.endDate}
                />
              </label>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Budget calculator</p>
                  <p className="text-sm text-slate-600">Preview a rough trip estimate.</p>
                  <p className="mt-1 text-xs text-slate-500">All estimated costs are calculated for one traveler.</p>
                </div>
                <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                  Rs. {estimatedBudget.toLocaleString()}
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-1.5 block">Travelers</span>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    min="1"
                    onChange={(event) => setBudgetForm((current) => ({ ...current, travelers: event.target.value }))}
                    type="number"
                    value={budgetForm.travelers}
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-1.5 block">Daily budget</span>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    min="0"
                    onChange={(event) => setBudgetForm((current) => ({ ...current, dailyBudget: event.target.value }))}
                    type="number"
                    value={budgetForm.dailyBudget}
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-1.5 block">Days</span>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    min="1"
                    onChange={(event) => setBudgetForm((current) => ({ ...current, durationDays: event.target.value }))}
                    type="number"
                    value={budgetForm.durationDays}
                  />
                </label>
              </div>
            </div>

            <button
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
              disabled={isSavingTrip}
              type="submit"
            >
              {isSavingTrip ? "Saving..." : "Save trip"}
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Travel preferences</h2>
            <p className="mt-1 text-sm text-slate-600">
              Save your favorite interests so future plans can be tailored quickly.
            </p>

            <form className="mt-5 space-y-4" onSubmit={handleSavePreferences}>
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-1.5 block">Interests</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  onChange={(event) => setPreferenceForm((current) => ({ ...current, interests: event.target.value }))}
                  placeholder="Food, beaches, museums"
                  value={preferenceForm.interests}
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-1.5 block">Travel style</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  onChange={(event) => setPreferenceForm((current) => ({ ...current, travelStyle: event.target.value }))}
                  placeholder="Relaxed, adventure, luxury"
                  value={preferenceForm.travelStyle}
                />
              </label>

              <button
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                disabled={isSavingPreferences}
                type="submit"
              >
                {isSavingPreferences ? "Saving..." : "Save preferences"}
              </button>
            </form>

            {preferences ? (
              <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-medium text-slate-800">Current preferences</p>
                <p className="mt-1">Interests: {preferences.interests}</p>
                <p>Style: {preferences.travelStyle}</p>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Saved trips</h2>
            <p className="mt-1 text-sm text-slate-600">Your recent travel plans appear here.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {trips.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-600">
              No trips added yet. Create one to get started.
            </div>
          ) : (
            trips.map((trip) => (
              <Link href={`/trips/${trip.id}`} key={trip.id} className="block transition-transform hover:scale-[1.01]">
                <article className="rounded-lg border border-slate-200 p-4 h-full bg-white transition hover:border-emerald-300 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 transition">{trip.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {trip.destination}{trip.city ? `, ${trip.city}` : ""}{trip.country ? `, ${trip.country}` : ""}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Rs. {trip.budget.toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                  </p>
                </article>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
