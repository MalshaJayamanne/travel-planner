"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { User, Settings, Compass, Wallet, Save } from "lucide-react";

type UserProfile = {
  name: string | null;
  email: string;
  image: string | null;
};

type Preference = {
  interests: string;
  travelStyle: string;
};

type ProfileManagerProps = {
  stats: {
    totalTrips: number;
    totalBudget: number;
    totalWishlist: number;
  };
};

export function ProfileManager({ stats }: ProfileManagerProps) {
  const { update } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<Preference>({ interests: "", travelStyle: "" });
  
  const [profileForm, setProfileForm] = useState({ name: "", image: "" });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefsMessage, setPrefsMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      const [profileRes, prefsRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/preferences")
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data);
        setProfileForm({ name: data.name || "", image: data.image || "" });
      }

      if (prefsRes.ok) {
        const data = await prefsRes.json();
        if (data) setPreferences({ interests: data.interests || "", travelStyle: data.travelStyle || "" });
      }
    }
    void loadData();
  }, []);

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm)
      });
      if (!res.ok) throw new Error("Failed to update profile");
      setProfileMessage("Profile updated successfully!");
      await update({ name: profileForm.name, image: profileForm.image }); // Sync the session so the navbar avatar updates instantly
    } catch (err: any) {
      setProfileMessage(err.message);
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleSavePreferences(e: FormEvent) {
    e.preventDefault();
    setIsSavingPrefs(true);
    setPrefsMessage("");
    try {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences)
      });
      if (!res.ok) throw new Error("Failed to update preferences");
      setPrefsMessage("Travel preferences updated!");
    } catch (err: any) {
      setPrefsMessage(err.message);
    } finally {
      setIsSavingPrefs(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Trips</p>
            <p className="text-2xl font-bold text-slate-800">{stats.totalTrips}</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Budget Tracked</p>
            <p className="text-2xl font-bold text-slate-800">Rs. {stats.totalBudget.toLocaleString()}</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600">
            <User className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Wishlist Places</p>
            <p className="text-2xl font-bold text-slate-800">{stats.totalWishlist}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <Settings className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-bold text-slate-800">Account Settings</h2>
          </div>

          {profileMessage && (
            <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${profileMessage.includes("success") ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
              {profileMessage}
            </div>
          )}

          <div className="mb-6 flex flex-col items-center">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-slate-50 bg-slate-200 shadow-sm">
              <img
                alt="Profile preview"
                className="h-full w-full object-cover"
                src={profileForm.image || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile?.email || 'User'}`}
              />
            </div>
            <p className="mt-2 text-xs font-medium text-slate-500 uppercase tracking-widest">Avatar Preview</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1.5 block">Email</span>
              <input
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
                disabled
                value={profile?.email || ""}
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1.5 block">Display Name</span>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={profileForm.name}
                onChange={e => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1.5 block">Avatar URL (Optional)</span>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={profileForm.image}
                onChange={e => setProfileForm(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://example.com/avatar.jpg"
              />
            </label>

            <button
              disabled={isSavingProfile}
              type="submit"
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {isSavingProfile ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </section>

        {/* Travel Preferences */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <Compass className="h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-800">Travel Preferences</h2>
              <p className="text-xs text-slate-500 mt-1">Used by AI to curate your smart itineraries.</p>
            </div>
          </div>

          {prefsMessage && (
            <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${prefsMessage.includes("updated") ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
              {prefsMessage}
            </div>
          )}

          <form onSubmit={handleSavePreferences} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1.5 block">Interests & Hobbies</span>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                value={preferences.interests}
                onChange={e => setPreferences(prev => ({ ...prev, interests: e.target.value }))}
                placeholder="e.g. Fine dining, modern art, hiking, local markets..."
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1.5 block">Travel Style</span>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={preferences.travelStyle}
                onChange={e => setPreferences(prev => ({ ...prev, travelStyle: e.target.value }))}
                placeholder="e.g. Relaxed, Adventure, Luxury, Budget Backpacker"
              />
            </label>

            <button
              disabled={isSavingPrefs}
              type="submit"
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {isSavingPrefs ? "Saving..." : "Save Preferences"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
