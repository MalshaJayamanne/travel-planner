import { AppShell } from "@/components/app-shell";
import { BookOpen, BookText } from "lucide-react";

export default function GuidesPage() {
  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Block */}
        <div className="bg-white rounded-2xl p-8 border border-[var(--color-brand-border)] shadow-sm">
          <h1 className="font-serif text-3xl font-bold text-[var(--color-brand-green)] flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            Travel Guides
          </h1>
          <p className="text-slate-500 mt-2">
            Comprehensive resources, packing lists, and tips for your journeys.
          </p>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: "Ultimate Packing List 2026", desc: "Everything you need, nothing you don't." },
            { title: "Navigating Foreign Transit", desc: "A beginner's guide to trains and buses abroad." },
            { title: "Photography Basics", desc: "How to capture memories that last a lifetime." },
            { title: "Budgeting 101", desc: "Stretch your travel funds further without sacrificing fun." }
          ].map((guide, idx) => (
            <div key={idx} className="flex gap-4 items-start bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-colors cursor-pointer group">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <BookText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">{guide.title}</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{guide.desc}</p>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 mt-3 inline-block">Read Guide &rarr;</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </AppShell>
  );
}
