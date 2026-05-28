import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Send, Sparkles, Smile, ShieldAlert, Navigation, SmilePlus, MessageCircle, X } from 'lucide-react';

interface AnonymousFeeling {
  id: string;
  text: string;
  moodType: string;
  createdAt: string;
  hugs: number;
  hearts: number;
  tears: number;
}

interface FeelingsWallProps {
  onClose?: () => void;
  showToast: (msg: string) => void;
}

const DEFAULT_CONFESSIONS: AnonymousFeeling[] = [
  {
    id: 'confession-1',
    text: "Maine use block toh kar diya par aaj bhi galti se phone dial ho jata hai toh haath kaampne lagte hain... 😔",
    moodType: "Broken",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    hugs: 24,
    hearts: 15,
    tears: 32,
  },
  {
    id: 'confession-2',
    text: "Sometimes attitude is not about ego, it's just about saving what's left of your self-respect from people who ignore your presence.",
    moodType: "Attitude",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    hugs: 12,
    hearts: 48,
    tears: 4,
  },
  {
    id: 'confession-3',
    text: "Dhundhla pad gaya hai sab kuch uske jaane ke baad, log puchte hain ghar se nikalte kyun nahi ho, par batayein kya ki bahar uski galiyan humein rula deti hain...",
    moodType: "Lonely",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    hugs: 56,
    hearts: 10,
    tears: 45,
  }
];

