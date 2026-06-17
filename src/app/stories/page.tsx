"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import {
  ArrowRight,
  Map,
  Mountain,
  Plus,
  MapPin,
  Calendar,
  Trash2,
  Edit2,
  X,
  Loader2,
  BookOpen,
  Camera,
} from "lucide-react";
import Image from "next/image";

type Story = {
  id: string;
  title: string;
  content: string;
  location: string | null;
  coverUrl: string | null;
  date: string;
  createdAt: string;
};

type Photo = {
  id: string;
  url: string;
  caption: string | null;
};

// Static default stories to populate the UI if the user has no stories
const DEFAULT_STORIES: Story[] = [
  {
    id: "default-1",
    title: "Whispers of the Dolomites",
    content: "Five days spent trekking through the jagged limestone cathedrals of South Tyrol, finding peace in the high-altitude silence. Every ridge line offered a new perspective on time and scale.",
    location: "Italy",
    coverUrl: "/images/dolomites_whispers_1781112260648.png",
    date: "2026-05-10T00:00:00.000Z",
    createdAt: "2026-05-10T00:00:00.000Z",
  },
  {
    id: "default-2",
    title: "Sailing Through History",
    content: "Discovering the forgotten islands of Venice via a traditional wooden bragozzo. The salt air and ancient lagoon secrets came alive under the guidance of our local captain.",
    location: "Venice, Italy",
    coverUrl: "/images/venice_sailing_1781112274772.png",
    date: "2026-05-24T00:00:00.000Z",
    createdAt: "2026-05-24T00:00:00.000Z",
  },
  {
    id: "default-3",
    title: "The Art of the Tea Ceremony",
    content: "An afternoon spent in a quiet tea house in Kyoto, learning the deliberate, meditative steps of matcha preparation. A reminder that beauty is in the details.",
    location: "Kyoto, Japan",
    coverUrl: "/images/kyoto_tea_1781112290845.png",
    date: "2026-06-02T00:00:00.000Z",
    createdAt: "2026-06-02T00:00:00.000Z",
  },
  {
    id: "default-4",
    title: "The Moss Chronicles",
    content: "Iceland's interior is more than just glaciers; it's a study in emerald textures and volcanic silence. A look at the resilience of arctic flora holding onto black basalt sand.",
    location: "Iceland",
    coverUrl: "/images/iceland_moss_1781112311190.png",
    date: "2026-06-12T00:00:00.000Z",
    createdAt: "2026-06-12T00:00:00.000Z",
  },
];

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [coverOption, setCoverOption] = useState<"upload" | "gallery" | "url">("upload");
  const [coverUrl, setCoverUrl] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState("");

  // Story read modal
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  useEffect(() => {
    fetchStoriesAndPhotos();
  }, []);

  const fetchStoriesAndPhotos = async () => {
    try {
      setLoading(true);
      const [storiesRes, photosRes] = await Promise.all([
        fetch("/api/stories"),
        fetch("/api/photos"),
      ]);

      if (storiesRes.ok) {
        const data = await storiesRes.json();
        setStories(data);
      }
      if (photosRes.ok) {
        const data = await photosRes.json();
        setPhotos(data);
      }
    } catch (err) {
      console.error("Failed to load stories data:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingStory(null);
    setTitle("");
    setContent("");
    setLocation("");
    setDate(new Date().toISOString().split("T")[0]);
    setCoverOption("upload");
    setCoverUrl("");
    setUploadFile(null);
    setSelectedGalleryPhoto("");
    setShowModal(true);
  };

  const openEditModal = (story: Story, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingStory(story);
    setTitle(story.title);
    setContent(story.content);
    setLocation(story.location || "");
    setDate(story.date ? new Date(story.date).toISOString().split("T")[0] : "");
    setCoverOption("url");
    setCoverUrl(story.coverUrl || "");
    setUploadFile(null);
    setSelectedGalleryPhoto("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      setSubmitting(true);
      let finalCoverUrl = coverUrl;

      // Handle Image Upload if option selected
      if (coverOption === "upload" && uploadFile) {
        const formData = new FormData();
        formData.append("file", uploadFile);
        formData.append("caption", `Cover: ${title}`);
        formData.append("location", location);
        
        const uploadRes = await fetch("/api/photos", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const photoData = await uploadRes.json();
          finalCoverUrl = photoData.url;
        } else {
          const errData = await uploadRes.json();
          alert(errData.error || "Failed to upload cover photo");
          setSubmitting(false);
          return;
        }
      } else if (coverOption === "gallery" && selectedGalleryPhoto) {
        finalCoverUrl = selectedGalleryPhoto;
      }

      const payload = {
        title,
        content,
        location,
        coverUrl: finalCoverUrl,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
      };

      let res;
      if (editingStory) {
        res = await fetch("/api/stories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingStory.id, ...payload }),
        });
      } else {
        res = await fetch("/api/stories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setShowModal(false);
        fetchStoriesAndPhotos();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save story");
      }
    } catch (err) {
      console.error("Submit story error:", err);
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this travel story?")) return;

    try {
      const res = await fetch(`/api/stories?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setStories((prev) => prev.filter((s) => s.id !== id));
        if (activeStory?.id === id) {
          setActiveStory(null);
        }
      } else {
        alert("Failed to delete story");
      }
    } catch (err) {
      console.error("Delete story error:", err);
    }
  };

  // Combine user stories and defaults
  const allStories = [...stories, ...DEFAULT_STORIES.filter(ds => !stories.some(s => s.title.toLowerCase() === ds.title.toLowerCase()))];

  // Dynamic statistics
  const storiesCount = allStories.length;
  const uniqueLocations = Array.from(
    new Set(
      allStories
        .map((s) => s.location?.split(",")?.pop()?.trim())
        .filter(Boolean)
    )
  ).length;
  const momentsCount = photos.length > 0 ? photos.length : 124; // fallback to 124 if no photos

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
              <p className="font-bold text-3xl text-[var(--color-brand-green)]">{storiesCount}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                Stories<br />Shared
              </p>
            </div>
            <div className="text-center">
              <p className="font-bold text-3xl text-[var(--color-brand-green)]">{uniqueLocations}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                Locations<br />Visited
              </p>
            </div>
            <div className="text-center">
              <p className="font-bold text-3xl text-[var(--color-brand-green)]">{momentsCount}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                Moments<br />Saved
              </p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
          <span className="text-sm font-semibold text-slate-600">
            Share your adventures and review past trips
          </span>
          <button
            onClick={openCreateModal}
            className="bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Write Story
          </button>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Loop through all stories and place them in masonry-like columns */}
          {allStories.map((story, index) => {
            const isUserGenerated = !story.id.startsWith("default-");
            
            return (
              <div
                key={story.id}
                onClick={() => setActiveStory(story)}
                className="group bg-white rounded-2xl overflow-hidden border border-[var(--color-brand-border)] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {story.coverUrl && (
                    <div className="relative w-full aspect-[4/3] bg-slate-100">
                      <img
                        src={story.coverUrl}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                      {story.location && (
                        <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {story.location}
                        </span>
                      )}

                      {/* User story edit/delete buttons */}
                      {isUserGenerated && (
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => openEditModal(story, e)}
                            className="bg-white/80 hover:bg-white p-2 rounded-full text-slate-700 hover:text-[var(--color-brand-green)] transition-colors shadow-xs"
                            title="Edit Story"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(story.id, e)}
                            className="bg-white/80 hover:bg-white p-2 rounded-full text-red-600 hover:text-red-700 transition-colors shadow-xs"
                            title="Delete Story"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(story.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-slate-800 group-hover:text-[var(--color-brand-green)] transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {story.content}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex justify-end">
                  <span className="text-xs font-bold text-[var(--color-brand-green)] group-hover:text-[var(--color-brand-green-hover)] flex items-center gap-1.5">
                    Read Full Story <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 border border-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[var(--color-brand-green)]" />
              {editingStory ? "Edit Travel Story" : "Write a Travel Story"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Story Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lost in the Streets of Rome"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] outline-none bg-slate-50/50 font-semibold text-slate-800"
                />
              </div>

              {/* Location & Date row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rome, Italy"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] outline-none bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Date of Journey
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] outline-none bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Cover Image Choice */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Cover Image
                </label>
                <div className="flex gap-4 border-b border-slate-100 pb-2">
                  <button
                    type="button"
                    onClick={() => setCoverOption("upload")}
                    className={`text-xs font-semibold pb-1 border-b-2 transition-all ${
                      coverOption === "upload"
                        ? "border-[var(--color-brand-green)] text-[var(--color-brand-green)]"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Upload Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverOption("gallery")}
                    className={`text-xs font-semibold pb-1 border-b-2 transition-all ${
                      coverOption === "gallery"
                        ? "border-[var(--color-brand-green)] text-[var(--color-brand-green)]"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Select From Gallery
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverOption("url")}
                    className={`text-xs font-semibold pb-1 border-b-2 transition-all ${
                      coverOption === "url"
                        ? "border-[var(--color-brand-green)] text-[var(--color-brand-green)]"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Image URL
                  </button>
                </div>

                {/* Cover Choice Render */}
                {coverOption === "upload" && (
                  <div className="border-2 border-dashed border-[var(--color-brand-border)] hover:border-[var(--color-brand-green)] bg-slate-50/50 hover:bg-slate-50 rounded-xl p-4 transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Camera className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-700">
                      {uploadFile ? uploadFile.name : "Choose Cover Image"}
                    </span>
                  </div>
                )}

                {coverOption === "gallery" && (
                  <div className="space-y-2">
                    {photos.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No photos in your gallery. Try uploading some first!</p>
                    ) : (
                      <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto p-1 border border-slate-100 rounded-xl">
                        {photos.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => setSelectedGalleryPhoto(p.url)}
                            className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                              selectedGalleryPhoto === p.url
                                ? "border-[var(--color-brand-green)] scale-95"
                                : "border-transparent hover:border-slate-300"
                            }`}
                          >
                            <img src={p.url} alt="Gallery item" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {coverOption === "url" && (
                  <input
                    type="url"
                    placeholder="https://example.com/cover-image.jpg"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[var(--color-brand-green)] outline-none bg-slate-50/50"
                  />
                )}
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Your Story
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Share the details of your trip. What did you see? How did you feel?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] outline-none bg-slate-50/50 resize-y text-slate-700 leading-relaxed"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] disabled:bg-slate-300 text-white rounded-xl py-3 font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Story...
                  </>
                ) : (
                  "Publish Story"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Story View Modal */}
      {activeStory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveStory(null)}
              className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-md transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cover photo */}
            {activeStory.coverUrl && (
              <div className="w-full h-64 sm:h-80 relative bg-slate-100 flex-shrink-0">
                <img src={activeStory.coverUrl} alt={activeStory.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 p-8 text-white">
                  {activeStory.location && (
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-[var(--color-brand-green)] px-3 py-1.5 rounded-full inline-block mb-3">
                      {activeStory.location}
                    </span>
                  )}
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
                    {activeStory.title}
                  </h2>
                </div>
              </div>
            )}

            {/* Story details */}
            <div className="p-8 overflow-y-auto flex-1 space-y-6">
              {!activeStory.coverUrl && (
                <div>
                  {activeStory.location && (
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] px-3 py-1.5 rounded-full inline-block mb-3">
                      {activeStory.location}
                    </span>
                  )}
                  <h2 className="font-serif text-3xl font-bold text-slate-800 leading-tight">
                    {activeStory.title}
                  </h2>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-slate-400 pb-4 border-b border-slate-100">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(activeStory.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                {activeStory.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {activeStory.location}
                  </span>
                )}
              </div>

              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {activeStory.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
