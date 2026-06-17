export type WeatherData = {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
};

export async function fetchWeather(destination: string): Promise<WeatherData | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.warn("OPENWEATHER_API_KEY is not set in environment variables.");
    return null;
  }

  try {
    // 1. Geocode the destination to get lat/lon
    const geoResponse = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(destination)}&limit=1&appid=${apiKey}`
    );
    const geoData = await geoResponse.json();

    if (!geoData || geoData.length === 0) {
      return null;
    }

    const { lat, lon } = geoData[0];

    // 2. Fetch weather data for those coordinates
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    const weatherData = await weatherResponse.json();

    if (!weatherData.main || !weatherData.weather || weatherData.weather.length === 0) {
      return null;
    }

    return {
      temp: Math.round(weatherData.main.temp),
      feelsLike: Math.round(weatherData.main.feels_like),
      description: weatherData.weather[0].description as string,
      icon: weatherData.weather[0].icon as string,
      humidity: weatherData.main.humidity as number,
      windSpeed: Math.round((weatherData.wind?.speed ?? 0) * 10) / 10,
    };
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    return null;
  }
}
