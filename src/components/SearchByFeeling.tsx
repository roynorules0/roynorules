import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, TrendingUp, X, Smile, Flame, Shield, Heart, HelpCircle, Zap, Skull, Compass, Mic, MicOff } from 'lucide-react';
import { Shayari } from '../types';

interface SearchByFeelingProps {
  approvedList: Shayari[];
  onSearchResults: (query: string, results: Shayari[] | null) => void;
  showToast: (msg: string) => void;
  onSelectMood: (moodId: string | null) => void;
}

// Synonyms mapping for concept search matching (smart related keywords)
const FEELING_ALIASES: Record<string, { synonyms: string[]; relatedMoods: string[]; mockSuggestions: string[] }> = {
  breakup: {
    synonyms: ['breakup', 'dhoke', 'dhoke/dhoka', 'dhoka', 'tute', 'dil', 'roota', 'alone', 'tanha', 'sad', 'broken', 'yaar', 'dost'],
    relatedMoods: ['Breakup', 'Sad', 'Lonely'],
    mockSuggestions: ['deep breakup healing', 'dil tutna', 'dhokebaaz dosti', 'sad alone hours']
  },
  dhokha: {
    synonyms: ['dhoke', 'dhoke/dhoka', 'dhoka', 'dhokha', 'dosti', 'tute', 'farq', 'badal', 'sangeen', 'dost', 'yaar'],
    relatedMoods: ['Breakup', 'Sad'],
    mockSuggestions: ['dost ka dhokha', 'broken faith', 'unfaithful partner', 'badalna']
  },
  'fake friends': {
    synonyms: ['dhoke', 'dost', 'yaar', 'dosti', 'badal', 'sangeen', 'fake', 'matlabi', 'asli', 'dushman'],
    relatedMoods: ['Sad', 'Lonely', 'Attitude'],
    mockSuggestions: ['matlabi dosti shayari', 'fake people attitude', 'two faced friends']
  },
  fake: {
    synonyms: ['dhoke', 'dost', 'yaar', 'dosti', 'badal', 'sangeen', 'fake', 'matlabi'],
    relatedMoods: ['Sad', 'Lonely'],
    mockSuggestions: ['fake expectations', 'matlabi dunya', 'fake promises']
  },
  lonely: {
    synonyms: ['khamoshi', 'shor', 'raat', 'lonely', 'alone', 'gam', 'tanha', 'sad', 'tute', 'safar'],
    relatedMoods: ['Lonely', 'Sad'],
    mockSuggestions: ['lonely midnight vibes', 'tanha safar lines', 'silent loneliness']
  },
  alone: {
    synonyms: ['khamoshi', 'shor', 'raat', 'lonely', 'alone', 'gam', 'tanha', 'sad', 'tute'],
    relatedMoods: ['Lonely', 'Sad'],
    mockSuggestions: ['feeling alone', 'raat ki khamoshi', 'lonely heart']
  },
  gym: {
    synonyms: ['motivation', 'hausla', 'jeet', 'kar', 'unstop', 'unstoppable', 'rules', 'hard', 'ziddi', 'fight', 'fire', 'focus', 'kamyabi'],
    relatedMoods: ['Motivation', 'Sigma'],
    mockSuggestions: ['gym sigma motivation', 'ziddi status for victory', 'unstoppable burning raw fire']
  },
  success: {
    synonyms: ['success', 'kamyabi', 'jeet', 'kamyaabi', 'raaste', 'ziddi', 'dream', 'sapno', 'shor', 'kar', 'safar'],
    relatedMoods: ['Motivation', 'Sigma', 'Happy'],
    mockSuggestions: ['success mindset goals', 'kamyabi shor machayegi', 'unstoppable achievement quotes']
  },
  attitude: {
    synonyms: ['attitude', 'royal', 'rules', 'badshah', 'baap', 'khud', 'naam', 'sigma', 'akadh', 'mizaji'],
    relatedMoods: ['Attitude', 'Sigma'],
    mockSuggestions: ['badshah attitude lines', 'roy no rules vibe', 'sigma male mindset']
  },
  sigma: {
    synonyms: ['attitude', 'royal', 'rules', 'badshah', 'baap', 'khud', 'naam', 'sigma', 'akadh', 'unstop', 'focus'],
    relatedMoods: ['Sigma', 'Attitude'],
    mockSuggestions: ['sigma single player rules', 'no validation aura', 'king status']
  },
  maa: {
    synonyms: ['maa', 'mother', 'jannat', 'pyar', 'love', 'emotional', 'khuda', 'zindagi'],
    relatedMoods: ['Love', 'Emotional'],
    mockSuggestions: ['maa jannat blessings', 'emotional mother respect', 'unconditional love']
  },
  mother: {
    synonyms: ['maa', 'mother', 'jannat', 'pyar', 'love', 'emotional', 'khuda'],
    relatedMoods: ['Love', 'Emotional'],
    mockSuggestions: ['mother emotional shayari', 'unconditional mother love']
  },
  pain: {
    synonyms: ['sad', 'emotional', 'gam', 'dard', 'roota', 'tute', 'khamoshi', 'hath', 'farq'],
    relatedMoods: ['Sad', 'Emotional', 'Lonely'],
    mockSuggestions: ['deep emotional pain', 'dil ka dard status', 'healing from pain']
  },
  sad: {
    // Requirements #7: If user searches "sad", Mix: emotional shayari, healing quotes, motivation recovery lines
    synonyms: ['sad', 'emotional', 'gam', 'dard', 'roota', 'tute', 'khamoshi', 'healing', 'motivation', 'hausla', 'safar', 'zindagi'],
    relatedMoods: ['Sad', 'Emotional', 'Motivation'],
    mockSuggestions: ['sad inner crying lines', 'healing from broken vibes', 'motivation recovery lines']
  },
  trust: {
    synonyms: ['trust', 'dhoke', 'yaar', 'dosti', 'dil', 'broken', 'tute', 'faith', 'vishwas'],
    relatedMoods: ['Sad', 'Lonely', 'Breakup'],
    mockSuggestions: ['broken trust hurts', 'dhokebaaz trust shayari', 'blind trust limits']
  },
  love: {
    synonyms: ['प्यार', 'dil', 'yaad', 'love', 'mohabbat', 'ishq', 'sukoon', 'dilon', 'bahaar', 'pyaar', 'aashiq', 'sadgi'],
    relatedMoods: ['Love', 'Happy'],
    mockSuggestions: ['romantic love vibes', 'deep emotional love', 'pehli nazar mohabbat']
  },
  betrayal: {
    synonyms: ['dhoke', 'dhoke/dhoka', 'dhoka', 'dhokha', 'broken', 'tute', 'fake', 'yaar', 'dost', 'faithless'],
    relatedMoods: ['Breakup', 'Sad'],
    mockSuggestions: ['broken friendship betrayal', 'dhokhebaaz relationship', 'unfaithful trust status']
  },
  ignore: {
    synonyms: ['ignore', 'khamoshi', 'tanha', 'alone', 'lonely', 'farq', 'ignore me', 'ignore status', 'unsaid', 'silent', 'pain'],
    relatedMoods: ['Breakup', 'Sad', 'Lonely'],
    mockSuggestions: ['silent ignore hurt', 'attitudes to ignore haters', 'ignored feelings status']
  }
};

