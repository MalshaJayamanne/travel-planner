"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { StoryCarousel } from "@/components/story-carousel";
import { StoryFormModal } from "@/components/story-form-modal";
import { StoryViewModal, type ViewableStory } from "@/components/story-view-modal";
import { ArrowRight, MapPin, Calendar, Trash2, Edit2, Plus, BookOpen, Globe, Camera, Loader2, Clock } from "lucide-react";

type StoryImage = { id?: string; url: string; order?: number };
type StoryUser = { id: string; name: string | null; email: string; image: string | null };

type Story = {
  id: string;
  title: string;
  content: string;
  location: string | null;
  coverUrl: string | null;
  date: string;
  createdAt: string;
  status?: string;
  images?: StoryImage[];
  user?: StoryUser;
};

type Photo = { id: string; url: string; caption: string | null };

const DEFAULT_STORIES: Story[] = [
  {
    id: "default-1", title: "Whispers of the Dolomites",
    content: "Five days spent trekking through the jagged limestone cathedrals of South Tyrol, finding peace in the high-altitude silence. Every ridge line offered a new perspective on time and scale.",
    location: "Italy", coverUrl: "/images/dolomites_whispers_1781112260648.png",
    date: "2026-05-10T00:00:00.000Z", createdAt: "2026-05-10T00:00:00.000Z", status: "APPROVED",
  },
  {
    id: "default-2", title: "Sailing Through History",
    content: "Discovering the forgotten islands of Venice via a traditional wooden bragozzo. The salt air and ancient lagoon secrets came alive under the guidance of our local captain.",
    location: "Venice, Italy", coverUrl: "/images/venice_sailing_1781112274772.png",
    date: "2026-05-24T00:00:00.000Z", createdAt: "2026-05-24T00:00:00.000Z", status: "APPROVED",
  },
  {
    id: "default-3", title: "The Art of the Tea Ceremony",
    content: "An afternoon spent in a quiet tea house in Kyoto, learning the deliberate, meditative steps of matcha preparation. A reminder that beauty is in the details.",
    location: "Kyoto, Japan", coverUrl: "/images/kyoto_tea_1781112290845.png",
    date: "2026-06-02T00:00:00.000Z", createdAt: "2026-06-02T00:00:00.000Z", status: "APPROVED",
  },
  {
    id: "default-4", title: "The Moss Chronicles",
    content: "Iceland's interior is more than just glaciers; it's a study in emerald textures and volcanic silence. A look at the resilience of arctic flora holding onto black basalt sand.",
    location: "Iceland", coverUrl: "/images/iceland_moss_1781112311190.png",
    date: "2026-06-12T00:00:00.000Z", createdAt: "2026-06-12T00:00:00.000Z", status: "APPROVED",
  },
];

function getStoryImages(story: Story): StoryImage[] {
  const imgs: StoryImage[] = [];
  if (story.coverUrl) imgs.push({ url: story.coverUrl, order: -1 });
  (story.images || []).forEach(img => { if (!imgs.some(x => x.url === img.url)) imgs.push(img); });
  return imgs;
}

function StatusBadge({ status }: { status?: string }) {
  if (!status || status === "APPROVED") return null;
  if (status === "PENDING") return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
      <Clock className="w-2.5 h-2.5" /> Pending Review
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
      Rejected
    </span>
  );
}

