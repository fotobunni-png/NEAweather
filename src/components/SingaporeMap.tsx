import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Thermometer,
  CloudRain,
  Gauge,
  MapPin,
  Info,
  Maximize2,
  Check,
} from 'lucide-react';
import {
  LocationSelection,
  PsiData,
  RainfallData,
  RegionKey,
  TemperatureData,
  WeatherStation,
} from '../types/weather';
import { SINGAPORE_REGIONS, calculateDistanceKm, getClosestRegion } from '../utils/geo';
import { getPsiCategory, getRainCategory } from '../services/neaApi';

interface SingaporeMapProps {
  currentLocation: LocationSelection;
  onSelectLocation: (loc: LocationSelection) => void;
  tempData: TemperatureData | null;
  rainData: RainfallData | null;
  psiData: PsiData | null;
}

type MapLayer = 'psi' | 'temp' | 'rain';

export const SingaporeMap: React.FC<SingaporeMapProps> = ({
  currentLocation,
  onSelectLocation,
  tempData,
  rainData,
  psiData,
}) => {
  const [activeLayer, setActiveLayer] = useState<MapLayer>('psi');
  const [hoveredStation, setHoveredStation] = useState<{
    name: string;
    value: string;
    subtext: string;
    x: number;
    y: number;
  } | null>(null);

  // Geographic projection from GPS (lat, lon) to SVG ViewBox (900x520)
  const projectToSvg = (lat: number, lon: number) => {
    const minLon = 103.60;
    const maxLon = 104.05;
    const minLat = 1.23;
    const maxLat = 1.47;

    const x = ((lon - minLon) / (maxLon - minLon)) * 760 + 70;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 400 + 60;
    return { x: Math.round(x), y: Math.round(y) };
  };

  // Region colors based on PSI
  const getRegionFill = (region: RegionKey) => {
    const psi = psiData?.readings.psi_twenty_four_hourly?.[region] ?? 0;
    const isSelected = currentLocation.region === region;

    if (psi <= 50) return isSelected ? '#10b981' : '#34d399'; // Emerald
    if (psi <= 100) return isSelected ? '#0ea5e9' : '#38bdf8'; // Sky blue
    if (psi <= 200) return isSelected ? '#f59e0b' : '#fbbf24'; // Amber
    if (psi <= 300) return isSelected ? '#f43f5e' : '#fb7185'; // Rose
    return isSelected ? '#a855f7' : '#c084fc'; // Purple
  };

  const getRegionOpacity = (region: RegionKey) => {
    return currentLocation.region === region ? 0.85 : 0.45;
  };

  // Map of temperature readings by station ID
  const tempMap = new Map<string, number>();
  tempData?.readings.forEach((r) => tempMap.set(r.stationId, r.value));

  // Map of rainfall readings by station ID
  const rainMap = new Map<string, number>();
  rainData?.readings.forEach((r) => rainMap.set(r.stationId, r.value));

  const handleRegionClick = (region: RegionKey) => {
    const meta = SINGAPORE_REGIONS[region];
    onSelectLocation({
      type: 'region',
      name: `${meta.label} Singapore`,
      latitude: meta.location.latitude,
      longitude: meta.location.longitude,
      region,
      nearestTempStation: currentLocation.nearestTempStation,
      nearestRainStation: currentLocation.nearestRainStation,
    });
  };

  const handleStationClick = (station: WeatherStation, type: 'temp' | 'rain') => {
    const region = getClosestRegion(station.location.latitude, station.location.longitude);
    onSelectLocation({
      type: 'station',
      name: station.name,
      latitude: station.location.latitude,
      longitude: station.location.longitude,
      region,
      nearestTempStation: type === 'temp' ? station : currentLocation.nearestTempStation,
      nearestRainStation: type === 'rain' ? station : currentLocation.nearestRainStation,
    });
  };

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
      {/* Top Header & Layer Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-black text-lg tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              Interactive Singapore Weather Map
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              Live Radar
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tap any sector or station pin to monitor local microclimate
          </p>
        </div>

        {/* Layer Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveLayer('psi')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeLayer === 'psi'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>PSI Sectors</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('temp')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeLayer === 'temp'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-amber-500" />
            <span>Temperature</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('rain')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeLayer === 'rain'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-sky-500" />
            <span>Rainfall Radar</span>
          </button>
        </div>
      </div>

      {/* Main SVG Map Container */}
      <div className="relative w-full aspect-[900/500] max-h-[500px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
        {/* Subtle Map Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Dynamic Map Layer Tooltip */}
        <AnimatePresence>
          {hoveredStation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute z-30 pointer-events-none bg-slate-900/95 text-white border border-slate-700 px-3 py-1.5 rounded-xl shadow-2xl text-xs backdrop-blur-md"
              style={{
                left: `${(hoveredStation.x / 900) * 100}%`,
                top: `${(hoveredStation.y / 520) * 100}%`,
                transform: 'translate(-50%, -120%)',
              }}
            >
              <div className="font-bold flex items-center gap-1.5">
                <span>{hoveredStation.name}</span>
                <span className="text-amber-400 font-mono">{hoveredStation.value}</span>
              </div>
              <div className="text-[10px] text-slate-400">{hoveredStation.subtext}</div>
            </motion.div>
          )}
        </AnimatePresence>

        <svg
          viewBox="0 0 900 520"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Water gradient */}
            <radialGradient id="oceanGrad" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#0b1329" />
              <stop offset="100%" stopColor="#060913" />
            </radialGradient>

            {/* Pulsing ripple for active rain */}
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Ocean Water Background */}
          <rect width="900" height="520" fill="url(#oceanGrad)" />

          {/* Waterway Labels */}
          <text x="450" y="40" fill="#334155" fontSize="12" fontWeight="600" textAnchor="middle" letterSpacing="3">
            STRAITS OF JOHOR
          </text>
          <text x="450" y="495" fill="#334155" fontSize="12" fontWeight="600" textAnchor="middle" letterSpacing="3">
            SINGAPORE STRAIT
          </text>

          {/* ========================================================= */}
          {/* SINGAPORE REGIONS / ISLAND OUTLINE POLYGONS               */}
          {/* ========================================================= */}

          {/* 1. WEST REGION */}
          <g
            className="cursor-pointer transition-transform hover:opacity-95"
            onClick={() => handleRegionClick('west')}
          >
            <path
              d="M100,240 Q130,190 200,180 L290,195 L280,310 L190,360 L140,320 L100,310 Z"
              fill={getRegionFill('west')}
              fillOpacity={getRegionOpacity('west')}
              stroke="#0f172a"
              strokeWidth="2.5"
            />
          </g>

          {/* 2. NORTH REGION */}
          <g
            className="cursor-pointer transition-transform hover:opacity-95"
            onClick={() => handleRegionClick('north')}
          >
            <path
              d="M200,180 Q280,100 420,110 L480,140 L450,230 L290,195 Z"
              fill={getRegionFill('north')}
              fillOpacity={getRegionOpacity('north')}
              stroke="#0f172a"
              strokeWidth="2.5"
            />
          </g>

          {/* 3. CENTRAL REGION */}
          <g
            className="cursor-pointer transition-transform hover:opacity-95"
            onClick={() => handleRegionClick('central')}
          >
            <path
              d="M290,195 L450,230 L490,280 L440,360 L360,360 L280,310 Z"
              fill={getRegionFill('central')}
              fillOpacity={getRegionOpacity('central')}
              stroke="#0f172a"
              strokeWidth="2.5"
            />
          </g>

          {/* 4. EAST REGION */}
          <g
            className="cursor-pointer transition-transform hover:opacity-95"
            onClick={() => handleRegionClick('east')}
          >
            <path
              d="M480,140 Q620,130 760,200 L790,260 L680,300 L540,320 L490,280 L450,230 Z"
              fill={getRegionFill('east')}
              fillOpacity={getRegionOpacity('east')}
              stroke="#0f172a"
              strokeWidth="2.5"
            />
          </g>

          {/* 5. SOUTH REGION */}
          <g
            className="cursor-pointer transition-transform hover:opacity-95"
            onClick={() => handleRegionClick('south')}
          >
            <path
              d="M360,360 L440,360 L490,280 L540,320 L510,380 L410,400 L350,380 Z"
              fill={getRegionFill('south')}
              fillOpacity={getRegionOpacity('south')}
              stroke="#0f172a"
              strokeWidth="2.5"
            />
          </g>

          {/* Sentosa Island */}
          <path
            d="M380,410 Q420,410 440,425 Q410,435 375,420 Z"
            fill={getRegionFill('south')}
            fillOpacity={getRegionOpacity('south')}
            stroke="#0f172a"
            strokeWidth="1.5"
            className="cursor-pointer"
            onClick={() => handleRegionClick('south')}
          />

          {/* Jurong Island */}
          <path
            d="M170,375 Q210,365 240,385 Q220,415 175,410 Z"
            fill={getRegionFill('west')}
            fillOpacity={getRegionOpacity('west')}
            stroke="#0f172a"
            strokeWidth="1.5"
            className="cursor-pointer"
            onClick={() => handleRegionClick('west')}
          />

          {/* Pulau Ubin & Pulau Tekong */}
          <path
            d="M660,130 Q700,125 720,140 Q685,150 655,140 Z"
            fill={getRegionFill('east')}
            fillOpacity={getRegionOpacity('east')}
            stroke="#0f172a"
            strokeWidth="1"
          />
          <path
            d="M740,135 Q785,130 805,155 Q780,180 745,160 Z"
            fill={getRegionFill('east')}
            fillOpacity={getRegionOpacity('east')}
            stroke="#0f172a"
            strokeWidth="1"
          />

          {/* ========================================================= */}
          {/* LAYER 1: PSI REGIONS LABELS & CENTROID BADGES             */}
          {/* ========================================================= */}
          {activeLayer === 'psi' && (
            <>
              {(['central', 'north', 'south', 'east', 'west'] as RegionKey[]).map((reg) => {
                const meta = SINGAPORE_REGIONS[reg];
                const pt = projectToSvg(meta.location.latitude, meta.location.longitude);
                const psi = psiData?.readings.psi_twenty_four_hourly?.[reg] ?? 0;
                const cat = getPsiCategory(psi);
                const isSelected = currentLocation.region === reg;

                return (
                  <g
                    key={reg}
                    transform={`translate(${pt.x}, ${pt.y})`}
                    className="cursor-pointer"
                    onClick={() => handleRegionClick(reg)}
                  >
                    {/* Pulsing ring if selected */}
                    {isSelected && (
                      <circle
                        r="32"
                        fill="none"
                        stroke="#818cf8"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        className="animate-spin"
                        style={{ transformOrigin: '0 0' }}
                      />
                    )}

                    {/* Centroid Badge */}
                    <circle r="22" fill="#0f172a" stroke={cat.borderColor.includes('emerald') ? '#10b981' : cat.borderColor.includes('blue') ? '#0ea5e9' : '#f59e0b'} strokeWidth="2.5" />
                    <text
                      y="-4"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="13"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {psi}
                    </text>
                    <text
                      y="9"
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="8"
                      fontWeight="600"
                    >
                      PSI
                    </text>

                    {/* Region Title Tag */}
                    <rect
                      x="-38"
                      y="26"
                      width="76"
                      height="16"
                      rx="8"
                      fill="#1e293b"
                      stroke="#334155"
                      strokeWidth="1"
                    />
                    <text
                      y="37"
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {meta.label.toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </>
          )}

          {/* ========================================================= */}
          {/* LAYER 2: TEMPERATURE STATIONS PINS                        */}
          {/* ========================================================= */}
          {activeLayer === 'temp' && (
            <>
              {tempData?.stations.map((st) => {
                const pt = projectToSvg(st.location.latitude, st.location.longitude);
                const temp = tempMap.get(st.id);
                const isSelected = currentLocation.nearestTempStation?.id === st.id;

                return (
                  <g
                    key={st.id}
                    transform={`translate(${pt.x}, ${pt.y})`}
                    className="cursor-pointer group"
                    onClick={() => handleStationClick(st, 'temp')}
                    onMouseEnter={() =>
                      setHoveredStation({
                        name: st.name,
                        value: temp !== undefined ? `${temp.toFixed(1)}°C` : '—',
                        subtext: `Station ID: ${st.id}`,
                        x: pt.x,
                        y: pt.y,
                      })
                    }
                    onMouseLeave={() => setHoveredStation(null)}
                  >
                    <circle
                      r={isSelected ? 16 : 12}
                      fill={isSelected ? '#f59e0b' : '#1e293b'}
                      stroke={isSelected ? '#ffffff' : '#f59e0b'}
                      strokeWidth="2"
                    />
                    <text
                      y="3.5"
                      textAnchor="middle"
                      fill={isSelected ? '#0f172a' : '#fbbf24'}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {temp !== undefined ? Math.round(temp) : '—'}°
                    </text>

                    {/* Label below if selected */}
                    {isSelected && (
                      <text
                        y="28"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                        filter="url(#glowFilter)"
                      >
                        {st.name.slice(0, 14)}
                      </text>
                    )}
                  </g>
                );
              })}
            </>
          )}

          {/* ========================================================= */}
          {/* LAYER 3: RAINFALL RADAR PINS                              */}
          {/* ========================================================= */}
          {activeLayer === 'rain' && (
            <>
              {rainData?.stations.map((st) => {
                const pt = projectToSvg(st.location.latitude, st.location.longitude);
                const rain = rainMap.get(st.id) ?? 0;
                const isRaining = rain > 0;
                const isSelected = currentLocation.nearestRainStation?.id === st.id;

                return (
                  <g
                    key={st.id}
                    transform={`translate(${pt.x}, ${pt.y})`}
                    className="cursor-pointer group"
                    onClick={() => handleStationClick(st, 'rain')}
                    onMouseEnter={() =>
                      setHoveredStation({
                        name: st.name,
                        value: `${rain.toFixed(1)} mm`,
                        subtext: isRaining ? 'Precipitation detected' : 'Dry conditions',
                        x: pt.x,
                        y: pt.y,
                      })
                    }
                    onMouseLeave={() => setHoveredStation(null)}
                  >
                    {/* Animated Ripple if raining */}
                    {isRaining && (
                      <circle
                        r="14"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        opacity="0.75"
                        className="animate-ping"
                      />
                    )}

                    <circle
                      r={isRaining ? 8 : 4}
                      fill={isRaining ? '#0284c7' : '#334155'}
                      stroke={isRaining ? '#bae6fd' : '#475569'}
                      strokeWidth={isRaining ? 2 : 1}
                    />

                    {isRaining && (
                      <text
                        y="18"
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="8"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {rain}mm
                      </text>
                    )}
                  </g>
                );
              })}
            </>
          )}

          {/* Current Selected Pin Highlight Marker */}
          {(() => {
            const curPt = projectToSvg(currentLocation.latitude, currentLocation.longitude);
            return (
              <g transform={`translate(${curPt.x}, ${curPt.y})`} className="pointer-events-none">
                <circle
                  r="24"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  opacity="0.8"
                  className="animate-pulse"
                />
                <circle r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                <path d="M-6,-22 L6,-22 L0,-12 Z" fill="#ef4444" />
                <rect x="-35" y="-36" width="70" height="14" rx="7" fill="#ef4444" />
                <text
                  y="-26"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="8"
                  fontWeight="bold"
                >
                  YOU ARE HERE
                </text>
              </g>
            );
          })()}
        </svg>

        {/* Legend / Helper Footer Bar Inside Map */}
        <div className="absolute bottom-2.5 left-3 right-3 flex flex-wrap items-center justify-between text-[11px] text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Good (0-50)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Moderate (51-100)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Unhealthy (101-200)
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <Info className="w-3 h-3" />
            <span>Click any island region to focus</span>
          </div>
        </div>
      </div>
    </div>
  );
};
