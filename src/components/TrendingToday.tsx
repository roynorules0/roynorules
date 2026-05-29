import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Heart, TrendingUp, Moon, Eye, Share2, Sparkles } from 'lucide-react';
import { Shayari } from '../types';
import { generateShayariSlug } from '../utils/seo';

interface TrendingTodayProps {
  approvedShayaris: Shayari[];
  onSelectShayari: (sh: Shayari) => void;
  showToast: (msg: string) => void;
}

type TabType = 'trending' | 'saved' | 'viral' | 'night';

export default function TrendingToday({ approvedShayaris, onSelectShayari, showToast }: TrendingTodayProps) {
  const [activeTab, setActiveTab] = useState<TabType>('trending');

  // Compute stats lists on local memory
  const tabData = useMemo(() => {
    const list = [...approvedShayaris];
    
    // Sort logic
    const trending = [...list].sort((a,b) => b.likes - a.likes).slice(0, 4);
    const mostSaved = [...list].sort((a,b) => b.shares - a.shares).slice(0, 4);
    const viral = [...list].filter(s => s.likes > 150).slice(0, 4);
    if (viral.length === 0) {
      // fallback
      viral.push(...list.slice(3, 7));
    }
    const lateNight = [...list].filter(s => 
      s.category === 'Sad' || s.category === 'Breakup' || s.text.toLowerCase().includes('raat') || s.text.toLowerCase().includes('khamoshi')
    ).slice(0, 4);

    return {
      trending,
      saved: mostSaved,
      viral,
      night: lateNight
    };
  }, [approvedShayaris]);

  const activeList = tabData[activeTab] || [];

  const tabMetadata = [
    { id: 'trending', label: 'Trending Today', icon: Flame, color: 'text-red-500 bg-red-950/20 border-red-500/25' },
    { id: 'saved', label: 'Most Saved', icon: Heart, color: 'text-pink-500 bg-pink-950/20 border-pink-500/25' },
    { id: 'viral', label: 'Viral Shayari', icon: TrendingUp, color: 'text-teal-500 bg-teal-950/20 border-teal-500/25' },
    { id: 'night', label: 'Late Night Feelings', icon: Moon, color: 'text-indigo-400 bg-indigo-950/20 border-indigo-400/25' },
  ];

  return (
    <div className="w-full bg-zinc-950/40 p-6 rounded-[24px] border border-white/5 space-y-6" id="trending-today-system">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-amber-400" />
            <h2 className="text-sm font-mono tracking-[0.2em] uppercase font-black text-zinc-100">
              ⚡ LIVE VIRAL PORTAL
            </h2>
          </div>
          <p className="text-[11px] text-zinc-500">Auto-updating emotional metrics based on user interactions.</p>
        </div>

        {/* Tab triggers */}
        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-white/5">
          {tabMetadata.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  showToast(`Loaded ${tab.label} collection Live 👀`);
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                  isSelected ? `${tab.color} border text-white` : 'text-zinc-550 hover:text-zinc-200 bg-transparent'
                }`}
              >
                <Icon size={11} />
                <span>{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {activeList.map((sh, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.3 }}
              key={sh.id}
              onClick={() => {
                onSelectShayari(sh);
                // Also update browser URL
                const slugPath = generateShayariSlug(sh);
                window.history.pushState(null, '', `/${slugPath}`);
                window.dispatchEvent(new Event('popstate'));
              }}
              className="p-4.5 rounded-xl border border-zinc-900 bg-zinc-950/70 hover:border-red-500/20 group cursor-pointer hover:bg-zinc-905 flex flex-col justify-between h-44 select-none"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[8px] font-mono font-bold uppercase tracking-widest text-zinc-650">
                  <span>{sh.category}</span>
                  <span className="text-zinc-500">#{idx + 1} ON RADAR</span>
                </div>
                <p className="text-stone-300 text-xs tracking-wide leading-relaxed line-clamp-4 group-hover:text-white transition duration-200 pre-wrap font-sans italic">
                  {sh.text}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5 text-[9px] font-mono text-zinc-550">
                <span className="font-semibold text-zinc-500">— {sh.author}</span>
                <span className="flex items-center gap-1">
                  <Flame size={10} className="text-red-500 animate-pulse" /> {sh.likes}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
