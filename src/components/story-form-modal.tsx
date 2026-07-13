"use client";
import { useState } from "react";
import { X, BookOpen, Camera, Loader2, Plus, Trash2 } from "lucide-react";

type Photo = { id: string; url: string; caption: string | null };
type UploadedImage = { url: string; publicId?: string; order: number };

type Props = {
  editingStory?: {
    id: string; title: string; content: string; location: string | null;
    coverUrl: string | null; date: string;
    images?: { url: string; order?: number }[];
  } | null;
  photos: Photo[];
  onClose: () => void;
  onSaved: () => void;
};

export function StoryFormModal({ editingStory, photos, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(editingStory?.title || "");
  const [content, setContent] = useState(editingStory?.content || "");
  const [location, setLocation] = useState(editingStory?.location || "");
  const [date, setDate] = useState(
    editingStory?.date ? new Date(editingStory.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
  );
  const [coverOption, setCoverOption] = useState<"upload" | "gallery" | "url">("upload");
  const [coverUrl, setCoverUrl] = useState(editingStory?.coverUrl || "");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [selectedGalleryPhotos, setSelectedGalleryPhotos] = useState<string[]>([]);
  const [currentImages, setCurrentImages] = useState<UploadedImage[]>(
    (editingStory?.images || []).map((img, i) => ({ url: img.url, order: img.order ?? i }))
  );
  const [submitting, setSubmitting] = useState(false);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadFiles(prev => [...prev, ...files]);
    setUploadPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeUploadFile = (idx: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== idx));
    setUploadPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleGalleryPhoto = (url: string) => {
    setSelectedGalleryPhotos(prev =>
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setSubmitting(true);

    try {
      const uploadedImages: UploadedImage[] = [...currentImages];
      let finalCoverUrl = coverUrl;

      // Upload files
      for (let i = 0; i < uploadFiles.length; i++) {
        const fd = new FormData();
        fd.append("file", uploadFiles[i]);
        fd.append("caption", `Story: ${title} - ${i + 1}`);
        fd.append("location", location);
        const res = await fetch("/api/photos", { method: "POST", body: fd });
        if (res.ok) {
          const data = await res.json();
          uploadedImages.push({ url: data.url, publicId: data.publicId, order: uploadedImages.length });
        }
      }

      // Add gallery selections
      selectedGalleryPhotos.forEach((url) => {
        if (!uploadedImages.some(x => x.url === url)) {
          uploadedImages.push({ url, order: uploadedImages.length });
        }
      });

      // Update orders
      const finalImages = uploadedImages.map((img, idx) => ({ ...img, order: idx }));

      // Set cover URL if empty
      if (!finalCoverUrl && finalImages.length > 0) {
        finalCoverUrl = finalImages[0].url;
      }

      const payload = {
        title, content, location: location || null,
        coverUrl: finalCoverUrl || null,
        date: new Date(date).toISOString(),
        visibility,
        images: finalImages,
      };

      const method = editingStory ? "PUT" : "POST";
      const body = editingStory ? { id: editingStory.id, ...payload } : payload;
      const res = await fetch("/api/stories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) { onSaved(); onClose(); }
      else { const d = await res.json(); alert(d.error || "Failed to save story"); }
    } catch { alert("Something went wrong"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 border border-slate-100 shadow-2xl relative max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h3 className="font-serif text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[var(--color-brand-green)]" />
          {editingStory ? "Edit Travel Story" : "Write a Travel Story"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Story Title</label>
            <input type="text" required placeholder="e.g. Lost in the Streets of Rome" value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] outline-none bg-slate-50/50 font-semibold text-slate-800" />
          </div>
          {/* Location & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Location</label>
              <input type="text" placeholder="e.g. Rome, Italy" value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[var(--color-brand-green)] outline-none bg-slate-50/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Date</label>
              <input type="date" required value={date} onChange={e => setDate(e.target.value)}
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[var(--color-brand-green)] outline-none bg-slate-50/50" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Visibility</label>
            <select value={visibility} onChange={e => setVisibility(e.target.value as "PUBLIC" | "PRIVATE")}
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[var(--color-brand-green)] outline-none bg-slate-50/50">
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>
          {/* Images */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Photos (multiple allowed)</label>
            <div className="flex gap-3 border-b border-slate-100 pb-2">
              {(["upload", "gallery", "url"] as const).map(opt => (
                <button key={opt} type="button" onClick={() => setCoverOption(opt)}
                  className={`text-xs font-semibold pb-1 border-b-2 transition-all capitalize ${coverOption === opt ? "border-[var(--color-brand-green)] text-[var(--color-brand-green)]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
                  {opt === "url" ? "Image URL" : opt === "gallery" ? "From Gallery" : "Upload"}
                </button>
              ))}
            </div>

            {coverOption === "upload" && (
              <div>
                <label className="border-2 border-dashed border-[var(--color-brand-border)] hover:border-[var(--color-brand-green)] bg-slate-50/50 rounded-xl p-4 flex flex-col items-center text-center cursor-pointer transition-colors">
                  <Camera className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">
                    Choose Images (multiple)
                  </span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            )}
            
            {coverOption === "gallery" && (
              <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto p-1 border border-slate-100 rounded-xl">
                {photos.length === 0
                  ? <p className="col-span-5 text-xs text-slate-400 italic p-2">No photos in gallery yet.</p>
                  : photos.map(p => (
                    <div key={p.id} onClick={() => toggleGalleryPhoto(p.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedGalleryPhotos.includes(p.url) ? "border-[var(--color-brand-green)] scale-95" : "border-transparent hover:border-slate-300"}`}>
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))
                }
              </div>
            )}
            
            {coverOption === "url" && (
              <input type="url" placeholder="https://example.com/image.jpg" value={coverUrl}
                onChange={e => setCoverUrl(e.target.value)}
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[var(--color-brand-green)] outline-none bg-slate-50/50" />
            )}

            {/* Unified Preview Area */}
            {(currentImages.length > 0 || uploadPreviews.length > 0 || selectedGalleryPhotos.length > 0 || coverUrl) && (
              <div className="space-y-1.5 mt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Selected Slides ({currentImages.length + uploadPreviews.length + selectedGalleryPhotos.length + (coverUrl ? 1 : 0)})</span>
                <div className="grid grid-cols-4 gap-2 border border-slate-100 rounded-xl p-3 bg-slate-50/50 max-h-36 overflow-y-auto">
                  {/* Cover URL (Custom URL) */}
                  {coverUrl && (
                    <div className="relative aspect-square rounded-lg overflow-hidden group/thumb border border-slate-200">
                      <img src={coverUrl} alt="Custom URL" className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 text-[8px] font-bold px-1.5 z-10">Link</div>
                      <button type="button" onClick={() => setCoverUrl("")}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Existing Images */}
                  {currentImages.map((img, i) => (
                    <div key={`existing-${i}`} className="relative aspect-square rounded-lg overflow-hidden group/thumb border border-slate-200">
                      <img src={img.url} alt="Saved" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setCurrentImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Gallery Selections */}
                  {selectedGalleryPhotos.map((url, i) => (
                    <div key={`gallery-${i}`} className="relative aspect-square rounded-lg overflow-hidden group/thumb border border-slate-200">
                      <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1 bg-[var(--color-brand-green)] text-white rounded-full p-0.5 text-[8px] font-bold px-1.5 z-10">Gallery</div>
                      <button type="button" onClick={() => toggleGalleryPhoto(url)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* New Upload Files */}
                  {uploadPreviews.map((src, i) => (
                    <div key={`upload-${i}`} className="relative aspect-square rounded-lg overflow-hidden group/thumb border border-slate-200">
                      <img src={src} alt="Upload Preview" className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-0.5 text-[8px] font-bold px-1.5 z-10">New</div>
                      <button type="button" onClick={() => removeUploadFile(i)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Story</label>
            <textarea required rows={6} placeholder="Share the details of your trip..." value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] outline-none bg-slate-50/50 resize-y text-slate-700 leading-relaxed" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] disabled:bg-slate-300 text-white rounded-xl py-3 font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm text-sm">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Publish Story"}
          </button>
        </form>
      </div>
    </div>
  );
}
