import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  Thermometer,
  CloudRain,
  MapPin,
  Check,
  Compass,
  ArrowUpDown,
} from 'lucide-react';
import { LocationSelection, RainfallData, TemperatureData, WeatherStation } from '../types/weather';
import { calculateDistanceKm, getClosestRegion } from '../utils/geo';

interface StationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tempData: TemperatureData | null;
  rainData: RainfallData | null;
  currentLocation: LocationSelection;
  onSelectStation: (loc: LocationSelection) => void;
}

export const StationsDrawer: React.FC<StationsDrawerProps> = ({
  isOpen,
  onClose,
  tempData,
  rainData,
  currentLocation,
  onSelectStation,
}) => {
  const [activeTab, setActiveTab] = useState<'temp' | 'rain'>('temp');
  const [search, setSearch] = useState('');
  const [onlyRaining, setOnlyRaining] = useState(false);

  if (!isOpen) return null;

  const tempReadingsMap = new Map<string, number>();
  tempData?.readings.forEach((r) => tempReadingsMap.set(r.stationId, r.value));

  const rainReadingsMap = new Map<string, number>();
  rainData?.readings.forEach((r) => rainReadingsMap.set(r.stationId, r.value));

  const stationsToDisplay: {
    station: WeatherStation;
    value: number | null;
    distanceKm: number;
  }[] = (activeTab === 'temp' ? tempData?.stations || [] : rainData?.stations || []).map((st) => {
    const val =
      activeTab === 'temp'
        ? tempReadingsMap.get(st.id) ?? null
        : rainReadingsMap.get(st.id) ?? 0;
    const dist = calculateDistanceKm(
      currentLocation.latitude,
      currentLocation.longitude,
      st.location.latitude,
      st.location.longitude
    );
    return { station: st, value: val, distanceKm: dist };
  });

  const filteredStations = stationsToDisplay
    .filter((item) => {
      const matchSearch =
        item.station.name.toLowerCase().includes(search.toLowerCase()) ||
        item.station.id.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (activeTab === 'rain' && onlyRaining) {
        return (item.value || 0) > 0;
      }
      return true;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Singapore Weather Stations</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select any NEA station to inspect local microclimate
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('temp')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'temp'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Thermometer className="w-3.5 h-3.5" />
                  Temperature ({tempData?.stations.length || 18})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('rain')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'rain'
                      ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <CloudRain className="w-3.5 h-3.5" />
                  Rainfall ({rainData?.stations.length || 88})
                </button>
              </div>

              {activeTab === 'rain' && (
                <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyRaining}
                    onChange={(e) => setOnlyRaining(e.target.checked)}
                    className="rounded text-sky-600"
                  />
                  <span>Rain detected only</span>
                </label>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search station by name or code (e.g. Changi, Clementi, S109)..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Stations List */}
          <div className="p-4 overflow-y-auto space-y-2 flex-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Showing {filteredStations.length} stations (sorted by nearest distance)
            </div>

            {filteredStations.map(({ station, value, distanceKm }) => {
              const isSelected =
                currentLocation.nearestTempStation?.id === station.id ||
                currentLocation.nearestRainStation?.id === station.id;

              return (
                <button
                  key={station.id}
                  type="button"
                  onClick={() => {
                    const region = getClosestRegion(
                      station.location.latitude,
                      station.location.longitude
                    );
                    onSelectStation({
                      type: 'station',
                      name: station.name,
                      latitude: station.location.latitude,
                      longitude: station.location.longitude,
                      region,
                      nearestTempStation: activeTab === 'temp' ? station : currentLocation.nearestTempStation,
                      nearestRainStation: activeTab === 'rain' ? station : currentLocation.nearestRainStation,
                      distanceKm,
                    });
                    onClose();
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-400/40'
                      : 'bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200/70 dark:border-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {station.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">
                        {station.id}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {distanceKm} km from current pin
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-black font-mono">
                      {value !== null ? (
                        activeTab === 'temp' ? (
                          <span className="text-amber-600 dark:text-amber-400">
                            {value.toFixed(1)}°C
                          </span>
                        ) : (
                          <span
                            className={
                              value > 0
                                ? 'text-sky-600 dark:text-sky-400 font-bold'
                                : 'text-slate-400'
                            }
                          >
                            {value.toFixed(1)} mm
                          </span>
                        )
                      ) : (
                        '—'
                      )}
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                        Active Pin
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
