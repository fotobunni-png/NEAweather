import React from 'react';
import {
  Thermometer,
  CloudRain,
  Wind,
  ShieldAlert,
  Clock,
  Sparkles,
  Droplets,
  Gauge,
} from 'lucide-react';
import { LocationSelection, PsiData, RainfallData, TemperatureData } from '../types/weather';
import { PsiCategory, getPsiCategory, getRainCategory } from '../services/neaApi';

interface HeroWeatherCardProps {
  currentLocation: LocationSelection;
  temperatureData: TemperatureData | null;
  rainfallData: RainfallData | null;
  psiData: PsiData | null;
  onOpenAdvisory: () => void;
  onOpenStations: () => void;
}

export const HeroWeatherCard: React.FC<HeroWeatherCardProps> = ({
  currentLocation,
  temperatureData,
  rainfallData,
  psiData,
  onOpenAdvisory,
  onOpenStations,
}) => {
  // Extract Temperature for current station or region average
  const stationTempId = currentLocation.nearestTempStation?.id;
  const tempReading =
    temperatureData?.readings.find((r) => r.stationId === stationTempId) ||
    temperatureData?.readings[0];
  const currentTemp = tempReading ? tempReading.value : null;

  // Temperature island stats
  const allTemps = (temperatureData?.readings || []).map((r) => r.value).filter(Boolean);
  const minTemp = allTemps.length ? Math.min(...allTemps) : null;
  const maxTemp = allTemps.length ? Math.max(...allTemps) : null;

  // Extract Rainfall for nearest rain station
  const stationRainId = currentLocation.nearestRainStation?.id;
  const rainReading =
    rainfallData?.readings.find((r) => r.stationId === stationRainId) ||
    rainfallData?.readings[0];
  const currentRainMm = rainReading ? rainReading.value : 0;
  const rainCategory = getRainCategory(currentRainMm);

  // Extract PSI for selected region
  const region = currentLocation.region;
  const psiValue =
    psiData?.readings.psi_twenty_four_hourly?.[region] ??
    psiData?.readings.psi_twenty_four_hourly?.national ??
    0;
  const psiCat: PsiCategory = getPsiCategory(psiValue);

  // PM2.5 and PM10
  const pm25Value =
    psiData?.readings.pm25_twenty_four_hourly?.[region] ??
    psiData?.readings.pm25_twenty_four_hourly?.national ??
    0;
  const pm10Value =
    psiData?.readings.pm10_twenty_four_hourly?.[region] ??
    psiData?.readings.pm10_twenty_four_hourly?.national ??
    0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
      {/* Decorative background glow matching PSI status */}
      <div
        className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none -z-10"
        style={{
          background:
            psiValue > 100
              ? 'radial-gradient(circle, #f59e0b, #ef4444)'
              : currentRainMm > 0
              ? 'radial-gradient(circle, #0284c7, #38bdf8)'
              : 'radial-gradient(circle, #fbbf24, #f59e0b)',
        }}
      />

      {/* Top Header: Location Title & Timestamp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Real-Time Observations
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
            {currentLocation.name}
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Updated:{' '}
            {psiData?.updateTimestamp
              ? new Date(psiData.updateTimestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Live'}
          </span>
        </div>
      </div>

      {/* Main Stats Grid: Temperature, PSI, Rainfall */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Air Temperature */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-200/60 dark:border-amber-800/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Air Temperature
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-medium">
              NEA Real-time
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              {currentTemp !== null ? currentTemp.toFixed(1) : '—'}
            </span>
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">°C</span>
          </div>

          <div className="pt-2 border-t border-amber-200/50 dark:border-amber-800/30 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>
              Island: <strong className="text-slate-800 dark:text-slate-200">{minTemp ?? '—'}°</strong> –{' '}
              <strong className="text-slate-800 dark:text-slate-200">{maxTemp ?? '—'}°C</strong>
            </span>
            <button
              type="button"
              onClick={onOpenStations}
              className="text-amber-700 dark:text-amber-400 hover:underline font-medium text-[11px] cursor-pointer"
            >
              Stations list →
            </button>
          </div>
        </div>

        {/* Card 2: 24-Hour PSI Indicator */}
        <div
          className={`p-5 rounded-2xl border flex flex-col justify-between ${psiCat.bgColor} ${psiCat.borderColor}`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${psiCat.textColor}`}
            >
              <Gauge className="w-4 h-4" /> 24-Hr PSI
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${psiCat.badgeColor}`}
            >
              {psiCat.label}
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              {psiValue}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Index Value
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/40 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 truncate max-w-[170px]">
              PM2.5: <strong className="text-slate-800 dark:text-slate-200">{pm25Value} µg/m³</strong>
            </span>
            <button
              type="button"
              onClick={onOpenAdvisory}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-[11px] cursor-pointer shrink-0"
            >
              Health Advice →
            </button>
          </div>
        </div>

        {/* Card 3: Rainfall Indicator */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50/80 to-blue-50/40 dark:from-sky-950/20 dark:to-blue-950/10 border border-sky-200/60 dark:border-sky-800/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Precipitation (5m)
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${rainCategory.bg} ${rainCategory.color}`}
            >
              {rainCategory.label}
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              {currentRainMm.toFixed(1)}
            </span>
            <span className="text-xl font-bold text-sky-600 dark:text-sky-400">mm</span>
          </div>

          <div className="pt-2 border-t border-sky-200/50 dark:border-sky-800/30 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="truncate">{rainCategory.description}</span>
            <span className="text-[11px] font-medium text-sky-700 dark:text-sky-400">
              88 radar stations
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Quick Row: Pollutants breakdown pills */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
          <Wind className="w-4 h-4 text-slate-400" />
          <span>Air Pollutant Sub-indices ({currentLocation.region.toUpperCase()}):</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <span className="text-[10px] text-slate-400 uppercase mr-1">PM2.5:</span>
            <strong>{pm25Value}</strong> µg/m³
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <span className="text-[10px] text-slate-400 uppercase mr-1">PM10:</span>
            <strong>{pm10Value}</strong> µg/m³
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <span className="text-[10px] text-slate-400 uppercase mr-1">O3:</span>
            <strong>{psiData?.readings.o3_eight_hour_max?.[region] ?? '—'}</strong> µg/m³
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <span className="text-[10px] text-slate-400 uppercase mr-1">CO:</span>
            <strong>{psiData?.readings.co_eight_hour_max?.[region] ?? '—'}</strong> mg/m³
          </div>
        </div>
      </div>
    </div>
  );
};
