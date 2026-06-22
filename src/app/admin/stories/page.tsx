"use client";

import { useEffect, useState } from "react";
import { 
  BookOpen,
  Search, 
  Trash2, 
  X, 
  AlertCircle,
  Check,
  Ban,
  Eye,
  MapPin,
  Calendar,
  User
} from "lucide-react";

type StoryUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

type Story = {
  id: string;
  title: string;
  content: string;
  location: string | null;
  coverUrl: string | null;
  date: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user: StoryUser;
};

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

  // Moderation state
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [previewStory, setPreviewStory] = useState<Story | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Story | null>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stories");
      const data = await res.json();
      if (res.ok) {
        setStories(data.stories || []);
      } else {
        setError(data.error || "Failed to load stories.");
      }
    } catch (err) {
      setError("An error occurred while loading travel stories.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (storyId: string, status: "APPROVED" | "REJECTED") => {
    try {
      setActioningId(storyId);
      const res = await fetch("/api/admin/stories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId, status }),
      });

      if (res.ok) {
        // Update local state
        setStories(prev => prev.map(s => s.id === storyId ? { ...s, status } : s));
        if (previewStory && previewStory.id === storyId) {
          setPreviewStory(prev => prev ? { ...prev, status } : null);
        }
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update story status.");
      }
    } catch (err) {
      alert("An error occurred during updating status.");
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setActioningId(deleteConfirm.id);
      const res = await fetch(`/api/admin/stories?storyId=${deleteConfirm.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setStories(prev => prev.filter(s => s.id !== deleteConfirm.id));
        setDeleteConfirm(null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete story.");
      }
    } catch (err) {
      alert("An error occurred during deletion.");
    } finally {
      setActioningId(null);
    }
  };

  // Filter and search
  const filteredStories = stories.filter((story) => {
    const matchesSearch = 
      story.title.toLowerCase().includes(search.toLowerCase()) ||
      story.content.toLowerCase().includes(search.toLowerCase()) ||
      (story.location && story.location.toLowerCase().includes(search.toLowerCase())) ||
      (story.user.name && story.user.name.toLowerCase().includes(search.toLowerCase())) ||
      story.user.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === "ALL" || story.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-slate-800">Travel Stories Moderation</h2>
        <p className="text-sm text-slate-500 mt-1">Review, approve, reject, or remove stories published by travelers.</p>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status filters */}
        <div className="flex flex-wrap gap-1.5">
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                filterStatus === status
                  ? "bg-[var(--color-brand-green)] border-[var(--color-brand-green)] text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {status === "ALL" ? "All Stories" : status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search stories, authors, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[var(--color-brand-green)] focus:ring-4 focus:ring-[var(--color-brand-green)]/10"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-4 border-[var(--color-brand-green)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-5 border border-red-200 p-6 text-red-700 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
          <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No stories found matching your filter selections.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => {
            const isActioning = actioningId === story.id;
            return (
              <div 
                key={story.id} 
                className={`bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col ${
                  isActioning ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {/* Cover Image */}
                <div className="h-44 bg-slate-100 relative overflow-hidden flex-shrink-0">
                  {story.coverUrl ? (
                    <img 
                      src={story.coverUrl} 
                      alt={story.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <BookOpen className="h-10 w-10 stroke-1" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm ${
                    story.status === "APPROVED"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : story.status === "REJECTED"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {story.status}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Title & Location */}
                  <div className="mb-2">
                    {story.location && (
                      <span className="text-[10px] font-bold text-[var(--color-brand-green)] uppercase flex items-center gap-0.5 mb-1">
                        <MapPin className="h-3 w-3" /> {story.location}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-slate-800 line-clamp-1 leading-snug">{story.title}</h3>
                  </div>

                  {/* Excerpt */}
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4 flex-1">
                    {story.content}
                  </p>

                  {/* Author Card */}
                  <div className="flex items-center gap-2.5 border-t border-slate-100 pt-3 flex-shrink-0">
                    <img 
                      src={story.user.image || `https://api.dicebear.com/7.x/notionists/svg?seed=${story.user.email}`} 
                      alt={story.user.name || "Avatar"} 
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-100"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-slate-700 truncate">{story.user.name || "Traveler"}</p>
                      <p className="text-[9px] text-slate-400 truncate flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5" />
                        {new Date(story.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 flex-shrink-0">
                    <button
                      onClick={() => setPreviewStory(story)}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg transition"
                    >
                      <Eye className="h-3.5 w-3.5" /> Inspect
                    </button>

                    <div className="flex items-center gap-1.5">
                      {story.status !== "APPROVED" && (
                        <button
                          onClick={() => handleUpdateStatus(story.id, "APPROVED")}
                          className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 border border-transparent hover:border-green-200 transition"
                          title="Approve Story"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      {story.status !== "REJECTED" && (
                        <button
                          onClick={() => handleUpdateStatus(story.id, "REJECTED")}
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition"
                          title="Reject Story"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteConfirm(story)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Delete Story"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect Story Modal */}
      {previewStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <section className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 flex-shrink-0">
              <h3 className="text-lg font-bold text-slate-800 truncate pr-6">
                Inspect Story: {previewStory.title}
              </h3>
              <button
                onClick={() => setPreviewStory(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 py-2 space-y-4">
              {previewStory.coverUrl && (
                <img 
                  src={previewStory.coverUrl} 
                  alt={previewStory.title} 
                  className="w-full h-48 object-cover rounded-xl border border-slate-100"
                />
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 bg-slate-50 border border-slate-150 rounded-xl p-3">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  Author: <strong>{previewStory.user.name || "Traveler"} ({previewStory.user.email})</strong>
                </span>
                {previewStory.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[var(--color-brand-green)]" />
                    Location: <strong>{previewStory.location}</strong>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Published: {new Date(previewStory.date).toLocaleDateString()}
                </span>
                <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${
                  previewStory.status === "APPROVED" ? "bg-green-50 text-green-700 border-green-200" :
                  previewStory.status === "REJECTED" ? "bg-red-50 text-red-700 border-red-200" :
                  "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  {previewStory.status}
                </span>
              </div>

              <div className="text-sm text-slate-600 leading-relaxed space-y-3 font-sans whitespace-pre-wrap">
                {previewStory.content}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between gap-3 flex-shrink-0">
              <div className="flex gap-2">
                {previewStory.status !== "APPROVED" && (
                  <button
                    onClick={() => handleUpdateStatus(previewStory.id, "APPROVED")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-xs font-semibold transition shadow-sm"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                )}
                {previewStory.status !== "REJECTED" && (
                  <button
                    onClick={() => handleUpdateStatus(previewStory.id, "REJECTED")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-xs font-semibold transition shadow-sm"
                  >
                    <Ban className="h-3.5 w-3.5" /> Reject
                  </button>
                )}
              </div>
              <button
                onClick={() => setPreviewStory(null)}
                className="rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-4 py-2 text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <section className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-5 border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Delete Story</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Permanently delete the story <strong className="text-slate-800">"{deleteConfirm.title}"</strong>? 
              This will remove all text contents and details. <span className="text-red-600 font-semibold">This action cannot be undone.</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 py-2.5 text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!!actioningId}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white py-2.5 text-sm font-semibold transition shadow-sm disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
