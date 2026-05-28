import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Award, Palette, Settings, BarChart2, BookOpen, Heart, 
  RotateCw, RefreshCw, Sparkles, User, ShieldAlert 
} from 'lucide-react';
import TopUsersList from './TopUsersList';
import MoodSelector from './MoodSelector';
import PremiumAdContainer from './PremiumAdContainer';

interface MoreMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (username: string) => void;
  currentUser: any;
  onTriggerAuth: () => void;
  activityTrigger: number;
  selectedMoodId: string | null;
  onSelectMood: (moodId: string | null) => void;
  isAutoShuffleOn: boolean;
  setIsAutoShuffleOn: (val: boolean) => void;
  onResetDb: () => void;
  savedCount: number;
  showToast: (msg: string) => void;
  savedIds?: string[];
  approvedList?: any[];
  onToggleSaveShayari?: (id: string) => void;
  onNavigateTrust?: (path: string) => void;
}

export default function MoreMenuModal({
  isOpen,
  onClose,
  onSelectUser,
  currentUser,
  onTriggerAuth,
  activityTrigger,
  selectedMoodId,
  onSelectMood,
  isAutoShuffleOn,
  setIsAutoShuffleOn,
  onResetDb,
  savedCount,
  showToast,
  savedIds = [],
  approvedList = [],
  onToggleSaveShayari,
  onNavigateTrust,
}: MoreMenuModalProps) {
  const [activeTab, setActiveTab] = useState<'hall_of_fame' | 'themes' | 'saved_collections' | 'user_stats' | 'settings' | 'about'>('hall_of_fame');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-4xl bg-zinc-950/95 border border-zinc-805 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col md:flex-row h-[85vh] md:h-[650px] z-10"
      >
        {/* Glow neon accents */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-600/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-rose-600/5 blur-[80px] rounded-full pointer-events-none" />

        {/* --- LEFT NAVIGATION PANEL --- */}
        <div className="w-full md:w-[250px] bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-900/80 p-5 flex flex-col justify-between shrink-0 select-none relative z-10">
          <div>
            <div className="flex items-center justify-between md:mb-6">
              <div className="flex items-center gap-1.5 text-left">
                <Sparkles className="text-red-500 animate-pulse size-3.5" />
                <span className="text-[10px] font-mono tracking-[0.2em] font-black uppercase text-zinc-400">
                  Roy's Matrix
                </span>
              </div>
              <button
                onClick={onClose}
                className="md:hidden p-1.5 rounded-lg bg-zinc-900/60 text-zinc-400 hover:text-white transition"
              >
                <X size={14} />
              </button>
            </div>

            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 no-scrollbar">
              {/* Tab 1: Hall of fame */}
              <button
                onClick={() => setActiveTab('hall_of_fame')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all text-left ${
                  activeTab === 'hall_of_fame'
                    ? 'bg-red-950/20 border border-red-500/35 text-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.08)]'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Award size={14} />
                <span>Hall Of Fame</span>
              </button>

              {/* Tab 2: Themes */}
              <button
                onClick={() => setActiveTab('themes')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all text-left ${
                  activeTab === 'themes'
                    ? 'bg-red-950/20 border border-red-500/35 text-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.08)]'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Palette size={14} />
                <span>Themes & Auras</span>
              </button>

               {/* Tab 3: Saved Collections */}
              <button
                onClick={() => setActiveTab('saved_collections')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all text-left ${
                  activeTab === 'saved_collections'
                    ? 'bg-red-950/20 border border-red-500/35 text-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.08)]'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Heart size={14} className={savedCount > 0 ? "text-red-500 animate-pulse fill-red-500/20" : ""} />
                <span>Saved Collections ({savedCount})</span>
              </button>

              {/* Tab 4: User stats */}
              <button
                onClick={() => setActiveTab('user_stats')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all text-left ${
                  activeTab === 'user_stats'
                    ? 'bg-red-950/20 border border-red-500/35 text-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.08)]'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <BarChart2 size={14} />
                <span>Your Core Stats</span>
              </button>

              {/* Tab 5: Settings */}
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all text-left ${
                  activeTab === 'settings'
                    ? 'bg-red-950/20 border border-red-500/35 text-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.08)]'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Settings size={14} />
                <span>Settings</span>
              </button>

              {/* Tab 6: About */}
              <button
                onClick={() => setActiveTab('about')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all text-left ${
                  activeTab === 'about'
                    ? 'bg-red-950/20 border border-red-500/35 text-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.08)]'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <BookOpen size={14} />
                <span>Backstory</span>
              </button>

              {/* Desktop separator and title header */}
              <div className="hidden md:block my-2 border-t border-zinc-900/50" />
              <div className="hidden md:block px-3 py-1 select-none">
                <span className="text-[9px] font-mono text-zinc-600 tracking-[0.14em] uppercase font-semibold">
                  Trust & Support
                </span>
              </div>

              {[
                { path: '/about-us', label: 'About Us', icon: '📖' },
                { path: '/privacy-policy', label: 'Privacy Policy', icon: '🔒' },
                { path: '/terms-and-conditions', label: 'Terms & Conditions', icon: '⚖️' },
                { path: '/disclaimer', label: 'Disclaimer', icon: '📢' },
                { path: '/contact-us', label: 'Contact Us', icon: '📞' }
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    if (onNavigateTrust) {
                      onNavigateTrust(item.path);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold text-zinc-500 hover:text-red-405 hover:bg-zinc-900/20 transition-all text-left whitespace-nowrap cursor-pointer shrink-0"
                >
                  <span className="text-zinc-500 text-xs">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="hidden md:block pt-4 border-t border-zinc-900/50 space-y-3.5">
            <PremiumAdContainer placement="sidebarAd" />
            <span className="text-[9px] font-mono text-zinc-650 leading-normal block">
              Roy No Rules Portal<br/>v3.2.0 Cinematic Edition
            </span>
          </div>
        </div>

        {/* --- RIGHT CONTENT SPACE --- */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden relative z-10 bg-zinc-950/30">
          
          {/* Header */}
          <div className="p-6 border-b border-zinc-900/60 flex items-center justify-between shrink-0 select-none">
            <div className="text-left">
              <h4 className="text-sm font-black font-sans tracking-wide text-white uppercase">
                {activeTab === 'hall_of_fame' && '🏆 Resident Legend Hall of Fame'}
                {activeTab === 'themes' && '🎨 Mood Vibe & Aura Customizer'}
                {activeTab === 'saved_collections' && '❤️ Saved Shayari Collections Vault'}
                {activeTab === 'user_stats' && '📊 Your Personal Soul Signature'}
                {activeTab === 'settings' && '🔧 System Mechanics Settings'}
                {activeTab === 'about' && '📖 Story of "Roy No Rules..."'}
              </h4>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                {activeTab === 'hall_of_fame' && 'Aura leaderboard determined by uploads, likes received, and interactions'}
                {activeTab === 'themes' && 'Calibrate your background color gradient and floating interactive particles pool'}
                {activeTab === 'saved_collections' && 'Review your secure bookmarked files or unsave any card instantly'}
                {activeTab === 'user_stats' && 'Synchronize your offline-first achievements list & user level status'}
                {activeTab === 'settings' && 'Manage autoplay shufflers or reinitialize factory standard states'}
                {activeTab === 'about' && 'The rebellion behind capture, soundscapes, romance and isolation'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white transition duration-200 cursor-pointer hover:border-zinc-700 hidden md:block"
            >
              <X size={15} />
            </button>
          </div>

          {/* Core scrollable space */}
          <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
            
            {/* 1. HALL OF FAME TAB */}
            {activeTab === 'hall_of_fame' && (
              <div className="space-y-4 animate-fade-in text-left">
                <TopUsersList
                  onSelectUser={(uname) => {
                    onSelectUser(uname);
                    onClose();
                  }}
                  activityTrigger={activityTrigger}
                />
              </div>
            )}

            {/* 2. THEMES CUSTOMIZER */}
            {activeTab === 'themes' && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="bg-zinc-900/30 border border-zinc-900 p-4.5 rounded-2xl">
                  <span className="text-[10px] font-mono text-red-500 font-bold uppercase tracking-widest block mb-1">
                    ACTIVE ATMOSPHERE CALIBRATOR
                  </span>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    Select any of the emotional states below to completely restyle the background gradients, custom gravity vectors, soundscapes, and floating particles of your current view.
                  </p>
                  
                  <MoodSelector
                    selectedMoodId={selectedMoodId}
                    onSelectMood={(moodId) => {
                      onSelectMood(moodId);
                      showToast(`Vibe recalibrated to: ${moodId ? moodId.toUpperCase() : 'DEFAULT'} ⚡`);
                    }}
                  />
                </div>

                {currentUser && (
                  <div className="bg-zinc-900/30 border border-zinc-900 p-4.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-left">
                      <h5 className="text-xs font-mono font-bold text-white uppercase">Profile Aura Matching</h5>
                      <span className="text-[11px] text-zinc-500 mt-0.5 block">Your custom theme preference is bound directly to your identity.</span>
                    </div>
                    <button
                      onClick={() => {
                        showToast('Profile Aura theme auto-synced! 🌟');
                      }}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 font-bold rounded-xl text-xs tracking-wide transition active:scale-95 cursor-pointer"
                    >
                      Override Save
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 3. SAVED COLLECTIONS */}
            {activeTab === 'saved_collections' && (
              <div className="space-y-4 animate-fade-in text-left">
                {savedIds.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-zinc-900 rounded-3xl p-6 bg-zinc-950/20">
                    <span className="text-2xl block mb-2">❤️</span>
                    <h5 className="text-sm font-bold text-zinc-300">Your Vault is Empty</h5>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto leading-relaxed">
                      Double-tap any poetry card in the home feed or click the Save icon to sync them inside your custom collections vault.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
                    {approvedList
                      .filter((s: any) => savedIds.includes(s.id.split('-')[0]))
                      .map((shayari: any) => (
                        <div 
                          key={shayari.id}
                          className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl space-y-3 hover:border-zinc-850 transition duration-300 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                            <span className="uppercase tracking-widest text-red-500 bg-red-950/15 px-2 py-0.5 rounded border border-red-950/30">
                              {shayari.category}
                            </span>
                            <span>— {shayari.author}</span>
                          </div>
                          
                          <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-line">
                            "{shayari.text}"
                          </p>

                          <div className="flex items-center justify-end gap-2 text-right pt-2 border-t border-zinc-950">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(shayari.text);
                                showToast('Copied to clipboard 📋');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-900 text-[10.5px] font-mono text-zinc-400 hover:text-white border border-zinc-900 transition cursor-pointer"
                            >
                              Copy
                            </button>
                            <button
                              onClick={() => {
                                if (onToggleSaveShayari) {
                                  onToggleSaveShayari(shayari.id);
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-red-950/20 text-[10.5px] font-mono text-red-400 hover:text-red-500 border border-zinc-900 hover:border-red-900/30 transition cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. YOUR CORE STATS */}
            {activeTab === 'user_stats' && (
              <div className="space-y-5 animate-fade-in text-left">
                {currentUser ? (
                  <div className="space-y-4">
                    <div className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 p-[1px] flex items-center justify-center font-black text-lg text-white select-none">
                        <div className="w-full h-full bg-zinc-950 rounded flex items-center justify-center uppercase">
                          {currentUser.realName.charAt(0)}
                        </div>
                      </div>

                      <div className="text-left">
                        <h4 className="text-sm font-black text-white leading-snug">
                          {currentUser.realName}
                        </h4>
                        <span className="text-xs font-mono text-zinc-500">
                          @{currentUser.username} • {currentUser.email}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-zinc-900/20 border border-zinc-900 p-4 rounded-xl text-left">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Favorites Folder</span>
                        <span className="text-xl font-black text-white mt-1.5 block">{savedCount}</span>
                        <span className="text-[9px] font-mono text-zinc-650 uppercase mt-0.5 block">Saved Cards</span>
                      </div>

                      <div className="bg-zinc-900/20 border border-zinc-900 p-4 rounded-xl text-left">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Resident Rank Badge</span>
                        <span className="text-xs font-extrabold text-red-500 mt-1.5 block uppercase truncate">
                          {currentUser.badge || 'Elite Resident ✨'}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-650 uppercase mt-1 block">Active Status</span>
                      </div>

                      <div className="bg-zinc-900/20 border border-zinc-900 p-4 rounded-xl col-span-2 md:col-span-1 text-left">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Security Standard</span>
                        <span className="text-xs font-mono text-emerald-500 mt-2 block font-bold leading-none">
                          SHA-256 SECURE
                        </span>
                        <span className="text-[9px] font-mono text-zinc-650 uppercase mt-2 block">Cryptographic</span>
                      </div>
                    </div>

                    <div className="bg-yellow-950/15 border border-yellow-800/10 p-4 rounded-xl flex items-start gap-2.5">
                      <ShieldAlert className="text-yellow-500 size-4 shrink-0 mt-0.5" />
                      <div className="text-left text-[11px] leading-relaxed text-zinc-400">
                        🔒 <span className="text-white font-bold">Privacy Matrix Pledge:</span> Your passcode matches cryptographic keys held in offline secure hashing inside your resident profile database. Admins can never review, read, or print your passcode fields.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-4">
                    <div className="text-3xl">👤</div>
                    <div className="space-y-1.5 max-w-sm mx-auto">
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">Soul Signature Offline</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        To synchronise custom saved folders, submit entries for admin consideration, and participate in leaderboard scores, please join the community.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onTriggerAuth();
                        onClose();
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold text-xs font-sans tracking-wide rounded-xl transition duration-300 active:scale-95 cursor-pointer hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    >
                      Authenticate Soul Profile
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 4. SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-5 animate-fade-in text-left">
                
                {/* Auto Shuffle Mode Switch */}
                <div className="bg-zinc-900/40 border border-zinc-900 p-4.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-left space-y-0.5">
                    <h5 className="text-xs font-bold text-white uppercase font-sans">Automatic Shuffle Mode (15s)</h5>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Main feed will automatically rotate out unread cards with random approved choices after 15 seconds.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      const updated = !isAutoShuffleOn;
                      setIsAutoShuffleOn(updated);
                      showToast(updated ? 'Auto Shuffle System: ENGAGED (15s) 🔄' : 'Auto Shuffle System: HALTED ⏹️');
                    }}
                    className={`px-4 py-2 font-mono text-xs font-black rounded-lg transition-all duration-300 cursor-pointer border ${
                      isAutoShuffleOn
                        ? 'bg-red-950/20 border-red-500 text-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)] animate-pulse'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    STATUS: {isAutoShuffleOn ? 'ACTIVE' : 'OFF'}
                  </button>
                </div>

                {/* Reset system state button */}
                <div className="bg-zinc-900/40 border border-zinc-910 p-4.5 rounded-2xl">
                  <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest block mb-1">
                    FACTORY DIAGNOSTICS DEFAULTS
                  </span>
                  <h5 className="text-xs font-bold text-zinc-200 uppercase font-sans">Clear Persistent Storage Cache</h5>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mt-1">
                    Resets all local submissions, deletes active favorite vaults on your current device, and restarts the default poetry registry index. This action is fast and irreversible!
                  </p>

                  <button
                    onClick={() => {
                      if (confirm('Are you absolutely certain you want to reset all persistent states back to factory standard? This empties your offline Favorites vault and clears custom categories.')) {
                        onResetDb();
                        onClose();
                      }
                    }}
                    className="mt-4 px-4 py-2 bg-zinc-950 hover:bg-red-950/20 border border-zinc-900 hover:border-red-900/50 text-zinc-400 hover:text-red-400 font-mono text-[10px] uppercase font-bold rounded-xl transition duration-300"
                  >
                    Force Factory Reset Database 🔄
                  </button>
                </div>

              </div>
            )}

            {/* 5. POETIC ABOUT STORY */}
            {activeTab === 'about' && (
              <div className="space-y-4 text-left animate-fade-in font-sans leading-relaxed text-zinc-400 text-xs">
                <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 blur-xl pointer-events-none rounded-full" />
                  
                  <span className="text-[20px] mb-2 block">🎬</span>
                  <p className="first-letter:text-3xl first-letter:font-black first-letter:text-red-500 leading-relaxed pr-2 select-text">
                    This portal exists at the interaction of cinematic visuals, isolated emotional states, and raw human expression. Named inspired by complete freedom (<span className="text-zinc-200">"Roy No Rules..."</span>), the community rejects default visual standards. We celebrate midnight thoughts, romantic dreams, unbreakable attitudes, and heavy motivation.
                  </p>

                  <p className="mt-4 leading-relaxed pr-2 select-text">
                    There is an authentic Hindi and Hinglish cadence to every card. By pairing high-contrast typography, customizable physical particle grids, synthesized ambient reading voices, and custom HD status generation tools, your phone captures a mood that public comments often distract from. Keep scrolling, find what speaks directly to your soul, and save it in your vault.
                  </p>

                  <div className="mt-5 pt-4 border-t border-zinc-900/50 flex flex-wrap gap-4 text-[10px] text-zinc-550 font-mono">
                    <span>🎬 CINEMATIC CORE</span>
                    <span>🎨 EMBODIED GRAPHICS</span>
                    <span>🌌 REAL IDENTITY INTEGRATED</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer inside Content Space */}
          <div className="p-4 border-t border-zinc-900/40 bg-zinc-950 px-6 flex items-center justify-between shrink-0 select-none text-[9.5px] font-mono text-zinc-600">
            <span>STRICT PRIVACY PROTOCOLS INSTALLED</span>
            <span>PRESIDENT PORTAL</span>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
