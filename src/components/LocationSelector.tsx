import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  Check,
  Compass,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { LocationSelection, RegionKey, WeatherStation } from '../types/weather';
import {
  SINGAPORE_REGIONS,
  SINGAPORE_TOWNS,
  SingaporeTown,
  findNearestStation,
  getClosestRegion,
} from '../utils/geo';

interface LocationSelectorProps {
  currentLocation: LocationSelection;
  onSelectLocation: (loc: LocationSelection) => void;
  tempStations: WeatherStation[];
  rainStations: WeatherStation[];
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  currentLocation,
  onSelectLocation,
  tempStations,
  rainStations,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Trigger browser GPS Geolocation
  const handleLocateMe = () => {
    setIsLocating(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const region = getClosestRegion(latitude, longitude);
        const nearestTemp = findNearestStation(tempStations, latitude, longitude);
        const nearestRain = findNearestStation(rainStations, latitude, longitude);

        onSelectLocation({
          type: 'auto-gps',
          name: 'My GPS Location',
          latitude,
          longitude,
          region,
          nearestTempStation: nearestTemp?.station,
          nearestRainStation: nearestRain?.station,
          distanceKm: nearestTemp?.distanceKm,
        });

        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        let msg = 'Could not access GPS';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Select a town below.';
        }
        setGpsError(msg);
        setIsLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSelectTown = (town: SingaporeTown) => {
    const nearestTemp = findNearestStation(tempStations, town.location.latitude, town.location.longitude);
    const nearestRain = findNearestStation(rainStations, town.location.latitude, town.location.longitude);

    onSelectLocation({
      type: 'preset-town',
      name: town.name,
      latitude: town.location.latitude,
      longitude: town.location.longitude,
      region: town.region,
      nearestTempStation: nearestTemp?.station,
      nearestRainStation: nearestRain?.station,
      distanceKm: nearestTemp?.distanceKm,
    });
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleSelectRegion = (regionKey: RegionKey) => {
    const meta = SINGAPORE_REGIONS[regionKey];
    const nearestTemp = findNearestStation(tempStations, meta.location.latitude, meta.location.longitude);
    const nearestRain = findNearestStation(rainStations, meta.location.latitude, meta.location.longitude);

    onSelectLocation({
      type: 'region',
      name: `${meta.label} Singapore`,
      latitude: meta.location.latitude,
      longitude: meta.location.longitude,
      region: regionKey,
      nearestTempStation: nearestTemp?.station,
      nearestRainStation: nearestRain?.station,
      distanceKm: nearestTemp?.distanceKm,
    });
  };

  // Filter towns & stations based on search query
  const filteredTowns = SINGAPORE_TOWNS.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStations = tempStations.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-4">
      {/* Top Bar: Current Selected & GPS Trigger */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Monitoring Location
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{currentLocation.name}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {SINGAPORE_REGIONS[currentLocation.region]?.label}
              </span>
            </div>
            {currentLocation.nearestTempStation && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs mt-0.5">
                Nearest temp station: {currentLocation.nearestTempStation.name}
                {currentLocation.distanceKm !== undefined && (
                  <span> ({currentLocation.distanceKm} km away)</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Locate Me Action Button */}
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium text-xs shadow-md shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          {isLocating ? 'Detecting GPS...' : 'Use My GPS Location'}
        </button>
      </div>

      {gpsError && (
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
          <span>⚠️ {gpsError}</span>
        </div>
      )}

      {/* Region Fast-Tabs */}
      <div>
        <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5" /> Singapore Regions
        </div>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {(['central', 'north', 'south', 'east', 'west'] as RegionKey[]).map((r) => {
            const isSelected = currentLocation.region === r && currentLocation.type === 'region';
            return (
              <button
                key={r}
                type="button"
                onClick={() => handleSelectRegion(r)}
                className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {SINGAPORE_REGIONS[r].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular Towns Quick Tags & Search */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> Popular Towns
          </span>

          <button
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-medium lowercase first-letter:uppercase"
          >
            {isSearchOpen ? 'Hide search' : 'Search all towns & stations'}
            <ChevronDown className={`w-3 h-3 transition-transform ${isSearchOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Search input dropdown */}
        {isSearchOpen && (
          <div className="relative">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search town (e.g. Orchard, Jurong, Bedok, Changi, Ang Mo Kio)..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {searchQuery && (
              <div className="mt-2 max-h-48 overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 text-xs">
                {filteredTowns.map((town) => (
                  <button
                    key={town.id}
                    type="button"
                    onClick={() => handleSelectTown(town)}
                    className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200">{town.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase">{town.region}</span>
                  </button>
                ))}

                {filteredStations.map((station) => (
                  <button
                    key={station.id}
                    type="button"
                    onClick={() => {
                      const nearestRain = findNearestStation(
                        rainStations,
                        station.location.latitude,
                        station.location.longitude
                      );
                      const region = getClosestRegion(
                        station.location.latitude,
                        station.location.longitude
                      );
                      onSelectLocation({
                        type: 'station',
                        name: station.name,
                        latitude: station.location.latitude,
                        longitude: station.location.longitude,
                        region,
                        nearestTempStation: station,
                        nearestRainStation: nearestRain?.station,
                      });
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">
                      Station: {station.name}
                    </span>
                    <span className="text-[10px] text-slate-400">Station ID: {station.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Town Chips Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {SINGAPORE_TOWNS.slice(0, 10).map((town) => {
            const isSelected = currentLocation.name === town.name;
            return (
              <button
                key={town.id}
                type="button"
                onClick={() => handleSelectTown(town)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
                {town.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
