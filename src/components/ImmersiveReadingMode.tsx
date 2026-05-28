import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, Volume2, Sparkles, Heart, Copy, Share2, Music, Maximize2, Minimize2 } from 'lucide-react';
import { Shayari } from '../types';

interface ImmersiveReadingModeProps {
  shayari: Shayari;
  isSaved: boolean;
  onToggleSave: () => void;
  onClose: () => void;
  showToast: (msg: string) => void;
  allShayaris?: Shayari[];
  onSelectShayari?: (sh: Shayari) => void;
}

export default function ImmersiveReadingMode({
  shayari,
  isSaved,
  onToggleSave,
  onClose,
  showToast,
  allShayaris = [],
  onSelectShayari,
}: ImmersiveReadingModeProps) {
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  
  // Immersive sound states for procedural audio synthesis
  const [noiseActive, setNoiseActive] = useState(false);
  const [pianoActive, setPianoActive] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const rainGainRef = useRef<GainNode | null>(null);
  const pianoGainRef = useRef<GainNode | null>(null);
  const pianoIntervalRef = useRef<any>(null);

  // Trigger speech synthesis
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Prevent scrolling while in immersive mode
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      stopAmbientAudio();
    };
  }, []);

  // Soft rain ambient noise source
  const startRainSynth = (ctx: AudioContext) => {
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * 2.0;
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      data[i] = b0 + b1 + b2 + b3 + b4 + white * 0.5362;
      data[i] *= 0.08; // extremely soft rain noise
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = buffer;
    rainSource.loop = true;

    const filterNode = ctx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(320, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    rainGainRef.current = gainNode;

    rainSource.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(ctx.destination);
    rainSource.start(0);
  };

  // Procedural lofi chords loop
  const startPianoSynth = (ctx: AudioContext) => {
    const pianoNotes = [
      [146.83, 185.00, 220.00, 277.18], // Dmaj7
      [130.81, 164.81, 196.00, 246.94], // Cmaj7
      [110.00, 130.81, 164.81, 220.00], // Am7
      [116.54, 146.83, 174.61, 220.00], // Bbmaj7
    ];
    let noteIdx = 0;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
    pianoGainRef.current = gainNode;
    gainNode.connect(ctx.destination);

    const playChord = () => {
      const now = ctx.currentTime;
      const notes = pianoNotes[noteIdx];
      noteIdx = (noteIdx + 1) % pianoNotes.length;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);

        oscGain.gain.setValueAtTime(0, now);
        oscGain.gain.linearRampToValueAtTime(0.08, now + 0.15);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 4.5);

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(gainNode);

        osc.start(now);
        osc.stop(now + 4.8);
      });
    };

    playChord();
    pianoIntervalRef.current = setInterval(playChord, 5000);
  };

  const initAudio = () => {
    if (audioCtxRef.current) return;
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) return;
    try {
      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      if (noiseActive) startRainSynth(ctx);
      if (pianoActive) startPianoSynth(ctx);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleRain = () => {
    const next = !noiseActive;
    setNoiseActive(next);
    if (!audioCtxRef.current) {
      initAudio();
    } else {
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      if (next) {
        startRainSynth(ctx);
      } else if (rainGainRef.current) {
        rainGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
      }
    }
    showToast(next ? 'Gentle storm initialized 🌧️' : 'Rain silenced ⛅');
  };

  const togglePiano = () => {
    const next = !pianoActive;
    setPianoActive(next);
    if (!audioCtxRef.current) {
      initAudio();
    } else {
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      if (next) {
        startPianoSynth(ctx);
      } else {
        if (pianoIntervalRef.current) clearInterval(pianoIntervalRef.current);
        if (pianoGainRef.current) {
          pianoGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
        }
      }
    }
    showToast(next ? 'Cinema chords activated 🎹' : 'Piano chords stopped 🎵');
  };

  const stopAmbientAudio = () => {
    if (pianoIntervalRef.current) clearInterval(pianoIntervalRef.current);
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
  };

  // Recite Shayari
  const handleRecite = () => {
    if (isPlayingVoice) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingVoice(false);
      return;
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      showToast('Reciter service not supported on this device.');
      return;
    }

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(shayari.text);
    
    // Slower emotional rhythm
    utter.rate = 0.76;
    utter.pitch = 0.9;

    utter.onstart = () => setIsPlayingVoice(true);
    utter.onend = () => setIsPlayingVoice(false);
    utter.onerror = () => setIsPlayingVoice(false);

    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
    showToast('Immersive reading recitation active... 🎧');
  };

  const copyText = async () => {
    const shareText = `"${shayari.text}"\n\n— ${shayari.author}\n✨ Read in Immersive Mode on Roy No Rules`;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      showToast('Verse copied perfectly! 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  const shareText = async () => {
    const shareText = `"${shayari.text}"\n\n— ${shayari.author}`;
    if (navigator.share) {
      try {
        await navigator.share({
          text: shareText,
          url: window.location.origin,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (_) {
        copyText();
      }
    } else {
      copyText();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-md overflow-y-auto flex flex-col justify-between p-6 sm:p-12 select-none"
      id="immersive-mode-overlay"
    >
      {/* Cinematic Blur Gradients */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 md:w-96 md:h-96 rounded-full bg-blue-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 md:w-96 md:h-96 rounded-full bg-red-500/10 blur-[130px] pointer-events-none" />

      {/* Header controls */}
      <div className="relative flex items-center justify-between shrink-0 z-10 w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase font-black px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-red-500">
            Immersive Mode
          </span>
          <span className="text-[10px] font-mono uppercase text-zinc-500 hidden sm:inline">
            // {shayari.category} Vibe
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio synthe buttons */}
          <button
            onClick={toggleRain}
            className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
              noiseActive ? 'border-blue-500 text-blue-400 bg-blue-950/20' : 'border-zinc-800 text-zinc-500 hover:text-stone-300'
            }`}
          >
            <span>Rain</span>
            <span className={`w-1 h-1 rounded-full ${noiseActive ? 'bg-blue-400 animate-ping' : 'bg-transparent'}`} />
          </button>

          <button
            onClick={togglePiano}
            className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
              pianoActive ? 'border-red-500 text-red-400 bg-red-950/20' : 'border-zinc-800 text-zinc-500 hover:text-stone-300'
            }`}
          >
            <span>Piano</span>
            <span className={`w-1 h-1 rounded-full ${pianoActive ? 'bg-red-400 animate-ping' : 'bg-transparent'}`} />
          </button>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500 hover:text-red-500 transition cursor-pointer text-zinc-400"
            title="Exit Immersive Mode"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Central Immersive Typography */}
      <div className="relative flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full py-12 px-4 text-center z-10 select-text">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="space-y-8 select-text"
        >
          {/* Decorative Spark */}
          <div className="inline-flex items-center justify-center text-red-500/40">
            <Sparkles className="size-8 animate-pulse text-red-500/80" />
          </div>

          <p className="text-2xl sm:text-3.5xl md:text-4.5xl font-extrabold text-stone-100 tracking-wide leading-[2] sm:leading-[2.1] text-center whitespace-pre-line font-sans selection:bg-red-500/30">
            {shayari.text}
          </p>

          <div className="text-zinc-500 tracking-widest font-mono text-sm">
            — {shayari.author}
          </div>

          {/* WHAT THIS FEELING MEANS (SEO Context Expansion) */}
          <div className="mt-8 pt-6 border-t border-white/5 max-w-xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-widest uppercase font-black text-red-500 bg-red-950/20 px-3 py-1 rounded">
              What This Feeling Means 👀
            </span>
            <p className="text-xs text-zinc-400 italic leading-relaxed">
              "{shayari.category === 'Sad' || shayari.category === 'Breakup' 
                ? 'Silence isn\'t empty; it is simply overflowing with words we can never tell anyone. When the heart suffers deep silent pain, writing it out becomes the ultimate healer.' 
                : shayari.category === 'Love' 
                  ? 'Romance is the silent gravity that keeps our chaotic souls connected. When looks speak, notebooks and hearts are filled with beautiful memories.' 
                  : 'No master succeeded without facing intense rejections and silent rooms. Your attitude is the boundary system that protects your self-worth.'}"
            </p>
          </div>
        </motion.div>
      </div>

      {/* MORE SHAYARI YOU MAY LIKE (RELATED ENGINE) */}
      {allShayaris.length > 0 && (
        <div className="relative z-10 w-full max-w-4xl mx-auto py-8 border-t border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              <h3 className="text-xs font-mono tracking-[0.2em] uppercase font-black text-red-500">
                More Shayari You May Like 👀
              </h3>
            </div>
            <span className="text-[10px] font-mono uppercase text-zinc-550 hidden sm:inline">// Matching same elements</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allShayaris
              .filter(s => s.id !== shayari.id)
              .filter(s => s.category === shayari.category)
              .slice(0, 3)
              .map((sh, idx) => (
                <div
                  key={sh.id}
                  onClick={() => {
                    if (onSelectShayari) {
                      onSelectShayari(sh);
                    }
                    showToast(`Transitioning to related poem #${idx + 1} 💫`);
                  }}
                  className="p-5 rounded-2xl bg-zinc-950/90 border border-zinc-900 overflow-hidden hover:border-red-500/20 select-none cursor-pointer group hover:bg-zinc-900/40 transition duration-300 text-left"
                >
                  <div className="flex items-center justify-between mb-3 text-[8.5px] font-mono text-zinc-550 font-bold uppercase gap-2">
                    <span className="truncate">{sh.category}</span>
                    <span className="shrink-0">— {sh.author}</span>
                  </div>
                  <p className="text-stone-300 text-[11px] leading-relaxed line-clamp-3 italic font-sans whitespace-pre-line">
                    {sh.text}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Custom Bottom actions panel */}
      <div className="relative shrink-0 z-10 w-full max-w-lg mx-auto bg-zinc-950/40 border border-white/5 p-4 rounded-2xl backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Save */}
          <button
            onClick={onToggleSave}
            className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
              isSaved ? 'border-red-500 bg-red-950/20 text-red-500' : 'border-zinc-800 text-zinc-500 hover:text-white'
            }`}
          >
            <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} className={isSaved ? 'scale-110' : ''} />
          </button>

          {/* Copy */}
          <button
            onClick={copyText}
            className="w-11 h-11 rounded-xl flex items-center justify-center border border-zinc-800 text-zinc-500 hover:text-white transition cursor-pointer"
          >
            <Copy size={16} />
          </button>

          {/* Share */}
          <button
            onClick={shareText}
            className="w-11 h-11 rounded-xl flex items-center justify-center border border-zinc-800 text-zinc-500 hover:text-white transition cursor-pointer"
          >
            <Share2 size={16} />
          </button>
        </div>

        {/* Listen Voice */}
        <button
          onClick={handleRecite}
          className={`h-11 px-6 rounded-xl border font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition ${
            isPlayingVoice 
              ? 'border-red-500 bg-red-950/30 text-red-400 animate-pulse' 
              : 'border-red-500/40 bg-red-650/10 text-red-500 hover:text-white hover:bg-gradient-to-r hover:from-red-650 hover:to-rose-650'
          }`}
        >
          <Volume2 size={14} className={isPlayingVoice ? 'animate-bounce' : ''} />
          <span>{isPlayingVoice ? 'Speaking' : 'Recite Softly'}</span>
        </button>
      </div>

      {/* Micro guidance line */}
      <div className="text-center font-mono text-[8.5px] text-zinc-600 mt-4 shrink-0 uppercase tracking-widest">
        *Procedural dynamic synthesis generates real-time room atmosphere
      </div>
    </motion.div>
  );
}
