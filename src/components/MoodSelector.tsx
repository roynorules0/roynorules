import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Star } from 'lucide-react';

export interface Mood {
  id: string;
  name: string;
  emoji: string;
  glowClass: string;
  borderClass: string;
  bgGradient: string;
  accentColor: string;
  particlesColors: string[];
  speed: number;
  tagline: string;
  categories: string[];
  keywords?: string[];
}

export const MOODS_METADATA: Mood[] = [
  {
    id: 'Sad',
    name: 'Sad',
    emoji: '😔',
    glowClass: 'shadow-[0_0_25px_rgba(59,130,246,0.5)]',
    borderClass: 'border-blue-500/50 hover:border-blue-400',
    bgGradient: 'from-blue-950/20 via-zinc-950 to-zinc-950',
    accentColor: 'text-blue-400',
    particlesColors: ['rgba(59, 130, 246, ', 'rgba(147, 51, 234, ', 'rgba(96, 165, 250, '],
    speed: 0.15,
    tagline: 'Deep words for quiet hours... 💧',
    categories: ['Sad', 'Emotional', 'Life'],
    keywords: ['gam', 'dard', 'roota', 'khamoshi', 'tute', 'mushkil', 'shor']
  },
  {
    id: 'Love',
    name: 'Love',
    emoji: '❤️',
    glowClass: 'shadow-[0_0_25px_rgba(244,63,94,0.5)]',
    borderClass: 'border-rose-500/50 hover:border-rose-450',
    bgGradient: 'from-rose-950/20 via-zinc-950 to-zinc-950',
    accentColor: 'text-rose-400',
    particlesColors: ['rgba(244, 63, 94, ', 'rgba(239, 68, 68, ', 'rgba(251, 113, 133, '],
    speed: 0.5,
    tagline: 'Romantic melodies and delicate verses... 🌹',
    categories: ['Love', 'Life'],
    keywords: ['प्यार', 'dil', 'yaad', 'love', 'mohabbat', 'ishq', 'sukoon', 'dilon', 'bahaar']
  },
  {
    id: 'Attitude',
    name: 'Attitude',
    emoji: '🔥',
    glowClass: 'shadow-[0_0_25px_rgba(239,68,68,0.5)]',
    borderClass: 'border-red-500/50 hover:border-red-400',
    bgGradient: 'from-red-950/20 via-zinc-950 to-zinc-950',
    accentColor: 'text-red-400',
    particlesColors: ['rgba(239, 68, 68, ', 'rgba(249, 115, 22, ', 'rgba(220, 38, 38, '],
    speed: 0.9,
    tagline: 'Rules humare khud ke hain, kisi ke baap ke nahi... 😈',
    categories: ['Attitude'],
    keywords: ['attitude', 'royal', 'rules', 'bas', 'badshah', 'naam', 'apna', 'sangeen']
  },
  {
    id: 'Motivation',
    name: 'Motivation',
    emoji: '🧠',
    glowClass: 'shadow-[0_0_25px_rgba(245,158,11,0.5)]',
    borderClass: 'border-amber-500/50 hover:border-amber-400',
    bgGradient: 'from-amber-950/20 via-zinc-950 to-zinc-950',
    accentColor: 'text-amber-400',
    particlesColors: ['rgba(245, 158, 11, ', 'rgba(249, 115, 22, ', 'rgba(253, 224, 71, '],
    speed: 0.85,
    tagline: 'Fuel your inner fire and shatter limitations... ⚡',
    categories: ['Motivation', 'Success'],
    keywords: ['hausla', 'jeet', 'कामयाबी', 'paagal', 'kamyabi', 'raaste', 'mushkil', 'mizaji', 'kar']
  },
  {
    id: 'Breakup',
    name: 'Breakup',
    emoji: '💔',
    glowClass: 'shadow-[0_0_25px_rgba(168,85,247,0.5)]',
    borderClass: 'border-purple-500/50 hover:border-purple-400',
    bgGradient: 'from-purple-950/20 via-zinc-950 to-zinc-950',
    accentColor: 'text-purple-400',
    particlesColors: ['rgba(147, 51, 234, ', 'rgba(239, 68, 68, ', 'rgba(88, 28, 135, '],
    speed: 0.38,
    tagline: 'Healing broken hearts, one deep verse at a time... 🥀',
    categories: ['Breakup', 'Sad'],
    keywords: ['dhoke', 'yaad', 'tute', 'dil', 'dhoka', 'farq', 'roota']
  },
  {
    id: 'Lonely',
    name: 'Lonely',
    emoji: '🌙',
    glowClass: 'shadow-[0_0_25px_rgba(99,102,241,0.5)]',
    borderClass: 'border-indigo-500/50 hover:border-indigo-400',
    bgGradient: 'from-indigo-950/20 via-zinc-950 to-zinc-950',
    accentColor: 'text-indigo-400',
    particlesColors: ['rgba(79, 70, 229, ', 'rgba(59, 130, 246, ', 'rgba(30, 58, 138, '],
    speed: 0.2,
    tagline: 'Silent verses for beautiful, quiet starry nights... 🌑',
    categories: ['Sad', 'Emotional'],
    keywords: ['khamoshi', 'shor', 'raat', 'lonely', 'gam', 'khuda', 'raaste']
  },
  {
    id: 'Sigma',
    name: 'Sigma',
    emoji: '👑',
    glowClass: 'shadow-[0_0_25px_rgba(234,179,8,0.5)]',
    borderClass: 'border-yellow-500/50 hover:border-yellow-400',
    bgGradient: 'from-yellow-950/20 via-zinc-950 to-zinc-950',
    accentColor: 'text-yellow-400',
    particlesColors: ['rgba(234, 179, 8, ', 'rgba(212, 163, 115, ', 'rgba(202, 138, 4, '],
    speed: 0.72,
    tagline: 'No validation needed. Stand alone with absolute focus... ⚔️',
    categories: ['Attitude', 'Success', 'Motivation'],
    keywords: ['rules', 'badshah', 'apna', 'khud', 'kismat', 'kamyabi', 'baap']
  }
];

