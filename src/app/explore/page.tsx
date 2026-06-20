import { AppShell } from "@/components/app-shell";
import { Compass, Search, MapPin } from "lucide-react";

export default function ExplorePage() {
  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Block */}
        <div className="bg-white rounded-2xl p-8 border border-[var(--color-brand-border)] flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-sm">
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
              className="w-full rounded-full border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)]"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Featured Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder Destinations */}
          {[
            { title: "Kyoto, Japan", desc: "Temples and Gardens", img: "bg-emerald-100" },
            { title: "Santorini, Greece", desc: "Sunset Views", img: "bg-blue-100" },
            { title: "Banff, Canada", desc: "Alpine Adventures", img: "bg-slate-200" },
            { title: "Machu Picchu, Peru", desc: "Ancient History", img: "bg-orange-100" },
            { title: "Reykjavik, Iceland", desc: "Northern Lights", img: "bg-teal-100" },
            { title: "Bali, Indonesia", desc: "Tropical Paradise", img: "bg-green-100" }
          ].map((item, idx) => (
            <div key={idx} className="group cursor-pointer rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className={`h-40 w-full ${item.img} flex items-center justify-center`}>
                <MapPin className="w-8 h-8 text-black/10" />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-slate-800 group-hover:text-[var(--color-brand-green)] transition-colors">{item.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </AppShell>
  );
}
