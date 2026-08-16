import React, { useEffect, useState } from 'react';
import { CloudSun, Sun, CloudRain, Zap, Snowflake, Wind, Droplets } from 'lucide-react';
import { internetSearchService, type GoogleWeatherData } from '../../../services/internetSearchService';

interface WeatherWidgetProps {
  onExpand?: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ onExpand }) => {
  const [weather, setWeather] = useState<GoogleWeatherData | null>(null);

  useEffect(() => {
    const loadWeather = async () => {
      const loc = await internetSearchService.fetchFreeIPLocation();
      const data = await internetSearchService.fetchFreeWeather(loc?.lat, loc?.lon, loc?.city);
      setWeather(data);
    };
    loadWeather();
  }, []);

  const getWeatherIcon = (theme: string = 'sunny') => {
    switch (theme) {
      case 'rainy': return <CloudRain className="w-6 h-6 text-blue-400 animate-pulse" />;
      case 'stormy': return <Zap className="w-6 h-6 text-amber-400 animate-bounce" />;
      case 'snowy': return <Snowflake className="w-6 h-6 text-cyan-300 animate-spin" />;
      case 'cloudy': return <CloudSun className="w-6 h-6 text-indigo-300" />;
      case 'sunny':
      default: return <Sun className="w-6 h-6 text-amber-400 animate-spin" />;
    }
  };

  return (
    <div
      onClick={onExpand}
      className="p-4 rounded-3xl bg-slate-950/60 border border-white/15 backdrop-blur-2xl shadow-xl flex flex-col justify-between cursor-pointer hover:border-amber-500/40 transition-all font-sans text-xs w-64"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          {getWeatherIcon(weather?.weatherTheme)}
          <span className="font-bold text-white text-sm">{weather?.city || 'Dehradun'}</span>
        </div>
        <span className="text-[10px] font-mono text-white/50 uppercase">Weather</span>
      </div>

      <div className="my-3 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold text-white tracking-tight">{weather ? `${weather.temperature}°C` : '28°C'}</span>
        <span className="text-xs font-semibold text-amber-200">{weather?.condition || 'Partly Cloudy'}</span>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-white/60 border-t border-white/10 pt-2">
        <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-cyan-400" /> {weather?.humidity || 62}%</span>
        <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-amber-400" /> {weather?.windSpeed || 12} km/h</span>
      </div>
    </div>
  );
};
