import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Shirt,
  Footprints,
  ShoppingBag,
  MessageCircle,
  Volume2,
  RefreshCw,
  Sun,
  CloudRain,
  CloudFog,
} from 'lucide-react';
import { WeatherEffectMode } from '../types/weather';

interface SgWeatherCompanionProps {
  currentTemp: number | null;
  rainfallMm: number;
  psiValue: number;
  regionName: string;
  weatherMode: WeatherEffectMode;
}

export const SgWeatherCompanion: React.FC<SgWeatherCompanionProps> = ({
  currentTemp,
  rainfallMm,
  psiValue,
  regionName,
  weatherMode,
}) => {
  const [clickCount, setClickCount] = useState(0);
  const [isWinking, setIsWinking] = useState(false);

  // Resolved condition
  const condition: 'sunny' | 'raining' | 'hazy' = (() => {
    if (weatherMode === 'sunny') return 'sunny';
    if (weatherMode === 'raining') return 'raining';
    if (weatherMode === 'hazy') return 'hazy';
    if (rainfallMm > 0) return 'raining';
    if (psiValue > 100) return 'hazy';
    return 'sunny';
  })();

  // Authentic Singapore commentary based on condition
  const sunnyQuotes = [
    `Wah, around ${currentTemp ?? 32}°C in ${regionName}! Confirm chop sweating today. Drink more water lah! 🥤`,
    'Sun so bright, perfect weather to visit Sentosa or Gardens by the Bay! Don\'t forget sunscreen SPF 50! 🧴',
    'High UV index afternoon! Dabao lunch nearby or find air-conditioned food court to chill! 🍜',
    'Best day to dry thick bedsheets and towels! Will dry super fast under this glorious sun! ☀️',
  ];

  const rainQuotes = [
    `Alamak, raining ${rainfallMm.toFixed(1)}mm around ${regionName}! Better bring umbrella (brolly) before leaving! ☂️`,
    'Sudden monsoon shower! MRT floors can be slippery, watch your step ah! 🚇',
    'Rainy day cozy vibes! Shiok weather to slurp piping hot Bak Kut Teh or Laksa! 🍲',
    'Keep your laundry inside! Don\'t let the rain soak your clean clothes lah! 🧺',
  ];

  const hazeQuotes = [
    `Aiyoh, PSI is ${psiValue} in ${regionName}! Smells like burning forest. Sensitive lungs please wear N95 mask! 😷`,
    'Transboundary haze drifting in! Close house windows and switch on your HEPA air purifier ok! 💨',
    'Avoid outdoor jogging along East Coast Park today. Indoor gym workout much safer! 🏋️',
    'Drink more herbal tea or barley water to cool down throat irritations! 🍵',
  ];

  const quotes = condition === 'raining' ? rainQuotes : condition === 'hazy' ? hazeQuotes : sunnyQuotes;
  const currentQuote = quotes[clickCount % quotes.length];

  const handleCompanionTap = () => {
    setIsWinking(true);
    setClickCount((c) => c + 1);
    setTimeout(() => setIsWinking(false), 800);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50/90 via-purple-50/70 to-amber-50/60 dark:from-slate-900/90 dark:via-indigo-950/40 dark:to-slate-900/90 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-indigo-100 dark:border-indigo-900/60 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100/80 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg tracking-tight text-slate-900 dark:text-slate-100">
                Ollie the SG Weather Companion
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300">
                Singapore Mascot
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your friendly local Singapore otter buddy with daily lifestyle weather tips
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCompanionTap}
          className="self-start sm:self-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Tap for more tips</span>
        </button>
      </div>

      {/* Main Mascot & Speech Bubble Row */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Animated SG Otter Mascot Character */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCompanionTap}
          className="relative cursor-pointer shrink-0"
          title="Tap me for more Singapore weather advice!"
        >
          {/* Mascot Glow Ambient */}
          <div className="absolute -inset-2 bg-gradient-to-r from-amber-400/30 to-pink-500/30 rounded-full blur-xl opacity-60 animate-pulse pointer-events-none" />

          {/* Character SVG */}
          <div className="w-36 h-36 relative select-none">
            <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-xl overflow-visible">
              <defs>
                <linearGradient id="otterFur" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8D6E63" />
                  <stop offset="100%" stopColor="#5D4037" />
                </linearGradient>
                <linearGradient id="otterBelly" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFF8E1" />
                  <stop offset="100%" stopColor="#FFE082" />
                </linearGradient>
              </defs>

              {/* Otter Ears */}
              <circle cx="48" cy="50" r="14" fill="#5D4037" />
              <circle cx="48" cy="50" r="8" fill="#FFAB91" />
              <circle cx="112" cy="50" r="14" fill="#5D4037" />
              <circle cx="112" cy="50" r="8" fill="#FFAB91" />

              {/* Otter Body & Tail */}
              <path d="M125,120 Q150,110 145,135 Q130,145 110,135 Z" fill="#5D4037" />
              <ellipse cx="80" cy="95" rx="44" ry="46" fill="url(#otterFur)" />

              {/* Otter Cream Belly */}
              <ellipse cx="80" cy="104" rx="26" ry="30" fill="url(#otterBelly)" />

              {/* Otter Head */}
              <ellipse cx="80" cy="65" rx="38" ry="34" fill="url(#otterFur)" />
              <ellipse cx="80" cy="74" rx="26" ry="18" fill="url(#otterBelly)" />

              {/* Eyes */}
              <ellipse cx="64" cy="60" rx="5" ry={isWinking ? 1 : 5} fill="#271c19" />
              {!isWinking && <circle cx="62" cy="58" r="1.8" fill="#ffffff" />}

              <ellipse cx="96" cy="60" rx="5" ry="5" fill="#271c19" />
              <circle cx="94" cy="58" r="1.8" fill="#ffffff" />

              {/* Cute Pink Cheeks */}
              <ellipse cx="55" cy="72" rx="6" ry="4" fill="#FF8A80" opacity="0.8" />
              <ellipse cx="105" cy="72" rx="6" ry="4" fill="#FF8A80" opacity="0.8" />

              {/* Button Nose & Whiskers */}
              <ellipse cx="80" cy="68" rx="5" ry="3.5" fill="#271c19" />
              <path d="M72,72 Q80,78 88,72" stroke="#271c19" strokeWidth="2.5" fill="none" strokeLinecap="round" />

              {/* Whiskers */}
              <path d="M50,68 L36,65 M50,72 L34,73 M110,68 L124,65 M110,72 L126,73" stroke="#8D6E63" strokeWidth="1.5" strokeLinecap="round" />

              {/* CONDITION ACCESSORIES */}
              {/* Sunny: Trendy Sunglasses */}
              {condition === 'sunny' && (
                <g>
                  <rect x="52" y="52" width="24" height="15" rx="6" fill="#1e293b" />
                  <rect x="84" y="52" width="24" height="15" rx="6" fill="#1e293b" />
                  <path d="M76,58 L84,58" stroke="#1e293b" strokeWidth="3" />
                  {/* Sunglass lens reflection */}
                  <line x1="56" y1="56" x2="68" y2="62" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                  <line x1="88" y1="56" x2="100" y2="62" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                </g>
              )}

              {/* Raining: Yellow Raincoat Hood & Umbrella */}
              {condition === 'raining' && (
                <g>
                  {/* Umbrella */}
                  <path d="M12,40 Q40,10 68,40 Z" fill="#EF4444" />
                  <path d="M40,10 L40,65 Q40,75 32,75" stroke="#94a3b8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  {/* Water droplets */}
                  <circle cx="15" cy="55" r="2.5" fill="#38BDF8" />
                  <circle cx="65" cy="58" r="2.5" fill="#38BDF8" />
                </g>
              )}

              {/* Hazy: N95 Mask */}
              {condition === 'hazy' && (
                <g>
                  <path d="M60,65 Q80,84 100,65 L95,84 Q80,95 65,84 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                  <path d="M56,70 Q58,62 64,65 M104,70 Q102,62 96,65" stroke="#94A3B8" strokeWidth="1.5" fill="none" />
                  <text x="80" y="80" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#64748B">N95</text>
                </g>
              )}

              {/* Paws */}
              <ellipse cx="65" cy="115" rx="8" ry="6" fill="#5D4037" />
              <ellipse cx="95" cy="115" rx="8" ry="6" fill="#5D4037" />
            </svg>
          </div>
          <div className="text-[10px] text-center font-bold text-slate-500 mt-1">
            Tap Ollie! 🐾
          </div>
        </motion.div>

        {/* Dynamic Speech Bubble */}
        <div className="flex-1 w-full bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-md relative">
          {/* Arrow pointing to companion */}
          <div className="hidden md:block absolute -left-2 top-8 w-4 h-4 bg-white dark:bg-slate-800 border-l border-b border-slate-200 dark:border-slate-700 transform rotate-45" />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" /> Ollie says:
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                {condition === 'sunny' ? '☀️ Bright Singapore' : condition === 'raining' ? '🌧️ Wet Weather' : '🌫️ Haze Advisory'}
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
              "{currentQuote}"
            </p>
          </div>
        </div>
      </div>

      {/* 3 Interactive Daily Lifestyle Checkers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Laundry Check */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Shirt className="w-4 h-4 text-indigo-500" />
            Laundry Radar
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {condition === 'sunny'
              ? '✅ Perfect to Hang Outside'
              : condition === 'raining'
              ? '❌ Keep Laundry Indoors'
              : '⚠️ Dry Indoors (Hazy Smoke)'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {condition === 'sunny'
              ? 'Direct tropical sun will dry clothes in 2 hours.'
              : condition === 'raining'
              ? 'High chance of sudden monsoon drizzle soaking clothes.'
              : 'Airborne PM particles can settle on clean fabric.'}
          </p>
        </div>

        {/* Card 2: Outdoor Running / Sports */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Footprints className="w-4 h-4 text-emerald-500" />
            Outdoor Exercise
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {condition === 'sunny'
              ? (currentTemp ?? 30) > 33
                ? '⚠️ Hot: Run Evening / Night'
                : '✅ Great for Park Connectors'
              : condition === 'raining'
              ? '⚠️ Slippery Trails / Wet'
              : '❌ Indoor Gym Preferred'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {condition === 'sunny'
              ? 'Keep workouts to early morning or after sunset.'
              : condition === 'raining'
              ? 'Sheltered running tracks or indoor gym recommended.'
              : 'Elevated PSI irritates throat and lungs during heavy breathing.'}
          </p>
        </div>

        {/* Card 3: What to pack in bag */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            What to Pack in Bag
          </div>
          <div className="flex flex-wrap gap-1 text-[11px] font-semibold mt-1">
            {condition === 'sunny' ? (
              <>
                <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  Sunscreen 🧴
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200">
                  Water Bottle 🥤
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200">
                  UV Sunglasses 🕶️
                </span>
              </>
            ) : condition === 'raining' ? (
              <>
                <span className="px-2 py-0.5 rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200">
                  Foldable Umbrella ☂️
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                  Waterproof Pouch 📱
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  Small Towel 🧖
                </span>
              </>
            ) : (
              <>
                <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200">
                  N95 Mask 😷
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                  Eye Drops 💧
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  Herbal Tea / Water 🍵
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
