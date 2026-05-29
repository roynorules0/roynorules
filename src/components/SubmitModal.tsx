import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, Plus, Hash, Sparkles, Paintbrush, FileText, ArrowRight, Check } from 'lucide-react';
import { Shayari } from '../types';

interface SubmitModalProps {
  categories: string[];
  onClose: () => void;
  onSubmit: (newShayari: Partial<Shayari> & { newCategory?: string }) => void;
}

const PRESET_GRADIENTS = [
  { id: 'cinematic', name: 'Obsidian Noir', class: 'from-zinc-950 via-zinc-900 to-black border-red-500/30' },
  { id: 'love', name: 'Rosy Desire', class: 'from-rose-950/40 via-zinc-950 to-rose-905/30 border-rose-500/30' },
  { id: 'broken', name: 'Silent Hearth', class: 'from-slate-950 via-pink-950/20 to-zinc-950 border-pink-500/20' },
  { id: 'sigma', name: 'Sigma Aura', class: 'from-zinc-950/90 via-amber-950/30 to-black border-amber-500/30' },
  { id: 'life', name: 'Neon Forest', class: 'from-emerald-950/30 via-zinc-950 to-zinc-900 border-emerald-500/25' },
];

const CUSTOM_FONTS = [
  { id: 'sans', name: 'Classic Inter', class: 'font-sans' },
  { id: 'serif', name: 'Aesthetic Playfair', class: 'font-serif italic' },
  { id: 'mono', name: 'Retro JetBrains', class: 'font-mono' }
];

