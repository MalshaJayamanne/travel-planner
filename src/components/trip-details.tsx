"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import MapView from "@/components/map-view-dynamic";
import { WeatherWidget } from "@/components/weather-widget";
import { ItineraryEditor } from "@/components/itinerary-editor";
import {
  Sparkles,
  Calendar,
  DollarSign,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  TrendingUp,
  ListTodo,
  AlertCircle
} from "lucide-react";
import type { Trip, Itinerary, ItineraryActivity, Expense } from "@prisma/client";

type ItineraryWithActivities = Itinerary & { activityItems: ItineraryActivity[] };
type TripWithItinerary = Trip & { itineraries: ItineraryWithActivities[] };

const BUDGET_CATEGORIES: Record<string, string[]> = {
  "Accommodation": ["Hotel", "Hostel", "Guest House", "Resort"],
  "Transportation": ["Bus", "Train", "Taxi", "Tuk Tuk", "Car Rental", "Fuel"],
  "Food & Beverages": ["Breakfast", "Lunch", "Dinner", "Snacks", "Drinks"],
  "Activities": ["Entrance Fees", "Safari", "Hiking", "Water Sports", "Cultural Activities"],
  "Shopping": ["Souvenirs", "Clothing", "Gifts"],
  "Miscellaneous": ["Medical", "Emergency", "Other"]
};

const LKR_TO_USD = 300.0; // Conversion rate: 1 USD = 300 LKR

