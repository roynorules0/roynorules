import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface IntroScreenProps {
  onComplete: () => void;
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([]);
  const onCompleteRef = useRef(onComplete);

  // Keep ref up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Generate organic cosmic sparks
    const items = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 0.8,
    }));
    setParticles(items);

    // Auto fade after 2.3 seconds for perfect cinematic flow (within 2-3 seconds)
    const timer = setTimeout(() => {
      onCompleteRef.current();
    }, 2300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4, ease: "easeInOut" } }}
      className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center overflow-hidden font-sans select-none"
    >
      {/* Cinematic Ambient Halo */}
      <div className="absolute inset-0 bg-zinc-950 pointer-events-none opacity-80" />

      {/* Floating Sparkles Background */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: '100%' }}
            animate={{ 
              opacity: [0, 0.7, 0],
              y: '-10%',
            }}
            transition={{
              duration: 1.8,
              delay: p.delay,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bg-red-500 rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
            }}
          />
        ))}
      </div>

      {/* Premium High Contrast Skip Button (Top Right fixed corner, always visible) */}
      <div className="absolute top-6 right-6 z-[110]">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onComplete}
          className="px-4 py-2 rounded-full border border-red-500/30 text-[10px] tracking-[0.12em] uppercase font-mono font-bold text-white bg-black cursor-pointer transition-all duration-200"
        >
          Skip Intro ➔
        </motion.button>
      </div>

      {/* Centered Glowing Logo Reveal Container */}
      <div className="relative text-center space-y-4 px-6 max-w-lg z-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center justify-center gap-2 text-red-550 mb-1"
        >
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-[0.15em] uppercase text-white">
            Roy No
          </h1>
          <h2 className="text-4xl md:text-5xl font-black uppercase text-red-550 tracking-[0.2em] mt-1 antialiased font-sans">
            Rules...
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 0.55, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase"
        >
          Loading Reborn Universe • 2.0
        </motion.div>
      </div>

      <div className="absolute bottom-6 text-[10px] text-zinc-650 font-mono select-none">
        Copyright © {new Date().getFullYear()} Roy No Rules. All Rights Reserved.
      </div>
    </motion.div>
  );
}
