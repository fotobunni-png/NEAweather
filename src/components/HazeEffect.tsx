import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Wind, ShieldAlert } from 'lucide-react';

interface HazeEffectProps {
  psiValue?: number;
}

export const HazeEffect: React.FC<HazeEffectProps> = ({ psiValue = 132 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [intensity, setIntensity] = useState<'normal' | 'heavy'>(
    psiValue > 150 ? 'heavy' : 'normal'
  );

  // Density based on PSI and chosen intensity
  const particleMultiplier = intensity === 'heavy' ? 1.6 : 1.0;
  const particleCount = Math.round((psiValue > 150 ? 140 : 90) * particleMultiplier);
  const smogOpacity = intensity === 'heavy' ? 0.48 : 0.36;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      radius: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
      wobble: number;
      wobbleSpeed: number;
    }

    interface SmokePuff {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      speedX: number;
      opacity: number;
    }

    const particles: Particle[] = [];
    const smokePuffs: SmokePuff[] = [];

    const colors = [
      'rgba(245, 158, 11, ', // vivid amber particulate
      'rgba(217, 119, 6, ',  // warm ochre
      'rgba(180, 83, 9, ',   // deep bronze soot
      'rgba(168, 162, 158, ', // gray-ash PM10
      'rgba(120, 113, 108, ', // dark smog
    ];

    for (let i = 0; i < particleCount; i++) {
      const colorBase = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3.5 + 1.2,
        speedX: (Math.random() * 0.8 + 0.3) * (Math.random() > 0.15 ? 1 : -0.5),
        speedY: (Math.random() * 0.4 - 0.2),
        opacity: Math.random() * 0.5 + 0.25,
        color: colorBase,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.03 + 0.01,
      });
    }

    // Larger drifting smoke clouds
    for (let i = 0; i < 16; i++) {
      smokePuffs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 120 + 80,
        maxRadius: Math.random() * 180 + 100,
        speedX: Math.random() * 0.35 + 0.15,
        opacity: Math.random() * 0.08 + 0.04,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render drifting soft smoke puffs in background
      for (let i = 0; i < smokePuffs.length; i++) {
        const puff = smokePuffs[i];
        const grad = ctx.createRadialGradient(
          puff.x, puff.y, 0,
          puff.x, puff.y, puff.radius
        );
        grad.addColorStop(0, `rgba(217, 119, 6, ${puff.opacity})`);
        grad.addColorStop(0.6, `rgba(180, 83, 9, ${puff.opacity * 0.5})`);
        grad.addColorStop(1, 'rgba(120, 53, 15, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(puff.x, puff.y, puff.radius, 0, Math.PI * 2);
        ctx.fill();

        puff.x += puff.speedX;
        if (puff.x - puff.radius > width) {
          puff.x = -puff.radius;
          puff.y = Math.random() * height;
        }
      }

      // Render prominent airborne PM particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.wobble += p.wobbleSpeed;
        const currentY = p.y + Math.sin(p.wobble) * 2;

        ctx.beginPath();
        ctx.arc(p.x, currentY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.shadowBlur = p.radius * 2.5;
        ctx.shadowColor = `${p.color}0.7)`;
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around boundaries
        if (p.x > width + 15) p.x = -15;
        if (p.x < -15) p.x = width + 15;
        if (p.y > height + 15) p.y = -15;
        if (p.y < -15) p.y = height + 15;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleCount]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* 1. Heavy Amber-Sepia Atmospheric Smog Tint */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-amber-900/40 via-yellow-950/30 to-stone-900/45 transition-opacity duration-700"
        style={{ opacity: smogOpacity }}
      />

      {/* 2. Visual Smog Warm Haze Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(245, 158, 11, 0.08) 0%, rgba(180, 83, 9, 0.22) 65%, rgba(68, 64, 60, 0.45) 100%)',
        }}
      />

      {/* 3. Rolling Layered Drifting Fog Sheets */}
      <motion.div
        animate={{ x: ['-10%', '0%', '-10%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-900/15 to-transparent blur-3xl opacity-70"
      />
      <motion.div
        animate={{ x: ['0%', '-12%', '0%'] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/4 -left-1/4 w-[150%] h-96 bg-gradient-to-r from-stone-800/20 via-yellow-900/20 to-stone-800/20 blur-2xl opacity-60"
      />

      {/* 4. Canvas with Airborne Particulates & Smoke Puffs */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 5. Dense Ground Haze Bank */}
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-stone-900/60 via-amber-950/30 to-transparent blur-xl opacity-90" />

      {/* 6. Prominent Haze Status Banner (Top Floating Tag) */}
      <div className="pointer-events-auto absolute top-20 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-amber-600/90 dark:bg-amber-900/90 text-amber-50 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-amber-400/50 flex items-center gap-2 text-xs font-semibold animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-200 shrink-0" />
          <span>Haze Atmosphere Active • PSI {psiValue}</span>
          <button
            type="button"
            onClick={() => setIntensity(intensity === 'normal' ? 'heavy' : 'normal')}
            className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-950/50 hover:bg-amber-950 text-amber-200 cursor-pointer transition-colors"
          >
            {intensity === 'heavy' ? 'Intense Haze' : 'Standard Haze'}
          </button>
        </div>
      </div>
    </div>
  );
};