export default function FeelingsWall({ onClose, showToast }: FeelingsWallProps) {
  const [feelings, setFeelings] = useState<AnonymousFeeling[]>([]);
  const [newThought, setNewThought] = useState('');
  const [selectedMood, setSelectedMood] = useState('Broken');
  const [error, setError] = useState('');
  const [filterMood, setFilterMood] = useState<string>('All');

  // Load confessions from database
  useEffect(() => {
    const saved = localStorage.getItem('roynorules_anonymous_feelings');
    if (saved) {
      try {
        setFeelings(JSON.parse(saved));
      } catch (_) {
        setFeelings(DEFAULT_CONFESSIONS);
      }
    } else {
      setFeelings(DEFAULT_CONFESSIONS);
      localStorage.setItem('roynorules_anonymous_feelings', JSON.stringify(DEFAULT_CONFESSIONS));
    }
  }, []);

  const handlePostFeeling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThought.trim()) {
      setError('Confession cannot be empty!');
      return;
    }
    if (newThought.length < 10) {
      setError('Please express a bit more... minimal (10 characters)');
      return;
    }
    if (newThought.length > 280) {
      setError('Wrap it under 280 characters! Keep it brief & raw.');
      return;
    }

    const compiled: AnonymousFeeling = {
      id: `anon-${Date.now()}`,
      text: newThought.trim(),
      moodType: selectedMood,
      createdAt: new Date().toISOString(),
      hugs: 0,
      hearts: 0,
      tears: 0,
    };

    const updated = [compiled, ...feelings];
    setFeelings(updated);
    localStorage.setItem('roynorules_anonymous_feelings', JSON.stringify(updated));
    setNewThought('');
    setError('');
    
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
    showToast('Your silent confession floated to the wall anonymous! 🕊️');
  };

  const incrementReaction = (id: string, type: 'hugs' | 'hearts' | 'tears') => {
    const updated = feelings.map(f => {
      if (f.id === id) {
        return {
          ...f,
          [type]: f[type] + 1
        };
      }
      return f;
    });
    setFeelings(updated);
    localStorage.setItem('roynorules_anonymous_feelings', JSON.stringify(updated));
    
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const filteredConfessions = feelings.filter(f => filterMood === 'All' || f.moodType === filterMood);

  const moodPills = ['Broken', 'Lonely', 'Attitude', 'In Love', 'Sigma', 'Motivation'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`${onClose ? 'fixed inset-0 z-50 bg-black/98 overflow-y-auto pt-6 pb-24 px-4 backdrop-blur-xl' : 'w-full py-2'}`}
      id="feelings-wall-container"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Block inside floating modal */}
        {onClose && (
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#ff0055] font-black uppercase flex items-center gap-1.5 animate-pulse">
                <Sparkles size={11} />
                LIVE STREAM SHARING
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Anonymous Feelings Wall
              </h2>
              <p className="text-[10px] text-zinc-550">
                Post Raw pains, heartbreaks & silent desires. Completely anonymous. No tracking.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* SECTION A: Post Confession Block */}
        <div className="bg-zinc-950/70 border border-white/5 rounded-3xl p-5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#ff0055]/40 to-transparent" />
          
          <form onSubmit={handlePostFeeling} className="space-y-4">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-zinc-500 select-none">
              <span className="flex items-center gap-1">
                <ShieldAlert size={12} className="text-red-500" />
                No IP saved • Anonymous encryption active
              </span>
              <span>{280 - newThought.length} characters left</span>
            </div>

            <textarea
              value={newThought}
              onChange={(e) => {
                setNewThought(e.target.value);
                if (error) setError('');
              }}
              placeholder="Aaj kya chupaye baithe ho dil me? Likho yahan... (e.g. Broken dreams, late confessions...)"
              rows={3}
              className="w-full bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 text-xs font-sans text-stone-200 placeholder-zinc-650 focus:border-[#ff0055]/50 focus:bg-zinc-900/60 focus:outline-none resize-none transition-all"
            />

            {error && (
              <p className="text-[10px] font-mono text-red-500 font-bold bg-red-950/20 px-3 py-1 rounded-lg border border-red-500/20 animate-shake">
                {error}
              </p>
            )}

            {/* Selector details */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono text-zinc-500 mr-2 uppercase">Feeling tag:</span>
                {moodPills.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedMood(tag)}
                    className={`px-3 py-1.5 rounded-full text-[9.5px] font-mono font-bold transition cursor-pointer ${
                      selectedMood === tag 
                        ? 'bg-[#ff0055]/15 border border-[#ff0055]/40 text-[#ff0055]' 
                        : 'bg-zinc-900 border border-zinc-920 text-zinc-500 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff0055] to-rose-700 hover:from-[#ff0033] hover:to-rose-600 text-white font-extrabold text-[10.5px] uppercase tracking-wider flex items-center gap-1.5 shadow-[0_5px_15px_rgba(255,0,85,0.25)] hover:shadow-[0_5px_22px_rgba(255,0,85,0.45)] cursor-pointer active:scale-95 transition-all"
              >
                <span>Float Anon</span>
                <Send size={11} className="stroke-[2.5]" />
              </button>
            </div>
          </form>
        </div>

        {/* SECTION B: CONFESSIONS WALL GRID */}
        <div className="space-y-4">
          
          {/* Filters shelf */}
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <span className="text-xs font-mono font-black text-zinc-400 uppercase tracking-widest">
              Wall feeds ({filteredConfessions.length})
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterMood('All')}
                className={`px-2.5 py-1 rounded-lg text-[9.5px] font-mono cursor-pointer transition ${
                  filterMood === 'All' ? 'bg-[#ff0055]/10 text-[#ff0055]' : 'text-zinc-500 hover:text-white'
                }`}
              >
                All
              </button>
              {moodPills.map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilterMood(tag)}
                  className={`px-2.5 py-1 rounded-lg text-[9.5px] font-mono cursor-pointer transition ${
                    filterMood === tag ? 'bg-[#ff0055]/10 text-[#ff0055]' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Confessions loop */}
          <AnimatePresence mode="popLayout">
            {filteredConfessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredConfessions.map((confession) => (
                  <motion.div
                    key={confession.id}
                    initial={{ opacity: 0, scale: 0.98, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -15 }}
                    whileHover={{ y: -3 }}
                    className="bg-zinc-950/50 hover:bg-zinc-950/80 border border-white/5 rounded-2xl p-5 hover:border-[#ff0055]/20 hover:shadow-[0_5px_20px_rgba(255,0,85,0.06)] transition-all duration-300 flex flex-col justify-between space-y-4 relative"
                    id={`anon-card-${confession.id}`}
                  >
                    {/* Top capsule tag */}
                    <div className="flex items-center justify-between select-none">
                      <span className="text-[8.5px] font-mono px-2 py-0.5 rounded bg-[#ff0055]/10 border border-[#ff0055]/20 text-[#ff0055] font-black uppercase">
                        {confession.moodType}
                      </span>
                      <span className="text-[8px] font-mono text-zinc-650 font-bold">
                        {new Date(confession.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Anonymous
                      </span>
                    </div>

                    <p className="text-[12.5px] font-normal leading-relaxed text-zinc-300 font-sans whitespace-pre-line select-text selection:bg-red-500/20">
                      "{confession.text}"
                    </p>

                    {/* Micro reaction counters */}
                    <div className="flex items-center gap-2 pt-2 border-t border-zinc-900/60 select-none">
                      <button
                        onClick={() => incrementReaction(confession.id, 'hugs')}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900/50 hover:bg-[#ff0055]/10 border border-zinc-920 text-zinc-400 hover:text-stone-100 flex items-center gap-1.5 text-[10px] font-mono transition cursor-pointer"
                        title="Give comfort hug"
                      >
                        <span>🫂 Comfort</span>
                        <span className="text-red-500 font-bold font-mono">{confession.hugs}</span>
                      </button>

                      <button
                        onClick={() => incrementReaction(confession.id, 'hearts')}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900/50 hover:bg-[#ff0055]/10 border border-zinc-920 text-zinc-400 hover:text-stone-100 flex items-center gap-1.5 text-[10px] font-mono transition cursor-pointer"
                        title="Comfort heart"
                      >
                        <span>❤️ Stay strong</span>
                        <span className="text-red-500 font-bold font-mono">{confession.hearts}</span>
                      </button>

                      <button
                        onClick={() => incrementReaction(confession.id, 'tears')}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900/50 hover:bg-[#ff0055]/10 border border-zinc-920 text-zinc-400 hover:text-stone-100 flex items-center gap-1.5 text-[10px] font-mono transition cursor-pointer"
                        title="Tear comforts"
                      >
                        <span>🥀 Relatable</span>
                        <span className="text-[#a855f7] font-bold font-mono">{confession.tears}</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-zinc-900 rounded-3xl p-12 text-center max-w-sm mx-auto bg-zinc-950/20">
                <p className="text-xs text-zinc-500 italic">No floating anonymous confessions matched this tag filter yet.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
}
