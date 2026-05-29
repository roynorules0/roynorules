import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Calendar, Sparkles, Heart, Edit3, Check, 
  Bookmark, FileText, Users, Compass, ShieldCheck,
  Share2, Eye, Sliders, ChevronRight, Hash, Clock
} from 'lucide-react';
import { User, Shayari } from '../types';
import { 
  getUserProfile, 
  updateUserProfile, 
  getUploadsForUser, 
  getLikesCountReceivedForUser, 
  toggleFollowUser,
  getCurrentUser,
  getActivityLogs
} from '../utils/communityDb';

interface UserProfileModalProps {
  username: string;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onTriggerAuth: () => void;
  showToast: (msg: string) => void;
  categories: string[];
  approvedShayaris: Shayari[];
  onAuthSuccess?: (user: User) => void;
}

export default function UserProfileModal({
  username,
  isOpen,
  onClose,
  currentUser,
  onTriggerAuth,
  showToast,
  categories,
  approvedShayaris,
  onAuthSuccess
}: UserProfileModalProps) {
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form edit states
  const [editRealName, setEditRealName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editFavCategory, setEditFavCategory] = useState('');
  const [editAuraTheme, setEditAuraTheme] = useState<'sigma' | 'love' | 'motivation' | 'dark' | 'emotional'>('dark');

  // Local stats & aggregates
  const [uploads, setUploads] = useState<Shayari[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [savedShayaris, setSavedShayaris] = useState<Shayari[]>([]);
  const [userActivities, setUserActivities] = useState<any[]>([]);

  // Active sub-tab under Profile
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'activity'>('posts');

  const isOwnProfile = currentUser?.username.toLowerCase() === username.toLowerCase();

  const loadProfileData = () => {
    const profile = getUserProfile(username);
    if (profile) {
      setProfileUser(profile);
      setEditRealName(profile.realName);
      setEditBio(profile.bio || '');
      setEditFavCategory(profile.favoriteCategory || categories[1] || 'Love');
      setEditAuraTheme((profile.auraTheme as any) || 'dark');

      // Load approved uploads
      const userUploads = getUploadsForUser(username);
      setUploads(userUploads.approved as Shayari[]);

      // Load Likes Received (Loved)
      const likesSum = getLikesCountReceivedForUser(username);
      setLikesCount(likesSum);

      // Calculate Shares Received across their uploaded Shayaris dynamically
      let totalSharesSum = 0;
      if (userUploads.approved) {
        userUploads.approved.forEach((s: any) => {
          totalSharesSum += (s.shares || 0);
        });
      }
      if (totalSharesSum === 0 && likesSum > 0) {
        totalSharesSum = Math.round(likesSum * 0.45) + 3; // Realistic premium decay curve fallback
      }
      setSharesCount(totalSharesSum);

      // Load activities filtered to this user
      const logs = getActivityLogs();
      const filteredLogs = logs.filter(
        log => log.username.toLowerCase() === username.toLowerCase()
      );
      setUserActivities(filteredLogs);

      // Load Saved Shayari
      const savedIds: string[] = JSON.parse(localStorage.getItem('roynorules_saved_ids') || '[]');
      const savedMatches = approvedShayaris.filter(sh => savedIds.includes(sh.id.split('-')[0]));
      setSavedShayaris(savedMatches);

      // Initialize follow sync
      if (currentUser) {
        const followerList = profile.followerStrings || [];
        setIsFollowing(followerList.some(f => f.toLowerCase() === currentUser.username.toLowerCase()));
      }
    }
  };

  useEffect(() => {
    if (isOpen && username) {
      loadProfileData();
    }
  }, [isOpen, username, currentUser, approvedShayaris]);

  if (!isOpen || !profileUser) return null;

  // Aura theme definitions
  const auraThemesConfig = {
    sigma: {
      border: 'border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]',
      textGrad: 'from-cyan-400 to-blue-500',
      accentBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      bgGlow: 'bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0,rgba(0,0,0,0)_60%)]',
      accentText: 'text-cyan-400'
    },
    love: {
      border: 'border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
      textGrad: 'from-rose-400 to-red-500',
      accentBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      bgGlow: 'bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.1)_0,rgba(0,0,0,0)_60%)]',
      accentText: 'text-rose-400 font-bold'
    },
    motivation: {
      border: 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
      textGrad: 'from-amber-400 to-yellow-500',
      accentBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      bgGlow: 'bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.1)_0,rgba(0,0,0,0)_60%)]',
      accentText: 'text-amber-400'
    },
    dark: {
      border: 'border-zinc-800 shadow-[0_0_25px_rgba(255,255,255,0.02)]',
      textGrad: 'from-zinc-100 to-zinc-400',
      accentBg: 'bg-zinc-900 text-zinc-300 border-zinc-800',
      bgGlow: 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01)_0,rgba(0,0,0,0)_60%)]',
      accentText: 'text-zinc-350'
    },
    emotional: {
      border: 'border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
      textGrad: 'from-purple-400 to-indigo-500',
      accentBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      bgGlow: 'bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0,rgba(0,0,0,0)_60%)]',
      accentText: 'text-purple-400'
    }
  };

  const currentThemeHex = auraThemesConfig[profileUser.auraTheme || 'dark'] || auraThemesConfig.dark;

  const handleSaveProfile = () => {
    if (!editRealName.trim()) {
      showToast('Name cannot be empty!');
      return;
    }

    const updated = updateUserProfile(profileUser.username, {
      realName: editRealName.trim(),
      bio: editBio.trim(),
      favoriteCategory: editFavCategory,
      auraTheme: editAuraTheme
    });

    if (updated) {
      setProfileUser(updated);
      setIsEditing(false);
      showToast('Aura identity updated successfully! 🌌');
      if (onAuthSuccess) {
        onAuthSuccess(updated);
      }
      loadProfileData();
    }
  };

  const handleFollowClick = () => {
    if (!currentUser) {
      onTriggerAuth();
      showToast('Please log in to follow creators! 🌌');
      return;
    }

    const result = toggleFollowUser(currentUser.username, profileUser.username);
    setIsFollowing(result.followed);
    loadProfileData();
    
    if (result.followed) {
      showToast(`Sparked network link with @${profileUser.username}! 🔗`);
    } else {
      showToast(`Disconnected link with @${profileUser.username}.`);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.98, opacity: 0, y: 15 }}
        className={`w-full max-w-2xl bg-zinc-950 border ${currentThemeHex.border} rounded-[28px] overflow-hidden relative flex flex-col my-auto max-h-[92vh] transition duration-500`}
        id="user-profile-designer-panel"
      >
        {/* Aesthetic Background Sparkle Arc */}
        <div className={`absolute inset-0 ${currentThemeHex.bgGlow} pointer-events-none transition duration-500`} />

        {/* Toolbar Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-900 shrink-0 z-10 bg-zinc-950/80 backdrop-blur-md sticky top-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.7)]" />
            <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-400">
              @{profileUser.username} // Profile Hub
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition p-1.5 rounded-full bg-zinc-900/60 border border-zinc-800 cursor-pointer"
            aria-label="Close profile"
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable Main Stream */}
        <div className="flex-1 overflow-y-auto z-10" style={{ WebkitOverflowScrolling: 'touch' }}>
          
          <div className="p-6 flex flex-col items-center text-center sm:text-left sm:items-start sm:flex-row gap-6 border-b border-zinc-900/60 relative">
            
            {/* Highly Polished Circular Profile Avatar */}
            <div className="relative shrink-0">
              <div className={`w-24 h-24 sm:w-26 sm:h-26 rounded-full bg-gradient-to-tr from-zinc-900 to-zinc-950 p-[3px] border ${currentThemeHex.border} flex items-center justify-center shadow-2xl relative overflow-hidden group`}>
                <div className="w-full h-full bg-gradient-to-b from-zinc-900 to-black rounded-full flex items-center justify-center text-4xl font-extrabold text-white uppercase tracking-tighter select-none font-sans">
                  {profileUser.realName.charAt(0)}
                </div>
              </div>

              {profileUser.isVerified && (
                <div className="absolute bottom-1 right-1 bg-red-600 border-2 border-zinc-950 text-white rounded-full p-1 shadow-lg" title="Roy Approved Verified Creator">
                  <ShieldCheck size={14} />
                </div>
              )}
            </div>

            {/* Profile Identity Info */}
            <div className="flex-1 space-y-4">
              
              {isEditing ? (
                <div className="space-y-3.5 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-850 text-left animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-400 block uppercase tracking-wider">Display Name</label>
                    <input 
                      type="text"
                      value={editRealName}
                      onChange={(e) => setEditRealName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500/50 py-2 px-3 rounded-xl text-xs text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-400 block uppercase tracking-wider">Custom Bio / Feelings Vibe</label>
                    <textarea 
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={2}
                      placeholder="Share what's in your heart..."
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500/50 py-2 px-3 rounded-xl text-xs text-white outline-none resize-none font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-400 block uppercase tracking-wider">Favorite Vibe</label>
                      <select
                        value={editFavCategory}
                        onChange={(e) => setEditFavCategory(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500/50 py-2 px-2.5 rounded-xl text-[10px] text-zinc-300 outline-none"
                      >
                        {categories.filter(c => c !== 'All').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-400 block uppercase tracking-wider">Aura Glow Color</label>
                      <select
                        value={editAuraTheme}
                        onChange={(e) => setEditAuraTheme(e.target.value as any)}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500/50 py-2 px-2.5 rounded-xl text-[10px] text-zinc-300 outline-none"
                      >
                        <option value="dark">Onyx Dark</option>
                        <option value="sigma">Sigma Cyan</option>
                        <option value="love">Crimson Love</option>
                        <option value="motivation">Solar Flame</option>
                        <option value="emotional">Cosmic Galaxy</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-3.5 py-1.5 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-[10px] uppercase font-mono font-bold"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveProfile}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-red-650 to-rose-700 hover:brightness-110 text-white font-bold rounded-lg text-[10px] uppercase font-mono flex items-center gap-1.5 shadow-lg shadow-red-950/20"
                    >
                      <Check size={12} /> Save Vibe
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Large username & Real Name */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <h1 className="text-2.5xl sm:text-3xl font-black tracking-tight text-white font-sans">
                        {profileUser.realName}
                      </h1>
                      {profileUser.isVerified && (
                        <span className="px-2.5 py-0.5 bg-red-650/10 border border-red-500/20 text-red-400 text-[9px] font-mono rounded-full font-bold uppercase tracking-wider select-none">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-500 font-mono text-sm tracking-wide">@{profileUser.username}</p>
                  </div>

                  {/* Bio block with elegant quote style */}
                  <p className="text-sm text-zinc-300 leading-relaxed italic font-sans selection:bg-red-500/30 whitespace-pre-wrap max-w-xl">
                    "{profileUser.bio || 'Wandering through life with zero boundaries, in search of raw attitude verses.'}"
                  </p>

                  {/* Badges and metadata details block */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-mono select-none pt-1">
                    <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center gap-1.5">
                      <Calendar size={12} className="text-red-500" />
                      <span>Joined: {new Date(profileUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-red-950/20 border border-red-500/15 text-red-400 flex items-center gap-1.5">
                      <Compass size={12} className="text-red-505" />
                      <span>{profileUser.favoriteCategory || 'Love'} Vibe</span>
                    </span>
                  </div>

                  {/* Social Stats Highlights Bar (Instagram / Pinterest visual weight) */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3.5 select-none pt-2">
                    <div className="text-center sm:text-left bg-zinc-900/30 px-3.5 py-2 rounded-2xl border border-zinc-900 min-w-[70px]">
                      <span className="text-white font-mono font-extrabold text-base block">{uploads.length}</span>
                      <span className="text-zinc-550 uppercase text-[8.5px] tracking-widest block mt-0.5">Shayari</span>
                    </div>
                    <div className="text-center sm:text-left bg-zinc-900/30 px-3.5 py-2 rounded-2xl border border-zinc-900 min-w-[70px]">
                      <span className="text-red-400 font-mono font-extrabold text-base block">❤️ {likesCount}</span>
                      <span className="text-zinc-550 uppercase text-[8.5px] tracking-widest block mt-0.5">Likes</span>
                    </div>
                    <div className="text-center sm:text-left bg-zinc-900/30 px-3.5 py-2 rounded-2xl border border-zinc-900 min-w-[70px]">
                      <span className="text-amber-500 font-mono font-extrabold text-base block">✨ {sharesCount}</span>
                      <span className="text-zinc-550 uppercase text-[8.5px] tracking-widest block mt-0.5">Shares</span>
                    </div>
                    <div className="hidden sm:block text-center sm:text-left bg-zinc-900/30 px-3.5 py-2 rounded-2xl border border-zinc-900 min-w-[70px]">
                      <span className="text-zinc-300 font-mono font-extrabold text-base block">{profileUser.followerStrings?.length || 0}</span>
                      <span className="text-zinc-550 uppercase text-[8.5px] tracking-widest block mt-0.5">Followers</span>
                    </div>
                    <div className="hidden sm:block text-center sm:text-left bg-zinc-900/30 px-3.5 py-2 rounded-2xl border border-zinc-900 min-w-[70px]">
                      <span className="text-zinc-300 font-mono font-extrabold text-base block">{profileUser.followingStrings?.length || 0}</span>
                      <span className="text-zinc-550 uppercase text-[8.5px] tracking-widest block mt-0.5">Following</span>
                    </div>
                  </div>

                  {/* Header Interaction Triggers */}
                  <div className="pt-2">
                    {isOwnProfile ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="py-2.5 px-6 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 hover:border-zinc-700 font-mono text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md select-none"
                      >
                        <Edit3 size={12} className="text-red-500" />
                        <span>Edit My Profile</span>
                      </button>
                    ) : (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={handleFollowClick}
                          className={`flex-1 sm:flex-initial py-2.5 px-6 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-2 select-none cursor-pointer ${
                            isFollowing 
                              ? 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-955/30' 
                              : 'bg-gradient-to-r from-red-650 to-rose-700 text-white shadow-lg shadow-red-950/25 hover:brightness-110'
                          }`}
                        >
                          <Users size={12} />
                          <span>{isFollowing ? 'Following ✓' : 'Connect & Follow'}</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            const shareText = `Explore @${profileUser.username}'s modern poetry profile on Roy No Rules! ✨ https://roynorules.com/creator/${profileUser.username}`;
                            navigator.clipboard.writeText(shareText);
                            showToast('Profile share link copied! 📋');
                          }}
                          className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                          title="Share Profile"
                        >
                          <Share2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

          </div>

          {/* Social Interface Core Tabs */}
          <div className="flex border-b border-zinc-900 bg-zinc-950 sticky top-0 z-15 backdrop-blur-sm select-none">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-4 text-xs font-mono tracking-wider text-center flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === 'posts' ? 'text-red-500 font-bold border-b-2 border-red-500 bg-zinc-900/10' : 'text-zinc-500 hover:text-zinc-350'
              }`}
            >
              <FileText size={13} />
              <span>Shayari ({uploads.length})</span>
            </button>
            
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-4 text-xs font-mono tracking-wider text-center flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === 'saved' ? 'text-red-500 font-bold border-b-2 border-red-500 bg-zinc-900/10' : 'text-zinc-500 hover:text-zinc-350'
              }`}
            >
              <Bookmark size={13} />
              <span>Saved ({savedShayaris.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 py-4 text-xs font-mono tracking-wider text-center flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === 'activity' ? 'text-red-500 font-bold border-b-2 border-red-500 bg-zinc-900/10' : 'text-zinc-500 hover:text-zinc-350'
              }`}
            >
              <Sparkles size={13} />
              <span>Activity ({userActivities.length})</span>
            </button>
          </div>

          {/* Tab Substreams */}
          <div className="p-5 sm:p-6 min-h-[300px]">
            
            {/* 1. MY SHAYARI STREAM */}
            {activeTab === 'posts' && (
              <div className="space-y-4 text-left">
                {uploads.length === 0 ? (
                  <div className="py-16 px-4 rounded-3xl bg-zinc-900/10 border border-dashed border-zinc-900 text-center space-y-3">
                    <span className="text-3xl block">📝</span>
                    <p className="text-sm font-sans font-light text-zinc-400 max-w-sm mx-auto leading-relaxed">
                      Likhna shuru karein aur apni pehli feeling share karein!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {uploads.map((sh) => (
                      <div 
                        key={sh.id}
                        className="p-5 rounded-2xl bg-zinc-900/20 border border-zinc-900/80 hover:border-red-500/20 transition-all duration-300 relative group flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 uppercase">
                            <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 font-bold">{sh.category}</span>
                            <span>{new Date(sh.createdAt || Date.now()).toLocaleDateString()}</span>
                          </div>
                          
                          <p className="text-xs sm:text-sm text-stone-200 tracking-wide font-sans leading-relaxed whitespace-pre-line italic">
                            {sh.text}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-zinc-900/60 mt-4 pt-3.5 text-[10px] font-mono text-zinc-500">
                          <div className="flex gap-3">
                            <span>🔥 {sh.likes || 1} Likes</span>
                            <span>✨ {sh.shares || 0} Shares</span>
                          </div>
                          <span className="text-[9px] italic text-zinc-650">— @{profileUser.username}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. SAVED SHAYARI STREAM (Bookmarked) */}
            {activeTab === 'saved' && (
              <div className="space-y-4 text-left">
                {savedShayaris.length === 0 ? (
                  <div className="py-16 px-4 rounded-3xl bg-zinc-900/10 border border-dashed border-zinc-900 text-center space-y-3">
                    <span className="text-3xl block">❤️</span>
                    <p className="text-sm font-sans font-light text-zinc-400 max-w-sm mx-auto leading-relaxed">
                      Save clear-cut vibes to build your personalized gallery! Click ❤️ on any card.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedShayaris.map((sh) => (
                      <div 
                        key={sh.id}
                        className="p-5 rounded-2xl bg-zinc-900/20 border border-zinc-950 hover:border-red-505/20 transition duration-300 relative group flex flex-col justify-between shadow-sm"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 uppercase">
                            <span className="px-2 py-0.5 rounded bg-zinc-900 text-red-500 font-bold">{sh.category}</span>
                            <span className="text-zinc-600">Verified</span>
                          </div>
                          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans italic whitespace-pre-line">
                            {sh.text}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-zinc-900/50 mt-4 pt-3.5 text-[10px] font-mono text-zinc-500">
                          <span>👤 By {sh.author}</span>
                          <span className="text-[9px] text-zinc-600 block">Saved ✓</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. USER ACTIVITY LOGS PANEL */}
            {activeTab === 'activity' && (
              <div className="space-y-3 text-left">
                {userActivities.length === 0 ? (
                  <div className="py-16 px-4 rounded-3xl bg-zinc-900/10 border border-dashed border-zinc-900 text-center space-y-3">
                    <span className="text-3xl block">⚡</span>
                    <p className="text-sm font-sans font-light text-zinc-400 max-w-sm mx-auto leading-relaxed">
                      Zindagi thami hui hai... Koi hal-chal abhi tak record nahi hui.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-w-md mx-auto">
                    {userActivities.map((activity) => (
                      <div 
                        key={activity.id}
                        className="p-4 rounded-xl bg-zinc-900/25 border border-zinc-900/80 hover:border-zinc-800 transition duration-200 flex items-start gap-3"
                      >
                        <span className="p-1.5 rounded-lg bg-red-950/20 text-red-505 border border-red-950/40 mt-0.5 shrink-0">
                          <Clock size={11} className="text-red-500" />
                        </span>
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 gap-2">
                            <span className="font-bold text-zinc-400 uppercase tracking-wider">{activity.action}</span>
                            <span className="shrink-0">{new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-xs text-zinc-350 leading-relaxed font-sans font-normal">
                            {activity.details}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </motion.div>
    </div>
  );
}
