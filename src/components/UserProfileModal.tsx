import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Calendar, Award, Sparkles, Heart, Zap, Edit3, Check, 
  Flame, MessageSquare, Bookmark, FileText, Users, Compass, ShieldCheck,
  Coins, TrendingUp, Share2, Eye, DollarSign, BarChart2, Lock
} from 'lucide-react';
import { User, Shayari } from '../types';
import PremiumAdContainer from './PremiumAdContainer';
import { 
  getUserProfile, 
  updateUserProfile, 
  getUploadsForUser, 
  getLikesCountReceivedForUser, 
  getDynamicBadges, 
  toggleFollowUser,
  getCurrentUser,
  calculateRoyCoinsForUser
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
  onAuthSuccess?: (user: User) => void; // Sync session upon edit
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

  // Unlocked premium power-ups via Roy Coins
  const [unlockedItems, setUnlockedItems] = useState<string[]>(() => {
    const stored = localStorage.getItem(`roynorules_unlocked_${username.toLowerCase()}`);
    return stored ? JSON.parse(stored) : [];
  });

  // Stats
  const [uploads, setUploads] = useState<{ approved: Shayari[]; pending: Shayari[] }>({ approved: [], pending: [] });
  const [likesCount, setLikesCount] = useState(0);
  const [badgesList, setBadgesList] = useState<string[]>([]);
  const [communityRank, setCommunityRank] = useState(1);
  const [isFollowing, setIsFollowing] = useState(false);
  const [savedShayaris, setSavedShayaris] = useState<Shayari[]>([]);

  // Active sub-tab under activity section
  const [activeTab, setActiveTab] = useState<'uploads' | 'saved' | 'monetization'>('uploads');

  const isOwnProfile = currentUser?.username.toLowerCase() === username.toLowerCase();

  const loadProfileData = () => {
    const profile = getUserProfile(username);
    if (profile) {
      setProfileUser(profile);
      setEditRealName(profile.realName);
      setEditBio(profile.bio || '');
      setEditFavCategory(profile.favoriteCategory || categories[1] || 'Motivation');
      setEditAuraTheme(profile.auraTheme || 'dark');

      // Load uploads
      const userUploads = getUploadsForUser(username);
      setUploads({
        approved: userUploads.approved as Shayari[],
        pending: userUploads.pending as Shayari[]
      });

      // Load likes received
      const likesSum = getLikesCountReceivedForUser(username);
      setLikesCount(likesSum);

      // Comments system removed

      // Load badges
      setBadgesList(getDynamicBadges(profile));

      // Load saved if own profile
      if (isOwnProfile) {
        const savedIds: string[] = JSON.parse(localStorage.getItem('roynorules_saved_ids') || '[]');
        const savedMatches = approvedShayaris.filter(sh => savedIds.includes(sh.id.split('-')[0]));
        setSavedShayaris(savedMatches);
      }

      // Calculate Rank
      const allUsersRaw = localStorage.getItem('roynorules_users_db');
      const allUsers: User[] = allUsersRaw ? JSON.parse(allUsersRaw) : [];
      const sortedUsersByActivity = [...allUsers].sort((a,b) => (b.activityCount || 0) - (a.activityCount || 0));
      const rankIdx = sortedUsersByActivity.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
      setCommunityRank(rankIdx !== -1 ? rankIdx + 1 : 1);

      // Follow state
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
  }, [isOpen, username, currentUser]);

  if (!isOpen || !profileUser) return null;

  // Aura theme definitions
  const auraThemesConfig = {
    sigma: {
      border: 'border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.25)]',
      textGrad: 'from-cyan-400 via-blue-500 to-indigo-500',
      accentBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      badgeColor: 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300',
      bgGlow: 'bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0,rgba(0,0,0,0)_60%)]',
      glowLabel: 'Sigma Mode 🔱'
    },
    love: {
      border: 'border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.25)]',
      textGrad: 'from-rose-400 via-pink-500 to-red-500',
      accentBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      badgeColor: 'border-rose-500/30 bg-rose-950/40 text-rose-300',
      bgGlow: 'bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.15)_0,rgba(0,0,0,0)_60%)]',
      glowLabel: 'Crimson Heart ❤️'
    },
    motivation: {
      border: 'border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.25)]',
      textGrad: 'from-amber-400 via-orange-500 to-yellow-500',
      accentBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      badgeColor: 'border-amber-500/30 bg-amber-950/40 text-amber-300',
      bgGlow: 'bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15)_0,rgba(0,0,0,0)_60%)]',
      glowLabel: 'Solar Flame ⚡'
    },
    dark: {
      border: 'border-zinc-800 shadow-[0_0_25px_rgba(255,255,255,0.03)]',
      textGrad: 'from-zinc-100 to-zinc-400',
      accentBg: 'bg-zinc-900 text-zinc-300 border-zinc-800',
      badgeColor: 'border-zinc-800 bg-zinc-950 text-zinc-300',
      bgGlow: 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0,rgba(0,0,0,0)_60%)]',
      glowLabel: 'Onyx Dark Mode 🔗'
    },
    emotional: {
      border: 'border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.25)]',
      textGrad: 'from-purple-400 via-violet-500 to-indigo-500',
      accentBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      badgeColor: 'border-purple-500/30 bg-purple-950/40 text-purple-300',
      bgGlow: 'bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0,rgba(0,0,0,0)_60%)]',
      glowLabel: 'Cosmic Galaxy 🌌'
    }
  };

  const currentThemeHex = auraThemesConfig[profileUser.auraTheme || 'dark'] || auraThemesConfig.dark;

  const handleSaveProfile = () => {
    if (!editRealName.trim()) {
      showToast('Real Name cannot be empty!');
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
      showToast('Identity updated with brand-new Aura! 🌌');
      if (onAuthSuccess) {
        onAuthSuccess(updated);
      }
      loadProfileData();
    }
  };

  const handleFollowClick = () => {
    if (!currentUser) {
      onTriggerAuth();
      showToast('Join parameters to enter the follow sync connection! 🌌');
      return;
    }

    const result = toggleFollowUser(currentUser.username, profileUser.username);
    setIsFollowing(result.followed);
    
    // Refresh to show updated following/followers counts
    loadProfileData();
    
    if (result.followed) {
      showToast(`Sparked network link with @${profileUser.username}! 🔗`);
    } else {
      showToast(`Disconnected link with @${profileUser.username}.`);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className={`w-full max-w-2xl bg-zinc-950/95 border ${currentThemeHex.border} rounded-[24px] overflow-hidden relative flex flex-col my-auto max-h-[90vh] sm:max-h-[88vh] transition duration-500`}
        id="premium-user-profile-identity"
      >
        {/* Background Aura Glow effect */}
        <div className={`absolute inset-0 ${currentThemeHex.bgGlow} pointer-events-none transition duration-500`} />

        {/* Header toolbar */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-900 shrink-0 z-10 bg-zinc-950/80 backdrop-blur-sm sticky top-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
            <span className="text-[10px] sm:text-xs font-mono tracking-widest uppercase text-zinc-500">
              Identity Aura Archive // {currentThemeHex.glowLabel}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition p-2 rounded-full bg-zinc-900 border border-zinc-800 cursor-pointer"
            aria-label="Close profile"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable Core Content */}
        <div className="flex-1 overflow-y-auto z-10" style={{ WebkitOverflowScrolling: 'touch' }}>
          
          {/* Cover & Hero Info */}
          <div className="px-6 md:px-8 pt-6 select-none leading-none z-10 relative">
            <PremiumAdContainer placement="profilePageAd" />
          </div>

          <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:items-start border-b border-zinc-900 relative">
            
            {/* Avatar block */}
            <div className="relative shrink-0 mx-auto md:mx-0">
              <div className={`w-24 h-24 rounded-2xl bg-zinc-900 p-[2px] border ${currentThemeHex.border} flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.8)]`}>
                <div className="w-full h-full bg-zinc-950 rounded-xl flex items-center justify-center text-4xl font-extrabold text-zinc-100 uppercase tracking-tighter select-none font-mono">
                  {profileUser.realName.charAt(0)}
                </div>
              </div>

              {/* Verified badge or indicator */}
              {profileUser.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-red-600 border-2 border-zinc-950 text-white rounded-full p-1 shadow-lg" title="Roy Approved Premium Member">
                  <ShieldCheck size={14} />
                </div>
              )}
            </div>

            {/* Profile Credentials */}
            <div className="flex-1 text-center md:text-left space-y-4">
              {isEditing ? (
                <div className="space-y-3 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-850">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-400 block uppercase tracking-wider">Real Name/Crown*</label>
                    <input 
                      type="text"
                      value={editRealName}
                      onChange={(e) => setEditRealName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 py-1.5 px-3 rounded-lg text-xs text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-400 block uppercase tracking-wider">Aura Status / Custom Bio</label>
                    <textarea 
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={2}
                      placeholder="Share your raw emotional status vibe..."
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 py-1.5 px-3 rounded-lg text-xs text-white outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-400 block uppercase tracking-wider">Fav Category</label>
                      <select
                        value={editFavCategory}
                        onChange={(e) => setEditFavCategory(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 py-1.5 px-2 rounded-lg text-[10px] text-zinc-300 outline-none"
                      >
                        {categories.filter(c => c !== 'All').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-400 block uppercase tracking-wider">Aura Theme</label>
                      <select
                        value={editAuraTheme}
                        onChange={(e) => setEditAuraTheme(e.target.value as any)}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 py-1.5 px-2 rounded-lg text-[10px] text-zinc-300 outline-none"
                      >
                        <option value="dark">Onyx Dark</option>
                        <option value="sigma">Sigma Cyan</option>
                        <option value="love">Crimson Love</option>
                        <option value="motivation">Orange Flame</option>
                        <option value="emotional">Cosmic Galaxy</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-[10px]"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveProfile}
                      className="px-3 py-1 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shadow-lg"
                    >
                      <Check size={11} /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-between gap-3">
                    <div>
                      <h1 className={`text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${currentThemeHex.textGrad}`}>
                        👑 {profileUser.realName}
                      </h1>
                      <div className="text-zinc-500 font-mono text-xs flex justify-center md:justify-start items-center gap-1.5 mt-0.5">
                        <span>@{profileUser.username}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Compass size={12} className="text-zinc-600" />
                          Preferred: {profileUser.favoriteCategory || 'Motivation'}
                        </span>
                      </div>
                    </div>

                    {/* Follow or Edit Action Button */}
                    <div className="shrink-0 flex justify-center gap-2">
                      {isOwnProfile ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-mono font-medium tracking-wide flex items-center gap-1.5 cursor-pointer transition select-none"
                        >
                          <Edit3 size={12} />
                          <span>Customize Aura</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleFollowClick}
                          className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wide transition flex items-center gap-1.5 select-none cursor-pointer ${
                            isFollowing 
                              ? 'bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-red-400' 
                              : 'bg-gradient-to-r from-red-600 to-rose-700 text-white'
                          }`}
                        >
                          <Users size={12} />
                          <span>{isFollowing ? 'Following ✓' : 'Link Connection'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-zinc-300 max-w-md mx-auto md:mx-0 leading-relaxed italic text-left select-text whitespace-pre-wrap">
                    "{profileUser.bio || 'Wandering through life with zero boundaries, in search of raw attitude verses.'}"
                  </p>

                  {/* Joined Date */}
                  <div className="flex items-center justify-center md:justify-start gap-1.5 text-zinc-600 text-[10px] font-mono">
                    <Calendar size={11} />
                    <span>Resident Since: {new Date(profileUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="p-6 sm:p-8 bg-zinc-950/60 border-b border-zinc-900 select-none">
            <h3 className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 mb-4 text-left">
              Social Statistics Matrix
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Community Rank */}
              <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Global Rank</span>
                <span className="text-xl font-black mt-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                  #{communityRank}
                </span>
                <span className="text-[8px] font-mono text-zinc-600 mt-1 uppercase">by Active Score</span>
              </div>

              {/* Total Uploads */}
              <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Sent Shayaris</span>
                <span className="text-xl font-black text-rose-500 mt-2">
                  {uploads.approved.length + uploads.pending.length}
                </span>
                <span className="text-[8px] font-mono text-zinc-600 mt-1 uppercase">
                  {uploads.pending.length > 0 ? `${uploads.approved.length} Live / ${uploads.pending.length} Pend` : 'Posted Verses'}
                </span>
              </div>

              {/* Total Likes Received */}
              <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Net Fire Rates</span>
                <span className="text-xl font-black mt-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-500Icon">
                  {likesCount} 🔥
                </span>
                <span className="text-[8px] font-mono text-zinc-600 mt-1 uppercase">Likes Earned</span>
              </div>

            </div>

            {/* Followers Group counter */}
            <div className="flex gap-6 mt-4 pt-4 border-t border-zinc-900/50 justify-center md:justify-start">
              <div className="flex gap-1.5 items-center font-mono text-xs text-zinc-400">
                <span className="font-bold text-white text-sm">{profileUser.followerStrings?.length || 0}</span>
                <span className="text-zinc-600 uppercase text-[10px]">Followers</span>
              </div>
              <div className="flex gap-1.5 items-center font-mono text-xs text-zinc-400">
                <span className="font-bold text-white text-sm">{profileUser.followingStrings?.length || 0}</span>
                <span className="text-zinc-600 uppercase text-[10px]">Following</span>
              </div>
              <div className="flex gap-1.5 items-center font-mono text-xs text-zinc-400">
                <span className="font-bold text-white text-sm">{(profileUser.activityCount || 0)}</span>
                <span className="text-zinc-600 uppercase text-[10px]">Activity Score</span>
              </div>
            </div>
          </div>

          {/* Badges system section */}
          <div className="p-6 sm:p-8 border-b border-zinc-900">
            <h3 className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 mb-3 text-left">
              Automated Identity Badges System
            </h3>
            <div className="flex flex-wrap gap-2">
              {badgesList.map((badge, idx) => {
                let badgeStyle = 'bg-zinc-900 border-zinc-800 text-zinc-300';
                if (badge.includes('Active')) badgeStyle = 'bg-amber-950/30 border-amber-600/30 text-amber-300';
                if (badge.includes('Thinker')) badgeStyle = 'bg-cyan-950/30 border-cyan-500/30 text-cyan-300';
                if (badge.includes('Motivation')) badgeStyle = 'bg-yellow-950/40 border-yellow-500/40 text-yellow-300';
                if (badge.includes('Love')) badgeStyle = 'bg-rose-950/40 border-rose-500/40 text-rose-300';
                if (badge.includes('Sigma')) badgeStyle = 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300';

                return (
                  <span 
                    key={idx}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border shadow-sm ${badgeStyle} select-none`}
                  >
                    {badge}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Profile Interactive Tabs for uploads and logs */}
          <div className="flex border-b border-zinc-900 relative bg-zinc-900/10 shrink-0 sticky top-[69px] z-15 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('uploads')}
              className={`flex-1 py-4 text-xs font-mono tracking-wider text-center flex items-center justify-center gap-1.5 transition ${
                activeTab === 'uploads' ? 'text-red-500 bg-zinc-900/40 font-bold border-b-2 border-red-500/80' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <FileText size={13} />
              <span className="hidden sm:inline">User Uploads ({uploads.approved.length + uploads.pending.length})</span>
              <span className="sm:hidden">Uploads ({uploads.approved.length + uploads.pending.length})</span>
            </button>
            {isOwnProfile && (
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex-1 py-4 text-xs font-mono tracking-wider text-center flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'saved' ? 'text-red-500 bg-zinc-900/40 font-bold border-b-2 border-red-500/80' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Bookmark size={13} />
                <span className="hidden sm:inline">My Vault ({savedShayaris.length})</span>
                <span className="sm:hidden">Vault ({savedShayaris.length})</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('monetization')}
              className={`flex-1 py-4 text-xs font-mono tracking-wider text-center flex items-center justify-center gap-1.5 transition ${
                activeTab === 'monetization' ? 'text-red-500 bg-zinc-900/40 font-bold border-b-2 border-red-500/80' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Coins size={13} />
              <span className="hidden sm:inline">Creator Earnings 🪙</span>
              <span className="sm:hidden">Earnings 🪙</span>
            </button>
          </div>

          {/* Dynamic Tab Panel View */}
          <div className="p-6 sm:p-8 min-h-[150px] space-y-4">
            
            {/* 1. UPLOADS PANEL */}
            {activeTab === 'uploads' && (
              <div className="space-y-4">
                {uploads.approved.length === 0 && uploads.pending.length === 0 ? (
                  <div className="py-8 text-center text-zinc-600 font-mono text-xs">
                    No poetry uploads detected. Share your deep lines first! 🕊️
                  </div>
                ) : (
                  <>
                    {/* Approved Live list */}
                    {uploads.approved.map((sh) => (
                      <div 
                        key={sh.id} 
                        className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-4 text-left hover:border-zinc-800 transition shadow-inner relative overflow-hidden"
                      >
                        <div className="absolute right-3 top-3 bg-red-950/30 text-red-500 text-[8px] font-mono border border-red-900 px-2 py-0.5 rounded uppercase">
                          {sh.category}
                        </div>
                        <p className="text-zinc-300 text-xs sm:text-sm whitespace-pre-line leading-relaxed italic block mt-1 pr-16 select-text">
                          "{sh.text}"
                        </p>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-900/70">
                          <span className="text-[10px] text-zinc-600 font-mono">Posted: {new Date(sh.createdAt).toLocaleDateString()}</span>
                          <span className="text-xs font-mono text-rose-500/80">🔥 {sh.likes || 0} Likes</span>
                        </div>
                      </div>
                    ))}

                    {/* Pending review list */}
                    {uploads.pending.map((sh) => (
                      <div 
                        key={sh.id} 
                        className="bg-zinc-950/40 border border-zinc-900/60 rounded-xl p-4 text-left opacity-75 relative overflow-hidden"
                      >
                        <div className="absolute right-3 top-3 bg-zinc-900 text-amber-500 text-[8px] font-mono border border-amber-900 px-2 py-0.5 rounded uppercase animate-pulse">
                          Awaiting Approve
                        </div>
                        <p className="text-zinc-400 text-xs sm:text-sm whitespace-pre-line leading-relaxed italic block mt-1 pr-16 select-text">
                          "{sh.text}"
                        </p>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-900/40">
                          <span className="text-[9px] text-zinc-600 font-mono">Date Submitted: {new Date(sh.createdAt).toLocaleDateString()}</span>
                          <span className="text-[9px] font-mono text-zinc-550 italic">Pending Roy’s Approval</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}



            {/* 3. SAVED SHAYARI (OWN VAULT ONLY) */}
            {activeTab === 'saved' && isOwnProfile && (
              <div className="space-y-4">
                {savedShayaris.length === 0 ? (
                  <div className="py-8 text-center text-zinc-600 font-mono text-xs">
                    Your personal vault is currently empty. Bookmark deep verses! 🌌
                  </div>
                ) : (
                  savedShayaris.map((sh) => (
                    <div 
                       key={sh.id} 
                       className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-left hover:border-red-500/25 transition relative overflow-hidden group"
                    >
                      <div className="absolute right-3 top-3 bg-red-950/20 text-red-500 text-[8px] font-mono border border-red-900/40 px-2 py-0.5 rounded uppercase">
                        {sh.category}
                      </div>
                      <p className="text-zinc-300 text-xs sm:text-sm whitespace-pre-line leading-relaxed italic block mt-1 pr-16 select-text">
                        "{sh.text}"
                      </p>
                      <div className="text-[9px] text-zinc-600 font-mono mt-2 flex justify-between">
                        <span>By {sh.author}</span>
                        <span>🔥 {sh.likes} Likes</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            {/* 4. PREMIUM CREATOR COINS & REWARDS PLAYGROUND */}
            {activeTab === 'monetization' && (() => {
              const { royCoins, totalViews, totalLikes, totalShares, totalSaves, engagementScore } = calculateRoyCoinsForUser(profileUser.username);

              // Calculate total coins spent to find net balance
              const spentTotal = unlockedItems.reduce((acc, itemId) => {
                if (itemId === 'aura_cyberpunk') return acc + 150;
                if (itemId === 'badge_vip') return acc + 250;
                if (itemId === 'aura_gold') return acc + 350;
                if (itemId === 'font_premium') return acc + 200;
                if (itemId === 'featured_profile') return acc + 500;
                return acc;
              }, 0);

              const netCoins = Math.max(0, royCoins - spentTotal);

              // Milestones unlocking tracker
              const badge1Unlocked = royCoins >= 50 || uploads.approved.length >= 1;
              const badge2Unlocked = royCoins >= 250 && uploads.approved.length >= 3;
              const badge3Unlocked = engagementScore >= 6.0 && totalLikes >= 5;
              const badge4Unlocked = royCoins >= 1000 || totalLikes >= 25;
              const badge5Unlocked = totalViews >= 1500 || royCoins >= 1400;

              // Handle store powerup unlock
              const handleUnlock = (itemId: string, cost: number, title: string) => {
                if (!isOwnProfile) {
                  showToast("⚠️ You can only unlock customizers for your own profile dashboard!");
                  return;
                }

                if (unlockedItems.includes(itemId)) {
                  showToast(`🌟 Power-up "${title}" is already unlocked!`);
                  return;
                }

                if (netCoins < cost) {
                  showToast(`❌ Insufficient Roy Coins! You need ${cost - netCoins} more 🪙 to acquire this premium customizer.`);
                  return;
                }

                const updatedList = [...unlockedItems, itemId];
                setUnlockedItems(updatedList);
                localStorage.setItem(`roynorules_unlocked_${profileUser.username.toLowerCase()}`, JSON.stringify(updatedList));

                // Perform live database state change
                let profileUpdates: Partial<User> = {};
                
                if (itemId === 'badge_vip') {
                  profileUpdates.badge = '👑 Sovereign VIP 👑';
                } else if (itemId === 'aura_gold') {
                  profileUpdates.auraTheme = 'motivation';
                } else if (itemId === 'aura_cyberpunk') {
                  profileUpdates.auraTheme = 'love';
                }

                const updated = updateUserProfile(profileUser.username, profileUpdates);
                if (updated && onAuthSuccess) {
                  onAuthSuccess(updated);
                }

                showToast(`🪙 PREMIUM ACTION UNLOCKED! -${cost} Roy Coins. You successfully claimed "${title}"! 🔥`);
                loadProfileData();
              };

              return (
                <div className="space-y-6 text-left animate-fade-in">
                  {/* Premium System Launcher Bar */}
                  <div className="p-4 rounded-2xl border border-rose-500/20 bg-gradient-to-r from-red-950/25 via-black to-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_4px_22px_rgba(239,68,68,0.06)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[35px] pointer-events-none" />
                    <div className="space-y-1 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-red-500 font-bold block">
                          🚀 Creator Rewards Program
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 max-w-md leading-relaxed selection:bg-red-500/20">
                        Earn sovereign premium 🪙 Roy Coins based on views, likes, shares, and real audience traffic consistency.
                      </p>
                    </div>
                    <div className="text-right shrink-0 relative z-10">
                      <span className="px-2.5 py-1 text-[9px] font-mono tracking-widest uppercase rounded border border-red-500/30 bg-red-950/25 text-red-400 font-extrabold shadow-[0_0_12px_rgba(239,68,68,0.1)]">
                        🔥 Creator Monetization Beta
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Stats Bento-Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 select-none">
                    
                    {/* Roy Coins Balance Card (Primary Spotlight) */}
                    <div className="col-span-2 bg-gradient-to-br from-zinc-900/60 via-zinc-950 to-black border border-amber-500/30 p-5 rounded-2xl flex flex-col justify-between hover:border-amber-500/50 transition-all duration-300 shadow-[0_4px_20px_rgba(245,158,11,0.03)] relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-550/10 blur-[45px] rounded-full group-hover:bg-amber-505/15 pointer-events-none transition-all duration-50 w" />
                      
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest block font-bold">SOVEREIGN BALANCE</span>
                          <h4 className="text-3xl font-black font-mono tracking-wider text-amber-400 flex items-center gap-2 drop-shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                            🪙 {netCoins.toLocaleString()}
                            <span className="text-xs font-mono text-zinc-500 font-normal">Roy Coins</span>
                          </h4>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center animate-bounce text-lg shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                          🪙
                        </div>
                      </div>

                      <div className="mt-4 pt-3.5 border-t border-zinc-900/80 flex justify-between items-center text-[9px] font-mono text-zinc-400">
                        <span>Lifetime Earned: <strong className="text-zinc-200">{royCoins} 🪙</strong></span>
                        <span className="text-amber-500/90 font-bold bg-amber-950/20 px-2 py-0.5 rounded border border-amber-950/60">
                          ✨ Early Creator Access
                        </span>
                      </div>
                    </div>

                    {/* Total Views */}
                    <div className="bg-zinc-900/30 border border-zinc-900/80 p-4.5 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition duration-300 relative overflow-hidden group">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Total Views</span>
                          <Eye size={13} className="text-sky-400" />
                        </div>
                        <div className="text-xl font-black font-mono tracking-tight mt-3 text-zinc-100">
                          {totalViews.toLocaleString()}
                        </div>
                      </div>
                      <span className="text-[8px] font-mono text-zinc-600 mt-2 uppercase tracking-wide block">Audience Reach</span>
                    </div>

                    {/* Total Likes */}
                    <div className="bg-zinc-900/30 border border-zinc-900/80 p-4.5 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition duration-300 relative overflow-hidden group">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Total Likes</span>
                          <Heart size={13} className="text-rose-500" />
                        </div>
                        <div className="text-xl font-black font-mono tracking-tight mt-3 text-zinc-100 animate-pulse">
                          {totalLikes.toLocaleString()}
                        </div>
                      </div>
                      <span className="text-[8px] font-mono text-zinc-600 mt-2 uppercase tracking-wide block">Fire Rates Recv</span>
                    </div>

                    {/* Total Shares */}
                    <div className="bg-zinc-900/30 border border-zinc-900/80 p-4.5 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition duration-300 relative overflow-hidden group">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Total Shares</span>
                          <Share2 size={13} className="text-indigo-400" />
                        </div>
                        <div className="text-xl font-black font-mono tracking-tight mt-3 text-zinc-100">
                          {totalShares.toLocaleString()}
                        </div>
                      </div>
                      <span className="text-[8px] font-mono text-zinc-600 mt-2 uppercase tracking-wide block">Network Echoes</span>
                    </div>

                    {/* Creator Leaderboard Rank */}
                    <div className="bg-zinc-900/30 border border-zinc-900/80 p-4.5 rounded-2xl flex flex-col justify-between hover:border-rose-950/20 transition duration-300 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 blur-[20px] rounded-full pointer-events-none" />
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-rose-450 uppercase tracking-widest font-semibold flex items-center gap-1">
                            Rank Status <span className="animate-pulse">👑</span>
                          </span>
                          <Award size={13} className="text-rose-500" />
                        </div>
                        <div className="text-xl font-black font-mono tracking-tight mt-3 text-rose-500 font-bold flex items-center gap-1">
                          #{communityRank}
                        </div>
                      </div>
                      <span className="text-[8px] font-mono text-zinc-600 mt-2 uppercase tracking-wide block">Top Creator Week</span>
                    </div>

                    {/* Engagement Score */}
                    <div className="bg-zinc-900/30 border border-zinc-900/80 p-4.5 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition duration-300 relative overflow-hidden group">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Engagement</span>
                          <Sparkles size={13} className="text-emerald-400" />
                        </div>
                        <div className="text-xl font-black font-mono tracking-tight mt-3 text-emerald-400">
                          {engagementScore} <span className="text-[10px] text-zinc-600">/ 10</span>
                        </div>
                      </div>
                      <span className="text-[8px] font-mono text-zinc-650 mt-2 uppercase tracking-wide block">Social Impact Factor</span>
                    </div>

                    {/* Total Saves */}
                    <div className="bg-zinc-900/30 border border-zinc-900/80 p-4.5 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition duration-300 relative overflow-hidden group">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Total Saves</span>
                          <Bookmark size={13} className="text-teal-400" />
                        </div>
                        <div className="text-xl font-black font-mono tracking-tight mt-3 text-zinc-100">
                          {totalSaves.toLocaleString()}
                        </div>
                      </div>
                      <span className="text-[8px] font-mono text-zinc-600 mt-2 uppercase tracking-wide block">Vault Additions</span>
                    </div>

                  </div>

                  {/* Coin Earnings Rate Reference Sheet */}
                  <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl space-y-1 mt-1 text-left">
                    <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                      ROY COIN ACCRUAL ENGINE METRICS
                    </span>
                    <p className="text-[9.5px] text-zinc-400 leading-relaxed font-sans">
                      💡 <strong>Rate Formula</strong>: 10 Views = 1 Roy Coin • 1 Like = 5 Roy Coins • 1 Share = 10 Roy Coins • Approved Post = 25 Roy Coins!
                    </p>
                  </div>

                  {/* STORE / UNLOCK CUSTOMIZERS WITH ROY COINS (COIN USES) */}
                  <div className="space-y-4 pt-3 border-t border-zinc-900/50">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono tracking-widest uppercase text-amber-500 font-bold block">
                          🪙 Premium Power-Up Store
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500 block">EXCHANGE COINS TO RESTYLE PROFILE VISUALS</span>
                      </div>
                      <span className="text-[8px] font-mono bg-amber-950/20 border border-amber-900/40 text-amber-400 px-2 py-0.5 rounded font-black">
                        LIVE REDEMPTIONS
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Store Item 1: VIP status badge */}
                      <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950 flex justify-between items-center gap-3 hover:border-zinc-800 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base text-yellow-500">👑</span>
                            <span className="text-[11px] font-bold text-zinc-200">Sovereign VIP Profile Badge</span>
                          </div>
                          <p className="text-[9.5px] text-zinc-500 max-w-xs">
                            Replaces your resident tag with a royal "👑 Sovereign VIP 👑" signature tag.
                          </p>
                          <span className="text-[9px] font-mono text-amber-400 font-bold bg-amber-955/10 px-1.5 py-0.5 rounded">
                            Price: 250 Coins
                          </span>
                        </div>
                        <button
                          onClick={() => handleUnlock('badge_vip', 250, 'Sovereign VIP Badge')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition shrink-0 ${
                            unlockedItems.includes('badge_vip')
                              ? 'bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed'
                              : 'bg-amber-500 border-amber-600 text-black hover:bg-amber-400'
                          }`}
                          disabled={unlockedItems.includes('badge_vip')}
                        >
                          {unlockedItems.includes('badge_vip') ? 'UNLOCKED' : 'UNLOCK'}
                        </button>
                      </div>

                      {/* Store Item 2: Neon Golden Crown Theme */}
                      <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950 flex justify-between items-center gap-3 hover:border-zinc-800 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base text-amber-500">🌅</span>
                            <span className="text-[11px] font-bold text-zinc-200">Neon Golden Crown Aura</span>
                          </div>
                          <p className="text-[9.5px] text-zinc-500 max-w-xs">
                            Unlocks the warm royal halo visual effects across your avatar & cards.
                          </p>
                          <span className="text-[9px] font-mono text-amber-400 font-bold bg-amber-955/10 px-1.5 py-0.5 rounded">
                            Price: 350 Coins
                          </span>
                        </div>
                        <button
                          onClick={() => handleUnlock('aura_gold', 350, 'Neon Golden Crown Theme')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition shrink-0 ${
                            unlockedItems.includes('aura_gold')
                              ? 'bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed'
                              : 'bg-amber-500 border-amber-600 text-black hover:bg-amber-400'
                          }`}
                          disabled={unlockedItems.includes('aura_gold')}
                        >
                          {unlockedItems.includes('aura_gold') ? 'UNLOCKED' : 'UNLOCK'}
                        </button>
                      </div>

                      {/* Store Item 3: Cyberpunk Crimson Aura */}
                      <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950 flex justify-between items-center gap-3 hover:border-zinc-800 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base text-rose-500">🍒</span>
                            <span className="text-[11px] font-bold text-zinc-200">Cyberpunk Crimson Aura Theme</span>
                          </div>
                          <p className="text-[9.5px] text-zinc-500 max-w-xs">
                            Transforms your cards into glowing dark-scarlet neon mood emitters.
                          </p>
                          <span className="text-[9px] font-mono text-amber-400 font-bold bg-amber-955/10 px-1.5 py-0.5 rounded">
                            Price: 150 Coins
                          </span>
                        </div>
                        <button
                          onClick={() => handleUnlock('aura_cyberpunk', 150, 'Cyberpunk Crimson Theme')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition shrink-0 ${
                            unlockedItems.includes('aura_cyberpunk')
                              ? 'bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed'
                              : 'bg-amber-500 border-amber-600 text-black hover:bg-amber-400'
                          }`}
                          disabled={unlockedItems.includes('aura_cyberpunk')}
                        >
                          {unlockedItems.includes('aura_cyberpunk') ? 'UNLOCKED' : 'UNLOCK'}
                        </button>
                      </div>

                      {/* Store Item 4: Featured Profile Spotlight */}
                      <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950 flex justify-between items-center gap-3 hover:border-zinc-800 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base text-indigo-400">✨</span>
                            <span className="text-[11px] font-bold text-zinc-200">Featured Creator Spotlight Spot</span>
                          </div>
                          <p className="text-[9.5px] text-zinc-500 max-w-xs">
                            Forces a premium golden animated outline around your profile on the Leaderboard.
                          </p>
                          <span className="text-[9px] font-mono text-amber-400 font-bold bg-amber-955/10 px-1.5 py-0.5 rounded">
                            Price: 500 Coins
                          </span>
                        </div>
                        <button
                          onClick={() => handleUnlock('featured_profile', 500, 'Featured Creator Spotlight')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition shrink-0 ${
                            unlockedItems.includes('featured_profile')
                              ? 'bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed'
                              : 'bg-amber-500 border-amber-600 text-black hover:bg-amber-400'
                          }`}
                          disabled={unlockedItems.includes('featured_profile')}
                        >
                          {unlockedItems.includes('featured_profile') ? 'UNLOCKED' : 'UNLOCK'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* MOTIVATIONAL BADGES / CREATOR MILESTONES */}
                  <div className="space-y-3.5 pt-4 border-t border-zinc-900/50">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 block text-left">
                      Rewards Milestones & Unlocked Creator Badges Tracker
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      
                      {/* Badge 1: Rising Creator */}
                      <div className={`p-4 rounded-xl border flex gap-3 transition duration-300 ${
                        badge1Unlocked 
                          ? 'bg-zinc-900/40 border-red-500/20 shadow-[0_4px_15px_rgba(239,68,68,0.02)]' 
                          : 'bg-zinc-950/40 border-zinc-905 opacity-60'
                      }`}>
                        <div className="text-xl shrink-0 self-center">🔥</div>
                        <div className="flex-1 text-left space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-[11px] font-bold ${badge1Unlocked ? 'text-zinc-250 font-bold' : 'text-zinc-500'}`}>
                              Rising Creator
                            </span>
                            <span className="text-[8px] font-mono font-black uppercase">
                              {badge1Unlocked ? '🏆 UNLOCKED' : '🔒 LOCKED'}
                            </span>
                          </div>
                          <p className="text-[9.5px] text-zinc-400 leading-relaxed font-sans">
                            Awarded to active writers sharing emotional shayari vibes with the community.
                          </p>
                          <div className="text-[8.5px] font-mono text-zinc-650">
                            Requirement: 1 post or 50 Roy Coins ({uploads.approved.length}/1 Posts)
                          </div>
                        </div>
                      </div>

                      {/* Badge 2: Elite Writer */}
                      <div className={`p-4 rounded-xl border flex gap-3 transition duration-300 ${
                        badge2Unlocked 
                          ? 'bg-zinc-900/40 border-amber-500/20 shadow-[0_4px_15px_rgba(245,158,11,0.02)]' 
                          : 'bg-zinc-950/40 border-zinc-905 opacity-60'
                      }`}>
                        <div className="text-xl shrink-0 self-center">👑</div>
                        <div className="flex-1 text-left space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-[11px] font-bold ${badge2Unlocked ? 'text-zinc-250 font-bold' : 'text-zinc-500'}`}>
                              Elite Writer
                            </span>
                            <span className="text-[8px] font-mono font-black uppercase">
                              {badge2Unlocked ? '🏆 UNLOCKED' : '🔒 LOCKED'}
                            </span>
                          </div>
                          <p className="text-[9.5px] text-zinc-400 leading-relaxed font-sans">
                            Recognized for deep lyrical impact and stellar consistency across categories.
                          </p>
                          <div className="text-[8.5px] font-mono text-zinc-650">
                            Requirement: 3 approved uploads & 250 Roy Coins ({uploads.approved.length}/3 Posts)
                          </div>
                        </div>
                      </div>

                      {/* Badge 3: Audience Favorite */}
                      <div className={`p-4 rounded-xl border flex gap-3 transition duration-300 ${
                        badge3Unlocked 
                          ? 'bg-zinc-900/40 border-rose-500/25 shadow-[0_4px_15px_rgba(244,63,94,0.02)]' 
                          : 'bg-zinc-950/40 border-zinc-905 opacity-60'
                      }`}>
                        <div className="text-xl shrink-0 self-center">❤️</div>
                        <div className="flex-1 text-left space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-[11px] font-bold ${badge3Unlocked ? 'text-zinc-250 font-bold' : 'text-zinc-500'}`}>
                              Audience Favorite
                            </span>
                            <span className="text-[8px] font-mono font-black uppercase">
                              {badge3Unlocked ? '🏆 UNLOCKED' : '🔒 LOCKED'}
                            </span>
                          </div>
                          <p className="text-[9.5px] text-zinc-400 leading-relaxed font-sans">
                            Maintains high average engagement and fire-rates on active poetry uploads.
                          </p>
                          <div className="text-[8.5px] font-mono text-zinc-650">
                            Requirement: Engagement &ge; 6.0 & 5 Likes ({engagementScore}/6.0)
                          </div>
                        </div>
                      </div>

                      {/* Badge 4: Trending Soul */}
                      <div className={`p-4 rounded-xl border flex gap-3 transition duration-300 ${
                        badge4Unlocked 
                          ? 'bg-zinc-900/40 border-yellow-500/25 shadow-[0_4px_15px_rgba(234,179,8,0.02)]' 
                          : 'bg-zinc-950/40 border-zinc-905 opacity-60'
                      }`}>
                        <div className="text-xl shrink-0 self-center">⚡</div>
                        <div className="flex-1 text-left space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-[11px] font-bold ${badge4Unlocked ? 'text-zinc-250 font-bold' : 'text-zinc-500'}`}>
                              Trending Soul
                            </span>
                            <span className="text-[8px] font-mono font-black uppercase">
                              {badge4Unlocked ? '🏆 UNLOCKED' : '🔒 LOCKED'}
                            </span>
                          </div>
                          <p className="text-[9.5px] text-zinc-400 leading-relaxed font-sans">
                            Unrestricted viral growth waves, sparking massive emotion across the platform.
                          </p>
                          <div className="text-[8.5px] font-mono text-zinc-650">
                            Requirement: 1000 Roy Coins or 25 total Likes ({royCoins}/1000 Coins)
                          </div>
                        </div>
                      </div>

                      {/* Badge 5: Viral Creator */}
                      <div className={`p-4 rounded-xl border flex gap-3 transition duration-300 col-span-1 sm:col-span-2 ${
                        badge5Unlocked 
                          ? 'bg-zinc-900/40 border-purple-500/25 shadow-[0_4px_15px_rgba(168,85,247,0.02)]' 
                          : 'bg-zinc-950/40 border-zinc-905 opacity-60'
                      }`}>
                        <div className="text-xl shrink-0 self-center">🌟</div>
                        <div className="flex-1 text-left space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-[11px] font-bold ${badge5Unlocked ? 'text-purple-400 font-bold' : 'text-zinc-500'}`}>
                              Viral Creator
                            </span>
                            <span className="text-[8px] font-mono font-black uppercase">
                              {badge5Unlocked ? '🏆 UNLOCKED' : '🔒 LOCKED'}
                            </span>
                          </div>
                          <p className="text-[9.5px] text-zinc-400 leading-relaxed font-sans">
                            Ultimate platform creator tier marking total views dominance.
                          </p>
                          <div className="text-[8.5px] font-mono text-zinc-650">
                            Requirement: 1500 Total Views or 1400 Roy Coins ({totalViews}/1500 Views)
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Pure HTML/SVG Glowing Sparkline Chart Segment */}
                  <div className="bg-zinc-950/80 border border-zinc-900 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-900/50 pb-3">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block">
                          Weekly Roy Coin Insights Forecast
                        </span>
                        <span className="text-[9px] font-mono text-zinc-600 block">7-DAY TRAFFIC & ENGAGEMENT HISTORY ARCHIVE</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 border border-emerald-950/60 bg-emerald-950/10 px-2.5 py-1 rounded">
                        <TrendingUp size={11} />
                        <span>+12.4% COIN TRAFFIC SPEED</span>
                      </div>
                    </div>

                    <div className="h-28 w-full relative pt-2">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGlowCoins" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Area Fill */}
                        <path 
                          d="M0,35 Q 20,25 40,28 T 80,10 T 100,2 L 100,40 L 0,40 Z" 
                          fill="url(#chartGlowCoins)"
                        />
                        {/* Grid Horizontal Guide lines */}
                        <line x1="0" y1="10" x2="100" y2="10" stroke="#18181b" strokeWidth="0.15" />
                        <line x1="0" y1="20" x2="100" y2="20" stroke="#18181b" strokeWidth="0.15" strokeDasharray="1 1" />
                        
                        {/* Main Sparkline */}
                        <path 
                          d="M0,28 Q 20,22 40,25 T 80,8 T 100,2" 
                          fill="none" 
                          stroke="#f59e0b" 
                          strokeWidth="0.8" 
                          strokeLinecap="round"
                          className="drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                        />

                        {/* Data Dots */}
                        <circle cx="100" cy="2" r="1.5" fill="#f59e0b" className="animate-pulse" />
                      </svg>

                      {/* Left/Right Axis indicators */}
                      <div className="absolute inset-x-0 bottom-0 top-0 pointer-events-none flex justify-between text-[7.5px] font-mono text-zinc-650 items-end">
                        <span>MON</span>
                        <span>TUE</span>
                        <span>WED</span>
                        <span>THU</span>
                        <span>FRI</span>
                        <span>SAT</span>
                        <span className="text-amber-500 font-black">TODAY</span>
                      </div>

                      <div className="absolute left-1 top-1 pointer-events-none text-[8px] font-mono text-zinc-650">
                        Current Coin Yield Multipier: X1.2
                      </div>
                    </div>
                  </div>

                  {/* Future UPI Payout Architecture Ready (NO direct money withdrawals active) */}
                  <div className="p-4 bg-zinc-900/15 border border-zinc-900/90 rounded-xl space-y-3.5 text-left relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-900/5 blur-[25px] rounded-full" />
                    
                    <div className="flex items-center gap-2">
                      <Lock size={12} className="text-zinc-600 animate-pulse" />
                      <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-400 font-bold block">
                        Anti-Spam & Real-Impact Payout Security Configuration
                      </span>
                    </div>

                    <p className="text-[9.5px] text-zinc-500 leading-relaxed font-sans">
                      🔒 <strong>Real-Impact Verification Active</strong>: Self-vibe views, proxy bot networks, and immediate page loads are filtered at the ledger layer. Authentic reader stays and verified bookmarks are audited every cycle to keep rewards genuine and scalable. Future UPI creator payout modules can be linked effortlessly to this ledger interface.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                      <div className="bg-zinc-950/80 p-2.5 rounded border border-zinc-900/60 font-mono">
                        <span className="text-[8px] text-zinc-600 block uppercase font-bold">Ledger Balance</span>
                        <span className="text-[10px] font-black text-zinc-300 block mt-1">Audit Perfect</span>
                      </div>
                      <div className="bg-zinc-950/80 p-2.5 rounded border border-zinc-900/60 font-mono">
                        <span className="text-[8px] text-zinc-600 block uppercase font-bold">Bot Filter</span>
                        <span className="text-[10px] font-black text-emerald-400 block mt-1">ACTIVE 🛡️</span>
                      </div>
                      <div className="bg-zinc-950/80 p-2.5 rounded border border-zinc-900/60 font-mono">
                        <span className="text-[8px] text-zinc-600 block uppercase font-bold">UPI Engine Link</span>
                        <span className="text-[10px] font-black text-zinc-550 block mt-1">Ready</span>
                      </div>
                      <div className="bg-zinc-950/80 p-2.5 rounded border border-zinc-900/60 font-mono">
                        <span className="text-[8px] text-zinc-600 block uppercase font-bold">Payout Mode</span>
                        <span className="text-[10px] font-black text-zinc-500 block mt-1">Virtual Only</span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })()}

          </div>

        </div>
      </motion.div>
    </div>
  );
}
