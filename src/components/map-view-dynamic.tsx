"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 w-full animate-pulse items-center justify-center rounded-xl bg-slate-100 border border-slate-200">
      <span className="text-slate-400 font-medium">Loading Map...</span>
    </div>
  ),
});

export default MapView;
