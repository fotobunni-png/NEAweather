import React, { useEffect, useState } from 'react';
import {
  CloudSun,
  Activity,
  RefreshCw,
  Compass,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { HealthCheckResponse } from '../types/weather';

interface NavbarProps {
  healthData: HealthCheckResponse | null;
  onOpenHealthModal: () => void;
  onOpenStationsModal: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  healthData,
  onOpenHealthModal,
  onOpenStationsModal,
  onRefreshData,
  isRefreshing,
}) => {
  const [sgtTime, setSgtTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format in Singapore Time SGT (UTC+8)
      setSgtTime(
        now.toLocaleTimeString('en-SG', {
          timeZone: 'Asia/Singapore',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isHealthy = healthData?.status === 'HEALTHY';
  const isDegraded = healthData?.status === 'DEGRADED';
  const healthyCount = healthData?.apis?.filter((a) => a.healthy).length || 0;
  const totalCount = healthData?.apis?.length || 3;

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand & SGT Time */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <CloudSun className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-slate-100">
                SG Weather &amp; PSI
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                NEA Open API
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5">
              <span>SGT: {sgtTime || 'Singapore Time'}</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>24/7 Live</span>
            </div>
          </div>
        </div>

        {/* Right Actions: Stations, API Health Status Pill, Refresh */}
        <div className="flex items-center gap-2">
          {/* Weather Stations Explorer Button */}
          <button
            type="button"
            onClick={onOpenStationsModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-500" />
            <span>All Stations</span>
          </button>

          {/* API Health Pill (Requirement #2) */}
          <button
            type="button"
            onClick={onOpenHealthModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border shadow-sm ${
              isHealthy
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-100'
                : isDegraded
                ? 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 hover:bg-amber-100'
                : 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 hover:bg-rose-100'
            }`}
            title="Click to view /api/health monitoring diagnostics"
          >
            {isHealthy ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : isDegraded ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            )}
            <span className="font-mono text-[11px]">
              {healthyCount}/{totalCount} APIs
            </span>
            {healthData?.averageLatencyMs && (
              <span className="hidden sm:inline font-mono opacity-80 text-[10px]">
                ({healthData.averageLatencyMs}ms)
              </span>
            )}
          </button>

          {/* Refresh Data Button */}
          <button
            type="button"
            onClick={onRefreshData}
            disabled={isRefreshing}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh NEA weather & PSI data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
