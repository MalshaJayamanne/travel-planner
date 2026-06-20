"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Plus,
  Trash2,
  Image as LucideImage,
  MapPin,
  Camera,
  X,
  Link2,
  Filter,
  Loader2,
  Calendar,
} from "lucide-react";
import Image from "next/image";

type Trip = {
  id: string;
  title: string;
  destination: string;
};

type Photo = {
  id: string;
  url: string;
  caption: string | null;
  location: string | null;
  tripId: string | null;
  createdAt: string;
  trip?: {
    title: string;
    destination: string;
  } | null;
};

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [selectedTripId, setSelectedTripId] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Filter/Search state
  const [filterTripId, setFilterTripId] = useState("all");
  const [searchLocation, setSearchLocation] = useState("");
  
  // Lightbox state
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);

  useEffect(() => {
    fetchPhotos();
    fetchTrips();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/photos");
      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
      }
    } catch (err) {
      console.error("Failed to fetch photos:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrips = async () => {
    try {
      const res = await fetch("/api/trips");
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
      }
    } catch (err) {
      console.error("Failed to fetch trips:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caption", caption);
      formData.append("location", location);
      if (selectedTripId) {
        formData.append("tripId", selectedTripId);
      }

      const res = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        // Reset form
        setFile(null);
        setCaption("");
        setLocation("");
        setSelectedTripId("");
        setShowUploadModal(false);
        // Refresh photos
        fetchPhotos();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to upload photo");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Something went wrong while uploading");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    try {
      const res = await fetch(`/api/photos?id=${photoId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        if (activePhoto?.id === photoId) {
          setActivePhoto(null);
        }
      } else {
        alert("Failed to delete photo");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Filter logic
  const filteredPhotos = photos.filter((photo) => {
    const matchesTrip = filterTripId === "all" || photo.tripId === filterTripId;
    const matchesLocation =
      !searchLocation ||
      (photo.location &&
        photo.location.toLowerCase().includes(searchLocation.toLowerCase()));
    return matchesTrip && matchesLocation;
  });

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Block */}
        <div className="bg-white rounded-2xl p-8 border border-[var(--color-brand-border)] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[var(--color-brand-green)]">
              Travel Photo Gallery
            </h1>
            <p className="text-slate-500 mt-2">
              Capture and preserve your favorite travel moments, organized by trip and destination.
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="self-start md:self-auto bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white px-5 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Camera className="w-4 h-4" />
            Upload Photo
          </button>
        </div>

        {/* Filters and Stats */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
            {/* Filter by Trip */}
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-[var(--color-brand-border)] shadow-xs w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterTripId}
                onChange={(e) => setFilterTripId(e.target.value)}
                className="text-sm bg-transparent outline-none text-slate-700 w-full cursor-pointer"
              >
                <option value="all">All Trips</option>
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Location */}
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-[var(--color-brand-border)] shadow-xs w-full sm:w-auto">
              <MapPin className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search location..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="text-sm bg-transparent outline-none text-slate-700 placeholder-slate-400 w-full"
              />
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-500 tracking-wider uppercase bg-slate-100 px-4 py-2 rounded-full self-end md:self-auto">
            {filteredPhotos.length} {filteredPhotos.length === 1 ? "Photo" : "Photos"} found
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-[var(--color-brand-green)] animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Loading gallery...</p>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-[var(--color-brand-border)]">
            <LucideImage className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-serif text-lg font-bold text-slate-800">No photos yet</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
              {searchLocation || filterTripId !== "all"
                ? "No photos match your current filters."
                : "Upload your first travel photo to start building your gallery."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setActivePhoto(photo)}
                className="group relative rounded-2xl overflow-hidden aspect-square bg-slate-100 border border-[var(--color-brand-border)] shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || "Travel Photo"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                  {photo.caption && (
                    <p className="text-sm font-semibold truncate mb-1">{photo.caption}</p>
                  )}
                  {photo.location && (
                    <span className="text-xs flex items-center gap-1 opacity-90 truncate">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {photo.location}
                    </span>
                  )}
                  {photo.trip && (
                    <span className="text-[10px] mt-1.5 flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full w-fit">
                      <Link2 className="w-2.5 h-2.5" />
                      {photo.trip.title}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-100 shadow-2xl relative animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-[var(--color-brand-green)]" />
                Upload New Photo
              </h3>

              <form onSubmit={handleUpload} className="space-y-4">
                {/* File Upload Drop Area */}
                <div className="border-2 border-dashed border-[var(--color-brand-border)] hover:border-[var(--color-brand-green)] bg-slate-50/50 hover:bg-slate-50 rounded-xl p-6 transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <LucideImage className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm font-semibold text-slate-700">
                    {file ? file.name : "Select or drag an image"}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">Supports PNG, JPG, WEBP</span>
                </div>

                {/* Caption */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Caption
                  </label>
                  <input
                    type="text"
                    placeholder="Short description of this moment"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] outline-none bg-slate-50/50"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Where was this taken?"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] outline-none bg-slate-50/50"
                  />
                </div>

                {/* Trip Association */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Link to Trip (Optional)
                  </label>
                  <select
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] outline-none bg-slate-50/50 cursor-pointer"
                  >
                    <option value="">Do not link to any trip</option>
                    {trips.map((trip) => (
                      <option key={trip.id} value={trip.id}>
                        {trip.title} ({trip.destination})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="w-full bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] disabled:bg-slate-300 text-white rounded-xl py-3 font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm text-sm"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading to Cloudinary...
                    </>
                  ) : (
                    "Upload Image"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Lightbox / Details Modal */}
        {activePhoto && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-200">
              {/* Close Button */}
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-md transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Photo Area */}
              <div className="flex-1 bg-black flex items-center justify-center min-h-[300px] md:min-h-[500px]">
                <img
                  src={activePhoto.url}
                  alt={activePhoto.caption || "Travel Photo"}
                  className="max-h-[60vh] md:max-h-[85vh] max-w-full object-contain"
                />
              </div>

              {/* Sidebar Info Area */}
              <div className="w-full md:w-80 p-8 text-slate-200 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-serif text-xl font-bold text-white">
                      {activePhoto.caption || "Travel Memory"}
                    </h4>
                    <span className="text-xs text-slate-400 block mt-2 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(activePhoto.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {activePhoto.location && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Location
                      </span>
                      <p className="text-sm font-semibold flex items-center gap-1.5 text-slate-300">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        {activePhoto.location}
                      </p>
                    </div>
                  )}

                  {activePhoto.trip && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Associated Trip
                      </span>
                      <p className="text-sm font-semibold flex items-center gap-1.5 text-slate-300">
                        <Link2 className="w-4 h-4 text-emerald-500" />
                        {activePhoto.trip.title} ({activePhoto.trip.destination})
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center">
                  <button
                    onClick={() => handleDelete(activePhoto.id)}
                    className="text-red-400 hover:text-red-500 hover:bg-red-950/20 px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Photo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
