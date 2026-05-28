import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart } from 'lucide-react';
import { MOODS_METADATA } from './MoodSelector';

interface TodaysFeelingPromptProps {
  onSelectMood: (moodId: string | null) => void;
  onClose: () => void;
}

export default function TodaysFeelingPrompt({ onSelectMood, onClose }: TodaysFeelingPromptProps) {
  
  const handleSelect = (moodId: string | null) => {
    if (navigator.vibrate) {
      navigator.vibrate([15, 10]);
    }
    onSelectMood(moodId);
    onClose();
  };

  // Feeling entries specifically designed around target translations
  const customFeelings = [
    { id: 'Sad', name: 'Broken', emoji: '😔', desc: 'Heartbroken & bruised' },
    { id: 'Love', name: 'In Love', emoji: '❤️', desc: 'Floating on clouds' },
    { id: 'Lonely', name: 'Lonely', emoji: '🌙', desc: 'Quiet starry silence' },
    { id: 'Attitude', name: 'Attitude', emoji: '🔥', desc: 'Royal & unbothered' },
    { id: 'Motivation', name: 'Motivation', emoji: '🧠', desc: 'Fueling my focus' },
    { id: 'Breakup', name: 'Missing Someone', emoji: '🥀', desc: 'Silent longing' },
    { id: 'Sigma', name: 'Sigma', emoji: '👑', desc: 'Standing strong alone' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[95] bg-black/98 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 select-none"
      id="todays-feeling-prompt-overlay"
    >
      {/* Decorative Aura Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-red-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl bg-zinc-950/80 border border-white/5 rounded-[32px] p-6 sm:p-8 relative overflow-hidden shadow-2xl flex flex-col items-center space-y-6 text-center">
        
        {/* Animated Neon glowing indicator */}
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#ff0055]/50 to-transparent" />

        {/* Header Title with premium spacing */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#ff0055]/10 border border-[#ff0055]/25 px-3.5 py-1.5 rounded-full">
            <Sparkles size={11} className="text-[#ff0055] animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-[#ff0055] font-black uppercase">
              REBORN V4 PERSONALIZATION
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
            Aaj Dil Kaisa Feel Kar Raha Hai? 👀
          </h1>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
            Select an active atmospheric field to instantly personalize your homepage stream & background colors.
          </p>
        </div>

        {/* Emotion quick button grid */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {customFeelings.map((feeling) => {
            const moodMeta = MOODS_METADATA.find(m => m.id === feeling.id);
            const accent = moodMeta?.accentColor || 'text-red-500';
            
            return (
              <motion.button
                key={feeling.name}
                onClick={() => handleSelect(feeling.id)}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white hover:border-[#ff0055]/30 hover:shadow-[0_4px_20px_rgba(255,0,85,0.06)] cursor-pointer text-left flex items-start gap-3 transition-colors group"
              >
                <span className="text-2xl pt-0.5 select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  {feeling.emoji}
                </span>

                <div className="min-w-0">
                  <h4 className={`text-xs font-black tracking-wider uppercase ${accent} group-hover:text-white`}>
                    {feeling.name}
                  </h4>
                  <p className="text-[9.5px] text-zinc-550 truncate mt-0.5">
                    {feeling.desc}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Footer skip unguided */}
        <div className="w-full pt-2">
          <button
            onClick={() => handleSelect(null)}
            className="px-5 py-2.5 text-[10.5px] font-mono tracking-widest font-black uppercase text-zinc-500 hover:text-white bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 rounded-xl transition cursor-pointer select-none"
          >
            Unguided Exploration 🌌
          </button>
        </div>

      </div>
    </motion.div>
  );
}