export function TripDetails({ trip }: { trip: TripWithItinerary }) {
  const searchParams = useSearchParams();
  const defaultTab = searchParams ? (searchParams.get("tab") === "budget" ? "budget" : "itinerary") : "itinerary";

  const [itineraries, setItineraries] = useState<ItineraryWithActivities[]>(trip.itineraries);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  // Tab State: "itinerary" or "budget"
  const [activeTab, setActiveTab] = useState<"itinerary" | "budget">(defaultTab);

  // Budget States
  const [tripBudget, setTripBudget] = useState<number>(trip.budget);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState<string>(trip.budget.toString());
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  // Expense List States
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);

  // Expense Form States
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Accommodation");
  const [expenseSubcategory, setExpenseSubcategory] = useState("Hotel");
  const [expenseDate, setExpenseDate] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [isSavingExpense, setIsSavingExpense] = useState(false);

  // Update default subcategory when category changes
  useEffect(() => {
    const subs = BUDGET_CATEGORIES[expenseCategory];
    if (subs && subs.length > 0) {
      setExpenseSubcategory(subs[0]);
    }
  }, [expenseCategory]);

  // Set default date to today
  useEffect(() => {
    setExpenseDate(new Date().toISOString().split("T")[0]);
  }, []);

  // Fetch Expenses
  useEffect(() => {
    async function loadExpenses() {
      try {
        setIsLoadingExpenses(true);
        const res = await fetch(`/api/trips/${trip.id}/expenses`);
        if (res.ok) {
          const data = await res.json();
          setExpenses(data);
        }
      } catch (err) {
        console.error("Failed to load expenses:", err);
      } finally {
        setIsLoadingExpenses(false);
      }
    }
    loadExpenses();
  }, [trip.id]);

  const handleGenerateItinerary = async () => {
    // Warn if existing itinerary has progress that will be lost
    const hasProgress = itineraries.some((it) =>
      it.activityItems?.some((a) => a.status === "COMPLETED" || a.status === "ONGOING")
    );
    if (hasProgress) {
      const ok = window.confirm(
        "Regenerating will reset all activity progress (Completed/Ongoing marks). Continue?"
      );
      if (!ok) return;
    }

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


  // Activity Status Updates

  const handleToggleActivityStatus = async (itineraryId: string, activityId: string, currentStatus: string) => {
    let nextStatus = "UPCOMING";
    if (currentStatus === "UPCOMING") nextStatus = "ONGOING";
    else if (currentStatus === "ONGOING") nextStatus = "COMPLETED";

    // Optimistic Update
    setItineraries(prev =>
      prev.map(it => {
        if (it.id === itineraryId) {
          return {
            ...it,
            activityItems: it.activityItems.map(act =>
              act.id === activityId ? { ...act, status: nextStatus } : act
            ),
          };
        }
        return it;
      })
    );

    try {
      const res = await fetch(`/api/trips/${trip.id}/itinerary/activities/${activityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        throw new Error("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      // Revert status on error
      setItineraries(prev =>
        prev.map(it => {
          if (it.id === itineraryId) {
            return {
              ...it,
              activityItems: it.activityItems.map(act =>
                act.id === activityId ? { ...act, status: currentStatus } : act
              ),
            };
          }
          return it;
        })
      );
    }
  };

  // Budget Update
  const handleSaveBudget = async () => {
    const val = parseFloat(newBudget);
    if (isNaN(val) || val < 0) {
      alert("Please enter a valid budget amount.");
      return;
    }

    setIsSavingBudget(true);
    try {
      const res = await fetch(`/api/trips/${trip.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: val }),
      });
      if (res.ok) {
        setTripBudget(val);
        setIsEditingBudget(false);
      } else {
        throw new Error("Failed to save budget");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update budget.");
    } finally {
      setIsSavingBudget(false);
    }
  };

  // Expense CRUD Handlers
  const handleAddOrEditExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(expenseAmount);
    if (!expenseTitle.trim()) {
      alert("Please enter an expense title.");
      return;
    }
    if (isNaN(amountVal) || amountVal <= 0) {
      alert("Please enter a valid amount in LKR.");
      return;
    }

    setIsSavingExpense(true);
    const payload = {
      title: expenseTitle.trim(),
      amount: amountVal,
      category: expenseCategory,
      subcategory: expenseSubcategory,
      date: expenseDate ? new Date(expenseDate).toISOString() : new Date().toISOString(),
      description: expenseDescription.trim(),
    };

    try {
      if (editingExpenseId) {
        const res = await fetch(`/api/trips/${trip.id}/expenses/${editingExpenseId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setExpenses(prev => prev.map(exp => exp.id === editingExpenseId ? updated : exp));
          resetExpenseForm();
        } else {
          throw new Error("Failed to edit expense");
        }
      } else {
        const res = await fetch(`/api/trips/${trip.id}/expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const created = await res.json();
          setExpenses(prev => [created, ...prev]);
          resetExpenseForm();
        } else {
          throw new Error("Failed to add expense");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error saving expense.");
    } finally {
      setIsSavingExpense(false);
    }
  };

  const handleStartEditExpense = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setExpenseTitle(exp.title);
    setExpenseAmount(exp.amount.toString());
    setExpenseCategory(exp.category);
    setExpenseSubcategory(exp.subcategory || "");
    setExpenseDate(exp.date ? new Date(exp.date).toISOString().split("T")[0] : "");
    setExpenseDescription(exp.description || "");
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      const res = await fetch(`/api/trips/${trip.id}/expenses/${expenseId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
      } else {
        throw new Error("Failed to delete expense");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting expense.");
    }
  };

  const resetExpenseForm = () => {
    setEditingExpenseId(null);
    setExpenseTitle("");
    setExpenseAmount("");
    setExpenseCategory("Accommodation");
    setExpenseSubcategory(BUDGET_CATEGORIES["Accommodation"][0]);
    setExpenseDate(new Date().toISOString().split("T")[0]);
    setExpenseDescription("");
  };

  // Progress Calculations
  const totalActivities = itineraries.reduce((sum, item) => sum + (item.activityItems?.length || 0), 0);
  const completedActivities = itineraries.reduce((sum, item) => sum + (item.activityItems?.filter(act => act.status === "COMPLETED").length || 0), 0);
  const progressPercent = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
  const remainingActivities = totalActivities - completedActivities;

  // Expense Calculations
  const totalBudgetLKR = tripBudget;
  const totalBudgetUSD = totalBudgetLKR / LKR_TO_USD;
  const totalExpensesLKR = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalExpensesUSD = totalExpensesLKR / LKR_TO_USD;
  const remainingBudgetLKR = totalBudgetLKR - totalExpensesLKR;
  const remainingBudgetUSD = remainingBudgetLKR / LKR_TO_USD;
  const utilizationPercent = totalBudgetLKR > 0 ? Math.min(Math.round((totalExpensesLKR / totalBudgetLKR) * 100), 200) : 0;

  // Weather widget target
  const weatherTarget = trip.city || trip.destination;

  return (
    <div className="space-y-6">
      {/* Premium Header Tab Selector */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("itinerary")}
          className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === "itinerary"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <ListTodo className="h-4 w-4" />
          Itinerary & Maps
        </button>
        <button
          onClick={() => setActiveTab("budget")}
          className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === "budget"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Budget & Expenses
        </button>
      </div>

      {activeTab === "itinerary" ? (
        <div className="space-y-6">
          {/* Main Grid: Details, Weather, Map */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Left Column: Details & Weather */}
            <div className="space-y-6 md:col-span-1">
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800">Trip Overview</h2>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium">Destination:</span>{" "}
                    {trip.destination}
                    {trip.city ? `, ${trip.city}` : ""}
                    {trip.country ? `, ${trip.country}` : ""}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium">Dates:</span>{" "}
                    {new Date(trip.startDate).toLocaleDateString()} -{" "}
                    {new Date(trip.endDate).toLocaleDateString()}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      <span className="font-medium">Budget:</span> Rs. {tripBudget.toLocaleString()}
                    </p>
                  </div>
                </div>
              </section>

              <WeatherWidget destination={weatherTarget} />
            </div>

            {/* Right Column: Map */}
            <div className="md:col-span-2">
              <MapView destination={trip.destination} city={trip.city} country={trip.country} />
            </div>
          </div>

          {/* Progress Tracker Card */}
          {itineraries.length > 0 && totalActivities > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-slate-700">Trip Progress</span>
                    <span className="text-sm font-bold text-emerald-600">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
                <div className="flex gap-4 text-xs font-semibold">
                  <div className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-center min-w-[70px]">
                    <div className="text-lg font-bold">{completedActivities}</div>
                    <div>Completed</div>
                  </div>
                  <div className="bg-slate-50 text-slate-600 px-3 py-2 rounded-lg text-center min-w-[70px]">
                    <div className="text-lg font-bold">{remainingActivities}</div>
                    <div>Remaining</div>
                  </div>
                  <div className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-center min-w-[70px]">
                    <div className="text-lg font-bold">{totalActivities}</div>
                    <div>Total</div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
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
                <>
                  <ItineraryEditor
                    itineraries={itineraries.map((day) => ({
                      id: day.id,
                      day: day.day,
                      summary: typeof day.activities === "string" ? day.activities : undefined,
                      activities: day.activityItems.map((act) => ({
                        id: act.id,
                        title: act.title,
                        timeOfDay: act.timeOfDay as "Morning" | "Afternoon" | "Evening",
                        travelTime: act.travelTime ?? "",
                        suggestedAttraction: act.suggestedAttraction ?? "",
                        notes: act.notes ?? "",
                        status: act.status,
                      })),
                    }))}
                    tripId={trip.id}
                    onRegenerate={(updatedItineraries) => setItineraries(updatedItineraries)}
                    onToggleStatus={handleToggleActivityStatus}
                  />
                </>
              )}
            </div>
          </section>
        </div>
      ) : (
        /* Budget & Expenses Tab */
        <div className="space-y-6">
          {/* Top Metrics Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Budget Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Budget</span>
                {isEditingBudget ? (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-semibold text-slate-600">Rs.</span>
                    <input
                      type="number"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveBudget(); }}
                      className="w-full text-base font-bold text-slate-800 border border-slate-300 rounded px-2 py-1 max-w-[120px] outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleSaveBudget}
                      disabled={isSavingBudget}
                      className="bg-emerald-600 text-white rounded p-1 hover:bg-emerald-700"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingBudget(false);
                        setNewBudget(tripBudget.toString());
                      }}
                      className="bg-slate-100 text-slate-500 rounded p-1 hover:bg-slate-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold text-slate-800">Rs. {tripBudget.toLocaleString()}</span>
                    <button
                      onClick={() => setIsEditingBudget(true)}
                      className="text-slate-400 hover:text-slate-600 transition"
                      title="Edit Budget"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <span className="text-xs text-slate-500 font-semibold mt-2">
                ≈ $ {totalBudgetUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
              </span>
            </div>

            {/* Total Expenses Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between min-h-[110px]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Expenses</span>
                <div className="mt-1 text-2xl font-bold text-slate-800">
                  Rs. {totalExpensesLKR.toLocaleString()}
                </div>
              </div>
              <span className="text-xs text-slate-500 font-semibold mt-2">
                ≈ $ {totalExpensesUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
              </span>
            </div>

            {/* Remaining Budget Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between min-h-[110px]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Remaining Budget</span>
                <div className={`mt-1 text-2xl font-bold ${remainingBudgetLKR < 0 ? "text-red-600" : "text-emerald-600"}`}>
                  Rs. {remainingBudgetLKR.toLocaleString()}
                </div>
              </div>
              <span className="text-xs text-slate-500 font-semibold mt-2">
                ≈ $ {remainingBudgetUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
              </span>
            </div>

            {/* Budget Utilization Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between min-h-[110px]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Utilization</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-2xl font-bold text-slate-800">{utilizationPercent}%</span>
                  {utilizationPercent > 100 && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                      Over Budget
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    utilizationPercent > 100 ? "bg-red-500" : utilizationPercent > 80 ? "bg-yellow-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${utilizationPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Content Columns: Add/Edit Expense Form & Expenses List */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Left Column: Add / Edit Expense Form */}
            <div className="md:col-span-1">
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                  <span>{editingExpenseId ? "Edit Expense" : "Add New Expense"}</span>
                  {editingExpenseId && (
                    <button
                      onClick={resetExpenseForm}
                      className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 font-semibold"
                    >
                      <X className="h-3 w-3" /> Cancel Edit
                    </button>
                  )}
                </h3>

                <form onSubmit={handleAddOrEditExpense} className="space-y-4">
                  <label className="block text-sm font-semibold text-slate-700">
                    <span className="mb-1.5 block">Title / Item Name</span>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                      placeholder="Airport Tuk Tuk / Hotel resort booking"
                      required
                      value={expenseTitle}
                      onChange={(e) => setExpenseTitle(e.target.value)}
                    />
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    <span className="mb-1.5 block">Amount (LKR)</span>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">Rs.</span>
                      <input
                        type="number"
                        className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-sm outline-none focus:border-emerald-500"
                        placeholder="12000"
                        required
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                      />
                    </div>
                  </label>

                  <div className="grid gap-3 grid-cols-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      <span className="mb-1.5 block">Category</span>
                      <select
                        className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none focus:border-emerald-500 bg-white"
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value)}
                      >
                        {Object.keys(BUDGET_CATEGORIES).map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block text-sm font-semibold text-slate-700">
                      <span className="mb-1.5 block">Subcategory</span>
                      <select
                        className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none focus:border-emerald-500 bg-white"
                        value={expenseSubcategory}
                        onChange={(e) => setExpenseSubcategory(e.target.value)}
                      >
                        {(BUDGET_CATEGORIES[expenseCategory] || []).map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block text-sm font-semibold text-slate-700">
                    <span className="mb-1.5 block">Date</span>
                    <input
                      type="date"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                      required
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                    />
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    <span className="mb-1.5 block">Description / Note</span>
                    <textarea
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 resize-none"
                      placeholder="Extra charge for luggage, taxi tip etc."
                      value={expenseDescription}
                      onChange={(e) => setExpenseDescription(e.target.value)}
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={isSavingExpense}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-75"
                  >
                    <Plus className="h-4 w-4" />
                    {isSavingExpense ? "Saving..." : editingExpenseId ? "Save Changes" : "Add Expense"}
                  </button>
                </form>
              </section>
            </div>

            {/* Right Column: Expenses History List */}
            <div className="md:col-span-2">
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 mb-4">
                  Expense History
                </h3>

                {isLoadingExpenses ? (
                  <div className="py-12 text-center text-sm font-medium text-slate-400">
                    Loading expenses history...
                  </div>
                ) : expenses.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 py-12 text-center">
                    <TrendingUp className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-sm text-slate-500">No expenses recorded yet. Start tracking your budget!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {expenses.map((exp) => (
                      <div
                        key={exp.id}
                        className="flex items-start justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 transition hover:border-slate-300"
                      >
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-800 text-sm">{exp.title}</h4>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold">
                            <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-sm">
                              {exp.category}
                            </span>
                            {exp.subcategory && (
                              <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-sm">
                                {exp.subcategory}
                              </span>
                            )}
                            <span className="text-slate-400">
                              {new Date(exp.date).toLocaleDateString()}
                            </span>
                          </div>
                          {exp.description && (
                            <p className="text-xs text-slate-500 italic mt-1">{exp.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-slate-800 mr-1">
                            Rs. {exp.amount.toLocaleString()}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleStartEditExpense(exp)}
                              className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-slate-200 transition"
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-slate-200 transition"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
