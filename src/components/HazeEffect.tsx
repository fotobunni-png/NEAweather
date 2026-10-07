import React, { useEffect, useRef } from 'react';

interface HazeEffectProps {
  psiValue?: number;
}

export const HazeEffect: React.FC<HazeEffectProps> = ({ psiValue = 130 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Density based on PSI (higher PSI = denser haze particles)
  const particleCount = psiValue > 200 ? 120 : psiValue > 100 ? 75 : 45;
  const smogOpacity = psiValue > 200 ? 0.35 : psiValue > 100 ? 0.22 : 0.14;

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
    }

    const particles: Particle[] = [];
    const colors = [
      'rgba(217, 119, 6, ', // warm amber dust
      'rgba(180, 83, 9, ',  // darker amber
      'rgba(202, 138, 4, ', // golden particulate
      'rgba(156, 163, 175, ', // grayish smog
    ];

    for (let i = 0; i < particleCount; i++) {
      const colorBase = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.8 + 0.8,
        speedX: (Math.random() * 0.4 + 0.15) * (Math.random() > 0.2 ? 1 : -1),
        speedY: (Math.random() * 0.25 - 0.1),
        opacity: Math.random() * 0.35 + 0.15,
        color: colorBase,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render drifting PM particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.shadowBlur = p.radius * 2;
        ctx.shadowColor = `${p.color}0.4)`;
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around boundaries
        if (p.x > width + 10) p.x = -10;
        if (p.x < -10) p.x = width + 10;
        if (p.y > height + 10) p.y = -10;
        if (p.y < -10) p.y = height + 10;
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
      {/* Smog & PM particles canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Sepia-gray Smog Atmosphere Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-yellow-900/15 to-stone-900/30"
        style={{ opacity: smogOpacity }}
      />

      {/* Reduced Visibility Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.05) 0%, rgba(120, 53, 15, 0.25) 100%)',
        }}
      />

      {/* Rolling Low-hanging Haze Banks */}
      <div
        className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-stone-900/40 via-amber-950/20 to-transparent blur-2xl"
        style={{ opacity: 0.7 }}
      />
    </div>
  );
};
