import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, ShieldAlert, Send } from 'lucide-react';

interface MoodPostModalProps {
  onClose: () => void;
  showToast: (msg: string) => void;
  onPostSuccess?: () => void;
}

export default function MoodPostModal({ onClose, showToast, onPostSuccess }: MoodPostModalProps) {
  const [text, setText] = useState('');
  const [selectedMood, setSelectedMood] = useState('Broken');
  const [error, setError] = useState('');

  const moodPills = ['Broken', 'Lonely', 'Attitude', 'In Love', 'Sigma', 'Motivation'];

  const handlePostFeeling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Arey, likho toh pehle! Post cannot be empty.');
      return;
    }
    if (text.length < 10) {
      setError('Please express a bit more... minimal (10 characters)');
      return;
    }
    if (text.length > 280) {
      setError('Wrap it under 280 characters! Keep it brief & raw.');
      return;
    }

    const compiled = {
      id: `anon-${Date.now()}`,
      text: text.trim(),
      moodType: selectedMood,
      createdAt: new Date().toISOString(),
      hugs: 0,
      hearts: 0,
      tears: 0,
    };

    let existing: any[] = [];
    const saved = localStorage.getItem('roynorules_anonymous_feelings');
    if (saved) {
      try {
        existing = JSON.parse(saved);
      } catch (_) {
        existing = [];
      }
    }

    const updated = [compiled, ...existing];
    localStorage.setItem('roynorules_anonymous_feelings', JSON.stringify(updated));

    if (navigator.vibrate) {
      navigator.vibrate(20);
    }

    showToast('Your silent mood was floated to the Anonymous Feelings Wall! 🕊️');
    if (onPostSuccess) {
      onPostSuccess();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[120] overflow-y-auto flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="bg-zinc-950 border border-zinc-900 rounded-[24px] w-full max-w-lg shadow-[0_0_50px_rgba(255,0,85,0.08)] overflow-hidden flex flex-col"
        id="mood-post-overlay"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-900 bg-gradient-to-r from-pink-950/20 to-zinc-950 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff0055] shadow-[0_0_8px_rgba(255,0,85,0.8)]"></span>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Post Silent Mood / Emotion Status 🌙
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition p-1.5 rounded-full bg-zinc-900 border border-zinc-800 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handlePostFeeling} className="p-6 space-y-5 flex-1">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-zinc-500">
            <span className="flex items-center gap-1">
              <ShieldAlert size={12} className="text-red-500" />
              100% Secure & Anonymous • Safe Space
            </span>
            <span>{280 - text.length} left</span>
          </div>

          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError('');
            }}
            placeholder="What is keeping you awake? Share a short raw quote, attitude rule, or heartbreak feeling..."
            rows={4}
            className="w-full bg-zinc-900/40 border border-zinc-850 hover:border-zinc-800 focus:border-[#ff0055]/50 text-zinc-100 placeholder-zinc-650 rounded-2xl p-4 text-xs font-sans outline-none resize-none transition-all duration-300"
          />

          {error && (
            <p className="text-[10px] font-mono text-red-500 font-bold bg-red-950/20 px-3 py-1 pb-1.5 rounded-lg border border-red-500/20">
              ⚠️ {error}
            </p>
          )}

          {/* Mood Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
              Which mood is this?
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {moodPills.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedMood(tag)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-black uppercase transition-all duration-250 cursor-pointer ${
                    selectedMood === tag
                      ? 'bg-[#ff0055]/15 border border-[#ff0055]/40 text-[#ff0055] scale-102'
                      : 'bg-zinc-900 border border-zinc-920 text-zinc-400 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-zinc-900 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-900 transition text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff0055] to-rose-700 hover:from-[#ff0033] hover:to-rose-600 text-white font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-[0_5px_15px_rgba(255,0,85,0.25)] hover:shadow-[0_5px_22px_rgba(255,0,85,0.45)] cursor-pointer active:scale-95 transition-all"
            >
              <span>Float Mood</span>
              <Send size={11} className="stroke-[2.5]" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
