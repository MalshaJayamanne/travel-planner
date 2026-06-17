import Link from "next/link";
import {
  Plane,
  MapPin,
  Wallet,
  Compass,
  Star,
  ArrowRight,
  Globe,
  Sparkles,
  TrendingUp,
  Shield,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Itinerary Builder",
    description:
      "Generate personalized day-by-day travel plans powered by Gemini AI in seconds.",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    icon: Wallet,
    title: "Smart Budget Tracker",
    description:
      "Set budgets, log expenses, and get real-time insights into your travel spending.",
    color: "from-emerald-500 to-green-600",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: TrendingUp,
    title: "Live Currency Converter",
    description:
      "Convert between 20+ currencies with live ECB rates directly from your dashboard.",
    color: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: MapPin,
    title: "Interactive Maps",
    description:
      "Visualize your routes and destinations on a live interactive map view.",
    color: "from-rose-500 to-pink-600",
    bg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  {
    icon: Globe,
    title: "Destination Explorer",
    description:
      "Browse curated travel guides and community stories from around the world.",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your trips and data are protected with NextAuth authentication and encrypted storage.",
    color: "from-slate-500 to-slate-700",
    bg: "bg-slate-50",
    iconColor: "text-slate-600",
  },
];

const destinations = [
  { name: "Tokyo", country: "Japan", emoji: "🇯🇵", tag: "Cultural" },
  { name: "Santorini", country: "Greece", emoji: "🇬🇷", tag: "Romantic" },
  { name: "Bali", country: "Indonesia", emoji: "🇮🇩", tag: "Tropical" },
  { name: "Paris", country: "France", emoji: "🇫🇷", tag: "Classic" },
  { name: "Safari", country: "Kenya", emoji: "🇰🇪", tag: "Adventure" },
  { name: "New York", country: "USA", emoji: "🇺🇸", tag: "Urban" },
];