export default function StoriesPage() {
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [communityStories, setCommunityStories] = useState<Story[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"my" | "community">("my");

  const [showModal, setShowModal] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [myRes, publicRes, photosRes] = await Promise.all([
        fetch("/api/stories"),
        fetch("/api/stories/public"),
        fetch("/api/photos"),
      ]);
      if (myRes.ok) setMyStories(await myRes.json());
      if (publicRes.ok) setCommunityStories(await publicRes.json());
      if (photosRes.ok) setPhotos(await photosRes.json());
    } catch (err) { console.error("Load error:", err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this travel story?")) return;
    const res = await fetch(`/api/stories?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setMyStories(prev => prev.filter(s => s.id !== id));
      if (activeStory?.id === id) setActiveStory(null);
    } else alert("Failed to delete story");
  };

  const openEdit = (story: Story, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingStory(story);
    setShowModal(true);
  };

  const openCreate = () => { setEditingStory(null); setShowModal(true); };

  // Merge user stories with defaults (avoid duplicates)
  const allMyStories = [
    ...myStories,
    ...DEFAULT_STORIES.filter(ds => !myStories.some(s => s.title.toLowerCase() === ds.title.toLowerCase())),
  ];

  const storiesCount = allMyStories.length;
  const uniqueLocations = Array.from(new Set(allMyStories.map(s => s.location?.split(",").pop()?.trim()).filter(Boolean))).length;
  const communityCount = communityStories.length;

  const displayStories = activeTab === "my" ? allMyStories : communityStories;

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Header */}
        <div className="bg-white rounded-2xl p-8 border border-[var(--color-brand-border)] flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-sm">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[var(--color-brand-green)]">Chronicles of a Wanderer</h1>
            <p className="font-serif italic text-slate-500 mt-2">
              "A journey is best measured in friends, rather than miles."
              <br /><span className="text-sm not-italic">— Tim Cahill</span>
            </p>
          </div>
          <div className="flex items-center gap-8 md:gap-12">
            <div className="text-center">
              <p className="font-bold text-3xl text-[var(--color-brand-green)]">{storiesCount}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Stories<br />Shared</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-3xl text-[var(--color-brand-green)]">{uniqueLocations}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Locations<br />Visited</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-3xl text-[var(--color-brand-green)]">{communityCount > 0 ? communityCount : photos.length > 0 ? photos.length : 124}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Community<br />Stories</p>
            </div>
          </div>
        </div>

        {/* Tab Bar + Action */}
        <div className="flex items-center justify-between gap-4 bg-white rounded-xl border border-[var(--color-brand-border)] p-2 shadow-sm">
          <div className="flex gap-1">
            <button onClick={() => setActiveTab("my")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "my" ? "bg-[var(--color-brand-green)] text-white shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}>
              <BookOpen className="w-4 h-4" /> My Stories
            </button>
            <button onClick={() => setActiveTab("community")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "community" ? "bg-[var(--color-brand-green)] text-white shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}>
              <Globe className="w-4 h-4" /> Community
              {communityCount > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "community" ? "bg-white/20 text-white" : "bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]"}`}>
                  {communityCount}
                </span>
              )}
            </button>
          </div>
          {activeTab === "my" && (
            <button onClick={openCreate}
              className="bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Write Story
            </button>
          )}
          {activeTab === "community" && (
            <p className="text-xs text-slate-400 pr-2">Approved stories from all travelers</p>
          )}
        </div>

        {/* Stories Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-green)]" />
          </div>
        ) : displayStories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[var(--color-brand-border)]">
            {activeTab === "community"
              ? <><Globe className="w-10 h-10 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">No community stories yet. Be the first to share!</p></>
              : <><BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">No stories yet. Share your first adventure!</p></>
            }
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayStories.map(story => {
              const isUserGenerated = !story.id.startsWith("default-");
              const storyImages = getStoryImages(story);
              const photoCount = storyImages.length;
              const authorName = story.user?.name || story.user?.email?.split("@")[0];
              const authorAvatar = story.user?.image || `https://api.dicebear.com/7.x/notionists/svg?seed=${story.user?.email || story.id}`;

              return (
                <div key={story.id} onClick={() => setActiveStory(story)}
                  className="group bg-white rounded-2xl overflow-hidden border border-[var(--color-brand-border)] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer">
                  <div>
                    {storyImages.length > 0 && (
                      <div className="relative w-full aspect-[4/3] bg-slate-100">
                        <StoryCarousel images={storyImages} autoPlay={false} />
                        {story.location && (
                          <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white flex items-center gap-1 z-10">
                            <MapPin className="w-3 h-3" />{story.location}
                          </span>
                        )}
                        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                          {photoCount > 1 && (
                            <span className="text-[10px] font-bold bg-black/60 backdrop-blur-md text-white px-2 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                              <Camera className="w-2.5 h-2.5" /> {photoCount}
                            </span>
                          )}
                          {isUserGenerated && activeTab === "my" && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <button onClick={e => openEdit(story, e)}
                                className="bg-white/80 hover:bg-white p-2 rounded-full text-slate-700 hover:text-[var(--color-brand-green)] transition-colors shadow-sm">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={e => handleDelete(story.id, e)}
                                className="bg-white/80 hover:bg-white p-2 rounded-full text-red-600 hover:text-red-700 transition-colors shadow-sm">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(story.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                        </div>
                        {isUserGenerated && activeTab === "my" && <StatusBadge status={story.status} />}
                      </div>
                      <h3 className="font-serif text-xl font-bold text-slate-800 group-hover:text-[var(--color-brand-green)] transition-colors">
                        {story.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{story.content}</p>
                      {activeTab === "community" && authorName && (
                        <div className="flex items-center gap-2 pt-1">
                          <img src={authorAvatar} alt={authorName} className="w-5 h-5 rounded-full object-cover" />
                          <span className="text-xs text-slate-500 font-medium">{authorName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-5 pt-0 flex justify-end mt-auto">
                    <span className="text-xs font-bold text-[var(--color-brand-green)] flex items-center gap-1.5">
                      Read Full Story <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <StoryFormModal
          editingStory={editingStory}
          photos={photos}
          onClose={() => setShowModal(false)}
          onSaved={fetchAll}
        />
      )}
      {activeStory && (
        <StoryViewModal
          story={activeStory as ViewableStory}
          onClose={() => setActiveStory(null)}
        />
      )}
    </AppShell>
  );
}
