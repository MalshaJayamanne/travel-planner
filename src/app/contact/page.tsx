"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "FEEDBACK",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Auto-fill logged-in user details
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setFormData({
          name: session?.user?.name || "",
          email: session?.user?.email || "",
          subject: "",
          category: "FEEDBACK",
          message: "",
        });
      } else {
        setError(data.error || "Failed to submit message.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Block */}
        <div className="bg-white rounded-2xl p-8 border border-[var(--color-brand-border)] text-center shadow-sm">
          <h1 className="font-serif text-3xl font-bold text-[var(--color-brand-green)] flex items-center justify-center gap-3">
            <MessageSquare className="w-8 h-8" />
            Contact & Feedback
          </h1>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            Have a suggestion or facing issues with your itinerary? Let us know and we'll get back to you!
          </p>
        </div>

        {/* Contact Form Card */}
        <div className="bg-white rounded-2xl p-8 border border-[var(--color-brand-border)] shadow-sm">
          {success ? (
            <div className="text-center py-10 space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-50 border border-green-200 text-[var(--color-brand-green)] rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Thank you!</h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Your message has been successfully sent. Our support team will review it shortly.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-4 px-5 py-2.5 bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white text-sm font-semibold rounded-xl transition shadow-sm"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Subject</label>
                  <input
                    type="text"
                    placeholder="Brief summary"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] text-slate-800"
                  >
                    <option value="FEEDBACK">General Feedback</option>
                    <option value="SUPPORT">Technical Support</option>
                    <option value="CONTACT">Contact Team</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Message</label>
                <textarea
                  rows={6}
                  placeholder="Describe your issue or suggestion details in full..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] text-slate-800 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white py-3 text-sm font-semibold transition shadow-sm disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </AppShell>
  );
}