const ANIMATED_PLACEHOLDERS = [
  "Feeling lonely tonight? Try 'alone'...",
  "Need gym energy to crush limits? Try 'gym'...",
  "Suffering from a broken heart? Try 'breakup'...",
  "Want sigma rules of life? Try 'sigma'...",
  "Lost faith in people? Try 'fake friends'...",
  "Looking for epic attitude? Try 'attitude'...",
  "Thinking about mother's love? Try 'maa'...",
  "In deep emotional pain? Try 'sad'..."
];

export default function SearchByFeeling({ approvedList, onSearchResults, showToast, onSelectMood }: SearchByFeelingProps) {
  const [query, setQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const isSpeechSupported = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  const startVoiceSearch = () => {
    if (!isSpeechSupported) {
      showToast('Voice Search (Bol kar search) is not supported in this browser. Try Chrome! 🎙️');
      return;
    }
    const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechClass();
    recognition.lang = 'hi-IN'; // Hindi/Hinglish language standard
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListeningVoice(true);
      showToast('🎤 "Bol Kar Search Karo" mode activated... Bolna shuru karein!');
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setQuery(text);
      handleSearchLogic(text);
      showToast(`Vocal Mood Detected: "${text}" ✨`);
    };

    recognition.onerror = () => {
      setIsListeningVoice(false);
      showToast('Could not capture voice clearly. Try again! 🎙️');
    };

    recognition.onend = () => {
      setIsListeningVoice(false);
    };

    recognition.start();
  };

  // Animated placeholder routine loop
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % ANIMATED_PLACEHOLDERS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Sync results when query alters
  useEffect(() => {
    handleSearchLogic(query);
  }, [query, approvedList]);

  // Click outside to hide suggestions box helper safely
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchLogic = (searchStr: string) => {
    const trimmed = searchStr.trim().toLowerCase();
    
    // Auto populate autocomplete suggestions dynamic listing
    if (trimmed.length > 0) {
      const matchedSuggestionsSet = new Set<string>();
      
      // Match keywords in aliases mapping keys or list items
      Object.keys(FEELING_ALIASES).forEach((key) => {
        if (key.includes(trimmed) || trimmed.includes(key)) {
          FEELING_ALIASES[key].mockSuggestions.forEach((sug) => matchedSuggestionsSet.add(sug));
        }
      });

      // Also append literal prefix/suffix matches
      if (trimmed.startsWith('lo')) {
        matchedSuggestionsSet.add('love');
        matchedSuggestionsSet.add('lonely');
        matchedSuggestionsSet.add('lost feelings');
      }

      setSuggestions(Array.from(matchedSuggestionsSet).slice(0, 5));
    } else {
      setSuggestions([]);
    }

    if (!trimmed) {
      onSearchResults('', null);
      return;
    }

    // Advanced search matching query!
    // Let's see if query maps to some defined premium emotional structures in FEELING_ALIASES definition:
    let matchedAliasesKeywords: string[] = [];
    let matchedRelatedMoods: string[] = [];

    Object.entries(FEELING_ALIASES).forEach(([key, meta]) => {
      // If user typing is subset or closely overlaps
      if (trimmed.includes(key) || key.includes(trimmed)) {
        matchedAliasesKeywords = [...matchedAliasesKeywords, ...meta.synonyms];
        matchedRelatedMoods = [...matchedRelatedMoods, ...meta.relatedMoods];
      }
    });

    const isSadSearch = trimmed === 'sad' || trimmed.includes('dard') || trimmed.includes('gam');

    // Filter list
    const filtered = approvedList.filter((sh) => {
      const bodyText = sh.text.toLowerCase();
      const cat = sh.category.toLowerCase();
      
      // Strict exact phrase match
      const containsDirectWord = bodyText.includes(trimmed) || cat.includes(trimmed);
      if (containsDirectWord) return true;

      // Match alias keywords
      const containsAliasKeywords = matchedAliasesKeywords.some((kw) => {
        return bodyText.includes(kw) || cat.includes(kw);
      });

      if (containsAliasKeywords) return true;

      // Special mixing logic for #7: "sad" query mixes emotional, healing and motivational recovery lines
      if (isSadSearch) {
        // Match healing, motivation recovery category
        const isHealingOrRecovery = 
          bodyText.includes('hausla') || 
          bodyText.includes('h हौसले') || 
          bodyText.includes('मंज़िल') ||
          bodyText.includes('khamoshi') ||
          sh.category === 'Motivation' || 
          sh.category === 'Life';

        return isHealingOrRecovery;
      }

      return false;
    });

    onSearchResults(searchStr, filtered);
  };

  const handleTrendingClick = (term: string) => {
    setQuery(term);
    setShowSuggestions(false);
    showToast(`Filtering by Trending Emotion: "${term}" 🔥`);

    // Optionally switch mood space to provide gorgeous complementary backdrop
    const matchAlias = FEELING_ALIASES[term.toLowerCase()];
    if (matchAlias && matchAlias.relatedMoods.length > 0) {
      onSelectMood(matchAlias.relatedMoods[0]);
    }
  };

  const handleSuggestionSelect = (sug: string) => {
    // If the suggestion is a formatted phrase, we can clean it to feed simple keywords or set the full query
    setQuery(sug);
    setShowSuggestions(false);
    showToast(`Emotional Search: "${sug}" 👀`);
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    onSearchResults('', null);
    showToast('Search filters cleared');
  };

  return (
    <div className="w-full relative py-2" ref={wrapperRef} id="feeling-search-container">
      {/* Dynamic backdrop emotional aura based on search contents */}
      <div className={`absolute -inset-2 bg-gradient-to-r ${
        query ? 'from-rose-500/10 via-red-500/5 to-cyan-500/10' : 'from-transparent via-transparent'
      } rounded-3xl blur-2xl transition-all duration-1000 opacity-60 pointer-events-none`} />

      <div className="relative max-w-2xl mx-auto">
        {/* Input wrapping glow shield */}
        <div className="relative group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-red-650 via-pink-650 to-rose-600 rounded-3xl blur opacity-20 group-hover:opacity-35 transition duration-500 animate-pulse" />
          
          <div className="relative bg-zinc-950/75 backdrop-blur-md border border-red-550/35 rounded-2xl flex items-center gap-3.5 px-5 py-4.5 shadow-[0_4px_16px_rgba(239,68,68,0.08)] transition duration-300 focus-within:border-red-500/80 focus-within:shadow-[0_0_25px_rgba(244,63,94,0.15)]">
            <Search className={`size-5 transition duration-300 ${query ? 'text-red-500 scale-110 drop-shadow-[0_0_12px_rgba(239,68,68,0.65)]' : 'text-zinc-500'}`} />
            
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-transparent text-zinc-50 text-sm font-sans focus:outline-none placeholder-transition font-medium tracking-wide prose-invert"
              placeholder={ANIMATED_PLACEHOLDERS[placeholderIndex]}
              id="feeling-search-input"
            />

            {/* Voice Search Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                startVoiceSearch();
              }}
              className={`p-1.5 rounded-lg border transition duration-200 cursor-pointer flex items-center justify-center shrink-0 ${
                isListeningVoice 
                  ? 'bg-red-500/25 border-red-500 text-red-500 animate-pulse scale-110' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
              title="Bol Kar Search Karo (Voice Search)"
            >
              {isListeningVoice ? <MicOff size={14} className="stroke-[2.5]" /> : <Mic size={14} className="stroke-[2.5]" />}
            </button>

            {/* Clear Button */}
            {query && (
              <button
                onClick={clearSearch}
                className="p-1 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Real-time Dynamic Suggester Box */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute left-0 right-0 mt-2 bg-zinc-950/98 border border-zinc-900/90 rounded-2xl p-2 z-50 shadow-lg backdrop-blur-md text-left"
              >
                <div className="px-2.5 py-1.5 border-b border-zinc-900/60 mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-black">
                    💡 MATCHED EMOTIONAL VIBES:
                  </span>
                  <span className="text-[9.5px] font-mono text-red-500/80 animate-pulse font-bold">
                    CYBER SUGGESTIONS ACTIVE
                  </span>
                </div>

                <div className="space-y-0.5">
                  {suggestions.map((sug) => (
                    <button
                      key={sug}
                      onClick={() => handleSuggestionSelect(sug)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-sans text-stone-300 hover:bg-zinc-900/40 hover:text-red-500 border border-transparent hover:border-red-500/10 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Compass className="size-3.5 text-zinc-600 shrink-0" />
                      <span className="font-semibold">{sug}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
