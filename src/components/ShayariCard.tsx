import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Copy, Share2, Image, Check, Lock, Unlock, ArrowRight, Volume2, Sparkles, Maximize2 } from 'lucide-react';
import { Shayari } from '../types';
import { getHighlightedText } from '../data/defaultShayaris';

interface ShayariCardProps {
  shayari: Shayari;
  isSaved: boolean;
  onToggleSave: () => void;
  onOpenImageStudio: () => void;
  index: number;
  isAutoShuffleOn: boolean;
  onNextShayari: () => void;
  showToast: (msg: string) => void;
  onListen: () => void;
  isListening: boolean;
  onFocus?: (sh: Shayari) => void;
  onOpenImmersive?: () => void;
  allShayaris?: Shayari[];
}

export default function ShayariCard({
  shayari,
  isSaved,
  onToggleSave,
  onOpenImageStudio,
  index,
  isAutoShuffleOn,
  onNextShayari,
  showToast,
  onListen,
  isListening,
  onFocus,
  onOpenImmersive,
  allShayaris,
}: ShayariCardProps) {
  // --- VIEWPORT INTERSECTION LAZY ENGINE ---
  const cardRef = useRef<HTMLDivElement>(null);
  const [isInViewport, setIsInViewport] = useState(() => {
    // Fast path: bypass lazy rendering for initial view cards (e.g. index < 4) to bypass layouts shift.
    return index < 4;
  });

  useEffect(() => {
    if (isInViewport) return;
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      setIsInViewport(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '250px' } // Pre-render when 250px near screen
    );
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    return () => observer.disconnect();
  }, [isInViewport]);

  // --- STATE FOR ACTIONS ---
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isRelatedExpanded, setIsRelatedExpanded] = useState(false);
  
  // --- PREMIUM UX STATE ---
  const [history, setHistory] = useState<Shayari[]>([shayari]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [isInteractivePaused, setIsInteractivePaused] = useState(false);
  const [glowActive, setGlowActive] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  // --- LOCAL RECITATION PLAYBACK STATE ---
  const [isSpeakingLocal, setIsSpeakingLocal] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // --- REFS FOR GESTURES AND TIMERS ---
  const isWaitingForParentNext = useRef<boolean>(false);
  const resumeTimeoutRef = useRef<number | null>(null);
  const lastTransitionRef = useRef<number>(0);
  const pressTimerRef = useRef<number | null>(null);
  const isLongPressed = useRef<boolean>(false);

  // Swipe position tracking
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);

  // Double Click / Tap variables
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<number | null>(null);

  // --- UTILS FOR SHYARI CONTENT ---
  const activeShayari = history[historyIndex] || shayari;
  const textParts = getHighlightedText(activeShayari.text, activeShayari.highlightedWords);

  // --- EFFECT: Sync Incoming Prop with History State ---
  useEffect(() => {
    // If incoming shayari does not match the current historical element:
    if (history[historyIndex]?.id !== shayari.id) {
      if (isWaitingForParentNext.current) {
        // Appended because we triggered 'onNextShayari' internally
        isWaitingForParentNext.current = false;
        setHistory((prev) => [...prev, shayari]);
        setHistoryIndex((prev) => prev + 1);
      } else {
        // External update (like search, category change, tab shift), reset stack
        setHistory([shayari]);
        setHistoryIndex(0);
      }
    }
  }, [shayari]);

  // Clean timeouts and window synthesis on unmount
  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Recitation logic
  const handleRecitePlayToggle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Trigger haptic response
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }

    if (isSpeakingLocal) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeakingLocal(false);
      showToast('Recitation paused 🛑');
      return;
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      showToast('Voice service is not supported on your profile device.');
      return;
    }

    // Cancel anything currently playing
    window.speechSynthesis.cancel();

    const textToRead = activeShayari.text.replace(/[\n,.]/g, ' ');
    const utter = new SpeechSynthesisUtterance(textToRead);
    
    // Intelligent Voice Selector
    const voices = window.speechSynthesis.getVoices();
    const optimalVoice = voices.find(v => 
      v.lang.toLowerCase().includes('hi-in') || 
      v.lang.toLowerCase().includes('en-in') || 
      v.name.includes('Google') ||
      v.name.includes('Microsoft')
    );

    if (optimalVoice) {
      utter.voice = optimalVoice;
    }

    utter.rate = 0.82; // Premium slower recite cadence
    utter.pitch = 0.94; // Deep, emotional tone curve

    utter.onstart = () => {
      setIsSpeakingLocal(true);
    };

    utter.onend = () => {
      setIsSpeakingLocal(false);
    };

    utter.onerror = () => {
      setIsSpeakingLocal(false);
    };

    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
    showToast('Recitator active • Listen closely 🎧');
  };

  // Turn off local synthesis on card change for clean session states
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingLocal(false);
  }, [activeShayari.id]);

  // --- SYNC / HANDLE THE 15-SECOND SHUFFLE TIMER ---
  useEffect(() => {
    if (!isAutoShuffleOn || isLocked || showQuickMenu) {
      setProgress(0);
      return;
    }

    const intervalTime = 100; // Tick every 100ms
    const totalDuration = 15000; // 15 seconds
    const increment = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      if (!isInteractivePaused) {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNextTrigger();
            return 0;
          }
          return prev + increment;
        });
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isAutoShuffleOn, isLocked, isInteractivePaused, historyIndex, history.length, showQuickMenu]);

  // Reset progress bar on card change
  useEffect(() => {
    setProgress(0);
  }, [historyIndex, shayari.id]);

  // --- UTILS: SHARE / COPY ACTIONS ---
  const handleCopy = async () => {
    const uniqueUrl = `${window.location.origin}/${activeShayari.slug || 'shayari/' + activeShayari.id}`;
    const shareText = `"${activeShayari.text}"\n\n— ${activeShayari.author} (Roy No Rules...)\n✨ Read & Share on: ${uniqueUrl}`;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      showToast('Shayari copied with dynamic SEO link! 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleShare = async () => {
    const uniqueUrl = `${window.location.origin}/${activeShayari.slug || 'shayari/' + activeShayari.id}`;
    const shareText = `"${activeShayari.text}"\n\n— ${activeShayari.author}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: activeShayari.seoTitle || 'Roy No Rules... Reborn Universe',
          text: shareText,
          url: uniqueUrl,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (err) {
        // Fallback to copy clipboard if canceled or fails
        handleCopy();
      }
    } else {
      handleCopy();
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  // --- NEXT & PREVIOUS INTERNAL LOGIC ---
  const handleNextTrigger = () => {
    if (isLocked) {
      showToast('Card is locked from shuffle! Unlock to change 🔒');
      return;
    }
    if (Date.now() - lastTransitionRef.current < 400) return; // Prevent rapid skip issues
    lastTransitionRef.current = Date.now();

    // Trigger glowing aura pulse
    setGlowActive(true);
    setTimeout(() => setGlowActive(false), 400);

    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      if (navigator.vibrate) {
        navigator.vibrate(12);
      }
    } else {
      isWaitingForParentNext.current = true;
      onNextShayari();
      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
    }
  };

  const handlePrevTrigger = () => {
    if (isLocked) {
      showToast('Card is locked from shuffle! Unlock to navigate 🔒');
      return;
    }
    if (Date.now() - lastTransitionRef.current < 400) return; // Prevent rapid skip issues
    lastTransitionRef.current = Date.now();

    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      showToast('Loaded previous Shayari ↩️');
      
      // Trigger glowing aura pulse
      setGlowActive(true);
      setTimeout(() => setGlowActive(false), 400);

      if (navigator.vibrate) {
        navigator.vibrate(12);
      }
    } else {
      showToast('At the beginning of your history stack! Swipe up to explore ✨');
    }
  };

  // --- TOUCH HANDLERS (VERTICAL REELS SWIPE & LONG PRESS) ---
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchStartTime.current = Date.now();
    isLongPressed.current = false;

    pauseInteraction();

    // Trigger timer for Long Press quick menu
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    pressTimerRef.current = window.setTimeout(() => {
      isLongPressed.current = true;
      setShowQuickMenu(true);
      if (navigator.vibrate) {
        navigator.vibrate(40);
      }
    }, 600); // 600ms long press threshold
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null || touchStartX.current === null) return;
    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const diffY = touchStartY.current - currentY;
    const diffX = touchStartX.current - currentX;

    // If moved more than 15px in any direction, discard long press
    if (Math.abs(diffY) > 15 || Math.abs(diffX) > 15) {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
        pressTimerRef.current = null;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    resumeInteraction();
    
    // Discard long press timer
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }

    if (touchStartY.current === null || touchStartX.current === null) return;
    const currentY = e.changedTouches[0].clientY;
    const currentX = e.changedTouches[0].clientX;
    const diffY = touchStartY.current - currentY;
    const diffX = touchStartX.current - currentX;
    const duration = Date.now() - touchStartTime.current;

    // Strict sensitivity filtration & diagonal vector/accidental click blocking
    const isMainlyVertical = Math.abs(diffY) > Math.abs(diffX) * 2.5;
    const isDeliberateSwipe = duration < 500 && duration > 50 && Math.abs(diffY) > 85;

    if (isDeliberateSwipe && isMainlyVertical) {
      if (diffY > 85) {
        // Swipe Up -> Next
        handleNextTrigger();
      } else if (diffY < -85) {
        // Swipe Down -> Prev
        handlePrevTrigger();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  // --- MOUSE HOVER PASTE INTERACTION ---
  const pauseInteraction = () => {
    setIsInteractivePaused(true);
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  };

  const resumeInteraction = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    // Resume auto-shuffling after 4 seconds of inactivity
    resumeTimeoutRef.current = window.setTimeout(() => {
      setIsInteractivePaused(false);
    }, 4000);
  };

  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent, clientX: number, clientY: number) => {
    onToggleSave(); // Triggers favorite toggle

    // Spawn heart particles inside card bounding bounds
    const cardEl = e.currentTarget as HTMLElement;
    const rect = cardEl.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const newHeart = {
      id: Date.now() + Math.random(),
      x: isNaN(x) ? rect.width / 2 : x,
      y: isNaN(y) ? rect.height / 3 * 2 : y,
    };

    setFloatingHearts((prev) => [...prev, newHeart]);

    if (navigator.vibrate) {
      navigator.vibrate([15, 30]);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Notify focus state
    onFocus?.(activeShayari);

    const target = e.target as HTMLElement;
    // Don't trigger tap skips if clicking buttons, links, or text selection
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('.interactive-bar') ||
      window.getSelection()?.toString()
    ) {
      return;
    }

    e.preventDefault();

    // If long press menu is already showing, dismiss it first on tap
    if (showQuickMenu) {
      setShowQuickMenu(false);
      return;
    }

    // Skip if touch handling marked this click as part of a completed long press
    if (isLongPressed.current) {
      isLongPressed.current = false;
      return;
    }

    clickCountRef.current += 1;
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (clickCountRef.current === 1) {
      clickTimerRef.current = window.setTimeout(() => {
        // Accidental tap protection: single tap on card does absolutely nothing!
        clickCountRef.current = 0;
      }, 250); // Double-click interval windows
    } else if (clickCountRef.current === 2) {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickCountRef.current = 0;
      handleDoubleTap(e, clientX, clientY);
    }
  };

  if (!isInViewport) {
    return (
      <div
        ref={cardRef}
        className="relative bg-zinc-950/45 border border-white/5 min-h-[420px] sm:min-h-[440px] rounded-[24px] p-6 flex flex-col justify-between"
      >
        <div className="h-3 bg-zinc-900/50 rounded-md w-1/3 animate-pulse" />
        <div className="space-y-3.5 py-6">
          <div className="h-3.5 bg-zinc-900/50 rounded-md w-full animate-pulse" />
          <div className="h-3.5 bg-zinc-900/50 rounded-md w-5/6 animate-pulse" />
          <div className="h-3.5 bg-zinc-900/50 rounded-md w-4/5 animate-pulse" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-9 bg-zinc-900/50 rounded-xl w-24 animate-pulse" />
          <div className="h-9 bg-zinc-900/50 rounded-xl w-16 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.4) }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={pauseInteraction}
      onMouseLeave={resumeInteraction}
      className={`relative group bg-zinc-950/75 backdrop-blur-md border flex flex-col justify-between overflow-hidden min-h-[420px] sm:min-h-[440px] cursor-pointer touch-manipulation select-text rounded-[24px] p-6 md:p-8 ${
        glowActive || isSpeakingLocal
          ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.25)]' 
          : 'border-white/10 hover:border-red-500/35 shadow-md hover:shadow-[0_8px_24px_rgba(239,68,68,0.12)]'
      } transition-all duration-300`}
      id={`shayari-card-${activeShayari.id}`}
    >
      {/* Animated Subtle Gradient Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-red-950/10 via-transparent to-rose-950/15 opacity-55 pointer-events-none group-hover:opacity-90 transition-opacity duration-500" />
      <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-350 pointer-events-none" />

      {/* FLOATING HEARTS (DOUBLE TAP SUCCESS) */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden select-none">
        <AnimatePresence>
          {floatingHearts.map((heart) => (
            <motion.div
              key={heart.id}
              initial={{ opacity: 1, scale: 0.4, x: heart.x - 12, y: heart.y - 12 }}
              animate={{
                opacity: 0,
                scale: [1, 2, 1.3],
                y: heart.y - 140, // Float high
                x: heart.x - 12 + (Math.random() * 50 - 25), // Left-right drift
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
              className="absolute text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.85)] text-2xl select-none"
            >
              ❤️
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* QUICK LONG-PRESS CONTEXT MENU */}
      <AnimatePresence>
        {showQuickMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/98 backdrop-blur-xl z-40 flex flex-col items-center justify-center p-5 selection:bg-transparent"
          >
            <div className="text-center space-y-1 mb-5 select-none animate-pulse">
              <span className="text-[10px] font-mono font-black tracking-widest text-red-500 uppercase flex items-center justify-center gap-1">
                <Sparkles size={11} className="text-red-500" />
                REBORN QUICK ACCESS COMMANDS
              </span>
              <p className="text-[10px] text-zinc-500 italic">
                Choose an immediate action vector
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 w-full max-w-[280px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                  setShowQuickMenu(false);
                }}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white hover:border-red-500 hover:shadow-[0_0_12px_rgba(239,68,68,0.25)] transition-all cursor-pointer"
              >
                {copied ? <Check size={16} className="text-green-500 mb-1" /> : <Copy size={16} className="text-red-500 mb-1" />}
                <span className="text-[9px] font-mono tracking-wider font-bold">COPY VERSE</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                  setShowQuickMenu(false);
                }}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white hover:border-red-500 hover:shadow-[0_0_12px_rgba(239,68,68,0.25)] transition-all cursor-pointer"
              >
                <Share2 size={16} className="text-red-500 mb-1" />
                <span className="text-[9px] font-mono tracking-wider font-bold">SHARE INSTANT</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenImageStudio();
                  setShowQuickMenu(false);
                }}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white hover:border-red-500 hover:shadow-[0_0_12px_rgba(239,68,68,0.25)] transition-all cursor-pointer"
              >
                <Image size={16} className="text-red-500 mb-1" />
                <span className="text-[9px] font-mono tracking-wider font-bold">HD STUDIO</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave();
                  setShowQuickMenu(false);
                }}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white hover:border-red-500/80 hover:shadow-[0_0_12px_rgba(239,68,68,0.25)] transition-all cursor-pointer"
              >
                <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} className={isSaved ? 'text-red-500 mb-1 scale-110' : 'text-red-550 mb-1'} />
                <span className="text-[9px] font-mono tracking-wider font-bold">
                  {isSaved ? 'UNSAVE LOCK' : 'SAVE INSTANT'}
                </span>
              </button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQuickMenu(false);
              }}
              className="mt-6 px-6 py-2.5 text-[10px] font-mono tracking-widest font-bold border border-zinc-920 bg-zinc-950 text-zinc-500 hover:text-white rounded-lg cursor-pointer"
            >
              DISMISS ACTION
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Internal Content wrapped with transition animations */}
      <div className="flex-1 flex flex-col justify-between select-text z-10 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeShayari.id}-${historyIndex}`}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex-1 flex flex-col justify-between w-full pointer-events-auto"
          >
            {/* Card Header (Category, Lock visual status & Author badge) */}
            <div className="flex items-center justify-between mb-4 select-none shrink-0 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono uppercase tracking-widest text-red-400 bg-red-950/40 px-3 py-1 rounded-full border border-red-500/25 shadow-[0_0_12px_rgba(239,68,68,0.1)]">
                  {activeShayari.category}
                </span>
                {/* Tiny glowing live recitation indicator */}
                {isSpeakingLocal && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute -top-1 -left-1" />
                )}
              </div>
              <div className="flex items-center gap-2">
                {isLocked && (
                  <span className="flex items-center gap-1 text-[8.5px] font-mono font-black text-rose-500 bg-rose-950/40 border border-rose-505/45 px-2.5 py-0.5 rounded-full animate-pulse tracking-wide">
                    <Lock size={9} className="fill-current" />
                    LOCKED
                  </span>
                )}
                <a
                  href={`/creator/${encodeURIComponent(activeShayari.uploaderUsername || activeShayari.author.toLowerCase().replace(/\s+/g, '-'))}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const cName = activeShayari.uploaderUsername || activeShayari.author.toLowerCase().replace(/\s+/g, '-');
                    window.history.pushState(null, '', `/creator/${encodeURIComponent(cName)}`);
                    window.dispatchEvent(new Event('popstate'));
                    showToast(`Opening Creator profile: @${activeShayari.author} 👑`);
                  }}
                  className="text-xs font-mono font-bold text-zinc-500 hover:text-red-400 hover:underline transition cursor-pointer select-auto"
                >
                  — {activeShayari.author}
                </a>
              </div>
            </div>

            {/* Shayari body containing highlighted interactive graphic text with stable centering & beautiful poems metrics */}
            <div className="flex-1 flex items-center justify-center py-6 text-center px-3 pointer-events-auto select-text selection:bg-red-500/30">
              <p className="text-[17px] md:text-[21px] font-bold leading-[1.85] md:leading-[2] tracking-wider text-zinc-100 whitespace-pre-line font-sans select-text">
                {textParts.map((part, pIdx) => {
                  if (typeof part === 'string') {
                    return <span key={pIdx}>{part}</span>;
                  } else {
                    return (
                      <span
                        key={pIdx}
                        className="relative inline-block font-black text-red-400 font-sans px-1 transition-transform duration-300"
                        style={{
                          textShadow: '0 0 12px rgba(239,68,68,0.5)',
                        }}
                      >
                        {part.word}
                        <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-red-500 rounded shadow-[0_0_8px_rgba(239,68,68,0.85)]" />
                      </span>
                    );
                  }
                })}
              </p>
            </div>

            {/* Micro details counter metrics & Equalizer Spectrum */}
            <div className="flex items-center justify-between select-none mt-2 shrink-0 pointer-events-none">
              <div className="text-[9px] font-mono font-bold text-zinc-650 group-hover:text-zinc-500 flex items-center gap-1.5 transition-colors">
                <span>{activeShayari.likes + (isSaved ? 1 : 0)} LIKES</span>
                <span>•</span>
                <span>{activeShayari.shares + (shared ? 1 : 0)} SHARES</span>
                {isAutoShuffleOn && !isLocked && (
                  <>
                    <span>•</span>
                    <span className="text-zinc-600">
                      {isInteractivePaused ? '⚠️ PAUSED' : 'STREAM'}
                    </span>
                  </>
                )}
              </div>

              {/* Minimal Glowing Voice Waveform Equalizer */}
              {isSpeakingLocal && (
                <div className="flex items-center gap-0.5 justify-end shrink-0" title="Voice waveform active">
                  {[0, 1, 2, 3, 4].map((bar) => (
                    <motion.span
                      key={bar}
                      animate={{
                        scaleY: [1, 2.8, 1],
                      }}
                      transition={{
                        duration: 0.4 + bar * 0.08,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                      className="w-0.75 h-4 bg-gradient-to-t from-red-500 via-pink-500 to-rose-500 rounded-full origin-bottom"
                      style={{ boxShadow: '0 0 10px rgba(239,68,68,0.7)' }}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Separator line */}
      <div className="w-full h-[1px] bg-white/5 my-4 group-hover:bg-red-500/10 transition-all duration-350 z-10 select-none pointer-events-none" />

      {/* Controls Footer */}
      <div className="flex items-center justify-between gap-2.5 z-10 select-none interactive-bar w-full flex-wrap sm:flex-nowrap pointer-events-auto">
        {/* Left Action Buttons: Save, Copy, Share, Listen, Create Status */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Save Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all duration-300 cursor-pointer ${
              isSaved
                ? 'bg-red-550/15 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.35)]'
                : 'bg-zinc-900/50 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800'
            }`}
            title={isSaved ? 'Unsave' : 'Save to Vault'}
          >
            <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} className={isSaved ? 'scale-110 text-red-500 transition-transform' : 'transition-transform hover:scale-110'} />
          </button>

          {/* Copy Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all duration-300 cursor-pointer ${
              copied
                ? 'bg-green-950/20 border-green-500 text-green-500 shadow-[0_0_12px_rgba(34,197,94,0.35)]'
                : 'bg-zinc-900/50 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800'
            }`}
            title="Copy Shayari Text"
          >
            {copied ? <Check size={16} /> : <Copy size={16} className="transition-transform hover:scale-105" />}
          </button>

          {/* Share Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all duration-300 cursor-pointer ${
              shared 
                ? 'bg-red-550/15 border-red-550 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.35)]' 
                : 'bg-zinc-900/50 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800'
            }`}
            title="Share Shayari"
          >
            <Share2 size={16} className="transition-transform hover:scale-105" />
          </button>

          {/* Listen Voice Recitation Button (LOCAL WAVEFORM DRIVEN) */}
          <button
            onClick={handleRecitePlayToggle}
            className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all duration-300 cursor-pointer ${
              isSpeakingLocal
                ? 'bg-red-650/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.55)]'
                : 'bg-zinc-900/50 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800'
            }`}
            title="Recite audio readout"
          >
            <Volume2 size={16} className={isSpeakingLocal ? 'animate-pulse text-red-500 scale-110' : 'transition-transform hover:scale-105'} />
          </button>

          {/* Image Creator Status Button */}
          <button
            onClick={(e) => {
               e.stopPropagation();
               onOpenImageStudio();
            }}
            className="w-11 h-11 flex items-center justify-center rounded-xl border bg-zinc-900/50 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800 transition-all duration-300 cursor-pointer"
            title="Create HD Wallpaper Status"
          >
            <Image size={16} className="transition-transform hover:scale-105" />
          </button>

          {/* Immersive Mode Focus Button */}
          {onOpenImmersive && (
            <button
              onClick={(e) => {
                 e.stopPropagation();
                 onOpenImmersive();
              }}
              className="w-11 h-11 flex items-center justify-center rounded-xl border bg-zinc-900/50 border-zinc-900 text-zinc-400 hover:text-white hover:border-[#ff0055]/30 hover:shadow-[0_0_12px_rgba(255,0,85,0.2)] transition-all duration-300 cursor-pointer"
              title="Enter Cinematic Immersive Mode"
            >
              <Maximize2 size={16} className="transition-transform hover:scale-105" />
            </button>
          )}

          {/* Lock/Unlock Shuffle Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const nextVal = !isLocked;
              setIsLocked(nextVal);
              showToast(nextVal ? 'Locked from rotate 🔒' : 'Unlocked rotate active 🔓');
            }}
            className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all duration-300 cursor-pointer ${
              isLocked
                ? 'bg-red-950/30 border-red-550/80 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.35)]'
                : 'bg-zinc-900/50 border-zinc-900 text-zinc-500 hover:text-zinc-300 hover:border-zinc-800'
            }`}
            title={isLocked ? 'Unlock Card Shuffle' : 'Lock card from auto shuffle'}
          >
            {isLocked ? <Lock size={15} /> : <Unlock size={15} />}
          </button>
        </div>

        {/* Right NEXT button exactly like reference */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNextTrigger();
          }}
          className="h-11 px-6 rounded-xl border border-red-550/60 bg-red-650/15 text-red-500 hover:text-white hover:bg-gradient-to-r hover:from-red-650 hover:to-rose-650 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:border-red-500 transition-all duration-300 flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-wider select-none cursor-pointer active:scale-95 flex-1 sm:flex-initial"
          title="Explore Next Content"
        >
          <span>NEXT</span>
          <ArrowRight size={14} className="stroke-[2.5]" />
        </button>
      </div>

      {/* RELATED ENGINE: 4-6 RECOMMENDED SHAYARIS */}
      {allShayaris && allShayaris.length > 0 && (
        <div className="w-full border-t border-white/5 pt-4 mt-3 z-10 text-left pointer-events-auto shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsRelatedExpanded(!isRelatedExpanded);
            }}
            className="flex items-center gap-2 text-[10px] font-mono tracking-wider text-zinc-500 hover:text-red-400 uppercase transition cursor-pointer select-none active:scale-95 bg-zinc-950/40 px-3 py-1.5 rounded-lg border border-zinc-900"
          >
            <Sparkles size={11} className={`text-red-500 animate-pulse transition-transform duration-500 ${isRelatedExpanded ? 'rotate-180' : ''}`} />
            <span>{isRelatedExpanded ? 'Hide Related Feelings (4)' : 'Show Related Shayari (4)'}</span>
          </button>

          <AnimatePresence>
            {isRelatedExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {allShayaris
                    .filter(s => s.id !== activeShayari.id)
                    .filter(s => s.category === activeShayari.category)
                    .slice(0, 4)
                    .map((sh, idx) => (
                      <div
                        key={sh.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Transition current active card to this shayari!
                          setHistory((prev) => [...prev, sh]);
                          setHistoryIndex((prev) => prev + 1);
                          if (onFocus) onFocus(sh);
                          showToast(`Feeling loaded into main focus: related verse #${idx + 1} 💫`);
                        }}
                        className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-900/60 hover:border-red-500/25 transition duration-300 hover:bg-zinc-900/40 cursor-pointer select-none group/rel"
                      >
                        <div className="flex items-center justify-between gap-1.5 mb-1 text-[7.5px] font-mono text-zinc-600 uppercase font-bold">
                          <span className="truncate">{sh.category}</span>
                          <span className="shrink-0">— {sh.author}</span>
                        </div>
                        <p className="text-zinc-400 group-hover/rel:text-zinc-200 text-[10px] font-serif leading-relaxed line-clamp-2 italic">
                          {sh.text}
                        </p>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Dynamic Glowing progress indicator for auto-shuffling */}
      {isAutoShuffleOn && !isLocked && !showQuickMenu && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-zinc-950/60 overflow-hidden select-none pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-red-600 via-pink-500 to-rose-600 shadow-[0_0_12px_rgba(239,68,68,0.85)] transition-all duration-100 ease-linear"
            style={{
              width: `${progress}%`,
              opacity: isInteractivePaused ? 0.35 : 1,
            }}
          />
        </div>
      )}
    </motion.div>
  );
}
