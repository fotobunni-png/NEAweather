import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface HappySunProps {
  size?: number;
  className?: string;
  showSpeechBubble?: boolean;
}

export const HappySun: React.FC<HappySunProps> = ({
  size = 140,
  className = '',
  showSpeechBubble = true,
}) => {
  const [isWinking, setIsWinking] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [speechText, setSpeechText] = useState('Bright & Sunny! ☀️');
  const [showBubble, setShowBubble] = useState(showSpeechBubble);

  const greetings = [
    'Bright & Sunny! ☀️',
    'Stay hydrated in the heat! 🥤',
    'UV index is strong, wear sunscreen! 🧴',
    'Shining bright over Singapore! 🇸🇬',
    'Have a warm, lovely day! ✨',
    'Smile back at the sun! 😊',
  ];

  const handleSunClick = () => {
    setIsWinking(true);
    setClickCount((c) => c + 1);
    const nextGreeting = greetings[(clickCount + 1) % greetings.length];
    setSpeechText(nextGreeting);
    setShowBubble(true);
    setTimeout(() => setIsWinking(false), 900);
  };

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Ambient Sun Glow & Lens Flares */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.65, 0.4],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute rounded-full pointer-events-none -z-10"
        style={{
          width: size * 1.8,
          height: size * 1.8,
          background: 'radial-gradient(circle, rgba(254, 215, 102, 0.5) 0%, rgba(251, 146, 60, 0.2) 40%, rgba(255, 255, 255, 0) 70%)',
        }}
      />

      {/* Interactive Speech Bubble */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 sm:translate-x-4 sm:left-auto sm:-right-24 whitespace-nowrap bg-amber-500/90 hover:bg-amber-500 text-amber-950 font-semibold text-xs px-3 py-1.5 rounded-full shadow-lg border border-amber-300 backdrop-blur-md cursor-pointer transition-transform active:scale-95 z-20 flex items-center gap-1.5"
            onClick={handleSunClick}
          >
            <span>{speechText}</span>
            <span className="text-[10px] opacity-70 underline ml-0.5">tap me!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interactive Sun Body */}
      <motion.button
        type="button"
        onClick={handleSunClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="relative cursor-pointer focus:outline-none p-2 rounded-full focus:ring-4 focus:ring-amber-400/40"
        title="I'm the Happy Smiling Sun! Click me!"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 160 160"
          className="w-full h-full drop-shadow-xl overflow-visible"
        >
          <defs>
            {/* Core Sun Gradient */}
            <radialGradient id="sunCoreGradient" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFF176" />
              <stop offset="35%" stopColor="#FBC02D" />
              <stop offset="85%" stopColor="#FFA000" />
              <stop offset="100%" stopColor="#F57C00" />
            </radialGradient>

            {/* Ray Gradient */}
            <linearGradient id="rayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE082" />
              <stop offset="100%" stopColor="#FFB300" />
            </linearGradient>

            {/* Cheek Blush Gradient */}
            <radialGradient id="blushGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF6B8B" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FF8E53" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Rotating Sun Rays */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{
              duration: 24,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ transformOrigin: '80px 80px' }}
          >
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 360) / 12;
              return (
                <motion.path
                  key={i}
                  d="M75,18 Q80,2 85,18 L82,32 L78,32 Z"
                  fill="url(#rayGradient)"
                  transform={`rotate(${angle} 80 80)`}
                  animate={{
                    scaleY: [1, 1.15, 1],
                  }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    delay: (i % 3) * 0.4,
                    ease: 'easeInOut',
                  }}
                  style={{ transformOrigin: '80px 80px' }}
                />
              );
            })}
          </motion.g>

          {/* Secondary Soft Rays */}
          <motion.g
            animate={{ rotate: -360 }}
            transition={{
              duration: 36,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ transformOrigin: '80px 80px' }}
          >
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 360) / 12 + 15;
              return (
                <circle
                  key={`dot-${i}`}
                  cx="80"
                  cy="20"
                  r="3.5"
                  fill="#FFD54F"
                  transform={`rotate(${angle} 80 80)`}
                  opacity="0.9"
                />
              );
            })}
          </motion.g>

          {/* Central Sun Circle */}
          <motion.circle
            cx="80"
            cy="80"
            r="48"
            fill="url(#sunCoreGradient)"
            stroke="#FFE082"
            strokeWidth="2.5"
            animate={{
              scale: [1, 1.025, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: '80px 80px' }}
          />

          {/* Highlights / 3D Specular curve */}
          <ellipse
            cx="66"
            cy="58"
            rx="16"
            ry="9"
            fill="#FFFFFF"
            opacity="0.45"
            transform="rotate(-25 66 58)"
          />

          {/* Left Eye */}
          <g>
            <motion.ellipse
              cx="63"
              cy="74"
              rx="4.5"
              ry={isWinking ? 1 : 5.5}
              fill="#3E2723"
              animate={
                isWinking
                  ? { scaleY: 0.1 }
                  : {
                      scaleY: [1, 1, 0.1, 1, 1],
                    }
              }
              transition={{
                duration: 3.5,
                repeat: Infinity,
                times: [0, 0.88, 0.9, 0.92, 1],
              }}
              style={{ transformOrigin: '63px 74px' }}
            />
            {/* Left Eye Specular Reflection */}
            {!isWinking && (
              <circle cx="61.5" cy="72" r="1.8" fill="#FFFFFF" />
            )}
          </g>

          {/* Right Eye (Winks on click or cute smiling arc) */}
          <g>
            {isWinking ? (
              <path
                d="M93,75 Q97,71 101,75"
                stroke="#3E2723"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <>
                <motion.ellipse
                  cx="97"
                  cy="74"
                  rx="4.5"
                  ry="5.5"
                  fill="#3E2723"
                  animate={{
                    scaleY: [1, 1, 0.1, 1, 1],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    times: [0, 0.88, 0.9, 0.92, 1],
                  }}
                  style={{ transformOrigin: '97px 74px' }}
                />
                <circle cx="95.5" cy="72" r="1.8" fill="#FFFFFF" />
              </>
            )}
          </g>

          {/* Rosy Blush Cheeks */}
          <ellipse cx="54" cy="85" rx="7" ry="4.5" fill="url(#blushGradient)" />
          <ellipse cx="106" cy="85" rx="7" ry="4.5" fill="url(#blushGradient)" />

          {/* Happy Smiling Mouth */}
          <motion.path
            d="M68,86 Q80,102 92,86"
            stroke="#3E2723"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="#D32F2F"
            animate={{
              d: isWinking
                ? 'M66,85 Q80,105 94,85'
                : 'M68,86 Q80,101 92,86',
            }}
            transition={{ duration: 0.2 }}
          />

          {/* Tongue in Smiling Mouth */}
          <path
            d="M74,93 Q80,91 86,93 Q80,99 74,93 Z"
            fill="#FF8A80"
          />

          {/* Tiny Cheerful Dimple Accents */}
          <path
            d="M66,85 Q65,88 67,89"
            stroke="#3E2723"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
          <path
            d="M94,85 Q95,88 93,89"
            stroke="#3E2723"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
        </svg>
      </motion.button>
    </div>
  );
};