export default function SubmitModal({ categories, onClose, onSubmit }: SubmitModalProps) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState(categories[1] || 'Motivation');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [author, setAuthor] = useState('');
  const [error, setError] = useState('');

  // Creative Styling States for Live Preview rendering
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [activeGradient, setActiveGradient] = useState(PRESET_GRADIENTS[0]);
  const [activeFont, setActiveFont] = useState(CUSTOM_FONTS[0]);

  // Find standard emotion words to highlight in preview in real-time
  const standardEmotionWords = [
    'dil', 'pyar', 'mohabbat', 'love', 'yaar', 'dost', 'zindagi', 'life', 'yaadon', 'khwab', 'bharosa', 'dard', 'gam', 'breakup', 'kismat', 'asman', 'mushkil', 'hausla', 'jeet', 'royal', 'rules', 'attitude', 'rasta', 'raah'
  ];

  const getHighlightedParts = (textStr: string) => {
    if (!textStr) return [];
    return textStr.split(/([\s,.'"\n\u0900-\u097F]+)/);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Arey, shayari toh likho pehle!');
      return;
    }
    if (isCustomCategory && !customCategoryName.trim()) {
      setError('Custom category ka naam likho!');
      return;
    }

    const categoryToSubmit = isCustomCategory ? customCategoryName.trim() : category;

    // Word highlighting logic
    const highlightedWords: string[] = [];
    text.split(/[\s,.'"\n]+/).forEach(word => {
      const cleanWord = word.replace(/[^\w\s\u0900-\u097F]/g, '');
      if (
        cleanWord && 
        (standardEmotionWords.includes(cleanWord.toLowerCase()) || cleanWord.length > 5) &&
        !highlightedWords.includes(cleanWord)
      ) {
        highlightedWords.push(cleanWord);
      }
    });

    onSubmit({
      text: text.trim(),
      category: categoryToSubmit,
      author: author.trim() || 'Anonymous Writer',
      highlightedWords: highlightedWords.slice(0, 4),
      newCategory: isCustomCategory ? customCategoryName.trim() : undefined
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/92 backdrop-blur-md z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 15 }}
        className="bg-zinc-950/90 border border-white/10 rounded-[24px] w-full max-w-4xl overflow-hidden shadow-[0_0_60px_rgba(239,68,68,0.15)] my-auto max-h-[92vh] sm:max-h-[88vh] flex flex-col"
        id="submit-shayari-form"
      >
        {/* Header (Sticky) */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-900 bg-gradient-to-r from-red-950/25 via-zinc-950 to-zinc-950 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.85)]"></span>
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Shayari Creator Studio 🌙
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono">Real-time live rendering & custom composer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition p-1.5 rounded-full bg-zinc-900 border border-zinc-800 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={15} />
          </button>
        </div>

        {/* Mobile Tab Swapper */}
        <div className="flex md:hidden border-b border-zinc-900 bg-zinc-950 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-3 text-xs font-mono font-bold tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'edit'
                ? 'text-red-550 border-red-500 bg-red-950/5'
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            <FileText size={13} />
            Composer
          </button>
          <button
            type="button"
            onClick={() => {
              if (!text.trim()) {
                setError('Shayari likho pehle preview dekhne ke liye! ✍');
                return;
              }
              setActiveTab('preview');
            }}
            className={`flex-1 py-3 text-xs font-mono font-bold tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'preview'
                ? 'text-red-550 border-red-500 bg-red-950/5'
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            <Paintbrush size={13} />
            Live Preview ✨
          </button>
        </div>

        {/* Main Workspace (Split Grid for Desktop, Tabbed for Mobile) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-zinc-900 bg-zinc-950">
          
          {/* COMPOSER FORM (Shown if tab is 'edit' on mobile, always shown on md+) */}
          <form 
            onSubmit={handleFormSubmit}
            className={`col-span-1 md:col-span-6 p-6 space-y-5 flex flex-col justify-between ${
              activeTab !== 'edit' ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-red-950/25 border border-red-500/35 rounded-xl text-red-400 text-xs font-mono font-medium animate-pulse">
                  ⚠️ {error}
                </div>
              )}

              {/* Composition Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center select-none">
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest block">
                    Compose Shayari / Quote *
                  </label>
                  <span className="text-[10px] text-zinc-600 font-mono">Hindi or Hinglish</span>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setError('');
                  }}
                  rows={5}
                  placeholder={`Write your pure feeling... \n\nE.g.:\nAchanak i love you bolkar\nUsne dosti ka maza hi kharab kar diya.`}
                  className="w-full bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-850 focus:border-red-500/50 text-zinc-200 placeholder-zinc-650 rounded-2xl p-4 text-xs font-sans outline-none transition duration-300 resize-none leading-relaxed"
                />
              </div>

              {/* Pen name / Author */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest block">
                  Author / Pen Name (Optional)
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g., Kabir Speaks, Broken Heart, Roy Lover"
                  className="w-full bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-850 focus:border-red-500/50 text-zinc-250 placeholder-zinc-650 rounded-xl px-4 py-3 text-xs outline-none transition duration-300"
                />
              </div>

              {/* Category selector */}
              <div className="space-y-3">
                <div className="flex justify-between items-center select-none">
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest block">
                    Category Tag
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(!isCustomCategory);
                      setError('');
                    }}
                    className="text-[11px] font-mono text-red-500 hover:text-red-400 flex items-center gap-1 cursor-pointer transition select-none"
                  >
                    <Plus size={11} />
                    <span>{isCustomCategory ? 'Existing List' : 'Add Custom'}</span>
                  </button>
                </div>

                {isCustomCategory ? (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative flex items-center bg-zinc-900/40 border border-zinc-850 focus-within:border-red-500/50 rounded-xl px-3.5 py-3 transition"
                  >
                    <Hash size={13} className="text-zinc-500 mr-2" />
                    <input
                      type="text"
                      value={customCategoryName}
                      onChange={(e) => {
                        setCustomCategoryName(e.target.value);
                        setError('');
                      }}
                      placeholder="e.g., Loneliness, CyberQuote, TrueRules"
                      className="w-full bg-transparent text-zinc-200 text-xs outline-none"
                    />
                  </motion.div>
                ) : (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-850 focus:border-red-500/50 text-zinc-300 text-xs rounded-xl px-3.5 py-3 outline-none cursor-pointer"
                  >
                    {categories
                      .filter((cat) => cat !== 'All')
                      .map((cat) => (
                        <option key={cat} value={cat} className="bg-zinc-950 text-zinc-350">
                          {cat}
                        </option>
                      ))}
                  </select>
                )}
              </div>
            </div>

            {/* Actions for Desktop composer pane */}
            <div className="pt-6 border-t border-zinc-900/80 flex items-center justify-between gap-3 select-none">
              <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline-block">
                ⚡ Auto format enabled
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-900 transition text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-95 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300 hover:shadow-[0_0_18px_rgba(239,68,68,0.35)] cursor-pointer"
                >
                  <Globe size={13} className="stroke-[2.5]" />
                  <span>Publish Site</span>
                </button>
              </div>
            </div>
          </form>

          {/* DYNAMIC LIVE PREVIEW VIEWER (Shown if tab is 'preview' on mobile, always shown on md+) */}
          <div 
            className={`col-span-1 md:col-span-6 p-6 bg-zinc-950/60 flex flex-col justify-between space-y-6 ${
              activeTab !== 'preview' ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between select-none">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest block flex items-center gap-1">
                  <Sparkles size={11} className="text-red-500" />
                  Live Aesthetic Card Render
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-500/10 uppercase font-bold animate-pulse">
                  WYSIWYG Live
                </span>
              </div>

              {/* Dynamic Theme Customizer Panels */}
              <div className="space-y-4">
                {/* 1. Gradient chooser */}
                <div className="space-y-1.5 select-none">
                  <span className="text-[10px] font-mono text-zinc-500 tracking-wider block uppercase">Select Canvas Atmosphere</span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_GRADIENTS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setActiveGradient(p)}
                        className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                          activeGradient.id === p.id
                            ? 'bg-red-950/20 text-red-400 border-red-500/40'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Font chooser */}
                <div className="space-y-1.5 select-none">
                  <span className="text-[10px] font-mono text-zinc-500 tracking-wider block uppercase">Select Font Spirit</span>
                  <div className="flex gap-2">
                    {CUSTOM_FONTS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setActiveFont(f)}
                        className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                          activeFont.id === f.id
                            ? 'bg-red-950/20 text-red-400 border-red-500/40'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {activeFont.id === f.id && <Check size={10} />}
                        <span className={f.class}>{f.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* High-Fidelity Rendering Card */}
              <div className="pt-2 select-none">
                <motion.div
                  layout
                  className={`relative p-8 rounded-[24px] bg-gradient-to-br ${activeGradient.class} border shadow-2xl overflow-hidden aspect-[4/3] flex flex-col justify-between`}
                >
                  {/* Subtle vector decorations to make it feel super-cinematic and gorgeous */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/2.5 blur-2xl" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-red-500/2.5 blur-2xl" />

                  {/* Header Row */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#ff0055]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff0055]" />
                      {isCustomCategory ? (customCategoryName || 'EMOTION') : category}
                    </span>
                    <span>{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>

                  {/* Core Content */}
                  <div className="my-auto py-4 text-center">
                    <p className={`text-base md:text-lg text-zinc-100 font-medium tracking-wide leading-relaxed whitespace-pre-line text-pretty select-text ${activeFont.class}`}>
                      {text.trim() ? (
                        getHighlightedParts(text).map((part, index) => {
                          const isKeyword = standardEmotionWords.includes(part.toLowerCase().replace(/[^\w]/g, ''));
                          return isKeyword ? (
                            <span 
                              key={index} 
                              className="text-red-500 font-bold underline decoration-red-500/30 underline-offset-4 px-0.5 bg-red-505/5 rounded"
                            >
                              {part}
                            </span>
                          ) : (
                            <span key={index}>{part}</span>
                          );
                        })
                      ) : (
                        <span className="opacity-30 italic text-zinc-500 font-sans text-sm">Compose your feelings... The live card view will render them with gorgeous cinematic alignment automatically.</span>
                      )}
                    </p>
                  </div>

                  {/* Footer Row */}
                  <div className="flex items-center justify-between border-t border-zinc-900/50 pt-3 text-[10px] font-mono text-zinc-500">
                    <span>by <strong className="text-zinc-300">{author.trim() || 'Anonymous Writer'}</strong></span>
                    <span className="tracking-widest uppercase text-zinc-650">Roy Verse Hub • Live Card</span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Mobile submission helper button when in preview tab */}
            <div className="block md:hidden pt-4 border-t border-zinc-900">
              <button
                type="button"
                onClick={handleFormSubmit}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(239,68,68,0.25)]"
              >
                <span>Publish Custom Shayari</span>
                <Globe size={13} className="stroke-[2.5]" />
              </button>
            </div>
            
            <div className="hidden md:block text-[9.5px] font-mono text-zinc-600 text-center select-none uppercase tracking-wider leading-relaxed">
              ⭐ Renders dynamically correctly on Android, iOS, & Desktop frames.
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
