import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CloudRain, Sun, CloudFog } from 'lucide-react';
import { WeatherEffectMode } from '../types/weather';
import { HappySun } from './HappySun';
import { RainfallEffect } from './RainfallEffect';
import { HazeEffect } from './HazeEffect';

interface WeatherEffectsProps {
  mode: WeatherEffectMode;
  onModeChange: (mode: WeatherEffectMode) => void;
  liveRainfallMm: number;
  livePsiValue: number;
  isNight?: boolean;
}

export const WeatherEffects: React.FC<WeatherEffectsProps> = ({
  mode,
  onModeChange,
  liveRainfallMm,
  livePsiValue,
}) => {
  // Determine resolved active effect
  const resolvedEffect: 'sunny' | 'raining' | 'hazy' = (() => {
    if (mode === 'sunny') return 'sunny';
    if (mode === 'raining') return 'raining';
    if (mode === 'hazy') return 'hazy';

    // Auto resolution based on live Singapore data:
    if (liveRainfallMm > 0.0) return 'raining';
    if (livePsiValue > 100) return 'hazy';
    return 'sunny';
  })();

  return (
    <>
      {/* Background Atmosphere Tint based on Resolved Weather */}
      <AnimatePresence mode="wait">
        <motion.div
          key={resolvedEffect}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 pointer-events-none -z-20 transition-colors"
        >
          {resolvedEffect === 'sunny' && (
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-sky-400/5 to-transparent" />
          )}
          {resolvedEffect === 'raining' && (
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-sky-950/30 to-slate-950/40" />
          )}
          {resolvedEffect === 'hazy' && (
            <div className="absolute inset-0 bg-gradient-to-b from-amber-900/25 via-stone-900/20 to-orange-950/20" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Weather Particle / Dynamic Atmosphere Layer */}
      {resolvedEffect === 'raining' && (
        <RainfallEffect rainfallMm={liveRainfallMm || 2.4} />
      )}

      {resolvedEffect === 'hazy' && (
        <HazeEffect psiValue={livePsiValue || 125} />
      )}

      {/* Floating Happy Smiling Sun in the Top-Right Sky when Sunny */}
      {resolvedEffect === 'sunny' && (
        <div className="fixed top-16 right-4 sm:top-20 sm:right-8 z-10 pointer-events-auto">
          <HappySun size={110} />
        </div>
      )}

      {/* Quick Weather Effect Switcher Widget (Fixed at bottom-right or accessible on mobile) */}
      <div className="fixed bottom-4 right-4 z-30">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-1.5 flex items-center gap-1 text-xs">
          <span className="hidden sm:inline-flex items-center gap-1 px-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">
            <Sparkles className="w-3 h-3 text-amber-500" /> Effects:
          </span>

          <button
            type="button"
            onClick={() => onModeChange('auto')}
            className={`px-2.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
              mode === 'auto'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Automatically reflects live Singapore conditions"
          >
            Auto Live
          </button>

          <button
            type="button"
            onClick={() => onModeChange('sunny')}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl font-medium flex items-center gap-1 transition-all cursor-pointer ${
              mode === 'sunny'
                ? 'bg-amber-500 text-amber-950 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Force Sunny with Smiling Sun"
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Sunny</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('raining')}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl font-medium flex items-center gap-1 transition-all cursor-pointer ${
              mode === 'raining'
                ? 'bg-sky-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Force Raining effect"
          >
            <CloudRain className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Rain</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('hazy')}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl font-medium flex items-center gap-1 transition-all cursor-pointer ${
              mode === 'hazy'
                ? 'bg-amber-700 text-amber-100 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Force Hazy smog effect"
          >
            <CloudFog className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Haze</span>
          </button>
        </div>
      </div>
    </>
  );
};
