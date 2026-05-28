import React from 'react';
import { motion } from 'motion/react';
import { X, PenTool, Image, Flame, Sparkles, MessageCircleCode } from 'lucide-react';

interface CreateHubModalProps {
  onClose: () => void;
  onSubmitShayari: () => void;
  onCreateWallpaper: () => void;
  onPostMood: () => void;
}

export default function CreateHubModal({
  onClose,
  onSubmitShayari,
  onCreateWallpaper,
  onPostMood
}: CreateHubModalProps) {
  return (
    <div className="fixed inset-0 bg-black/92 backdrop-blur-md z-[100] flex items-center justify-center p-4 select-none">
      {/* Dynamic Background Flare */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-red-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-pink-500/10 blur-[130px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="w-full max-w-md bg-zinc-950/85 border border-white/10 rounded-[28px] p-6 shadow-2xl relative overflow-hidden backdrop-blur-3xl space-y-6"
        id="create-hub-modal"
      >
        {/* Subtle top light bar */}
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

        {/* Modal Head */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] font-black text-red-500 uppercase">
              <Sparkles size={11} className="animate-spin" />
              Creator Portal Hub
            </div>
            <h2 className="text-base font-black text-white tracking-tight">
              Aapki Baatein, Aapka Style 👑
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-805 flex items-center justify-center cursor-pointer text-zinc-400 hover:text-white hover:border-zinc-700 transition"
          >
            <X size={15} />
          </button>
        </div>

        {/* Beautiful glassmorphic select list */}
        <div className="space-y-3.5">
          {/* OPTION 1: SUBMIT SHAYARI */}
          <motion.div
            whileHover={{ x: 4, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              onSubmitShayari();
              onClose();
            }}
            className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 hover:border-red-500/30 hover:bg-zinc-900/10 transition-all cursor-pointer flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-red-950/30 border border-red-500/25 flex items-center justify-center shrink-0 text-red-400">
              <PenTool size={18} />
            </div>
            <div className="space-y-1 text-left flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">✍ Submit Shayari</h4>
                <span className="text-[8px] font-mono text-red-400 font-bold bg-red-950/20 border border-red-500/15 px-1.5 rounded uppercase">Public Feed</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                Publish poems to our public stream and category directories. Auto category tagging & admin vetting.
              </p>
            </div>
          </motion.div>

          {/* OPTION 2: WALLPAPER CREATOR (ROY STUDIO PRO) */}
          <motion.div
            whileHover={{ x: 4, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              onCreateWallpaper();
              onClose();
            }}
            className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 hover:border-amber-500/25 hover:bg-zinc-900/10 transition-all cursor-pointer flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-955/35 border border-amber-500/25 flex items-center justify-center shrink-0 text-amber-500">
              <Image size={18} />
            </div>
            <div className="space-y-1 text-left flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">🎨 Create Wallpaper / Status</h4>
                <span className="text-[8px] font-mono text-amber-500 font-bold bg-amber-950/20 border border-amber-500/15 px-1.5 rounded uppercase">HD Wallpaper</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                ROY Studio Pro: Design status layouts, fine-tune color gradients, select modern fonts, download graphics.
              </p>
            </div>
          </motion.div>

          {/* OPTION 3: MOOD CONFESSION */}
          <motion.div
            whileHover={{ x: 4, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              onPostMood();
              onClose();
            }}
            className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 hover:border-pink-500/25 hover:bg-zinc-900/10 transition-all cursor-pointer flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-955/35 border border-pink-500/25 flex items-center justify-center shrink-0 text-pink-500">
              <MessageCircleCode size={18} />
            </div>
            <div className="space-y-1 text-left flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">🌙 Mood Post</h4>
                <span className="text-[8px] font-mono text-pink-400 font-bold bg-pink-950/20 border border-pink-500/15 px-1.5 rounded uppercase font-black animate-pulse">Live Wall</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                Float short anonymous confessions & raw evening thoughts directly onto the Community Mood Wall.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Footer info lock */}
        <div className="pt-2 text-center text-[9px] font-mono text-zinc-600 block">
          ⚡ ALL CREATIONS SECURED INDEPENDENTLY • SHAYARI IS LIFE
        </div>
      </motion.div>
    </div>
  );
}
