import { AppShell } from "@/components/app-shell";
import { ArrowRight, Map, Mountain, Plus } from "lucide-react";
import Image from "next/image";

export default function StoriesPage() {
  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Stats Block */}
        <div className="bg-white rounded-2xl p-8 border border-[var(--color-brand-border)] flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-sm">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[var(--color-brand-green)]">
              Chronicles of a Wanderer
            </h1>
            <p className="font-serif italic text-slate-500 mt-2">
              "A journey is best measured in friends, rather than miles."
              <br />
              <span className="text-sm not-italic">— Tim Cahill</span>
            </p>
          </div>

          <div className="flex items-center gap-8 md:gap-12">
            <div className="text-center">
              <p className="font-bold text-3xl text-[var(--color-brand-green)]">42</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                Stories<br />Shared
              </p>
            </div>
            <div className="text-center">
              <p className="font-bold text-3xl text-[var(--color-brand-green)]">18</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                Countries<br />Visited
              </p>
            </div>
            <div className="text-center">
              <p className="font-bold text-3xl text-[var(--color-brand-green)]">124</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                Moments<br />Saved
              </p>
            </div>
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Column 1 */}
          <div className="flex flex-col gap-6">
            {/* Dolomites */}
            <div className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-sm hover:shadow-md transition-shadow">
              <Image 
                src="/images/dolomites_whispers_1781112260648.png" 
                alt="Dolomites" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full inline-block mb-4">
                  Long Read • Italy
                </span>
                <h3 className="font-serif text-3xl font-bold mb-3">Whispers of the Dolomites</h3>
                <p className="text-sm text-white/80 leading-relaxed max-w-sm">
                  Five days spent trekking through the jagged limestone cathedrals of South Tyrol, finding peace in the high-altitude silence.
                </p>
              </div>
            </div>

            {/* Sailing */}
            <div className="group relative rounded-2xl overflow-hidden aspect-[4/3] shadow-sm hover:shadow-md transition-shadow">
              <Image 
                src="/images/venice_sailing_1781112274772.png" 
                alt="Venice Sailing" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/70 block mb-1">
                      Lat/Long
                    </span>
                    <span className="text-xs font-mono bg-white/20 px-2 py-1 rounded inline-block mb-3">
                      45.4408° N, 12.3155° E
                    </span>
                    <h3 className="font-serif text-xl font-bold mb-1">Sailing Through History</h3>
                    <p className="text-xs text-white/80 line-clamp-2">
                      Discovering the forgotten islands of Venice via a traditional bragozzo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Add Your Story */}
            <button className="rounded-2xl border-2 border-dashed border-[var(--color-brand-border)] bg-slate-50/50 hover:bg-slate-50 aspect-video flex flex-col items-center justify-center gap-4 transition-colors group">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-[var(--color-brand-green)]">
                <Plus className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-800">Add Your Story</p>
                <p className="text-xs text-slate-500 mt-1">Upload photos and start your next<br/>travel log entry.</p>
              </div>
            </button>

          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-6">
            {/* Peak Discovery */}
            <div className="bg-white rounded-2xl p-8 border border-[var(--color-brand-border)] shadow-sm">
              <Mountain className="w-6 h-6 text-[var(--color-brand-green)] mb-6" />
              <h3 className="font-serif text-xl font-bold text-slate-900 mb-3">Peak Discovery</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                You've reached an average elevation of 3,200m this year. Your hiking endurance has increased by 15%.
              </p>
              <button className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand-green)] hover:text-[var(--color-brand-green-hover)] flex items-center gap-2 transition-colors">
                View Trail Data <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Kyoto Tea */}
            <div className="group relative rounded-2xl overflow-hidden aspect-[3/4] shadow-sm hover:shadow-md transition-shadow">
              <Image 
                src="/images/kyoto_tea_1781112290845.png" 
                alt="Kyoto" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-[var(--color-brand-green)] px-3 py-1 rounded inline-block mb-3">
                  Kyoto
                </span>
                <h3 className="font-serif text-xl font-bold">The Art of the Tea Ceremony</h3>
              </div>
            </div>

            {/* Scandinavia */}
            <div className="bg-[var(--color-brand-green)] rounded-2xl p-8 shadow-sm text-white flex flex-col justify-between aspect-square">
              <Map className="w-8 h-8 opacity-80" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 block mb-2">
                  Most Visited
                </span>
                <h3 className="font-serif text-2xl font-bold">Scandinavia</h3>
              </div>
            </div>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-6">
            {/* Iceland Moss Image */}
            <div className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-sm hover:shadow-md transition-shadow">
              <Image 
                src="/images/iceland_moss_1781112311190.png" 
                alt="Iceland Moss" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Iceland Moss Text */}
            <div className="bg-white rounded-2xl p-8 border border-[var(--color-brand-border)] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-green)] block mb-3">
                Natural Wonders
              </span>
              <h3 className="font-serif text-2xl font-bold text-slate-900 mb-4">
                The Moss Chronicles
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Iceland's interior is more than just glaciers; it's a study in emerald textures and volcanic silence. A look at the resilience of arctic flora.
              </p>
              <button className="text-xs font-bold text-[var(--color-brand-green)] hover:text-[var(--color-brand-green-hover)] flex items-center gap-2 transition-colors">
                Read Full Story <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
