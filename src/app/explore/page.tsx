"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Compass, Search, MapPin, ImageIcon, AlertCircle } from "lucide-react";

type Destination = {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
};

const CATEGORIES = ["All", "Adventure", "Beach", "Historical", "Nature", "Cultural"];

export default function ExplorePage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetchDestinations();
  }, [search, selectedCategory]);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      setError("");
      
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedCategory !== "All") params.set("category", selectedCategory);

      const res = await fetch(`/api/destinations?${params.toString()}`);
      const data = await res.json();
      
      if (res.ok) {
        setDestinations(data || []);
      } else {
        setError(data.error || "Failed to load destinations.");
      }
    } catch (err) {
      setError("An error occurred while loading destinations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Block */}
        <div className="bg-white rounded-2xl p-8 border border-[var(--color-brand-border)] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[var(--color-brand-green)] flex items-center gap-3">
              <Compass className="w-8 h-8" />
              Explore Destinations
            </h1>
            <p className="text-slate-500 mt-2">
              Discover your next adventure from our curated list of global hotspots.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <input 
              type="text" 
              placeholder="Search destinations..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] text-slate-800"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                selectedCategory === cat
                  ? "bg-[var(--color-brand-green)] border-[var(--color-brand-green)] text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main Grid or Status Views */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="w-8 h-8 border-4 border-[var(--color-brand-green)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-red-700 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-250 rounded-2xl">
            <MapPin className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No destinations found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((item) => (
              <div 
                key={item.id} 
                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col hover:-translate-y-1"
              >
                {/* Image header */}
                <div className="h-44 w-full bg-slate-100 relative overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-8 h-8 stroke-1" />
                    </div>
                  )}

                  {/* Category Pill */}
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-slate-800 px-2.5 py-1 rounded-full border border-slate-150 shadow-sm">
                    {item.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-[var(--color-brand-green)] transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-[var(--color-brand-green)] font-semibold">
                    <MapPin className="w-3.5 h-3.5" /> View location details
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </AppShell>
  );
}
