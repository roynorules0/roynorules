import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, Square, Music, Volume2, Sparkles, ChevronDown, Check,
  Activity, Smile, Flame, Moon, Compass, VolumeX
} from 'lucide-react';
import { Shayari } from '../types';

interface VoiceShayariPlayerProps {
  shayari: Shayari | null;
  onClose: () => void;
}

// Low-latency procedural Web Audio Ambient Synthesizer Engine
class AmbientSynthEngine {
  private ctx: AudioContext | null = null;
  private rainGain: GainNode | null = null;
  private pianoGain: GainNode | null = null;
  private lofiGain: GainNode | null = null;
  
  private rainNode: AudioBufferSourceNode | null = null;
  private pianoInterval: any = null;
  private lofiInterval: any = null;
  
  private pianoIndex = 0;
  private pianoNotes = [
    [130.81, 164.81, 196.00, 246.94], // Cmaj7 (C3, E3, G3, B3)
    [110.00, 130.81, 164.81, 220.00], // Am7 / Am9
    [87.31, 110.00, 130.81, 174.61],  // Fmaj7
    [98.00, 123.47, 146.83, 196.00]   // G7
  ];
  private lofiStep = 0;

  constructor() {}

  init() {
    if (this.ctx) return;
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) return;
    try {
      this.ctx = new AudioCtxClass();

      // Setup clean gain chains
      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.rainGain.connect(this.ctx.destination);

      this.pianoGain = this.ctx.createGain();
      this.pianoGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.pianoGain.connect(this.ctx.destination);

      this.lofiGain = this.ctx.createGain();
      this.lofiGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.lofiGain.connect(this.ctx.destination);

      this.startRainFilter();
      this.startPianoChords();
      this.startLofiBeat();
    } catch (e) {
      console.error('Failed to initialize local synthesizer:', e);
    }
  }

  private startRainFilter() {
    if (!this.ctx || !this.rainGain) return;

    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 2.0; // 2 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    // Procedural Pink Noise generation
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.76162 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.12; // Adjust volume for noise
      b6 = white * 0.115926;
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = buffer;
    rainSource.loop = true;

    // Soft rainy lowpass filter
    const filterNode = this.ctx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(380, this.ctx.currentTime);

    rainSource.connect(filterNode);
    filterNode.connect(this.rainGain);
    rainSource.start(0);

    this.rainNode = rainSource;
  }

  private startPianoChords() {
    if (!this.ctx || !this.pianoGain) return;

    const playNextChord = () => {
      if (!this.ctx || !this.pianoGain) return;
      
      const now = this.ctx.currentTime;
      const notes = this.pianoNotes[this.pianoIndex];
      this.pianoIndex = (this.pianoIndex + 1) % this.pianoNotes.length;

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const nodeGain = this.ctx!.createGain();
        const nodeFilter = this.ctx!.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        nodeFilter.type = 'lowpass';
        nodeFilter.frequency.setValueAtTime(280, now);
        nodeFilter.frequency.exponentialRampToValueAtTime(100, now + 3.0);

        nodeGain.gain.setValueAtTime(0, now);
        // Soft touch attack, long spatial decay
        nodeGain.gain.linearRampToValueAtTime(0.15 - (idx * 0.025), now + 0.1);
        nodeGain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

        osc.connect(nodeFilter);
        nodeFilter.connect(nodeGain);
        nodeGain.connect(this.pianoGain!);

        osc.start(now);
        osc.stop(now + 3.8);
      });
    };

    this.pianoInterval = setInterval(() => {
      try { playNextChord(); } catch (e) {}
    }, 4500);

    // Play first chord shortly
    setTimeout(() => { try { playNextChord(); } catch(e){} }, 500);
  }

  private startLofiBeat() {
    if (!this.ctx || !this.lofiGain) return;

    const handleSequencerStep = () => {
      if (!this.ctx || !this.lofiGain) return;
      const now = this.ctx.currentTime;

      // Heartbeat 54Hz soft kick drum
      if (this.lofiStep === 0 || this.lofiStep === 2) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(54, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.2);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(this.lofiGain);

        osc.start(now);
        osc.stop(now + 0.3);
      }

      // Vinyl dusty hiss clicks
      if (Math.random() > 0.4) {
        const snapOsc = this.ctx.createOscillator();
        const snapGain = this.ctx.createGain();

        snapOsc.type = 'triangle';
        snapOsc.frequency.setValueAtTime(1500 + Math.random() * 800, now);

        snapGain.gain.setValueAtTime(0, now);
        snapGain.gain.linearRampToValueAtTime(0.02, now + 0.001);
        snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

        snapOsc.connect(snapGain);
        snapGain.connect(this.lofiGain);

        snapOsc.start(now);
        snapOsc.stop(now + 0.02);
      }

      this.lofiStep = (this.lofiStep + 1) % 4;
    };

    this.lofiInterval = setInterval(() => {
      try { handleSequencerStep(); } catch (e) {}
    }, 600); // 100 BPM lounge heartbeat
  }

  updateGains(rain: boolean, piano: boolean, lofi: boolean, active: boolean) {
    if (active) {
      this.init();
    }
    if (!this.ctx) return;

    // Resume suspended context (safely bypassing chrome autoplay rules)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const targetRain = rain && active ? 0.32 : 0;
    const targetPiano = piano && active ? 0.45 : 0;
    const targetLofi = lofi && active ? 0.35 : 0;

    this.rainGain?.gain.setTargetAtTime(targetRain, now, 0.4);
    this.pianoGain?.gain.setTargetAtTime(targetPiano, now, 0.5);
    this.lofiGain?.gain.setTargetAtTime(targetLofi, now, 0.4);
  }

  destroy() {
    if (this.pianoInterval) clearInterval(this.pianoInterval);
    if (this.lofiInterval) clearInterval(this.lofiInterval);
    if (this.rainNode) {
      try { this.rainNode.stop(); } catch(e){}
    }
    this.ctx?.close();
    this.ctx = null;
  }
}

