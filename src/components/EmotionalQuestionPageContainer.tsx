import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, ArrowLeft, Share2, Sparkles, AlertCircle, Quote, Tag, Compass, Calendar, ChevronRight } from 'lucide-react';
import { Shayari } from '../types';
import { EmotionalQuestionPage } from '../data/emotionalQuestions';
import { defaultShayaris } from '../data/defaultShayaris';

interface EmotionalQuestionPageContainerProps {
  page: EmotionalQuestionPage;
  allShayaris: Shayari[];
  onBack: () => void;
  onSelectShayari: (sh: Shayari) => void;
  showToast: (msg: string) => void;
}

export default function EmotionalQuestionPageContainer({
  page,
  allShayaris,
  onBack,
  onSelectShayari,
  showToast
}: EmotionalQuestionPageContainerProps) {
  const [likesCount, setLikesCount] = useState<Record<string, number>>({});
  const [copiedLink, setCopiedLink] = useState(false);

  // Fallback to defaults + db approved
  const mergedShayaris = allShayaris.length > 0 ? allShayaris : defaultShayaris;

  // Find the exact matching ones
  const matchingQuotes = mergedShayaris.filter(sh => 
    page.matchingShayariIds.includes(sh.id) || 
    sh.text.toLowerCase().includes(page.slug.split('-')[0])
  );

  const handleSharePage = () => {
    const url = `${window.location.origin}/${page.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('Page URL copied for WhatsApp, Telegram, or Twitter! 🚀');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleToggleLikeQuote = (id: string) => {
    setLikesCount(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
    showToast('Vibe locked & upvoted! ❤️');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10 selection:bg-red-500/30 text-stone-200" id={`emotional-node-${page.id}`}>
      {/* Decorative Glow Elements */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />

      {/* Navigation Headers and Dynamic Path */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4.5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-mono font-black uppercase tracking-wider text-zinc-400 hover:text-white transition group cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Sanctuary
        </button>

        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-550 uppercase">
          <span>Home</span>
          <span>/</span>
          <span className="text-red-400 font-bold">{page.slug.replace(/-/g, ' ')}</span>
        </div>
      </div>

      {/* Main Core Section */}
      <div className="space-y-6">
        {/* Core Emotion Tag */}
        <div className="flex flex-wrap items-center gap-2">
          {page.relatedCategories.map(cat => (
            <span
              key={cat}
              className="px-2.5 py-0.5 rounded text-[9.5px] font-mono uppercase bg-red-950/20 text-red-400 border border-red-950/40"
            >
              {cat} vibe
            </span>
          ))}
          <span className="flex items-center gap-1 text-[9px] font-mono text-zinc-500 ml-auto">
            <Calendar size={10} /> UPDATED TODAY
          </span>
        </div>

        {/* Emotion Heading */}
        <h1 className="text-2xl sm:text-4.5xl font-black text-white tracking-tight leading-[1.125] sm:max-w-3xl">
          {page.heading}
        </h1>

        {/* Conversational human style Intro */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-900 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Quote size={80} className="text-red-500" />
          </div>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed italic pr-4 select-text">
            {page.intro}
          </p>
        </div>
      </div>

      {/* Relatable thoughts list - Human style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {page.thoughts.map((thought, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-zinc-950/50 border border-white/5 space-y-3 hover:border-red-500/10 transition-colors duration-300"
          >
            <div className="text-[10px] font-mono text-amber-500/70 font-black uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={11} /> Perspective #{idx + 1}
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed select-text">
              {thought}
            </p>
          </div>
        ))}
      </div>

      {/* Matching Shayari Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <h2 className="text-xs font-mono tracking-[0.2em] font-black uppercase text-red-500">
            Matching Poetry & Status Lines
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {matchingQuotes.length > 0 ? (
            matchingQuotes.map((sh) => (
              <div
                key={sh.id}
                className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-900 flex flex-col justify-between space-y-5 hover:border-red-500/20 transition-all select-none"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[9px] font-mono text-zinc-550 font-bold uppercase">
                    <span>{sh.category} Vibes</span>
                    <span>BY {sh.author}</span>
                  </div>
                  <p className="text-stone-200 text-sm leading-relaxed whitespace-pre-line italic font-sans font-medium">
                    {sh.text}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <button
                    onClick={() => handleToggleLikeQuote(sh.id)}
                    className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-zinc-400 hover:text-pink-500 transition cursor-pointer"
                  >
                    <Heart size={12} className={likesCount[sh.id] ? 'fill-pink-500 text-pink-500' : ''} />
                    <span>{sh.likes + (likesCount[sh.id] || 0)}</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectShayari(sh);
                      showToast('Entering premium cinematic reading state... enjoy the aesthetic ambient audio player! 🌌');
                    }}
                    className="px-3 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-wider bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition cursor-pointer"
                  >
                    Recite & Aesthetic Card
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 p-10 rounded-2xl bg-zinc-950 border border-dashed border-zinc-900 text-center text-zinc-500 text-xs">
              Fetching dynamic localized resources... enjoy custom status builders.
            </div>
          )}
        </div>
      </div>

      {/* YOU MAY ALSO FEEL (Suggested Similar Feelings Navigation) */}
      <div className="p-6 rounded-3xl bg-zinc-950/60 border border-white/5 space-y-5">
        <div className="flex items-center gap-2">
          <Compass size={14} className="text-amber-500" />
          <h3 className="text-xs font-mono tracking-[0.2em] uppercase font-black text-amber-500">
            You May Also Feel 👀
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {page.similarFeelings.map((feeling, idx) => (
            <a
              key={idx}
              href={feeling.url}
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState(null, '', feeling.url);
                window.dispatchEvent(new Event('popstate'));
                showToast(`Navigated to mood study: ${feeling.label} ⚡`);
              }}
              className="px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-white hover:border-red-500 hover:bg-red-950/10 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>{feeling.label}</span>
              <ChevronRight size={10} className="text-zinc-650" />
            </a>
          ))}
        </div>
      </div>

      {/* Bottom Content Notice Safeguard and Share triggers */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-zinc-950/30 border border-white/5 text-[10px] font-mono text-zinc-500">
        <div className="flex gap-2 items-start text-left">
          <AlertCircle size={14} className="text-amber-500/70 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-zinc-400 font-bold block uppercase tracking-wider">CREATOR & EMOTION DISCLAIMER</span>
            <span>This represents artistic, relatable, human emotional journaling. It is NOT psychological or medical advice. Survive with grace.</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleSharePage}
            className="px-5 py-2.5 rounded-full border border-red-500/30 text-red-400 bg-red-950/10 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors cursor-pointer font-black uppercase text-[10px] tracking-wider flex items-center gap-1.5"
          >
            <Share2 size={11} /> {copiedLink ? 'Copied Vibe' : 'Share Vibe Page'}
          </button>
        </div>
      </div>
    </div>
  );
}
