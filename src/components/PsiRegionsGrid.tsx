import React from 'react';
import { Gauge, MapPin, ArrowRight } from 'lucide-react';
import { PsiData, RegionKey } from '../types/weather';
import { SINGAPORE_REGIONS } from '../utils/geo';
import { getPsiCategory } from '../services/neaApi';

interface PsiRegionsGridProps {
  psiData: PsiData | null;
  activeRegion: RegionKey;
  onSelectRegion: (region: RegionKey) => void;
}

export const PsiRegionsGrid: React.FC<PsiRegionsGridProps> = ({
  psiData,
  activeRegion,
  onSelectRegion,
}) => {
  const regions: RegionKey[] = ['central', 'north', 'south', 'east', 'west'];

  const nationalPsi = psiData?.readings.psi_twenty_four_hourly?.national ?? 0;
  const nationalCat = getPsiCategory(nationalPsi);

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-4">
      {/* Title & National Average Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-indigo-500" />
            Island-Wide PSI by Region
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare air quality across the 5 Singapore geographic sectors
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">National Avg:</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${nationalCat.badgeColor}`}>
            {nationalPsi} • {nationalCat.label}
          </span>
        </div>
      </div>

      {/* 5 Regions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {regions.map((reg) => {
          const psi = psiData?.readings.psi_twenty_four_hourly?.[reg] ?? 0;
          const pm25 = psiData?.readings.pm25_twenty_four_hourly?.[reg] ?? 0;
          const cat = getPsiCategory(psi);
          const isSelected = activeRegion === reg;
          const meta = SINGAPORE_REGIONS[reg];

          return (
            <button
              key={reg}
              type="button"
              onClick={() => onSelectRegion(reg)}
              className={`p-4 rounded-2xl text-left transition-all border flex flex-col justify-between cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'ring-2 ring-indigo-500 shadow-md bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800'
                  : 'bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/70 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    {meta.label}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.badgeColor}`}>
                    {cat.label}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">
                  {meta.description}
                </p>
              </div>

              <div className="my-3 flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-black font-mono text-slate-900 dark:text-slate-100">
                    {psi}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">24-hr PSI</div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-slate-700 dark:text-slate-300">
                    {pm25}
                  </div>
                  <div className="text-[10px] text-slate-400">PM2.5 (µg/m³)</div>
                </div>
              </div>

              {/* Progress bar visual */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    psi > 200 ? 'bg-rose-500' : psi > 100 ? 'bg-amber-500' : psi > 50 ? 'bg-blue-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (psi / 200) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline">
                <span>{isSelected ? 'Currently Selected' : 'View this sector'}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
