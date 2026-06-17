"use client";

import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState, Suspense } from "react";

type Mode = "login" | "register";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [mode, setMode] = useState<Mode>(
    searchParams.get("mode") === "register" ? "register" : "login"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [router, status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error ?? "Registration failed.");
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid email or password.");
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-brand-bg)] px-4 py-8 text-slate-950 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[24px] border border-[var(--color-brand-border)] bg-white shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden bg-[var(--color-brand-green)] p-8 text-white sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1),_transparent_40%)]" />
            <div className="relative z-10 flex flex-col h-full">
              <Link
                className="inline-flex items-center gap-3 text-2xl font-bold font-serif text-white hover:opacity-90 transition-opacity"
                href="/"
              >
                Horizon Travel
              </Link>

              <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-2 shadow-lg backdrop-blur-sm">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Image
                    alt="Travel planning illustration"
                    className="object-cover"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    src="/travel-illustration.jpg"
                  />
                </div>
              </div>

              <div className="mt-auto pt-12">
                <h1 className="max-w-xl text-3xl font-serif font-bold leading-tight sm:text-4xl">
                  Chronicle your journeys in a premium workspace.
                </h1>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base font-light">
                  Curate your destinations, manage budgets, and document stories from every corner of the globe.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center p-6 sm:p-8 lg:p-12">
            <div className="w-full max-w-md mx-auto">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-slate-900">
                    {mode === "login"
                      ? "Welcome back"
                      : "Start your journey"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {mode === "login" 
                      ? "Sign in to access your itineraries and stories."
                      : "Create an account to build your first travel log."}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                <button
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    mode === "login"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  onClick={() => setMode("login")}
                  type="button"
                >
                  Login
                </button>
                <button
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    mode === "register"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  onClick={() => setMode("register")}
                  type="button"
                >
                  Register
                </button>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                {mode === "register" ? (
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Name
                    </span>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brand-green)] focus:ring-4 focus:ring-[var(--color-brand-green)]/10"
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Alex Rivera"
                      required
                      type="text"
                      value={name}
                    />
                  </label>
                ) : null}

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                  </span>
                  <input
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brand-green)] focus:ring-4 focus:ring-[var(--color-brand-green)]/10"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    type="email"
                    value={email}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Password
                  </span>
                  <input
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brand-green)] focus:ring-4 focus:ring-[var(--color-brand-green)]/10"
                    minLength={8}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    required
                    type="password"
                    value={password}
                  />
                </label>

                {error ? (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
                    {error}
                  </p>
                ) : null}

                <button
                  className="w-full mt-2 rounded-xl bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] px-4 py-3.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-70 shadow-sm"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting
                    ? "Please wait..."
                    : mode === "login"
                      ? "Sign In"
                      : "Create Account"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-brand-bg)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--color-brand-green)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
