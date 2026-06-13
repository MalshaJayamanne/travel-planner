export type WeatherData = {
  temp: number;
  description: string;
  icon: string;
};

export async function fetchWeather(destination: string): Promise<WeatherData | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.warn("OPENWEATHER_API_KEY is not set in environment variables.");
    return null;
  }

  try {
    // 1. First geocode the destination to get lat/lon
    const geoResponse = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(destination)}&limit=1&appid=${apiKey}`
    );
    const geoData = await geoResponse.json();

    if (!geoData || geoData.length === 0) {
      return null;
    }

    const { lat, lon } = geoData[0];

    // 2. Fetch the weather data for those coordinates
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    const weatherData = await weatherResponse.json();

    if (!weatherData.main || !weatherData.weather || weatherData.weather.length === 0) {
      return null;
    }

    return {
      temp: Math.round(weatherData.main.temp),
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
    };
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    return null;
  }
}
