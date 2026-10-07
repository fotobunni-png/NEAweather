import React, { useEffect, useRef } from 'react';

interface RainfallEffectProps {
  intensity?: 'light' | 'moderate' | 'heavy';
  rainfallMm?: number;
}

export const RainfallEffect: React.FC<RainfallEffectProps> = ({
  intensity,
  rainfallMm = 1.5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determine drop density and fall speed from rainfall mm or explicit intensity
  const calculatedIntensity = intensity || (rainfallMm > 8 ? 'heavy' : rainfallMm > 2 ? 'moderate' : 'light');

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

    const dropCount =
      calculatedIntensity === 'heavy' ? 160 : calculatedIntensity === 'moderate' ? 95 : 55;

    interface Drop {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;
      width: number;
      slant: number;
    }

    interface Splash {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      opacity: number;
    }

    const drops: Drop[] = [];
    const splashes: Splash[] = [];

    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * (width + 200) - 100,
        y: Math.random() * height,
        length: Math.random() * 18 + 12,
        speed: Math.random() * 12 + 16,
        opacity: Math.random() * 0.4 + 0.3,
        width: Math.random() * 1.2 + 0.8,
        slant: -1.8, // slight Singapore monsoon wind tilt
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render Rain Streaks
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];

        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.slant * (d.length / 4), d.y + d.length);
        ctx.strokeStyle = `rgba(186, 230, 253, ${d.opacity})`;
        ctx.lineWidth = d.width;
        ctx.lineCap = 'round';
        ctx.stroke();

        d.x += d.slant;
        d.y += d.speed;

        // Ground collision & ripple generation
        if (d.y > height - 10) {
          if (Math.random() > 0.4 && splashes.length < 35) {
            splashes.push({
              x: d.x,
              y: height - Math.random() * 20,
              radius: 1,
              maxRadius: Math.random() * 7 + 4,
              opacity: 0.6,
            });
          }
          d.y = -d.length;
          d.x = Math.random() * (width + 200) - 100;
        }
      }

      // Render Puddle Splashes
      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, s.radius * 2, s.radius * 0.7, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(199, 210, 254, ${s.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        s.radius += 0.45;
        s.opacity -= 0.035;

        if (s.opacity <= 0 || s.radius >= s.maxRadius) {
          splashes.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [calculatedIntensity]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Rainfall Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Atmospheric Wet Weather Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-950/20 via-slate-900/15 to-sky-950/30" />

      {/* Gentle Floating Rainy Mist Clouds */}
      <div className="absolute -top-32 left-0 right-0 h-64 bg-gradient-to-b from-slate-800/40 via-sky-900/20 to-transparent blur-3xl opacity-80" />
    </div>
  );
};