const stats = [
  { value: "20+", label: "Currencies Supported" },
  { value: "AI", label: "Itinerary Planning" },
  { value: "∞", label: "Trips to Plan" },
  { value: "100%", label: "Free to Use" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f9f9f7] text-slate-900 font-sans overflow-x-hidden">
      {/* ─── NAV ─── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2a5a40] shadow-sm group-hover:shadow-md transition-shadow">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <span className="font-serif text-xl font-bold text-[#2a5a40]">
              Horizon Travel
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {["Features", "Destinations", "About"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              id="nav-login-btn"
              className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-[#2a5a40] transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              id="nav-register-btn"
              className="flex items-center gap-2 rounded-xl bg-[#2a5a40] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1f422e] hover:shadow-md transition-all"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        {/* Gradient blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#2a5a40]/8 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 right-0 h-[500px] w-[500px] rounded-full bg-blue-400/8 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-60 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-violet-400/6 blur-3xl"
        />

        <div className="mx-auto max-w-7xl px-6 pb-20 pt-20 md:pt-28">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#2a5a40]/20 bg-[#EAF0EC] px-4 py-1.5 text-xs font-semibold text-[#2a5a40]">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Travel Planning · Now Live
            </span>
          </div>

          {/* Headline */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-serif text-5xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl md:text-7xl">
              Your entire trip,{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-[#2a5a40]">beautifully</span>
                <span
                  aria-hidden
                  className="absolute bottom-1 left-0 h-3 w-full -rotate-1 rounded-sm bg-[#2a5a40]/15"
                />
              </span>{" "}
              planned.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-500 max-w-2xl mx-auto">
              Plan destinations, track budgets, convert currencies, and generate
              AI-powered itineraries — all in one beautifully crafted travel workspace.
            </p>
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/register"
              id="hero-cta-primary"
              className="group flex items-center gap-2.5 rounded-2xl bg-[#2a5a40] px-7 py-4 text-base font-bold text-white shadow-lg shadow-[#2a5a40]/25 hover:bg-[#1f422e] hover:shadow-xl hover:shadow-[#2a5a40]/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plane className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              Start Planning Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/login"
              id="hero-cta-secondary"
              className="flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-7 py-4 text-base font-bold text-slate-700 shadow-sm hover:border-[#2a5a40] hover:text-[#2a5a40] hover:shadow-md transition-all duration-200"
            >
              Sign In
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-1">Trusted by travelers worldwide</span>
            </div>
          </div>

          {/* Hero Card Mockup */}
          <div className="mt-16 mx-auto max-w-5xl">
            <div className="relative rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-200/60 overflow-hidden">
              {/* Fake browser chrome */}
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-4">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="mx-auto flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-1.5 text-xs text-slate-400">
                  <span>🔒</span>
                  horizon-travel.app/dashboard
                </div>
              </div>

              {/* App Preview */}
              <div className="grid md:grid-cols-[240px_1fr] min-h-[380px]">
                {/* Sidebar */}
                <div className="border-r border-slate-100 bg-white p-5 hidden md:block">
                  <div className="mb-6">
                    <p className="text-xs font-bold text-[#2a5a40] mb-1">Horizon Travel</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Global Explorer</p>
                  </div>
                  {[
                    { icon: "🏠", label: "Home", active: true },
                    { icon: "✈️", label: "Trips", active: false },
                    { icon: "💰", label: "Budget", active: false },
                    { icon: "💱", label: "Currency", active: false },
                    { icon: "❤️", label: "Wishlist", active: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 mb-1 text-xs font-medium ${
                        item.active
                          ? "bg-[#EAF0EC] text-[#2a5a40]"
                          : "text-slate-500"
                      }`}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </div>
                  ))}
                </div>

                {/* Dashboard preview */}
                <div className="bg-[#f9f9f7] p-6">
                  <div className="mb-5 rounded-2xl bg-gradient-to-r from-[#2a5a40] to-[#3d7a58] p-5 text-white">
                    <p className="text-xs text-green-200 mb-1">Welcome back</p>
                    <p className="text-lg font-bold">Ready to explore? ✈️</p>
                    <p className="text-xs text-green-100 mt-1">3 upcoming trips planned</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: "Total Trips", val: "8", color: "text-[#2a5a40]" },
                      { label: "Upcoming", val: "3", color: "text-blue-600" },
                      { label: "Budget", val: "$4,200", color: "text-violet-600" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl bg-white border border-slate-100 p-3 shadow-sm">
                        <p className="text-[10px] text-slate-400">{s.label}</p>
                        <p className={`text-base font-bold mt-1 ${s.color}`}>{s.val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white border border-slate-100 p-3 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 mb-2">LIVE RATES</p>
                      {[
                        { from: "🇺🇸 USD", to: "🇪🇺 EUR", rate: "0.9182" },
                        { from: "🇺🇸 USD", to: "🇬🇧 GBP", rate: "0.7894" },
                        { from: "🇺🇸 USD", to: "🇯🇵 JPY", rate: "149.32" },
                      ].map((r) => (
                        <div key={r.to} className="flex justify-between text-[10px] py-0.5">
                          <span className="text-slate-500">{r.from} → {r.to}</span>
                          <span className="font-bold text-slate-700">{r.rate}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl bg-white border border-slate-100 p-3 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 mb-2">NEXT TRIP</p>
                      <p className="text-xs font-bold text-slate-800">🇯🇵 Tokyo Spring</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Apr 12 — Apr 21</p>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                        <div className="h-1.5 w-2/3 rounded-full bg-[#2a5a40]" />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">67% planned</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-serif text-4xl font-bold text-[#2a5a40]">{s.value}</p>
                <p className="mt-1 text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF0EC] px-4 py-1.5 text-xs font-semibold text-[#2a5a40] mb-4">
            Everything you need
          </span>
          <h2 className="font-serif text-4xl font-bold text-slate-900">
            Travel smarter, not harder.
          </h2>
          <p className="mt-4 text-slate-500 max-w-xl mx-auto">
            Horizon brings all your travel tools into one seamless experience —
            from AI planning to live currency rates.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${feat.bg} mb-4 group-hover:scale-110 transition-transform`}>
                <feat.icon className={`h-6 w-6 ${feat.iconColor}`} />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── DESTINATIONS ─── */}
      <section id="destinations" className="bg-slate-900 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-slate-300 mb-4">
              <Globe className="h-3.5 w-3.5" />
              Explore the world
            </span>
            <h2 className="font-serif text-4xl font-bold text-white">
              Where will you go next?
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Start planning your dream destinations. From Tokyo to Santorini,
              Horizon has you covered.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {destinations.map((dest) => (
              <div
                key={dest.name}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 text-center hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">
                  {dest.emoji}
                </div>
                <p className="text-sm font-bold text-white">{dest.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{dest.country}</p>
                <span className="mt-2 inline-block rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300">
                  {dest.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section id="about" className="mx-auto max-w-7xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2a5a40] via-[#3d7a58] to-[#2a5a40] p-12 md:p-20 text-center shadow-2xl shadow-[#2a5a40]/20">
          {/* Decorative blobs */}
          <div aria-hidden className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
          <div aria-hidden className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/5 blur-2xl" />

          <div className="relative z-10">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
              <Plane className="h-8 w-8 text-white" />
            </div>
            <h2 className="font-serif text-4xl font-bold text-white md:text-5xl">
              Ready to start your adventure?
            </h2>
            <p className="mt-4 text-green-100 text-lg max-w-xl mx-auto">
              Join and start planning beautiful, organized trips today. It&apos;s completely free.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/register"
                id="cta-section-register"
                className="flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-[#2a5a40] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                <Sparkles className="h-5 w-5" />
                Create Free Account
              </Link>
              <Link
                href="/auth/login"
                id="cta-section-login"
                className="flex items-center gap-2 rounded-2xl border-2 border-white/30 px-8 py-4 text-base font-bold text-white hover:bg-white/10 hover:border-white/50 transition-all duration-200"
              >
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2a5a40]">
              <Compass className="h-4 w-4 text-white" />
            </div>
            <span className="font-serif text-base font-bold text-[#2a5a40]">Horizon Travel</span>
          </div>
          <p className="text-sm text-slate-400">
            © 2026 Horizon Travel. Built with ❤️ for explorers.
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/auth/login" className="hover:text-[#2a5a40] transition-colors">Sign In</Link>
            <Link href="/auth/register" className="hover:text-[#2a5a40] transition-colors">Register</Link>
            <Link href="/dashboard" className="hover:text-[#2a5a40] transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
