import React, { useCallback, useEffect, useState } from 'react';
import {
  CloudSun,
  Activity,
  RefreshCw,
  Compass,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Droplets,
  Thermometer,
  Wind,
} from 'lucide-react';
import {
  HealthCheckResponse,
  LocationSelection,
  PsiData,
  RainfallData,
  RegionKey,
  TemperatureData,
  WeatherEffectMode,
} from './types/weather';
import {
  fetchApiHealth,
  fetchPsi,
  fetchRainfall,
  fetchTemperature,
  getPsiCategory,
} from './services/neaApi';
import {
  SINGAPORE_REGIONS,
  SINGAPORE_TOWNS,
  findNearestStation,
  getClosestRegion,
} from './utils/geo';
import { Navbar } from './components/Navbar';
import { WeatherEffects } from './components/WeatherEffects';
import { LocationSelector } from './components/LocationSelector';
import { HeroWeatherCard } from './components/HeroWeatherCard';
import { PsiRegionsGrid } from './components/PsiRegionsGrid';
import { HealthAdvisoryCard } from './components/HealthAdvisoryCard';
import { ApiHealthModal } from './components/ApiHealthModal';
import { StationsDrawer } from './components/StationsDrawer';

export default function App() {
  // Weather & PSI data state
  const [temperatureData, setTemperatureData] = useState<TemperatureData | null>(null);
  const [rainfallData, setRainfallData] = useState<RainfallData | null>(null);
  const [psiData, setPsiData] = useState<PsiData | null>(null);
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Modals state
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isStationsModalOpen, setIsStationsModalOpen] = useState(false);

  // Weather effect simulator mode (default to auto)
  const [effectMode, setEffectMode] = useState<WeatherEffectMode>('auto');

  // Selected Location (default to Orchard / Central)
  const [currentLocation, setCurrentLocation] = useState<LocationSelection>(() => {
    const defaultTown = SINGAPORE_TOWNS[0];
    return {
      type: 'preset-town',
      name: defaultTown.name,
      latitude: defaultTown.location.latitude,
      longitude: defaultTown.location.longitude,
      region: defaultTown.region,
    };
  });

  // Fetch all weather and health data
  const loadAllData = useCallback(async (isSilentRefresh = false) => {
    if (!isSilentRefresh) setIsLoading(true);
    else setIsRefreshing(true);
    setFetchError(null);

    try {
      const [tempRes, rainRes, psiRes, healthRes] = await Promise.all([
        fetchTemperature().catch((err) => {
          console.error('Temp error:', err);
          return null;
        }),
        fetchRainfall().catch((err) => {
          console.error('Rain error:', err);
          return null;
        }),
        fetchPsi().catch((err) => {
          console.error('PSI error:', err);
          return null;
        }),
        fetchApiHealth().catch((err) => {
          console.error('Health error:', err);
          return null;
        }),
      ]);

      if (tempRes) setTemperatureData(tempRes);
      if (rainRes) setRainfallData(rainRes);
      if (psiRes) setPsiData(psiRes);
      if (healthRes) setHealthData(healthRes);

      // Re-link nearest stations for current location
      if (tempRes?.stations || rainRes?.stations) {
        setCurrentLocation((prev) => {
          const nearestTemp = tempRes?.stations
            ? findNearestStation(tempRes.stations, prev.latitude, prev.longitude)
            : null;
          const nearestRain = rainRes?.stations
            ? findNearestStation(rainRes.stations, prev.latitude, prev.longitude)
            : null;

          return {
            ...prev,
            nearestTempStation: nearestTemp?.station || prev.nearestTempStation,
            nearestRainStation: nearestRain?.station || prev.nearestRainStation,
            distanceKm: nearestTemp?.distanceKm ?? prev.distanceKm,
          };
        });
      }
    } catch (err) {
      console.error('Data loading failure:', err);
      setFetchError(err instanceof Error ? err.message : 'Unable to load Singapore weather data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load and periodic polling
  useEffect(() => {
    loadAllData();

    // Auto refresh data every 60s
    const weatherInterval = setInterval(() => {
      loadAllData(true);
    }, 60000);

    // Auto probe API health every 30s
    const healthInterval = setInterval(() => {
      fetchApiHealth()
        .then((h) => setHealthData(h))
        .catch(console.error);
    }, 30000);

    return () => {
      clearInterval(weatherInterval);
      clearInterval(healthInterval);
    };
  }, [loadAllData]);

  // Compute live rainfall and PSI for the active location
  const liveStationRainId = currentLocation.nearestRainStation?.id;
  const liveRainReading =
    rainfallData?.readings.find((r) => r.stationId === liveStationRainId) ||
    rainfallData?.readings[0];
  const liveRainfallMm = liveRainReading?.value ?? 0;

  const livePsiValue =
    psiData?.readings.psi_twenty_four_hourly?.[currentLocation.region] ??
    psiData?.readings.psi_twenty_four_hourly?.national ??
    0;

  const psiCategory = getPsiCategory(livePsiValue);

  // Handle region switch from 5-regions grid
  const handleSelectRegion = (region: RegionKey) => {
    const meta = SINGAPORE_REGIONS[region];
    const nearestTemp = temperatureData?.stations
      ? findNearestStation(temperatureData.stations, meta.location.latitude, meta.location.longitude)
      : null;
    const nearestRain = rainfallData?.stations
      ? findNearestStation(rainfallData.stations, meta.location.latitude, meta.location.longitude)
      : null;

    setCurrentLocation({
      type: 'region',
      name: `${meta.label} Singapore`,
      latitude: meta.location.latitude,
      longitude: meta.location.longitude,
      region,
      nearestTempStation: nearestTemp?.station,
      nearestRainStation: nearestRain?.station,
      distanceKm: nearestTemp?.distanceKm,
    });
  };

  // Island-wide stats
  const activeRainStationsCount =
    rainfallData?.readings.filter((r) => (r.value || 0) > 0).length ?? 0;
  const totalRainStations = rainfallData?.stations.length ?? 88;

  const allTemps = (temperatureData?.readings || []).map((r) => r.value).filter(Boolean);
  const avgTemp =
    allTemps.length > 0
      ? (allTemps.reduce((a, b) => a + b, 0) / allTemps.length).toFixed(1)
      : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors relative selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Weather Atmospheric Background & Particles (Sunny / Raining / Hazy) */}
      <WeatherEffects
        mode={effectMode}
        onModeChange={setEffectMode}
        liveRainfallMm={liveRainfallMm}
        livePsiValue={livePsiValue}
      />

      {/* Top Navigation */}
      <Navbar
        healthData={healthData}
        onOpenHealthModal={() => setIsHealthModalOpen(true)}
        onOpenStationsModal={() => setIsStationsModalOpen(true)}
        onRefreshData={() => loadAllData(true)}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 relative z-10">
        {/* Error notification banner if any */}
        {fetchError && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{fetchError}</span>
            </div>
            <button
              type="button"
              onClick={() => loadAllData()}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* API Health Banner alert if degraded */}
        {healthData && healthData.status !== 'HEALTHY' && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-600 animate-spin" />
              <span>
                One or more NEA APIs reported degraded status. Some readings may be cached.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsHealthModalOpen(true)}
              className="underline font-semibold cursor-pointer"
            >
              View API Health Status
            </button>
          </div>
        )}

        {/* Initial Loading Skeleton */}
        {isLoading && !temperatureData ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          </div>
        ) : (
          <>
            {/* 1. Location & Station Selector */}
            <LocationSelector
              currentLocation={currentLocation}
              onSelectLocation={setCurrentLocation}
              tempStations={temperatureData?.stations || []}
              rainStations={rainfallData?.stations || []}
            />

            {/* 2. Hero Weather & PSI Card for Selected Location */}
            <HeroWeatherCard
              currentLocation={currentLocation}
              temperatureData={temperatureData}
              rainfallData={rainfallData}
              psiData={psiData}
              onOpenAdvisory={() => {
                const el = document.getElementById('health-advisory-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenStations={() => setIsStationsModalOpen(true)}
            />

            {/* 3. Island-Wide 5-Regions PSI Comparison */}
            <PsiRegionsGrid
              psiData={psiData}
              activeRegion={currentLocation.region}
              onSelectRegion={handleSelectRegion}
            />

            {/* 4. Singapore Island Weather Synopsis Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                  Island Average Temp
                </div>
                <div className="text-xl font-bold font-mono mt-1 text-slate-900 dark:text-slate-100">
                  {avgTemp !== null ? `${avgTemp}°C` : '—'}
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-sky-500" />
                  Raining Stations
                </div>
                <div className="text-xl font-bold font-mono mt-1 text-slate-900 dark:text-slate-100">
                  {activeRainStationsCount} / {totalRainStations}
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-indigo-500" />
                  Active Weather Effect
                </div>
                <div className="text-sm font-bold capitalize mt-1.5 text-slate-800 dark:text-slate-200">
                  {effectMode === 'auto'
                    ? liveRainfallMm > 0
                      ? '🌧️ Rain (Auto)'
                      : livePsiValue > 100
                      ? '🌫️ Haze (Auto)'
                      : '☀️ Sunny (Auto)'
                    : `${effectMode === 'sunny' ? '☀️' : effectMode === 'raining' ? '🌧️' : '🌫️'} ${effectMode}`}
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  API Health Status
                </div>
                <button
                  type="button"
                  onClick={() => setIsHealthModalOpen(true)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-1.5 block cursor-pointer"
                >
                  {healthData?.status || 'Online'} • {healthData?.averageLatencyMs || '—'}ms →
                </button>
              </div>
            </div>

            {/* 5. NEA Official Health & Activity Advisory */}
            <div id="health-advisory-section">
              <HealthAdvisoryCard
                psiCategory={psiCategory}
                psiValue={livePsiValue}
              />
            </div>
          </>
        )}
      </main>

      {/* Footer with NEA / Data.gov.sg Attributions & Health endpoint link */}
      <footer className="mt-12 border-t border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <CloudSun className="w-4 h-4 text-amber-500" />
            <span>
              Real-time weather data provided by Singapore <strong>National Environment Agency (NEA)</strong> via Data.gov.sg API v2.
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsHealthModalOpen(true)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
            >
              Monitor API Health
            </button>
            <span>•</span>
            <a
              href="/api/health.js"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 dark:text-slate-300 hover:underline flex items-center gap-1 font-mono"
            >
              /api/health.js <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ApiHealthModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        healthData={healthData}
        isLoading={isRefreshing}
        onRefresh={() => loadAllData(true)}
      />

      <StationsDrawer
        isOpen={isStationsModalOpen}
        onClose={() => setIsStationsModalOpen(false)}
        tempData={temperatureData}
        rainData={rainfallData}
        currentLocation={currentLocation}
        onSelectStation={setCurrentLocation}
      />
    </div>
  );
}
