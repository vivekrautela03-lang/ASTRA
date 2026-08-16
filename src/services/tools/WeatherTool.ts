import { internetSearchService, type GoogleWeatherData } from '../internetSearchService';

export class WeatherTool {
  public name = 'WeatherTool';
  public description = 'Fetch real-time weather, temperature, humidity, wind, and forecast via Open-Meteo API';

  public async execute(city?: string): Promise<{ data: GoogleWeatherData | null; summary: string }> {
    const loc = await internetSearchService.fetchFreeIPLocation();
    const weather = await internetSearchService.fetchFreeWeather(loc?.lat, loc?.lon, city || loc?.city);

    if (weather) {
      const summary = `The current weather in ${weather.city} is ${weather.temperature}°C with ${weather.condition} conditions, humidity at ${weather.humidity}%, and wind at ${weather.windSpeed} km/h, Boss.`;
      return { data: weather, summary };
    }

    return { data: null, summary: "Unable to retrieve weather data right now, Boss." };
  }
}

export const weatherTool = new WeatherTool();
