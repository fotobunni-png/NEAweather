import React from 'react';
import {
  ShieldAlert,
  HeartPulse,
  Users,
  Baby,
  Sparkles,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { PsiCategory } from '../services/neaApi';

interface HealthAdvisoryCardProps {
  psiCategory: PsiCategory;
  psiValue: number;
}

export const HealthAdvisoryCard: React.FC<HealthAdvisoryCardProps> = ({
  psiCategory,
  psiValue,
}) => {
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              NEA Health &amp; Activity Advisory
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Singapore Ministry of Health (MOH) &amp; NEA guidelines for PSI {psiValue} ({psiCategory.label})
            </p>
          </div>
        </div>

        <span className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-center ${psiCategory.badgeColor}`}>
          Band: {psiCategory.range} ({psiCategory.label})
        </span>
      </div>

      {/* Advisory Cards Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Healthy Population */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-xs">
            <Users className="w-4 h-4 text-emerald-500" />
            Healthy Individuals
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {psiCategory.activityGeneral}
          </p>
          <div className="text-[11px] text-slate-400">
            Jogging, cycling, and standard outdoor workouts.
          </div>
        </div>

        {/* Vulnerable Groups */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-xs">
            <Baby className="w-4 h-4 text-amber-500" />
            Elderly, Pregnant &amp; Children
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {psiCategory.activityVulnerable}
          </p>
          <div className="text-[11px] text-slate-400">
            Consider indoor activities if air becomes smoggy.
          </div>
        </div>

        {/* Chronic Conditions */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-xs">
            <HeartPulse className="w-4 h-4 text-rose-500" />
            Heart &amp; Chronic Lung Illness
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {psiValue > 100
              ? 'Avoid outdoor physical exertion. Keep prescribed medication on hand.'
              : 'Normal activities; observe symptoms and consult doctor if unwell.'}
          </p>
          <div className="text-[11px] text-slate-400">
            Asthma, COPD, or cardiovascular condition.
          </div>
        </div>
      </div>

      {/* Mask Guidance Banner */}
      <div
        className={`p-4 rounded-2xl border flex items-start gap-3 ${
          psiCategory.maskRecommended
            ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300/80 dark:border-amber-700/60 text-amber-900 dark:text-amber-200'
            : 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300/80 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-200'
        }`}
      >
        <div className="mt-0.5 shrink-0">
          {psiCategory.maskRecommended ? (
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          )}
        </div>
        <div className="space-y-0.5 text-xs">
          <div className="font-bold">
            {psiCategory.maskRecommended
              ? 'N95 Respirator Masks Advisable for Prolonged Outdoor Exposure'
              : 'Masks Not Required for General Activities'}
          </div>
          <p className="text-[11px] opacity-90 leading-relaxed">
            {psiCategory.maskRecommended
              ? 'N95 masks help filter out airborne PM2.5 particulate matter. Ensure a snug fit around nose and mouth. Vulnerable groups should stay in air-conditioned environments.'
              : 'Current PSI levels do not warrant respirator protection. Ordinary outdoor sports and transit are safe for all individuals.'}
          </p>
        </div>
      </div>
    </div>
  );
};
