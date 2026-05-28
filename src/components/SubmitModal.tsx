import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Globe, Plus, Hash } from 'lucide-react';
import { Shayari } from '../types';

interface SubmitModalProps {
  categories: string[];
  onClose: () => void;
  onSubmit: (newShayari: Partial<Shayari> & { newCategory?: string }) => void;
}

export default function SubmitModal({ categories, onClose, onSubmit }: SubmitModalProps) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState(categories[1] || 'Motivation');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [author, setAuthor] = useState('');
  const [error, setError] = useState('');

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

    // Simple auto words highlighting logic for user submitted text
    const words = text.toLowerCase().split(/[\s,.'"\n]+/);
    const standardEmotionWords = [
      'dil', 'pyar', 'mohabbat', 'love', 'yaar', 'dost', 'zindagi', 'life', 'yaadon', 'khwab', 'bharosa', 'dard', 'gam', 'breakup', 'kismat', 'asman', 'mushkil', 'hausla', 'jeet', 'royal', 'rules', 'attitude'
    ];
    // Find matching words
    const highlightedWords: string[] = [];
    text.split(/[\s,.'"\n]+/).forEach(word => {
      const cleanWord = word.replace(/[^\w\s\u0900-\u097F]/g, ''); // strip punctuation, preserve devanagari characters
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
      highlightedWords: highlightedWords.slice(0, 4), // max 4 highlights
      newCategory: isCustomCategory ? customCategoryName.trim() : undefined
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-zinc-950/90 border border-zinc-900 rounded-[24px] w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.1)] my-auto max-h-[90vh] sm:max-h-[88vh] flex flex-col"
        id="submit-shayari-form"
      >
        {/* Modal Header - Sticky at the top */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-900 bg-gradient-to-r from-red-950/20 to-zinc-950 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Shayari / Motivation Submission
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition p-1.5 rounded-full bg-zinc-900 border border-zinc-800 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body - Scrollable independently */}
        <form 
          onSubmit={handleFormSubmit} 
          className="flex-1 overflow-y-auto p-6 space-y-4"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {error && (
            <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Text Area */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
              Write Shayari (Hindi or Hinglish)*
            </label>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError('');
              }}
              rows={4}
              placeholder="Dil se likho yahan...&#10;E.g., Badshah to hum waise bhi hain..."
              className="w-full bg-zinc-900/60 border border-zinc-850 focus:border-red-500 text-zinc-100 placeholder-zinc-550 rounded-xl p-3.5 text-sm outline-none transition duration-300 resize-none"
            />
          </div>

          {/* Author Name */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
              Your Name / Pen Name (Optional)
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g., Roy Lover, Anonymous Writer"
              className="w-full bg-zinc-900/60 border border-zinc-850 focus:border-red-500 text-zinc-100 placeholder-zinc-550 rounded-xl px-3.5 py-2.5 text-xs outline-none transition duration-300"
            />
          </div>

          {/* Category Dropdown & Custom Category option */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
                Category Selection
              </label>

              {/* Toggle new category toggle option */}
              <button
                type="button"
                onClick={() => {
                  setIsCustomCategory(!isCustomCategory);
                  setError('');
                }}
                className="text-xs font-mono text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} />
                <span>{isCustomCategory ? 'Use Existing category' : 'Add New category'}</span>
              </button>
            </div>

            {isCustomCategory ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative flex items-center bg-zinc-900/60 border border-zinc-850 focus-within:border-red-500 rounded-xl px-3.5 py-2.5 transition"
              >
                <Hash size={14} className="text-zinc-500 mr-2" />
                <input
                  type="text"
                  value={customCategoryName}
                  onChange={(e) => {
                    setCustomCategoryName(e.target.value);
                    setError('');
                  }}
                  placeholder="E.g., Friendship, Cyber, SelfMade"
                  className="w-full bg-transparent text-zinc-100 text-xs outline-none"
                />
              </motion.div>
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-850 focus:border-red-500 text-zinc-350 text-xs rounded-xl px-3.5 py-2.5 outline-none cursor-pointer"
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

          <div className="pt-3 border-t border-zinc-900 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-900 transition text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-pointer"
            >
              <Globe size={13} />
              <span>Submit Shayari</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