interface MoodSelectorProps {
  selectedMoodId: string | null;
  onSelectMood: (moodId: string | null) => void;
}

export default function MoodSelector({
  selectedMoodId,
  onSelectMood,
}: MoodSelectorProps) {
  // Glow click wave explosion controller
  const [explosionId, setExplosionId] = useState<string | null>(null);

  const handleBubbleClick = (moodId: string | null) => {
    // Standard haptic suggestion simulation
    if (navigator.vibrate) {
      navigator.vibrate(12);
    }
    
    setExplosionId(moodId || 'all');
    setTimeout(() => setExplosionId(null), 800);
    
    onSelectMood(moodId);
  };

  const selectedMood = MOODS_METADATA.find(m => m.id === selectedMoodId);

  return (
    <div className="w-full relative px-4 text-center select-none" id="mood-quick-bubbles">
      {/* Dynamic Report Subtitle */}
      <div className="mb-4 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedMoodId || 'all'}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="inline-flex items-center gap-2 bg-zinc-950/40 border border-zinc-900 px-3.5 py-1.5 rounded-full"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase">
              {selectedMood ? `${selectedMood.name} Atmosphere Active` : "Exploring Unguided Stream"}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating circular mood bubbles grid */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-2.5">
        
        {/* 🌌 All Vibes Base Button */}
        <div className="relative">
          <motion.button
            onClick={() => handleBubbleClick(null)}
            whileHover={{ scale: 1.13 }}
            whileTap={{ scale: 0.90 }}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full cursor-pointer flex flex-col items-center justify-center border transition-all duration-300 backdrop-blur-md relative z-10 ${
              selectedMoodId === null
                ? 'bg-zinc-950 border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.35)] text-red-500'
                : 'bg-zinc-950/30 border-zinc-900 text-zinc-500 hover:text-white hover:border-zinc-850'
            }`}
          >
            <span className="text-lg sm:text-xl">🌌</span>
            <span className="text-[8px] font-mono font-bold mt-0.5 tracking-wider">All</span>
          </motion.button>
          
          {/* Neon Ring Explosion */}
          {explosionId === 'all' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 border-2 border-red-500 rounded-full pointer-events-none z-0"
            />
          )}
        </div>

        {/* Individual Quick Access Bubbles */}
        {MOODS_METADATA.map((mood) => {
          const isSelected = selectedMoodId === mood.id;
          const auraColors = mood.particlesColors[0].replace('rgb', 'rgba').replace(')', ', 0.6)');
          
          return (
            <div key={mood.id} className="relative">
              <motion.button
                onClick={() => handleBubbleClick(isSelected ? null : mood.id)}
                whileHover={{ scale: 1.13, y: -4 }}
                whileTap={{ scale: 0.90 }}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full cursor-pointer flex flex-col items-center justify-center border transition-all duration-300 backdrop-blur-md relative z-10 ${
                  isSelected
                    ? `bg-zinc-950 border-red-500/60 ${mood.accentColor} ${mood.glowClass}`
                    : 'bg-zinc-950/30 border-zinc-900 text-zinc-500 hover:text-zinc-200 hover:border-zinc-800'
                }`}
              >
                <span className="text-xl sm:text-2xl select-none filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
                  {mood.emoji}
                </span>
                <span className="text-[8.5px] font-mono font-bold mt-0.5 tracking-wider">
                  {mood.name}
                </span>
              </motion.button>

              {/* Glowing Ambient Outer Halos */}
              {isSelected && (
                <motion.div
                  layoutId="bubblePulseActiveRing"
                  className="absolute -inset-1.5 rounded-full border border-red-500/20 animate-pulse pointer-events-none z-0"
                />
              )}

              {/* Tap Glow Explosion */}
              {explosionId === mood.id && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 1 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 border-2 rounded-full pointer-events-none z-0"
                  style={{ borderColor: auraColors }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Tagline Subtitle Text */}
      <div className="mt-4 min-h-[1.5rem]">
        <AnimatePresence mode="wait">
          <motion.p
            key={selectedMoodId || 'neutral'}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 0.6, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="text-[11px] font-mono tracking-wide text-zinc-400 italic max-w-lg mx-auto"
          >
            {selectedMood 
              ? `"${selectedMood.tagline}"` 
              : 'Hold clean focus. Double tab any verse card to save. Tap "Create" to generate premium status wallpapers.'
            }
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
