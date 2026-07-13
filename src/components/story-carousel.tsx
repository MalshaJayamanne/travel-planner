"use client";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type StoryImage = { id?: string; url: string; order?: number };

export function StoryCarousel({ images, autoPlay = true }: { images: StoryImage[]; autoPlay?: boolean }) {
  const [idx, setIdx] = useState(0);
  const total = images.length;

  const prev = useCallback(() => setIdx(i => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setIdx(i => (i + 1) % total), [total]);

  useEffect(() => {
    if (!autoPlay || total <= 1) return;
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [autoPlay, next, total]);

  if (total === 0) return null;
  if (total === 1) return (
    <img src={images[0].url} alt="Story" className="w-full h-full object-cover" />
  );

  return (
    <div className="relative w-full h-full">
      {images.map((img, i) => (
        <img
          key={i}
          src={img.url}
          alt={`Slide ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === idx ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); prev(); }}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); next(); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10">
        <ChevronRight className="w-4 h-4" />
      </button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
        {images.map((_, i) => (
          <button key={i} onClick={(e) => { e.stopPropagation(); e.preventDefault(); setIdx(i); }}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? "bg-white w-3" : "bg-white/50"}`} />
        ))}
      </div>
    </div>
  );
}
