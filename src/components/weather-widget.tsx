"use client";

import { useEffect, useState } from "react";
import { CloudRain, Sun, Cloud, Thermometer } from "lucide-react";

type WeatherData = {
  temp: number;
  description: string;
  icon: string;
};

export function WeatherWidget({ destination }: { destination: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadWeather() {
      if (!destination) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/weather?destination=${encodeURIComponent(destination)}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setWeather(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    void loadWeather();
  }, [destination]);

  if (loading) {
    return (
      <div className="flex animate-pulse items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="h-10 w-10 rounded-full bg-slate-200" />
        <div className="space-y-2">
          <div className="h-4 w-20 rounded bg-slate-200" />
          <div className="h-3 w-32 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-sm text-slate-500">
        Weather currently unavailable for {destination}.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
        <img 
          src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`} 
          alt={weather.description}
          className="h-12 w-12 object-contain"
        />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-slate-800">{weather.temp}°C</h3>
          <span className="text-sm font-medium text-slate-500 capitalize">
            {weather.description}
          </span>
        </div>
        <p className="text-sm text-slate-500 flex items-center gap-1">
          <Thermometer className="h-3 w-3" />
          Current weather in {destination}
        </p>
      </div>
    </div>
  );
}
