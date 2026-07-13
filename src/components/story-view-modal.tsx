"use client";
import { useState } from "react";
import { X, Calendar, MapPin, ChevronLeft, ChevronRight, Share2, User } from "lucide-react";

type StoryImage = { id?: string; url: string; order?: number };
type StoryUser = { id: string; name: string | null; email: string; image: string | null };

export type ViewableStory = {
  id: string;
  title: string;
  content: string;
  location: string | null;
  coverUrl: string | null;
  date: string;
  status?: string;
  images?: StoryImage[];
  user?: StoryUser;
};

export function StoryViewModal({ story, onClose }: { story: ViewableStory; onClose: () => void }) {
  const allImages: StoryImage[] = [];
  if (story.coverUrl) allImages.push({ url: story.coverUrl });
  (story.images || []).forEach(img => { if (!allImages.some(x => x.url === img.url)) allImages.push(img); });

  const [imgIdx, setImgIdx] = useState(0);
  const total = allImages.length;

  const authorName = story.user?.name || story.user?.email?.split("@")[0] || "Traveler";
  const authorAvatar = story.user?.image || `https://api.dicebear.com/7.x/notionists/svg?seed=${story.user?.email || "user"}`;

  const handleShare = async () => {
    const url = `${window.location.origin}/stories`;
    if (navigator.share) {
      await navigator.share({ title: story.title, text: story.content.slice(0, 100), url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <button onClick={onClose}
          className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-md transition-colors z-20">
          <X className="w-5 h-5" />
        </button>

        {/* Image area */}
        {allImages.length > 0 && (
          <div className="relative w-full h-64 sm:h-80 bg-slate-100 flex-shrink-0 group">
            <img src={allImages[imgIdx].url} alt={story.title} className="w-full h-full object-cover transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {total > 1 && (<>
              <button onClick={() => setImgIdx(i => (i - 1 + total) % total)}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition z-10">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setImgIdx(i => (i + 1) % total)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition z-10">
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {allImages.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`rounded-full transition-all ${i === imgIdx ? "bg-white w-4 h-1.5" : "bg-white/50 w-1.5 h-1.5"}`} />
                ))}
              </div>
              <span className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">{imgIdx + 1}/{total}</span>
            </>)}

            <div className="absolute bottom-0 left-0 p-6 text-white z-10">
              {story.location && (
                <span className="text-[10px] font-bold uppercase tracking-widest bg-[var(--color-brand-green)] px-3 py-1.5 rounded-full inline-block mb-2">
                  {story.location}
                </span>
              )}
              <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">{story.title}</h2>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {allImages.length === 0 && (
            <div>
              {story.location && (
                <span className="text-[10px] font-bold uppercase tracking-widest bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] px-3 py-1.5 rounded-full inline-block mb-2">
                  {story.location}
                </span>
              )}
              <h2 className="font-serif text-2xl font-bold text-slate-800">{story.title}</h2>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />
                {new Date(story.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
              {story.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{story.location}</span>}
            </div>
            <button onClick={handleShare} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[var(--color-brand-green)] transition-colors">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>

          {story.user && (
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
              <img src={authorAvatar} alt={authorName} className="w-8 h-8 rounded-full object-cover" />
              <div>
                <p className="text-xs font-semibold text-slate-700">{authorName}</p>
                <p className="text-[10px] text-slate-400">Traveler</p>
              </div>
            </div>
          )}

          <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{story.content}</div>
        </div>
      </div>
    </div>
  );
}
