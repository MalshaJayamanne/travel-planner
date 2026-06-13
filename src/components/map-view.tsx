"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for leaflet markers in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Component to dynamically update map center
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapView({ destination }: { destination: string }) {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function geocode() {
      if (!destination) return;
      try {
        setLoading(true);
        // Using openstreetmap nominatim for free geocoding
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`);
        const data = await res.json();
        if (data && data.length > 0) {
          setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      } catch (err) {
        console.error("Failed to geocode destination:", err);
      } finally {
        setLoading(false);
      }
    }
    void geocode();
  }, [destination]);

  if (loading) {
    return (
      <div className="flex h-64 w-full animate-pulse items-center justify-center rounded-xl bg-slate-100 border border-slate-200">
        <span className="text-slate-400 font-medium">Loading Map...</span>
      </div>
    );
  }

  if (!coords) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-xl bg-slate-50 border border-slate-200">
        <span className="text-slate-500 font-medium text-sm">Map unavailable for this destination.</span>
      </div>
    );
  }

  return (
    <div className="h-80 w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm relative z-0">
      <MapContainer 
        center={coords} 
        zoom={12} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={coords} />
        <Marker position={coords} icon={icon}>
          <Popup>{destination}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
