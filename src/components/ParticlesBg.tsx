import React, { useEffect, useRef } from 'react';

interface ParticlesBgProps {
  activeMoodColors?: string[];
  speedMultiplier?: number;
}

export default function ParticlesBg({ activeMoodColors, speedMultiplier = 1 }: ParticlesBgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorsRef = useRef<string[]>([]);
  const speedRef = useRef<number>(speedMultiplier);

  // Baselines colors that look premium dark/neon
  const defaultColors = [
    'rgba(239, 68, 68, ', // Red neon
    'rgba(244, 63, 94, ',  // Rose
    'rgba(168, 85, 247, ', // Purple
    'rgba(34, 197, 94, '   // Green neon
  ];

  // Dynamically update refs on parameters changes safely using primitive joins to avoid rendering loops
  const colorsKey = activeMoodColors?.join(',');
  useEffect(() => {
    if (activeMoodColors && activeMoodColors.length > 0) {
      colorsRef.current = activeMoodColors;
    } else {
      colorsRef.current = defaultColors;
    }
    speedRef.current = speedMultiplier;
  }, [colorsKey, speedMultiplier]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      colorIndex: number;
    }[] = [];

    // Reduced count to 18 for high-speed lightweight performance on mobile
    for (let i = 0; i < 18; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.5 + 1.2,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: (Math.random() - 0.5) * 0.25,
        opacity: Math.random() * 0.3 + 0.1,
        colorIndex: Math.floor(Math.random() * 4)
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      const currentColors = colorsRef.current.length > 0 ? colorsRef.current : defaultColors;
      const currentSpeed = speedRef.current;

      particles.forEach((p) => {
        // Apply smooth speed updates from parent mood multiplier
        p.x += p.speedX * currentSpeed;
        p.y += p.speedY * currentSpeed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Circular draw loop
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        // Access safety check on color indices
        const baseColor = currentColors[p.colorIndex % currentColors.length];
        
        ctx.fillStyle = baseColor + p.opacity + ')';
        // Removed shadowBlur & shadowColor to prevent extreme mobile GPU choking
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
      style={{ opacity: 0.65 }}
    />
  );
}
