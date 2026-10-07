import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Server,
  Zap,
  Clock,
  Database,
  X,
  Code,
} from 'lucide-react';
import { HealthCheckResponse } from '../types/weather';

interface ApiHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  healthData: HealthCheckResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const ApiHealthModal: React.FC<ApiHealthModalProps> = ({
  isOpen,
  onClose,
  healthData,
  isLoading,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'json'>('status');

  if (!isOpen) return null;

  const isHealthy = healthData?.status === 'HEALTHY';
  const isDegraded = healthData?.status === 'DEGRADED';

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
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  isHealthy
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                    : isDegraded
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                }`}
              >
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
                  NEA API Health Monitor
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                      isHealthy
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : isDegraded
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {healthData?.status || 'CHECKING'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Live status of Data.gov.sg real-time weather &amp; PSI endpoints
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
                title="Refresh health checks"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 pt-2 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              type="button"
              onClick={() => setActiveTab('status')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'status'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Endpoints ({healthData?.apis?.length || 3})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('json')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'json'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              /api/health.js Output
            </button>
          </div>

          {/* Content Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
            {activeTab === 'status' ? (
              <>
                {/* Latency and Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" /> Average Latency
                    </div>
                    <div className="text-xl font-bold mt-1 text-slate-800 dark:text-slate-100">
                      {healthData?.averageLatencyMs ?? '—'}{' '}
                      <span className="text-xs font-normal text-slate-500">ms</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Server className="w-3 h-3 text-emerald-500" /> Operational
                    </div>
                    <div className="text-xl font-bold mt-1 text-slate-800 dark:text-slate-100">
                      {healthData?.apis?.filter((a) => a.healthy).length || 0} /{' '}
                      {healthData?.apis?.length || 3}
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-500" /> Checked At
                    </div>
                    <div className="text-xs font-medium mt-1.5 text-slate-700 dark:text-slate-300 truncate">
                      {healthData?.timestamp
                        ? new Date(healthData.timestamp).toLocaleTimeString()
                        : 'Checking...'}
                    </div>
                  </div>
                </div>

                {/* API Cards List */}
                <div className="space-y-3">
                  {healthData?.apis?.map((api) => {
                    const isApiHealthy = api.healthy;
                    return (
                      <div
                        key={api.id}
                        className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/70 shadow-sm hover:shadow transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {isApiHealthy ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                              )}
                              <h4 className="font-semibold text-sm">{api.name}</h4>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  api.statusCode === 200
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                }`}
                              >
                                HTTP {api.statusCode || 'ERR'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono break-all">
                              {api.endpoint}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                              {api.latencyMs} ms
                            </div>
                            <div className="text-[11px] text-slate-400">response time</div>
                          </div>
                        </div>

                        {/* Extra stats */}
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                          <div className="flex items-center gap-3">
                            {api.stationCount !== undefined && (
                              <span className="flex items-center gap-1">
                                <Database className="w-3 h-3 text-slate-400" />
                                {api.stationCount} stations/regions
                              </span>
                            )}
                            {api.dataTimestamp && (
                              <span className="flex items-center gap-1 truncate max-w-[200px]">
                                <Clock className="w-3 h-3 text-slate-400" />
                                Data: {new Date(api.dataTimestamp).toLocaleTimeString()}
                              </span>
                            )}
                          </div>

                          <a
                            href={api.endpoint}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                          >
                            Open Raw API <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Endpoint: <a href="/api/health.js" target="_blank" className="underline text-indigo-500">/api/health.js</a>
                  </span>
                  <a
                    href="/api/health.js"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                  >
                    Open endpoint directly <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[400px] border border-slate-800 leading-relaxed">
                  {JSON.stringify(healthData, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Automatic probe every 30 seconds</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
