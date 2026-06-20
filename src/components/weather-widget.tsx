"use client";

import { useEffect, useState } from "react";
import {
  Cloud,
  CloudRain,
  Sun,
  Snowflake,
  Wind,
  Droplets,
  Thermometer,
  Eye,
} from "lucide-react";

type WeatherData = {
  temp: number;
  feelsLike?: number;
  description: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
  visibility?: number;
};

function WeatherIcon({ icon, description }: { icon: string; description: string }) {
  const isRain = description.toLowerCase().includes("rain");
  const isSnow = description.toLowerCase().includes("snow");
  const isClear = description.toLowerCase().includes("clear");
  const isCloudy = description.toLowerCase().includes("cloud");

  const IconComp = isRain
    ? CloudRain
    : isSnow
    ? Snowflake
    : isClear
    ? Sun
    : isCloudy
    ? Cloud
    : Sun;

  const colorClass = isRain
    ? "text-blue-400"
    : isSnow
    ? "text-indigo-300"
    : isClear
    ? "text-amber-400"
    : "text-slate-400";

  return (
    <img
      src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
      alt={description}
      className="h-14 w-14 object-contain drop-shadow-sm"
      onError={(e) => {
        // Fallback to lucide icon if image fails
        const target = e.currentTarget;
        target.style.display = "none";
        const fallback = target.nextSibling as HTMLElement;
        if (fallback) fallback.style.display = "block";
      }}
    />
  );
}

export function WeatherWidget({ destination }: { destination: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadWeather() {
      if (!destination) return;
      try {
        setLoading(true);
        setError(false);
        const res = await fetch(
          `/api/weather?destination=${encodeURIComponent(destination)}`
        );
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
      <div className="flex animate-pulse items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="h-14 w-14 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-24 rounded bg-slate-200" />
          <div className="h-3 w-36 rounded bg-slate-200" />
          <div className="h-3 w-28 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-sm text-slate-500 flex items-center gap-2">
        <Cloud className="h-4 w-4 text-slate-300" />
        Weather currently unavailable for <span className="font-medium">{destination}</span>.
      </div>
    );
  }

  // Determine background gradient based on conditions
  const isNight = weather.icon?.includes("n");
  const isRain = weather.description.toLowerCase().includes("rain");
  const isClear = weather.description.toLowerCase().includes("clear");

  const gradientClass = isNight
    ? "from-indigo-900 to-slate-800"
    : isRain
    ? "from-slate-700 to-blue-800"
    : isClear
    ? "from-amber-400 to-orange-500"
    : "from-blue-500 to-cyan-600";

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${gradientClass} p-5 shadow-md text-white`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">
            Current Weather
          </p>
          <h3 className="text-lg font-bold capitalize">{destination}</h3>
          <p className="text-4xl font-bold mt-1">{weather.temp}°C</p>
          <p className="text-sm text-white/80 capitalize mt-1">{weather.description}</p>
        </div>
        <div className="flex flex-col items-center">
          <WeatherIcon icon={weather.icon} description={weather.description} />
        </div>
      </div>

      {/* Details row */}
      {(weather.humidity ?? weather.windSpeed ?? weather.feelsLike) && (
        <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-2 text-xs">
          {weather.feelsLike !== undefined && (
            <div className="flex flex-col items-center gap-1">
              <Thermometer className="h-3.5 w-3.5 text-white/70" />
              <span className="text-white/70">Feels Like</span>
              <span className="font-bold">{weather.feelsLike}°C</span>
            </div>
          )}
          {weather.humidity !== undefined && (
            <div className="flex flex-col items-center gap-1">
              <Droplets className="h-3.5 w-3.5 text-white/70" />
              <span className="text-white/70">Humidity</span>
              <span className="font-bold">{weather.humidity}%</span>
            </div>
          )}
          {weather.windSpeed !== undefined && (
            <div className="flex flex-col items-center gap-1">
              <Wind className="h-3.5 w-3.5 text-white/70" />
              <span className="text-white/70">Wind</span>
              <span className="font-bold">{weather.windSpeed} m/s</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