// Preset definition for speech properties
type VoiceTone = 'male' | 'female' | 'soft' | 'motivation';

export default function VoiceShayariPlayer({ shayari, onClose }: VoiceShayariPlayerProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentTimeText, setCurrentTimeText] = useState<string>('0:00');
  const [activeTone, setActiveTone] = useState<VoiceTone>('motivation');
  
  // Ambient Sound Toggles
  const [ambientRain, setAmbientRain] = useState<boolean>(false);
  const [ambientPiano, setAmbientPiano] = useState<boolean>(true); // Cozy default
  const [ambientLofi, setAmbientLofi] = useState<boolean>(false);

  // Browser SpeechSynthesis Voices loaded dynamically
  const [deviceVoices, setDeviceVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [showVoicePicker, setShowVoicePicker] = useState<boolean>(false);

  const ambientSynthRef = useRef<AmbientSynthEngine | null>(null);
  const playTimerRef = useRef<any>(null);
  const playbackSecondsRef = useRef<number>(0);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize synth engine
  useEffect(() => {
    ambientSynthRef.current = new AmbientSynthEngine();
    return () => {
      ambientSynthRef.current?.destroy();
      stopSpeechService();
    };
  }, []);

  // Update synthesized background gain loop dynamically based on state
  useEffect(() => {
    if (ambientSynthRef.current) {
      ambientSynthRef.current.updateGains(
        ambientRain,
        ambientPiano,
        ambientLofi,
        isPlaying && !isPaused
      );
    }
  }, [ambientRain, ambientPiano, ambientLofi, isPlaying, isPaused]);

  // Load voices dynamically on boot
  useEffect(() => {
    const fetchVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const allVoices = window.speechSynthesis.getVoices();
        
        // Let's prioritize Indian or beautiful soft Hindi/English/Hinglish speaking voices first
        const sortedVoices = [...allVoices].sort((a, b) => {
          const langA = a.lang.toLowerCase();
          const langB = b.lang.toLowerCase();
          if (langA.includes('hi-in') && !langB.includes('hi-in')) return -1;
          if (!langA.includes('hi-in') && langB.includes('hi-in')) return 1;
          if (langA.includes('en-in') && !langB.includes('en-in')) return -1;
          if (!langA.includes('en-in') && langB.includes('en-in')) return 1;
          return a.name.localeCompare(b.name);
        });

        setDeviceVoices(sortedVoices);
        
        // Auto select a beautiful default Indian or English voice
        if (sortedVoices.length > 0) {
          const topIndian = sortedVoices.find(v => v.lang.toLowerCase().includes('hi-') || v.lang.toLowerCase().includes('en-in'));
          setSelectedVoiceName(topIndian ? topIndian.name : sortedVoices[0].name);
        }
      }
    };

    fetchVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = fetchVoices;
    }
  }, []);

  // Clean play process if structural target shayari changes unexpectedly
  useEffect(() => {
    if (shayari) {
      stopSpeechService();
      // Auto play the fresh card
      setTimeout(() => {
        handlePlaySpeech();
      }, 100);
    } else {
      stopSpeechService();
    }
  }, [shayari]);

  // Speech helper: Stops synthesize tasks without trace
  const stopSpeechService = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
    }
    playbackSecondsRef.current = 0;
    setCurrentTimeText('0:00');
    setIsPlaying(false);
    setIsPaused(false);
  };

  // Build the Speech Utterance matching selected tone and speaking voice
  const handlePlaySpeech = () => {
    if (!shayari) return;

    if (isPaused && currentUtteranceRef.current) {
      // Resume
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.resume();
        setIsPaused(false);
        setIsPlaying(true);
        startVisualTimer();
      }
      return;
    }

    // Full restart text speech synthesize
    stopSpeechService();

    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Prepare full context containing textual shayari and brief author line to give dynamic premium vibe
    const textToRead = `${shayari.text}.`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    currentUtteranceRef.current = utterance;

    // Apply designated selected voice
    if (selectedVoiceName) {
      const matchVoice = deviceVoices.find(v => v.name === selectedVoiceName);
      if (matchVoice) {
        utterance.voice = matchVoice;
      }
    }

    // Configure fine mathematical parameters representing custom Vibe Tones with pristine elegance
    switch (activeTone) {
      case 'male':
        utterance.pitch = 0.82;
        utterance.rate = 0.88;
        utterance.volume = 1.0;
        break;
      case 'female':
        utterance.pitch = 1.15;
        utterance.rate = 0.94;
        utterance.volume = 1.0;
        break;
      case 'soft':
        utterance.pitch = 0.92;
        utterance.rate = 0.78; // slow intimate delivery
        utterance.volume = 0.75;
        break;
      case 'motivation':
        utterance.pitch = 1.05;
        utterance.rate = 1.05; // energized beat delivery
        utterance.volume = 1.0;
        break;
    }

    // Set syntheses lifecycle triggers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      startVisualTimer();
    };

    utterance.onend = () => {
      stopSpeechService();
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis errored out gracefully:', e);
      stopSpeechService();
    };

    // Trigger synthesis service
    window.speechSynthesis.speak(utterance);
    
    // Quick initialize synthesizer gain
    if (ambientSynthRef.current) {
      ambientSynthRef.current.updateGains(ambientRain, ambientPiano, ambientLofi, true);
    }
  };

  // Pause action
  const handlePauseSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
      }
    }
  };

  // Run real-time clock counter
  const startVisualTimer = () => {
    if (playTimerRef.current) clearInterval(playTimerRef.current);
    playTimerRef.current = setInterval(() => {
      playbackSecondsRef.current += 1;
      const mins = Math.floor(playbackSecondsRef.current / 60);
      const secs = playbackSecondsRef.current % 60;
      setCurrentTimeText(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
    }, 1000);
  };

  if (!shayari) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed bottom-20 left-4 right-4 md:bottom-6 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[650px] z-50 bg-zinc-950/98 border border-zinc-900 rounded-3xl p-5 shadow-[0_15px_60px_rgba(0,0,0,0.85)] select-none backdrop-blur-xl"
      id="voice-cyber-player"
    >
      {/* Decorative cyber framing light */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-red-500/70 to-transparent shadow-[0_3px_12px_rgba(239,68,68,0.5)]"></div>

      {/* Grid Content Layout */}
      <div className="space-y-4">
        
        {/* Core A: Current Track Meta Text */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-500 relative shrink-0">
              <Activity className={`size-5 ${isPlaying && !isPaused ? 'animate-pulse' : ''}`} />
              {/* Pulsing micro indicator */}
              {isPlaying && !isPaused && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono tracking-widest text-red-500 uppercase font-black">
                🎤 LOCAL VOICE STATION
              </span>
              <p className="text-xs font-sans text-stone-200 font-extrabold truncate max-w-[280px]">
                "{shayari.text}"
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9.5px] font-mono text-zinc-500">#{shayari.category}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-800"></span>
                <span className="text-[9.5px] font-mono text-zinc-400 font-bold">{currentTimeText}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[10px] font-mono font-bold uppercase py-1 px-2.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
          >
            Collapse
          </button>
        </div>

        {/* Core B: Graphical Sound Waves EQ while active */}
        <div className="h-4 flex items-center justify-center gap-1 bg-zinc-900/40 rounded-lg overflow-hidden px-4 border border-zinc-900/60">
          {(isPlaying && !isPaused) ? (
            Array.from({ length: 26 }).map((_, i) => {
              const animDur = 0.5 + Math.random() * 0.7;
              return (
                <motion.span
                  key={i}
                  animate={{ height: ['4px', `${Math.random() * 14 + 2}px`, '4px'] }}
                  transition={{ repeat: Infinity, duration: animDur, ease: 'easeInOut' }}
                  className="w-1 rounded-full bg-gradient-to-t from-red-600 to-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.2)]"
                />
              );
            })
          ) : (
            <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest text-center">
              {isPaused ? '⏸️ Voice paused' : '⏹️ Ready... Play to trigger audio'}
            </div>
          )}
        </div>

        {/* Settings Block C: Tone Pill Buttons & Voice Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-zinc-900/60 select-none">
          
          {/* Tone presetter */}
          <div className="space-y-1.5">
            <span className="text-[9.5px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">
              Speech delivery attitude:
            </span>
            <div className="grid grid-cols-4 gap-1">
              {([
                { id: 'motivation', name: 'Raw 🔥', tip: 'Energetic delivery' },
                { id: 'soft', name: 'Cozy 🌙', tip: 'Slow emotional soft tone' },
                { id: 'male', name: 'Bro 🤵', tip: 'Custom deep pitch male' },
                { id: 'female', name: 'Siri 💁', tip: 'Elegant high pitch female' }
              ] as const).map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => {
                    setActiveTone(tone.id);
                    // If playing, restart automatically to let active parameters apply
                    if (isPlaying) {
                      setTimeout(() => handlePlaySpeech(), 100);
                    }
                  }}
                  title={tone.tip}
                  className={`py-1.5 text-[10px] rounded-lg border font-bold text-center transition-all cursor-pointer ${
                    activeTone === tone.id
                      ? 'bg-zinc-900 text-red-500 border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.15)]'
                      : 'bg-zinc-950/40 text-stone-400 border-zinc-900 hover:text-white'
                  }`}
                >
                  {tone.name}
                </button>
              ))}
            </div>
          </div>

          {/* Native Synthesis Engine voice dropdown picker */}
          <div className="space-y-1.5 relative">
            <span className="text-[9.5px] font-mono text-zinc-500 uppercase tracking-wider block font-bold flex justify-between">
              <span>Dynamic speech synthesizer:</span>
              <span className="text-[8.5px] text-zinc-500">({deviceVoices.length} voices)</span>
            </span>

            <button
              onClick={() => setShowVoicePicker(!showVoicePicker)}
              className="w-full bg-zinc-900/50 border border-zinc-900 text-stone-200 rounded-xl px-3 py-1.5 text-[10.5px] font-sans font-bold flex items-center justify-between cursor-pointer"
            >
              <span className="truncate max-w-[190px]">
                {deviceVoices.find(v => v.name === selectedVoiceName)?.name || 'Default Text System Voice'}
              </span>
              <ChevronDown size={12} className="text-zinc-500 shrink-0" />
            </button>

            {/* Dropdown list */}
            <AnimatePresence>
              {showVoicePicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 right-0 mb-2 max-h-40 overflow-y-auto bg-zinc-950 border border-zinc-900 rounded-2xl p-2 z-[60] scrollbar-thin shadow-2xl"
                >
                  {deviceVoices.length === 0 ? (
                    <div className="text-[10px] text-zinc-600 p-2 italic">Scanning system text-to-speech services...</div>
                  ) : (
                    deviceVoices.map((voice, idx) => {
                      const isSelected = selectedVoiceName === voice.name;
                      const isIndian = voice.lang.toLowerCase().includes('in');
                      return (
                        <button
                          key={`${voice.name}-${voice.lang}-${idx}`}
                          onClick={() => {
                            setSelectedVoiceName(voice.name);
                            setShowVoicePicker(false);
                            if (isPlaying) {
                              setTimeout(() => handlePlaySpeech(), 100);
                            }
                          }}
                          className={`w-full text-left px-2.5 py-1 rounded-lg text-[9.5px] font-mono flex items-center justify-between transition cursor-pointer ${
                            isSelected ? 'bg-zinc-900 text-red-500' : 'hover:bg-zinc-900/50 text-stone-400 hover:text-white'
                          }`}
                        >
                          <span className="truncate max-w-[170px]">
                            {isIndian ? '🇮🇳 ' : ''}{voice.name} <span className="text-[8px] text-zinc-600">({voice.lang})</span>
                          </span>
                          {isSelected && <Check size={10} className="text-red-500 shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Ambient Synthesizers Block D */}
        <div className="space-y-1.5 pt-1 border-t border-zinc-900/60 select-none">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">
              Procedural Ambient background synthesizer:
            </span>
            <span className="text-[8.5px] font-mono text-red-500 font-extrabold tracking-widest uppercase">
              100% FREE SYNTH
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'rain', active: ambientRain, label: '🌧️ Rain Storm', toggle: () => setAmbientRain(!ambientRain) },
              { id: 'piano', active: ambientPiano, label: '🎹 Cozy Piano', toggle: () => setAmbientPiano(!ambientPiano) },
              { id: 'lofi', active: ambientLofi, label: '🎧 Lofi Beat', toggle: () => setAmbientLofi(!ambientLofi) }
            ].map((amb) => (
              <button
                key={amb.id}
                onClick={amb.toggle}
                className={`py-1.5 rounded-lg text-[10px] font-extrabold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  amb.active
                    ? 'bg-zinc-900/50 text-stone-100 border-red-500/30'
                    : 'bg-zinc-950/20 text-zinc-500 border-zinc-900 hover:text-zinc-300'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${amb.active ? 'bg-red-500 animate-pulse' : 'bg-zinc-800'}`}></span>
                <span>{amb.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls Block E: Play Pause Stop */}
        <div className="flex items-center justify-between gap-4 pt-2">
          
          <div className="flex items-center gap-2">
            {isPlaying && !isPaused ? (
              <button
                onClick={handlePauseSpeech}
                className="w-12 h-12 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-stone-200 flex items-center justify-center cursor-pointer transition active:scale-95"
                title="Pause Speech Delivery"
              >
                <Pause size={18} />
              </button>
            ) : (
              <button
                onClick={handlePlaySpeech}
                className="w-28 h-12 rounded-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(239,68,68,0.25)] hover:shadow-[0_4px_22px_rgba(239,68,68,0.45)] cursor-pointer transition active:scale-95"
                title="Play Speech Delivery"
              >
                <Play size={14} fill="currentColor" />
                <span>Play Free</span>
              </button>
            )}

            <button
              onClick={stopSpeechService}
              className="w-12 h-12 rounded-full bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-500 hover:text-zinc-200 flex items-center justify-center cursor-pointer transition active:scale-95"
              title="Stop Audio Track"
            >
              <Square size={14} fill="currentColor" />
            </button>
          </div>

          <div className="text-[9.5px] font-mono text-zinc-500 italic text-right shrink-0">
            *Uses completely FREE local browser synth
          </div>

        </div>

      </div>
    </motion.div>
  );
}
