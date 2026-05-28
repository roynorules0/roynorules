import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Check, ToggleLeft, Trash2, Plus, Users, ShieldAlert, Award, ChevronRight, Activity, ShieldCheck, ShieldBan, ShieldOff, Trash, Eye, Megaphone } from 'lucide-react';
import { Shayari, User } from '../types';
import { getUsers, setBlockUserStatus, deleteUserFromDb, getActivityLogs } from '../utils/communityDb';
import PremiumAdContainer, { getStoredAdsConfig, saveAdsConfig, AdsConfig } from './PremiumAdContainer';

interface AdminPanelProps {
  categories: string[];
  pendingShayaris: Shayari[];
  approvedShayaris: Shayari[];
  onAddShayari: (shayari: Shayari) => void;
  onDeleteShayari: (id: string) => void;
  onApproveShayari: (id: string) => void;
  onDeclineShayari: (id: string) => void;
  onAddCategory: (category: string) => void;
  onClose: () => void;
}

export default function AdminPanel({
  categories,
  pendingShayaris,
  approvedShayaris,
  onAddShayari,
  onDeleteShayari,
  onApproveShayari,
  onDeclineShayari,
  onAddCategory,
  onClose,
}: AdminPanelProps) {
  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');

  // Tab State: 'pending' | 'list' | 'add' | 'categories' | 'users' | 'ads'
  const [activeTab, setActiveTab] = useState<'pending' | 'list' | 'add' | 'categories' | 'users' | 'ads'>('pending');

  // Ad Management State
  const [adsConfig, setAdsConfig] = useState<AdsConfig>(() => getStoredAdsConfig());
  const [testPlacement, setTestPlacement] = useState<keyof AdsConfig['placements']>('homeTopBanner');

  // Interactive local states for user management DB
  const [users, setUsers] = useState<User[]>(() => getUsers());
  const [activityUser, setActivityUser] = useState<string | null>(null);

  // New Shayari Form State
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState(categories[1] || 'Motivation');
  const [newAuthor, setNewAuthor] = useState('Roy No Rules');
  const [customHighlights, setCustomHighlights] = useState('');
  const [autoHighlight, setAutoHighlight] = useState(true);
  const [addShayariSuccess, setAddShayariSuccess] = useState(false);

  // New Category State
  const [categoryName, setCategoryName] = useState('');

  // Refresh Users directory list
  const refreshUsersList = () => {
    setUsers(getUsers());
  };

  // Handle keypad click
  const handleKeypadPress = (val: string) => {
    setLoginError('');
    if (val === 'C') {
      setPin('');
    } else if (val === 'backspace') {
      setPin((prev) => prev.slice(0, -1));
    } else {
      if (pin.length < 10) {
        setPin((prev) => prev + val);
      }
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate credentials
    // Username: Roynorules, passcode PIN: 9027671630 (10 digits)
    if (username.toLowerCase() !== 'roynorules') {
      setLoginError('Invalid Admin Username!');
      return;
    }
    if (pin === '9027671630') {
      setIsLoggedIn(true);
      setPin('');
      refreshUsersList(); // Sync with DB
    } else {
      setLoginError('Incorrect Passcode PIN!');
      setPin(''); // Reset on failure
    }
  };

  const handleAddNewShayari = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    let highlights: string[] = [];
    if (autoHighlight) {
      // Find longest words & some emotional words
      const words = newText.split(/[\s,.'"\n]+/);
      const emoKeywords = ['rules', 'roy', 'zindagi', 'attitude', 'kismat', 'mushkil', 'shor', 'manzil', 'dil', 'dosti', 'waqt', 'love', 'yaar'];
      
      const found = words.filter(
        (w) => emoKeywords.includes(w.toLowerCase()) || w.length > 5
      );
      highlights = (Array.from(new Set(found)) as string[]).slice(0, 4);
    } else if (customHighlights.trim()) {
      highlights = customHighlights
        .split(',')
        .map((h) => h.trim())
        .filter(Boolean);
    }

    const compiled: Shayari = {
      id: Date.now().toString(),
      text: newText.trim(),
      category: newCategory,
      author: newAuthor.trim() || 'Roy No Rules',
      highlightedWords: highlights,
      likes: Math.floor(Math.random() * 200) + 50,
      shares: Math.floor(Math.random() * 80) + 12,
      createdAt: new Date().toISOString(),
      status: 'approved',
    };

    onAddShayari(compiled);
    setNewText('');
    setCustomHighlights('');
    setAddShayariSuccess(true);
    setTimeout(() => setAddShayariSuccess(false), 3000);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    onAddCategory(categoryName.trim());
    setCategoryName('');
  };

  return (
    <div 
      className="fixed inset-0 bg-[#000000]/95 backdrop-blur-xl z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-900/80 rounded-[24px] overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.18)] flex flex-col my-auto max-h-[90vh] sm:max-h-[88vh]">
        {/* Admin Header */}
        <div className="flex items-center justify-between p-4.5 sm:p-5 border-b border-zinc-900 bg-gradient-to-r from-red-950/20 via-zinc-950 to-zinc-950 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-red-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold tracking-widest text-white font-mono uppercase">
              Roy No Rules... Admin HQ
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex text-zinc-400 hover:text-white transition p-2 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.5)] active:scale-95"
            aria-label="Close modal"
          >
            <X size={15} />
          </button>
        </div>

        {/* LOGIN SCREEN IF NOT LOGGED IN */}
        <AnimatePresence mode="wait">
          {!isLoggedIn ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center justify-center overflow-y-auto"
            >
              {/* Login info */}
              <div className="md:w-1/2 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                  <Lock className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Enter Admin Passcode
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Authorized access only. Use the numeric keypad to unlock Roy No Rules' content controls, community accounts, and system databases.
                </p>

                <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/80 space-y-2">
                  <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                    Security Policy
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    This control dashboard requires a valid username and the official 10-digit passcode. All access attempts are securely recorded in the community activity logs.
                  </p>
                </div>
              </div>

              {/* Login Interface Form */}
              <form onSubmit={handleLoginSubmit} className="md:w-1/2 w-full max-w-sm space-y-5">
                {loginError && (
                  <div className="p-3 bg-red-950/20 border border-red-500/30 text-red-400 text-xs rounded-xl font-medium">
                    ⚠️ {loginError}
                  </div>
                )}

                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter Admin Username"
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-2.5 text-xs outline-none focus:border-red-500"
                  />
                </div>

                {/* Pin visual visual feedback */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block text-center">
                    Enter Keypad PIN Code (10 Digits)
                  </label>
                  <div className="flex justify-center gap-2 py-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => (
                      <div
                        key={idx}
                        className={`w-3 h-3 rounded-full border transition-all duration-350 ${
                          pin.length > idx
                            ? 'bg-red-500 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)] scale-110'
                            : 'border-zinc-800 bg-zinc-950'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Numeric Keypad only UI */}
                <div className="grid grid-cols-3 gap-2 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-850">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'backspace'].map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleKeypadPress(key)}
                      className={`h-11 rounded-xl text-sm font-semibold flex items-center justify-center transition active:scale-95 cursor-pointer ${
                        key === 'C'
                          ? 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-500'
                          : key === 'backspace'
                          ? 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                          : 'bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-white hover:border-zinc-800'
                      }`}
                    >
                      {key === 'backspace' ? '⌫' : key}
                    </button>
                  ))}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!username || pin.length !== 10}
                  className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:opacity-90 active:scale-95 text-white font-bold py-3 px-4 rounded-xl text-xs tracking-widest uppercase transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                >
                  Confirm Login
                </button>
              </form>
            </motion.div>
          ) : (
            /* ADMIN INSIDE DASHBOARD CONTENT */
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-y-auto">
              {/* Sidebar Navigation inside Panel */}
              <div className="md:w-64 border-r border-zinc-900 bg-zinc-950 md:p-4 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible shrink-0 select-none">
                {/* Pending Submissions */}
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl text-left transition w-full whitespace-nowrap cursor-pointer ${
                    activeTab === 'pending'
                      ? 'bg-red-950/20 border border-red-500/30 text-red-500'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <Users size={14} />
                  <span>Pending Shayaris ({pendingShayaris.length})</span>
                  {pendingShayaris.length > 0 && (
                    <span className="ml-auto bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                      {pendingShayaris.length}
                    </span>
                  )}
                </button>

                {/* Add Shayari */}
                <button
                  onClick={() => setActiveTab('add')}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl text-left transition w-full whitespace-nowrap cursor-pointer ${
                    activeTab === 'add'
                      ? 'bg-red-950/20 border border-red-500/30 text-red-500'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <Plus size={14} />
                  <span>Publish New Shayari</span>
                </button>

                {/* All Approved List */}
                <button
                  onClick={() => setActiveTab('list')}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl text-left transition w-full whitespace-nowrap cursor-pointer ${
                    activeTab === 'list'
                      ? 'bg-red-950/20 border border-red-500/30 text-red-500'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <Award size={14} />
                  <span>Live Database ({approvedShayaris.length})</span>
                </button>

                {/* User Accounts Management Tab (NEW) */}
                <button
                  onClick={() => {
                    setActiveTab('users');
                    refreshUsersList();
                  }}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl text-left transition w-full whitespace-nowrap cursor-pointer ${
                    activeTab === 'users'
                      ? 'bg-red-950/20 border border-red-500/30 text-red-500'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <Users size={14} />
                  <span>User Management ({users.length})</span>
                </button>

                {/* Categories Manager */}
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl text-left transition w-full whitespace-nowrap cursor-pointer ${
                    activeTab === 'categories'
                      ? 'bg-red-950/20 border border-red-500/30 text-red-500'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <ChevronRight size={14} />
                  <span>Manage Categories ({categories.length})</span>
                </button>

                {/* Ads Manager */}
                <button
                  onClick={() => setActiveTab('ads')}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl text-left transition w-full whitespace-nowrap cursor-pointer ${
                    activeTab === 'ads'
                      ? 'bg-red-950/20 border border-red-500/30 text-red-500'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <Megaphone size={14} />
                  <span>Ad Management</span>
                </button>
              </div>

              {/* Main Workspace Frame */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-zinc-950/40">
                {/* TAB 1: PENDING SUBMISSIONS REVIEW */}
                {activeTab === 'pending' && (
                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-bold text-white tracking-tight">
                        Review User Submissions
                      </h4>
                      <span className="text-xs font-mono text-zinc-500">
                        {pendingShayaris.length} submissions awaiting review
                      </span>
                    </div>

                    {pendingShayaris.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-zinc-900 rounded-2xl bg-zinc-950/20">
                        <Users className="text-zinc-700 mx-auto mb-3" size={32} />
                        <h5 className="text-sm font-semibold text-zinc-400">All caught up!</h5>
                        <p className="text-xs text-zinc-650 mt-1">No user submitted shayaris are currently pending approval.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {pendingShayaris.map((sh) => (
                          <div
                            key={sh.id}
                            className="p-5 border border-zinc-900 rounded-2xl bg-zinc-900/40 hover:border-red-500/10 transition-colors space-y-4"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono bg-red-950/30 border border-red-950 text-red-400 px-3 py-0.5 rounded-full">
                                {sh.category}
                              </span>
                              <span className="text-zinc-500 font-mono">By — {sh.author}</span>
                            </div>

                            <p className="text-sm text-zinc-200 leading-relaxed italic block whitespace-pre-line text-center font-sans">
                              {sh.text}
                            </p>

                            <div className="text-[10px] text-zinc-500 font-mono flex gap-1.5 flex-wrap">
                              <span>Auto-Keywords Highlighted:</span>
                              {sh.highlightedWords.map((hw) => (
                                <span key={hw} className="text-red-400 font-medium">
                                  #{hw}
                                </span>
                              ))}
                            </div>

                            <div className="flex border-t border-zinc-850 pt-4 justify-end gap-3.5">
                              <button
                                onClick={() => onDeclineShayari(sh.id)}
                                className="px-4 py-2 border border-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-950 rounded-xl text-xs transition-colors font-medium flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 size={13} />
                                <span>Decline</span>
                              </button>
                              <button
                                onClick={() => onApproveShayari(sh.id)}
                                className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition hover:shadow-[0_0_12px_rgba(239,68,68,0.2)] cursor-pointer"
                              >
                                <Check size={13} />
                                <span>Approve & Publish</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: LIVE DATABASE LIST / DELETE */}
                {activeTab === 'list' && (
                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-bold text-white tracking-tight">
                        Live Shayari Directory
                      </h4>
                      <span className="text-xs font-mono text-zinc-500">
                        {approvedShayaris.length} Live Items on Feed
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5">
                      {approvedShayaris.map((sh) => (
                        <div
                          key={sh.id}
                          className="flex items-center justify-between p-4 border border-zinc-900 rounded-2xl bg-zinc-900/20 hover:bg-zinc-900/40 transition text-left"
                        >
                          <div className="max-w-[80%] space-y-1.5">
                            <p className="text-xs text-zinc-300 font-medium line-clamp-2 italic font-sans whitespace-pre-line">
                              "{sh.text}"
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                              <span className="text-red-400">{sh.category}</span>
                              <span>•</span>
                              <span>By {sh.author}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => onDeleteShayari(sh.id)}
                            className="text-zinc-500 hover:text-red-500 p-2 border border-transparent hover:border-red-950 hover:bg-red-950/20 rounded-xl transition cursor-pointer"
                            title="Delete permanently"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: ADD NEW SHAYARI FROM ADMIN */}
                {activeTab === 'add' && (
                  <div className="space-y-5">
                    <h4 className="text-lg font-bold text-white tracking-tight">
                      Draft & Publish Official Shayari
                    </h4>

                    {addShayariSuccess && (
                      <div className="p-3 bg-green-950/30 border border-green-500/30 text-green-400 text-xs rounded-xl font-medium">
                        🎉 Success! Shayari published instantly onto live portal feed.
                      </div>
                    )}

                    <form onSubmit={handleAddNewShayari} className="space-y-4">
                      {/* Text */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
                          Shayari Content
                        </label>
                        <textarea
                          value={newText}
                          onChange={(e) => setNewText(e.target.value)}
                          rows={4}
                          placeholder="Bebakh likho, No rules..."
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 text-white rounded-xl p-3 text-xs outline-none transition"
                        />
                      </div>

                      {/* Author */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
                            Author/Signature
                          </label>
                          <input
                            type="text"
                            value={newAuthor}
                            onChange={(e) => setNewAuthor(e.target.value)}
                            placeholder="Roy No Rules"
                            className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 text-white rounded-xl px-4 py-3 text-xs outline-none transition"
                          />
                        </div>

                        {/* Category */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
                            Select Category
                          </label>
                          <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 text-zinc-300 text-xs rounded-xl px-4 py-3 outline-none cursor-pointer"
                          >
                            {categories
                              .filter((c) => c !== 'All')
                              .map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                      {/* Auto highlights selector */}
                      <div className="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-805 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-zinc-300">
                            Auto Highlighter Mode
                          </span>
                          <button
                            type="button"
                            onClick={() => setAutoHighlight(!autoHighlight)}
                            className="text-red-500 hover:text-red-400 p-1 flex items-center gap-1 text-xs cursor-pointer"
                          >
                            <ToggleLeft size={16} className={autoHighlight ? '' : 'rotate-180 text-zinc-500'} />
                            <span>{autoHighlight ? 'Auto Highlights (On)' : 'Custom Highlights (On)'}</span>
                          </button>
                        </div>

                        {!autoHighlight && (
                          <div className="space-y-1 text-left">
                            <label className="text-[10px] font-mono text-zinc-400 uppercase block">
                              Enter words to highlight (separated by comma)
                            </label>
                            <input
                              type="text"
                              value={customHighlights}
                              onChange={(e) => setCustomHighlights(e.target.value)}
                              placeholder="E.g. raste, mushkil, manzil, kismat"
                              className="w-full bg-zinc-950 border border-zinc-900 focus:border-red-500 text-white text-xs rounded-xl px-3 py-2 outline-none"
                            />
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={!newText.trim()}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl text-xs tracking-wider uppercase transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                      >
                        Publish Instantly
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB 4: USER ACCOUNT SECURITY MANAGEMENT (NEW) */}
                {activeTab === 'users' && (
                  <div className="space-y-5">
                    <div className="flex justify-between items-center select-none text-left">
                      <h4 className="text-lg font-bold text-white tracking-tight">
                        Registered Users Registry 🛡️
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2.5 py-1 rounded-xl border border-zinc-900">
                        {users.length} Registered Community Profiles
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {users.map((item) => {
                        const isBlocked = item.status === 'blocked';
                        const isViewingActivity = activityUser === item.username;
                        
                        return (
                          <div
                            key={item.id}
                            className={`p-5 rounded-2xl border transition-colors duration-300 text-left ${
                              isBlocked 
                                ? 'bg-red-950/10 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.02)]' 
                                : 'bg-zinc-900/40 border-zinc-900 hover:border-zinc-850'
                            } space-y-4`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                                  isBlocked 
                                    ? 'bg-red-950 border border-red-500/30 text-red-500 animate-pulse' 
                                    : 'bg-zinc-950 border border-zinc-900 text-zinc-300'
                                }`}>
                                  {item.realName.charAt(0)}
                                </div>
                                <div className="text-left">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-zinc-100">{item.realName}</span>
                                    <span className="text-xs font-mono text-zinc-550">@{item.username}</span>
                                    {item.badge && (
                                      <span className="text-[8px] tracking-wider font-mono uppercase bg-red-950/20 border border-red-950/40 text-red-400 px-1.5 py-0.25 rounded">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-zinc-400 font-sans block mt-0.5">{item.email}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-lg border ${
                                  isBlocked 
                                    ? 'bg-red-950/30 border-red-500/20 text-red-400 font-extrabold shadow-[0_0_10px_rgba(239,68,68,0.15)]' 
                                    : 'bg-emerald-950/25 border-emerald-500/20 text-emerald-400 font-extrabold'
                                }`}>
                                  {item.status === 'blocked' ? '🚫 Blocked' : '✅ Active'}
                                </span>
                                <span className="text-[9px] font-mono text-zinc-550 bg-zinc-950 border border-zinc-900 px-2 py-0.5 rounded-lg">
                                  {item.activityCount || 0} Actions Logged
                                </span>
                                <span className="text-[9px] font-mono text-zinc-600">
                                  Joined {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {/* Secure check: verify no passwords displayed */}
                            <div className="text-[9px] font-mono text-zinc-700 bg-zinc-950/40 p-2 rounded-lg border border-zinc-950 text-left">
                              🔒 Cryptographic Password: <span className="text-emerald-500 font-bold uppercase text-[8px] tracking-wider">SHA-256 Hashed & Secured (Hidden from Admin)</span>
                            </div>

                            {/* Controls buttons row */}
                            <div className="flex flex-wrap border-t border-zinc-900/50 pt-3.5 justify-end gap-2.5">
                              {/* View Action Logs Button */}
                              <button
                                onClick={() => {
                                  setActivityUser(isViewingActivity ? null : item.username);
                                }}
                                className={`px-3 py-1.5 border text-xs font-mono rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                                  isViewingActivity 
                                    ? 'bg-zinc-900 border-zinc-800 text-white font-extrabold' 
                                    : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800'
                                }`}
                              >
                                <Activity size={12} className={isViewingActivity ? 'animate-spin' : ''} style={{ animationDuration: '3s' }} />
                                <span>{isViewingActivity ? 'Close Logs' : 'Audit Activity'}</span>
                              </button>

                              {/* Block toggle */}
                              <button
                                onClick={() => {
                                  const targetState = !isBlocked;
                                  setBlockUserStatus(item.id, targetState);
                                  refreshUsersList();
                                }}
                                className={`px-3.5 py-1.5 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                  isBlocked
                                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:border-emerald-550 hover:text-white shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                                    : 'bg-red-950/10 border-red-500/20 text-red-500 hover:bg-red-650 hover:border-red-500 hover:text-white font-bold'
                                }`}
                              >
                                {isBlocked ? (
                                  <>
                                    <Check size={12} />
                                    <span>Unblock Member</span>
                                  </>
                                ) : (
                                  <>
                                    <ShieldOff size={12} />
                                    <span>Block Member</span>
                                  </>
                                )}
                              </button>

                              {/* Delete button */}
                              {/* Users cannot self-delete admin account */}
                              <button
                                onClick={() => {
                                  if (confirm(`Are you absolutely certain you want to permanently delete user @${item.username}? This removes identity and purges all custom uploads. This is irreversible!`)) {
                                    deleteUserFromDb(item.id);
                                    refreshUsersList();
                                  }
                                }}
                                className="px-3.5 py-1.5 bg-zinc-950 border border-zinc-905 hover:bg-red-950/20 hover:border-red-500/30 text-zinc-500 hover:text-red-400 rounded-xl text-xs transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
                                title="Delete user"
                              >
                                <Trash2 size={12} />
                                <span>Purge Profile</span>
                              </button>
                            </div>

                            {/* VIEW ACTIVITY logs inline with transition */}
                            <AnimatePresence>
                              {isViewingActivity && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="border-t border-zinc-900/50 pt-3.5 overflow-hidden space-y-2.5 text-left"
                                >
                                  <h5 className="text-[10px] font-mono font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Activity size={10} className="animate-pulse" />
                                    <span>Identity Audits Logs for @{item.username}</span>
                                  </h5>
                                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 max-h-48 overflow-y-auto space-y-2">
                                    {getActivityLogs().filter(log => log.username.toLowerCase() === item.username.toLowerCase()).length === 0 ? (
                                      <p className="text-[10px] text-zinc-700 font-mono italic text-center">No transactions locked in history database.</p>
                                    ) : (
                                      getActivityLogs()
                                        .filter(log => log.username.toLowerCase() === item.username.toLowerCase())
                                        .map(log => (
                                          <div key={log.id} className="text-[10.5px] font-mono flex items-start gap-2 border-b border-zinc-900/50 pb-1.5 justify-between">
                                            <div className="space-y-0.5 pr-2">
                                              <span className="text-zinc-300 font-bold bg-zinc-900 border border-zinc-850 px-1.5 py-0.25 rounded text-[8px] mr-1.5 uppercase font-sans">
                                                {log.action}
                                              </span>
                                              <span className="text-zinc-400 font-sans">{log.details}</span>
                                            </div>
                                            <span className="text-[9px] text-zinc-600 select-none shrink-0 font-light mt-0.5">
                                              {new Date(log.timestamp).toLocaleTimeString() || log.timestamp}
                                            </span>
                                          </div>
                                        ))
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 5: CATEGORY MANAGER */}
                {activeTab === 'categories' && (
                  <div className="space-y-5">
                    <h4 className="text-lg font-bold text-white tracking-tight">
                      Manage Live Categories List
                    </h4>

                    {/* Add Category inline Form */}
                    <form onSubmit={handleAddCategorySubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="Type new category (e.g., Attitude, Shayari)"
                        className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-red-500 text-white rounded-xl px-4 py-2.5 text-xs outline-none transition"
                      />
                      <button
                        type="submit"
                        disabled={!categoryName.trim()}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-45"
                      >
                        <Plus size={14} />
                        <span>Add Category</span>
                      </button>
                    </form>

                    {/* Directory of categories */}
                    <div className="pt-2 text-left">
                      <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-3.5">
                        Current Categories ({categories.length})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                          <span
                            key={cat}
                            className="bg-zinc-900 border border-zinc-850 text-xs text-zinc-300 font-mono px-4 py-2 rounded-xl flex items-center justify-between gap-3"
                          >
                            <span>{cat}</span>
                            {cat !== 'All' && (
                              <span className="text-[9px] text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded-full border border-zinc-900">
                                Active Usage
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 6: SMART ADS MANAGEMENT */}
                {activeTab === 'ads' && (
                  <div className="space-y-6 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-4 select-none">
                      <div>
                        <h4 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                          <Megaphone className="text-red-500 animate-pulse" size={18} />
                          <span>Adsterra Smart Ads System</span>
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1 font-sans">
                          Sustain and monetize your universe without disrupting the dark aesthetic or emotional flow.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-zinc-500">GLOBAL STATE</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...adsConfig, isEnabled: !adsConfig.isEnabled };
                            setAdsConfig(updated);
                            saveAdsConfig(updated);
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition duration-300 cursor-pointer ${
                            adsConfig.isEnabled
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-450 shadow-[0_0_15px_rgba(16,185,129,0.1)] font-bold'
                              : 'bg-red-950/10 border-red-500/20 text-red-500 font-medium'
                          }`}
                        >
                          <ToggleLeft size={16} className={adsConfig.isEnabled ? '' : 'rotate-180 text-zinc-550'} />
                          <span>{adsConfig.isEnabled ? 'Ads Active (ON)' : 'Ads Stopped (OFF)'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left: Settings Panel */}
                      <div className="space-y-5">
                        {/* 1. Paste Script Content */}
                        <div className="p-5 bg-zinc-900/30 border border-zinc-900 rounded-2xl space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block font-bold">
                              Adsterra Script Fragment
                            </label>
                            <span className="text-[10px] font-mono text-zinc-650">HTML / JS Banner Code</span>
                          </div>
                          
                          <textarea
                            value={adsConfig.adsterraScript}
                            onChange={(e) => {
                              const updated = { ...adsConfig, adsterraScript: e.target.value };
                              setAdsConfig(updated);
                              saveAdsConfig(updated);
                            }}
                            rows={8}
                            placeholder="<!-- Paste your Adsterra native banner code snippet here -->"
                            className="w-full bg-zinc-950 border border-zinc-900 focus:border-red-500/50 text-zinc-350 font-mono text-[10px] p-3 rounded-xl outline-none transition"
                          />

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const resetConfig = { ...adsConfig, adsterraScript: `<!-- Sample Adsterra Banner Widget -->
<script type="text/javascript">
	atOptions = {
		'key' : 'sample_adsterra_key_9fcf3d0b2f',
		'format' : 'iframe',
		'height' : 90,
		'width' : 728,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//www.creativeformat.com/sample_key/invoke.js"></script>` };
                                setAdsConfig(resetConfig);
                                saveAdsConfig(resetConfig);
                              }}
                              className="px-3.5 py-1.5 border border-zinc-850 px-2 text-zinc-400 hover:text-white rounded-xl text-xs transition bg-zinc-950 cursor-pointer w-full"
                            >
                              Reset to Sample
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const cleared = { ...adsConfig, adsterraScript: '' };
                                setAdsConfig(cleared);
                                saveAdsConfig(cleared);
                              }}
                              className="px-3.5 py-1.5 border border-red-950/40 hover:bg-red-950/10 text-red-500 rounded-xl text-xs transition bg-zinc-950 w-full cursor-pointer"
                            >
                              Clear Script
                            </button>
                          </div>
                        </div>

                        {/* 2. Frequency Config */}
                        <div className="p-5 bg-zinc-900/30 border border-zinc-900 rounded-2xl space-y-3.5">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block font-bold">
                              Show Ad After Every N Posts
                            </label>
                            <span className="text-xs font-mono text-red-500 font-black">{adsConfig.adFrequency} Posts</span>
                          </div>
                          <input
                            type="range"
                            min="3"
                            max="10"
                            value={adsConfig.adFrequency}
                            onChange={(e) => {
                              const num = parseInt(e.target.value, 10);
                              const updated = { ...adsConfig, adFrequency: num };
                              setAdsConfig(updated);
                              saveAdsConfig(updated);
                            }}
                            className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-red-500"
                          />
                          <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
                            Recommended spacing is 5-7 cards. Too frequent might feel spammy, while too rare will decrease monetization.
                          </p>
                        </div>
                      </div>

                      {/* Right: Placements Grid */}
                      <div className="space-y-5">
                        <div className="p-5 bg-zinc-900/30 border border-zinc-900 rounded-2xl space-y-3">
                          <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block font-bold">
                            Active Placements Matrix
                          </label>
                          <p className="text-[10px] text-zinc-500 leading-relaxed">
                            Control exactly which touchpoints load responsive banner scripts. Turn them on/off dynamically.
                          </p>

                          <div className="space-y-2.5 pt-2">
                            {(Object.keys(adsConfig.placements) as Array<keyof AdsConfig['placements']>).map((p) => {
                              const isPlacementOn = adsConfig.placements[p];
                              const userFriendlyName = p
                                .replace(/([A-Z])/g, ' $1')
                                .replace(/^./, (str) => str.toUpperCase());
                                
                              return (
                                <div
                                  key={p}
                                  onClick={() => {
                                    const updated = {
                                      ...adsConfig,
                                      placements: {
                                        ...adsConfig.placements,
                                        [p]: !adsConfig.placements[p],
                                      },
                                    };
                                    setAdsConfig(updated);
                                    saveAdsConfig(updated);
                                  }}
                                  className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition duration-200 ${
                                    isPlacementOn
                                      ? 'bg-zinc-900/50 border-zinc-800 text-white'
                                      : 'bg-zinc-950/20 border-zinc-950 text-zinc-500 hover:text-zinc-400'
                                  }`}
                                >
                                  <span className="text-xs font-medium font-sans">
                                    {userFriendlyName}
                                  </span>
                                  <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-md ${
                                    isPlacementOn
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40 font-bold'
                                      : 'bg-zinc-950 text-zinc-500 border border-zinc-900/50'
                                  }`}>
                                    {isPlacementOn ? 'Active' : 'Disabled'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: QA Visual Live Preview Section */}
                    <div className="p-5 bg-zinc-900/30 border border-zinc-900 rounded-2xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
                        <div className="text-left">
                          <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block font-bold">
                            Interactive QA Preview System 👀
                          </label>
                          <p className="text-[10px] text-zinc-500 leading-relaxed mt-0.5 font-sans">
                            Select placement layout format below to experience true spacing and mock visual rendering:
                          </p>
                        </div>
                        
                        <select
                          value={testPlacement}
                          onChange={(e) => setTestPlacement(e.target.value as keyof AdsConfig['placements'])}
                          className="bg-zinc-950 border border-zinc-900 text-zinc-300 text-xs px-3.5 py-1.5 rounded-xl outline-none cursor-pointer focus:border-red-500"
                        >
                          {(Object.keys(adsConfig.placements) as Array<keyof AdsConfig['placements']>).map((p) => (
                            <option key={p} value={p}>
                              {p.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Display live component in action */}
                      <div className="py-2.5 bg-black/40 rounded-xl p-3 border border-zinc-950 relative overflow-hidden">
                        <PremiumAdContainer placement={testPlacement} forcePreview={true} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
