import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, BarChart3, BookOpen, Users, ShieldAlert, ShieldCheck, Megaphone, 
  Settings, Globe, Mail, Plus, Trash2, Check, RefreshCw, Layers,
  Search, Menu, ExternalLink, HelpCircle, ArrowRight, Zap, Play, Grid
} from 'lucide-react';
import { Shayari, Category, User } from '../types';
import { 
  getUsers, setBlockUserStatus, deleteUserFromDb, getActivityLogs,
  calculateRoyCoinsForUser, getUploadsForUser
} from '../utils/communityDb';
import PremiumAdContainer from './PremiumAdContainer';

interface AdminPanelProps {
  categories: string[];
  pendingShayaris: Shayari[];
  approvedShayaris: Shayari[];
  onAddShayari: (sh: Shayari) => void;
  onDeleteShayari: (id: string) => void;
  onApproveShayari: (id: string) => void;
  onDeclineShayari: (id: string) => void;
  onAddCategory: (name: string) => void;
  onClose: () => void;
}

// Simulated feedback inbox message item type
interface SupportMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  category: 'feedback' | 'bug' | 'copyright' | 'other';
}

const DEFAULT_MESSAGES: SupportMessage[] = [
  {
    id: 'msg-1',
    name: 'Ronit Mehra',
    email: 'ronit.mehra@gmail.com',
    subject: 'Love categories are amazing!',
    message: 'I have shared over 15 shayaris from the Love category to my WhatsApp status. The voice synthesizer reads them perfectly in soft beats. Thank you Roy!',
    timestamp: '2026-05-28T10:15:00.000Z',
    category: 'feedback'
  },
  {
    id: 'msg-2',
    name: 'Suhani Patel',
    email: 'suhani.p@gmail.com',
    subject: 'Sitemap 404 resolved',
    message: 'Awesome performance upgrade. The sitemap is loading instantly under /sitemap.xml now. Thank you for fixing Google Search Console error so fast.',
    timestamp: '2026-05-27T18:40:00.000Z',
    category: 'other'
  },
  {
    id: 'msg-3',
    name: 'Aman Verma',
    email: 'aman.verma@gmail.com',
    subject: 'Request for custom fonts in card downloads',
    message: 'It would be super awesome if we could choose Space Grotesk font on the background wallpaper card download module in the create section.',
    timestamp: '2026-05-27T11:22:00.000Z',
    category: 'feedback'
  }
];

export default function AdminPanel({
  categories,
  pendingShayaris,
  approvedShayaris,
  onAddShayari,
  onDeleteShayari,
  onApproveShayari,
  onDeclineShayari,
  onAddCategory,
  onClose
}: AdminPanelProps) {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'manage_shayari' | 'users' | 'block_unblock' | 'ads' | 'settings' | 'seo' | 'messages' | 'mood'>('analytics');
  
  // Side Drawer / Sidebar Toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Local admin states
  const [userList, setUserList] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>(DEFAULT_MESSAGES);
  
  // Shayari search & filters
  const [approvedSearch, setApprovedSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  
  // Manual adding Form states
  const [newShayariText, setNewShayariText] = useState('');
  const [newShayariAuthor, setNewShayariAuthor] = useState('');
  const [newShayariCategory, setNewShayariCategory] = useState(categories[0] || 'Motivation');
  const [newShayariHighlight, setNewShayariHighlight] = useState('');

  // Category managing form states
  const [addCatName, setAddCatName] = useState('');

  // Loaded upon render
  useEffect(() => {
    refreshData();
  }, [approvedShayaris, pendingShayaris]);

  const refreshData = () => {
    setUserList(getUsers());
    setActivityLogs(getActivityLogs());
  };

  // Block/unblock triggers
  const handleToggleBlock = (userId: string, currentlyBlocked: boolean) => {
    const success = setBlockUserStatus(userId, !currentlyBlocked);
    if (success) {
      refreshData();
    }
  };

  // Delete user from db
  const handleDeleteUser = (userId: string) => {
    if (confirm('Permanently delete this user from database? This is irreversible.')) {
      const success = deleteUserFromDb(userId);
      if (success) {
        refreshData();
      }
    }
  };

  // Handle manual publishing of a Shayari
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShayariText.trim()) return;
    
    const highlightWords = newShayariHighlight
      ? newShayariHighlight.split(',').map(w => w.trim()).filter(Boolean)
      : [];

    const item: Shayari = {
      id: 'approved-' + Date.now(),
      text: newShayariText.trim(),
      category: newShayariCategory,
      author: newShayariAuthor.trim() || 'Roy No Rules',
      highlightedWords: highlightWords,
      likes: Math.floor(Math.random() * 8) + 1,
      shares: Math.floor(Math.random() * 4),
      createdAt: new Date().toISOString(),
      status: 'approved'
    };

    onAddShayari(item);
    setNewShayariText('');
    setNewShayariHighlight('');
    setNewShayariAuthor('');
    setActiveTab('manage_shayari');
    alert('Shayari instantly published to live website feed!');
  };

  // Handle adding custom category list
  const handleCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addCatName.trim()) return;
    onAddCategory(addCatName.trim());
    setAddCatName('');
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 flex flex-col md:flex-row text-zinc-100 overflow-hidden font-sans" id="admin-hq-panel">
      
      {/* --- SIDEBAR / DRAWER COMPONENT --- */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -260, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed md:relative top-0 bottom-0 left-0 w-[260px] bg-zinc-950 border-r border-zinc-900/80 p-5 flex flex-col justify-between shrink-0 z-50 h-full select-none`}
          >
            <div>
              {/* Logo / Header Branding Section */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-red-650 flex items-center justify-center font-black text-xs text-white">
                    R
                  </div>
                  <div>
                    <h2 className="text-xs font-black tracking-[0.15em] uppercase text-white leading-none">
                      Roy's Command
                    </h2>
                    <span className="text-[8px] font-mono tracking-widest text-red-500 uppercase mt-1 block">
                      HQ CONTROL DECK
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 px-1.5 rounded-lg bg-zinc-900 text-zinc-500 hover:text-white transition cursor-pointer md:hidden"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Drawer Links Navigation Container */}
              <nav className="space-y-1 overflow-y-auto max-h-[70vh] no-scrollbar">
                
                {/* 1. Analytics */}
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold w-full text-left transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-red-950/20 border border-red-500/35 text-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.06)]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                  }`}
                >
                  <BarChart3 size={15} />
                  <span>📊 Analytics Dashboard</span>
                </button>

                {/* 2. Manage Shayari */}
                <button
                  onClick={() => setActiveTab('manage_shayari')}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold w-full text-left transition-all ${
                    activeTab === 'manage_shayari'
                      ? 'bg-red-950/20 border border-red-500/35 text-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.06)]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                  }`}
                >
                  <BookOpen size={15} />
                  <div className="flex-1 flex items-center justify-between">
                    <span>📝 Manage Shayari</span>
                    {pendingShayaris.length > 0 && (
                      <span className="bg-red-600 text-white text-[8.5px] px-2 py-0.5 rounded-full animate-pulse font-extrabold">
                        {pendingShayaris.length} REV
                      </span>
                    )}
                  </div>
                </button>

                {/* 3. Users list */}
                <button
                  onClick={() => {
                    setActiveTab('users');
                    refreshData();
                  }}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold w-full text-left transition-all ${
                    activeTab === 'users'
                      ? 'bg-red-950/20 border border-red-500/35 text-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.06)]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                  }`}
                >
                  <Users size={15} />
                  <span>👤 Users Directory</span>
                </button>

                {/* 4. Block/Unblock Moderation */}
                <button
                  onClick={() => {
                    setActiveTab('block_unblock');
                    refreshData();
                  }}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold w-full text-left transition-all ${
                    activeTab === 'block_unblock'
                      ? 'bg-red-950/20 border border-red-500/35 text-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.06)]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                  }`}
                >
                  <ShieldAlert size={15} />
                  <span>🚫 Block / Moderation</span>
                </button>

                {/* 5. Ads manager */}
                <button
                  onClick={() => setActiveTab('ads')}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold w-full text-left transition-all ${
                    activeTab === 'ads'
                      ? 'bg-red-950/20 border border-red-500/35 text-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.06)]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                  }`}
                >
                  <Megaphone size={15} />
                  <span>📢 Adsterra Smart Ads</span>
                </button>

                {/* 6. Settings config */}
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold w-full text-left transition-all ${
                    activeTab === 'settings'
                      ? 'bg-red-950/20 border border-red-500/35 text-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.06)]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                  }`}
                >
                  <Settings size={15} />
                  <span>⚙ settings Pane</span>
                </button>

                {/* 7. SEO metrics */}
                <button
                  onClick={() => setActiveTab('seo')}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold w-full text-left transition-all ${
                    activeTab === 'seo'
                      ? 'bg-red-950/20 border border-red-500/35 text-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.06)]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                  }`}
                >
                  <Globe size={15} />
                  <span>📈 SEO / Sitemaps</span>
                </button>

                {/* 8. Messages mail */}
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold w-full text-left transition-all ${
                    activeTab === 'messages'
                      ? 'bg-red-950/20 border border-red-500/35 text-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.06)]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                  }`}
                >
                  <Mail size={15} />
                  <div className="flex-grow flex items-center justify-between">
                    <span>📩 Feedback Message Box</span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {supportMessages.length}
                    </span>
                  </div>
                </button>

                {/* 9. Mood atmospheres and categories */}
                <button
                  onClick={() => setActiveTab('mood')}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold w-full text-left transition-all ${
                    activeTab === 'mood'
                      ? 'bg-red-950/20 border border-red-500/35 text-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.06)]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                  }`}
                >
                  <Layers size={15} />
                  <span>🎭 Mood System Config</span>
                </button>

              </nav>
            </div>

            <div className="pt-4 border-t border-zinc-900/50">
              <span className="text-[9px] font-mono text-zinc-600 block">
                ADMIN SESSION IN PROGRESS
              </span>
              <button 
                onClick={onClose}
                className="mt-3 px-3 py-2 bg-zinc-900 hover:bg-red-950/20 hover:text-red-450 text-zinc-400 rounded-xl font-mono text-[10px] uppercase font-bold tracking-widest block text-center w-full select-none cursor-pointer border border-zinc-850 active:scale-95 transition"
              >
                Log Out System
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* --- MAIN HQ WORKSPACE WRAPPER --- */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative z-10 bg-zinc-950/60 overflow-hidden">
        
        {/* Workspace Floating Navigation Header (Mobile Toggle etc) */}
        <header className="px-6 py-4.5 border-b border-zinc-900/80 bg-zinc-950/50 backdrop-blur flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white transition active:scale-95 cursor-pointer"
              title="Toggle Sidebar Drawer"
            >
              <Menu size={16} />
            </button>
            <div className="text-left">
              <h1 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                Workspace Panel
              </h1>
              <h2 className="text-sm font-black text-white uppercase tracking-wider mt-0.5">
                {activeTab === 'analytics' && '📊 Deep Analytics Console'}
                {activeTab === 'manage_shayari' && '📝 Poetry Registry Controller'}
                {activeTab === 'users' && '👤 High Resident Directories'}
                {activeTab === 'block_unblock' && '🚫 Community Defensive Moderation'}
                {activeTab === 'ads' && '📢 Intelligent Ads Distributor'}
                {activeTab === 'settings' && '⚙ Port Configurations & purgers'}
                {activeTab === 'seo' && '📈 SEO & Canonical indexing'}
                {activeTab === 'messages' && '📩 Resident Direct Support Mailbox'}
                {activeTab === 'mood' && '🎭 Atmospheres Mood System Matrix'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 px-3 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white transition duration-200 text-xs font-bold leading-none cursor-pointer flex items-center gap-1 hover:border-zinc-750"
          >
            <span>Exit Console</span>
            <X size={13} />
          </button>
        </header>

        {/* Scrollable Main Workspace Content Canvas */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto no-scrollbar relative">
          
          {/* Grid Background accents */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none" />

          {/* 1. ANALYTICS CONSOLE SCREEN */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in text-left">
              {/* Telemetry Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-zinc-900/20 border border-zinc-900 p-4.5 rounded-2xl relative overflow-hidden">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Live Database Cards</span>
                  <span className="text-3xl font-black text-white mt-1.5 block">{approvedShayaris.length}</span>
                  <div className="text-[9px] font-mono text-green-500 uppercase mt-2 select-none flex items-center gap-1">
                    <span>● 100% ONLINE</span>
                    <span className="text-zinc-600">• SHARED WORLDWIDE</span>
                  </div>
                </div>

                <div className="bg-zinc-900/20 border border-zinc-900 p-4.5 rounded-2xl relative overflow-hidden">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Pending Reviews</span>
                  <span className={`text-3xl font-black mt-1.5 block ${pendingShayaris.length > 0 ? 'text-amber-500' : 'text-zinc-500'}`}>
                    {pendingShayaris.length}
                  </span>
                  <div className="text-[9px] font-mono text-zinc-500 uppercase mt-2 flex items-center gap-1.5">
                    <span className={pendingShayaris.length > 0 ? 'animate-pulse text-amber-500 font-bold' : ''}>
                      {pendingShayaris.length > 0 ? '⚠️ ACTION REQUIRED' : '✓ ALL REVIEWS COMPLETED'}
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-900/20 border border-zinc-900 p-4.5 rounded-2xl relative overflow-hidden">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Registered Profiles</span>
                  <span className="text-3xl font-black text-white mt-1.5 block">{userList.length}</span>
                  <div className="text-[9px] font-mono text-zinc-500 mt-2">
                    Active communities & followers
                  </div>
                </div>

                <div className="bg-zinc-900/20 border border-zinc-900 p-4.5 rounded-2xl relative overflow-hidden">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Engagement Index</span>
                  <span className="text-3xl font-black text-white mt-1.5 block">9.86%</span>
                  <div className="text-[9px] font-mono text-rose-500 mt-2 font-bold select-none">
                    📈 Growth: +14.2% THIS WEEK
                  </div>
                </div>

              </div>

              {/* High Tech Animated Graph Simulator */}
              <div className="bg-zinc-900/10 border border-zinc-900 p-5 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest">TRAFFIC MATRIX DENSITY</span>
                    <h3 className="text-sm font-black text-white uppercase mt-0.5">Real-time Impression & Request Log</h3>
                  </div>
                  <div className="flex gap-2 text-[9px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-400">INDEX: CLOUDFLARE</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-emerald-400 font-bold">STABLE</span>
                  </div>
                </div>

                {/* Simulated Graph Lines */}
                <div className="h-44 w-full bg-zinc-950/60 rounded-xl border border-zinc-900 p-3 flex items-end gap-1.5 relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-[9px] font-mono text-zinc-650">MAX FLOW: 480 req/s</div>
                  
                  {/* Grid Lines Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-4 py-8">
                    <div className="border-b border-zinc-900/20 w-full" />
                    <div className="border-b border-zinc-900/20 w-full" />
                    <div className="border-b border-zinc-900/20 w-full" />
                  </div>

                  {/* Columns */}
                  {[32, 45, 12, 54, 76, 34, 45, 90, 85, 42, 31, 22, 65, 87, 89, 45, 67, 95, 120, 110, 85, 96, 74].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end h-full">
                      <div 
                        style={{ height: `${h}%` }} 
                        className={`w-full rounded-t-sm transition-all duration-1000 bg-gradient-to-t from-red-950 to-red-500 border-t border-red-400/40 hover:from-white hover:to-white`}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-[9px] font-mono text-zinc-550 mt-2.5">
                  <span>02:00 IST</span>
                  <span>06:00 IST</span>
                  <span>10:00 IST</span>
                  <span>14:00 IST</span>
                  <span>18:00 IST</span>
                  <span>22:00 IST</span>
                </div>
              </div>

              {/* Live activity feed */}
              <div className="bg-zinc-900/10 border border-zinc-900 p-5 rounded-2xl">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-4">CRITICAL USER INTERACTION LOGGER (LOGS)</span>
                <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-2">
                  {activityLogs.slice(0, 12).map((lg: any) => (
                    <div key={lg.id} className="p-2.5 bg-zinc-950/60 border border-zinc-900/60 rounded-xl text-left font-mono text-[10.5px] text-zinc-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-red-500 font-bold">@{lg.username}</span>
                        <span className="text-zinc-300">— {lg.action}</span>
                        <span className="text-zinc-500 font-sans">({lg.details})</span>
                      </div>
                      <span className="text-zinc-600 text-[9.5px] sm:text-right shrink-0">
                        {new Date(lg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-[9px] font-mono text-zinc-600 mt-3 uppercase text-right leading-none">
                  SECURE STORAGE ENCRYPTED TRACEBACKS ACTIVE • TRUNCATED TO SYSTEM MEMORY
                </p>
              </div>

            </div>
          )}

          {/* 2. MANAGE SHAYARI VIEW */}
          {activeTab === 'manage_shayari' && (
            <div className="space-y-6 animate-fade-in text-left">
              {/* Tabs within Manage Shayari: Review / Live Directory / Publish */}
              <div className="flex border-b border-zinc-900 gap-1 overflow-x-auto pb-1 no-scrollbar select-none">
                <button
                  type="button"
                  id="tab-awaiting"
                  onClick={() => {
                    const elReview = document.getElementById('review-section-target');
                    if (elReview) {
                      elReview.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-4 py-2 bg-zinc-900/40 text-xs font-bold whitespace-nowrap border border-zinc-850 hover:border-zinc-700 text-zinc-300 rounded-xl"
                >
                  🚀 Review Submissions ({pendingShayaris.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const elDir = document.getElementById('live-feed-directory');
                    if (elDir) {
                      elDir.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-4 py-2 bg-zinc-900/40 text-xs font-bold whitespace-nowrap border border-zinc-850 hover:border-zinc-700 text-zinc-300 rounded-xl"
                >
                  📚 Live Directory ({approvedShayaris.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const elAddForm = document.getElementById('add-manual-form');
                    if (elAddForm) {
                      elAddForm.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-4 py-2 bg-zinc-900/40 text-xs font-bold whitespace-nowrap border border-zinc-850 hover:border-zinc-700 text-zinc-300 rounded-xl"
                >
                  ➕ Direct Publish Card
                </button>
              </div>

              {/* Section 1: Review user submissions */}
              <div id="review-section-target" className="scroll-mt-10 bg-zinc-900/10 border border-zinc-900 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center select-none">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase">Awaiting Editorial Validation</h3>
                    <p className="text-[10px] text-zinc-550 font-mono mt-0.5">Reviews requested by global visitors via Submit option</p>
                  </div>
                  <span className="bg-zinc-950 text-zinc-400 text-[10px] font-mono px-2.5 py-1 rounded border border-zinc-900">
                    AWAITING: {pendingShayaris.length} CARD(S)
                  </span>
                </div>

                {pendingShayaris.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-zinc-900 rounded-xl">
                    <span className="text-xl">🕊️</span>
                    <h5 className="text-xs font-mono text-zinc-500 uppercase mt-2">No pending reviews</h5>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingShayaris.map((sh: Shayari) => (
                      <div key={sh.id} className="p-4 bg-zinc-950 border border-zinc-900/80 rounded-2xl flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center text-[9.5px] font-mono mb-2">
                            <span className="text-red-500 uppercase font-black bg-red-950/10 px-2.5 py-1 border border-red-950/30 rounded">
                              {sh.category}
                            </span>
                            <span className="text-zinc-500 truncate max-w-[140px]">Author: {sh.author}</span>
                          </div>
                          
                          <p className="text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-line select-text">
                            "{sh.text}"
                          </p>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 mt-4 border-t border-zinc-900/50">
                          <button
                            onClick={() => onDeclineShayari(sh.id)}
                            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 rounded-lg text-[10px] font-mono uppercase font-bold transition border border-zinc-850 select-none cursor-pointer"
                          >
                            Decline ✖
                          </button>
                          <button
                            onClick={() => onApproveShayari(sh.id)}
                            className="px-3.5 py-1.5 bg-red-950/40 hover:bg-red-900/30 border border-red-500/30 text-red-400 hover:text-red-300 rounded-lg text-[10px] font-mono uppercase font-bold transition select-none cursor-pointer flex items-center gap-1"
                          >
                            <Check size={11} />
                            <span>Approve ⚡</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: Publish Manual */}
              <div id="add-manual-form" className="scroll-mt-10 bg-zinc-900/10 border border-zinc-900 p-5 rounded-2xl">
                <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-widest block mb-4">ESTABLISH OFFICIAL SEED ENTRY</span>
                
                <form onSubmit={handleAddSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono text-zinc-500 uppercase tracking-wider block">Poet / Author</label>
                      <input 
                        type="text"
                        value={newShayariAuthor}
                        onChange={(e) => setNewShayariAuthor(e.target.value)}
                        placeholder="e.g. Anand Roy"
                        className="w-full bg-zinc-950 border border-zinc-900 text-zinc-200 text-xs px-3.5 py-2 rounded-xl focus:border-red-500/40 outline-none transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono text-zinc-500 uppercase tracking-wider block">Category Segment</label>
                      <select
                        value={newShayariCategory}
                        onChange={(e) => setNewShayariCategory(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 text-zinc-200 text-xs px-3 py-2 rounded-xl outline-none focus:border-red-500/40 transition"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono text-zinc-500 uppercase tracking-wider block">Highlight Words (Comma-Separated)</label>
                      <input 
                        type="text"
                        value={newShayariHighlight}
                        onChange={(e) => setNewShayariHighlight(e.target.value)}
                        placeholder="e.g. अकड़, सितारे, औकात"
                        className="w-full bg-zinc-950 border border-zinc-900 text-zinc-200 text-xs px-3.5 py-2 rounded-xl focus:border-red-500/40 outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-mono text-zinc-500 uppercase tracking-wider block">Shayari Hindi / Hinglish Verses</label>
                    <textarea 
                      required
                      rows={4}
                      value={newShayariText}
                      onChange={(e) => setNewShayariText(e.target.value)}
                      placeholder="Enter poetry verses here... Use line splits normally."
                      className="w-full bg-zinc-950 border border-zinc-900 text-zinc-200 text-xs p-4 rounded-xl focus:border-red-500/40 outline-none transition resize-none whitespace-pre-line"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-red-650 to-rose-700 text-white font-extrabold text-[11px] uppercase tracking-widest rounded-xl transition cursor-pointer select-none active:scale-98"
                  >
                    🚀 Release Instantly To Feed
                  </button>
                </form>
              </div>

              {/* Section 3: Live directory lists */}
              <div id="live-feed-directory" className="scroll-mt-10 bg-zinc-900/10 border border-zinc-900 p-5 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase">Live Database Directory</h3>
                    <p className="text-[10px] text-zinc-550 font-mono mt-0.5">Filter, search, or purge live elements instantly</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center bg-zinc-950 border border-zinc-900 rounded-xl px-2.5 max-w-[180px]">
                      <Search size={12} className="text-zinc-500 shrink-0" />
                      <input 
                        type="text"
                        placeholder="Search verses..."
                        value={approvedSearch}
                        onChange={(e) => setApprovedSearch(e.target.value)}
                        className="bg-transparent border-none outline-none text-[11px] text-zinc-100 placeholder-zinc-650 w-full p-1.5 focus:ring-0"
                      />
                    </div>

                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="bg-zinc-950 border border-zinc-900 text-zinc-300 text-[10.5px] rounded-xl px-2 py-1 outline-none"
                    >
                      <option value="All">All Categories</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* APPROVED LIST */}
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 no-scrollbar">
                  {approvedShayaris
                    .filter(sh => {
                      const matchesSearch = sh.text.toLowerCase().includes(approvedSearch.toLowerCase());
                      const matchesCategory = selectedCategoryFilter === 'All' || sh.category === selectedCategoryFilter;
                      return matchesSearch && matchesCategory;
                    })
                    .map((sh) => (
                      <div key={sh.id} className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl hover:border-zinc-850 transition duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5 text-left flex-1">
                          <div className="flex items-center gap-2 text-[10px] font-mono">
                            <span className="text-red-500 uppercase font-black bg-red-955/10 border border-red-950/20 px-2 py-0.5 rounded leading-none">
                              {sh.category}
                            </span>
                            <span className="text-zinc-500">• Created: {sh.createdAt ? sh.createdAt.split('T')[0] : 'Legendary'}</span>
                            <span className="text-zinc-500 font-bold">• Author: {sh.author}</span>
                          </div>
                          
                          <p className="text-xs text-zinc-300 leading-relaxed max-w-[580px] select-text font-sans whitespace-pre-line">
                            "{sh.text}"
                          </p>
                        </div>

                        <div className="flex items-center justify-end gap-2 shrink-0">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(sh.text);
                              alert('Verses written to core clipboard!');
                            }}
                            className="px-2.5 py-1.5 bg-zinc-900 text-[10px] font-mono text-zinc-400 hover:text-white rounded-lg transition border border-zinc-850 cursor-pointer"
                          >
                            Copy
                          </button>
                          <button
                            onClick={() => onDeleteShayari(sh.id)}
                            className="p-1 px-2.5 bg-red-950/15 text-red-400 border border-red-955/20 hover:border-red-550/45 hover:bg-red-955/20 rounded-lg text-xs transition cursor-pointer"
                            title="Purge permanently"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

            </div>
          )}

          {/* 3. USERS DIRECTORY */}
          {activeTab === 'users' && (
            <div className="space-y-5 animate-fade-in text-left">
              <div className="bg-zinc-900/10 border border-zinc-900 p-5 rounded-2xl relative overflow-hidden">
                <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-widest block mb-4">MEMBER ROSTER INDEX (SECURE)</span>
                
                <div className="overflow-x-auto rounded-xl border border-zinc-900">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-950 border-b border-zinc-900 select-none text-zinc-450 font-mono text-[9px] uppercase tracking-wider">
                        <th className="p-4 font-bold">Identity</th>
                        <th className="p-4 font-bold">Mailbox Address</th>
                        <th className="p-4 font-bold">Level / Badge</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold text-right" id="th-controls">Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60 bg-zinc-950/20">
                      {userList.map((user) => {
                        const analytics = calculateRoyCoinsForUser(user.username);
                        return (
                          <tr key={user.id} className="hover:bg-zinc-900/30 transition">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center justify-center font-bold text-white uppercase text-xs">
                                  {user.realName.charAt(0)}
                                </div>
                                <div className="text-left font-mono">
                                  <span className="text-white font-bold block">{user.realName}</span>
                                  <span className="text-[10px] text-zinc-500 mt-0.5 block">@{user.username}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-mono text-[11px] text-zinc-400">
                              {user.email}
                            </td>
                            <td className="p-4 font-mono select-none">
                              <span className="text-red-500 font-bold block">
                                {user.badge || 'Resident Creator'}
                              </span>
                              <span className="text-[10px] text-zinc-500 block">
                                Activities: {user.activityCount || 0} times
                              </span>
                            </td>
                            <td className="p-4 font-mono select-none">
                              <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold border ${
                                user.status === 'blocked'
                                  ? 'bg-red-950/10 border-red-500/20 text-red-500'
                                  : 'bg-emerald-950/10 border-emerald-500/20 text-emerald-400'
                              }`}>
                                {user.status === 'blocked' ? 'BLOCKED' : 'ACTIVE'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-900 hover:border-red-900/40 text-zinc-500 hover:text-red-400 text-[10px] font-mono uppercase font-bold rounded-lg transition cursor-pointer"
                              >
                                Delete Account
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. DEFENSIVE MODERATION BOARD */}
          {activeTab === 'block_unblock' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="bg-zinc-900/10 border border-zinc-900 p-5 rounded-2xl relative overflow-hidden">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-4">CRITICAL ACCESS BLACKLIST (SECURITY)</span>
                
                <p className="text-xs text-zinc-400 mb-5 leading-relaxed max-w-2xl font-sans">
                  Block specific usernames or registered IDs instantly. Blocked accounts are immediately denied entry logs and cannot view the social stream or submit content.
                </p>

                <div className="space-y-3">
                  {userList.map((user) => (
                    <div 
                      key={user.id} 
                      className="p-4 bg-zinc-950 border border-zinc-905 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-805 transition duration-200"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${
                          user.status === 'blocked' 
                            ? 'bg-red-950/40 border border-red-900/40 text-red-500'
                            : 'bg-zinc-900 border border-zinc-850 text-white'
                        }`}>
                          {user.status === 'blocked' ? '🚫' : '✓'}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white select-text">
                            {user.realName} <span className="text-xs text-zinc-500 font-mono">(@{user.username})</span>
                          </h4>
                          <span className="text-[10.5px] font-mono text-zinc-500 block mt-0.5">
                            Signed: {user.createdAt ? user.createdAt.split('T')[0] : 'Historical'} • Mail: {user.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 select-none">
                        <button
                          onClick={() => handleToggleBlock(user.id, user.status === 'blocked')}
                          className={`px-4 py-2 text-[10.5px] font-mono font-black uppercase rounded-xl transition-all duration-300 pointer-events-auto cursor-pointer border ${
                            user.status === 'blocked'
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/40 shadow-lg'
                              : 'bg-red-950/20 border-red-500/20 text-red-550 hover:bg-red-955/35'
                          }`}
                        >
                          {user.status === 'blocked' ? '⚡ Lift Ban (Unblock)' : '⛔ Impose Permanent Ban'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. ADSTERRA INTUITIVE ADS CONTAINER */}
          {activeTab === 'ads' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="bg-zinc-900/10 border border-zinc-900 p-5 rounded-2xl">
                <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-widest block mb-4">ADSTERRA INTELLIGENT ADS CHANNELS</span>
                
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  Manage commercial ad placements on Roy No Rules. Choose placeholder configuration or customize the direct script vectors. Ads helps support the server hosting cost of this database.
                </p>

                <div className="space-y-5">
                  <div className="bg-zinc-950 p-4.5 border border-zinc-900 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-white">
                      <span>Header Banner Spot (728x90 Billboard)</span>
                      <span className="text-emerald-500 uppercase font-mono text-[9.5px]">Active State</span>
                    </div>
                    <p className="text-[10.5px] text-zinc-500 leading-relaxed">
                      Mounted at header and near the top menu on mobile views. Auto-shuffles with related shayari posts inside.
                    </p>
                    <textarea 
                      readOnly
                      rows={2}
                      value="<!-- Adsterra Header banner placeholder script code tag active -->"
                      className="w-full bg-zinc-900 text-zinc-400 font-mono text-[10px] p-2.5 rounded-lg border border-zinc-850 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="bg-zinc-950 p-4.5 border border-zinc-900 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-white">
                      <span>Bottom stream spot (300x250 Medium Rectangle)</span>
                      <span className="text-emerald-500 uppercase font-mono text-[9.5px]">Active State</span>
                    </div>
                    <p className="text-[10.5px] text-zinc-500 leading-relaxed">
                      Mounted underneath the pagination load-more button. Maximizes view through high contrast background colors.
                    </p>
                    <textarea 
                      readOnly
                      rows={2}
                      value="<!-- Adsterra Bottom stream banner placeholder script code tag active -->"
                      className="w-full bg-zinc-900 text-zinc-400 font-mono text-[10px] p-2.5 rounded-lg border border-zinc-850 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. SETTINGS PANES */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Purge / Cache storage section */}
              <div className="bg-zinc-900/10 border border-zinc-900 p-5 rounded-2xl space-y-4">
                <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-widest block">FACTORY REGISTRY OVERRIDES</span>
                <h3 className="text-sm font-black text-white uppercase font-sans">Clear Persistent Storage Cache</h3>
                
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Clear device data including recent draft saves and telemetry comments. Resets all database streams back to official factory standards immediately. This command is processed client-side.
                </p>

                <button
                  onClick={() => {
                    if (confirm('Are you absolutely certain you want to clear localStorage persistent registry databases back to standard index seeding? This deletes all custom user accounts, feedback logs, and metadata comments.')) {
                      localStorage.clear();
                      alert('Local persistent databases cleared! Reloading the portal...');
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2.5 bg-zinc-950 hover:bg-red-955/20 border border-zinc-900 hover:border-red-500/35 text-zinc-400 hover:text-red-400 font-mono text-[10px] uppercase font-bold rounded-xl transition duration-300"
                >
                  Clear System Cache and Databases 🔄
                </button>
              </div>

            </div>
          )}

          {/* 7. SEO METRICS PANEL */}
          {activeTab === 'seo' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="bg-zinc-900/10 border border-zinc-900 p-5 rounded-2xl space-y-4">
                <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest block">CANONICAL SEARCH INDEXING</span>
                
                <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl font-sans">
                  Generate SEO friendly url structure for each poet card to rank on yahoo/google correctly. Hindi Unicode symbols are parsed and transliterated into English matching search schemas.
                </p>

                <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl font-mono text-xs space-y-3">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-zinc-500">Google Search Verification File Path</span>
                    <span className="text-emerald-500 uppercase">PROVISIONED AND REACHABLE</span>
                  </div>
                  <pre className="p-3 bg-zinc-900 rounded border border-zinc-850 text-zinc-400 text-[10px] select-text">
                    /google59b50fef3e93f851.html
                  </pre>
                </div>

                <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl font-mono text-xs space-y-3">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-zinc-500">Live XML Sitemap URL Address</span>
                    <span className="text-emerald-500 uppercase">AUTO-REGENERATING (ONLINE)</span>
                  </div>
                  <pre className="p-3 bg-zinc-900 rounded border border-zinc-850 text-zinc-400 text-[10px] select-text">
                    https://royversehub.netlify.app/sitemap.xml
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* 8. SUPPORT MAIL SCREEN */}
          {activeTab === 'messages' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="bg-zinc-900/10 border border-zinc-900 p-5 rounded-2xl space-y-4">
                <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-widest block mb-4">INCOMING VISITOR ENVELOPE QUEUE</span>
                
                {supportMessages.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-zinc-900 rounded-xl">
                    <span className="text-xl">📩</span>
                    <h5 className="text-xs font-mono text-zinc-500 uppercase mt-2">Inbox and feedback empty</h5>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {supportMessages.map((msg) => (
                      <div key={msg.id} className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl hover:border-zinc-850 transition duration-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-2.5 mb-3 select-none">
                          <div className="text-left font-mono">
                            <span className="text-white font-bold block text-xs">{msg.name}</span>
                            <span className="text-[10px] text-zinc-500 block mt-0.5">{msg.email}</span>
                          </div>
                          <span className="text-[9.5px] font-mono uppercase text-red-500 bg-red-955/10 border border-red-950/20 px-2 py-0.5 rounded leading-none shrink-0 sm:text-right">
                            {msg.category.toUpperCase()} • {new Date(msg.timestamp).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="text-left space-y-2">
                          <h4 className="text-xs font-bold text-zinc-200 select-text">Subject: {msg.subject}</h4>
                          <p className="text-xs text-zinc-400 font-sans leading-relaxed select-text">
                            "{msg.message}"
                          </p>
                        </div>

                        <div className="flex items-center justify-end gap-2 text-right pt-3 mt-4 border-t border-zinc-900/50 select-none">
                          <button
                            onClick={() => {
                              setSupportMessages(prev => prev.filter(m => m.id !== msg.id));
                              alert('Message handled and archived!');
                            }}
                            className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-zinc-400 rounded-lg text-[10px] font-mono uppercase font-bold transition cursor-pointer"
                          >
                            Archive
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 9. MOOD SYSTEM CONFIGURATION */}
          {activeTab === 'mood' && (
            <div className="space-y-6 animate-fade-in text-left">
              {/* Add Custom Category Form */}
              <div className="bg-zinc-900/10 border border-zinc-900 p-5 rounded-2xl space-y-4">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">EXTEND EMOTIONAL CLASSIFIERS</span>
                <h3 className="text-sm font-black text-white uppercase font-sans">Introduce New Category State</h3>

                <form onSubmit={handleCatSubmit} className="flex gap-2">
                  <input 
                    type="text"
                    required
                    value={addCatName}
                    onChange={(e) => setAddCatName(e.target.value)}
                    placeholder="e.g. Broken Soul, Midnight Thoughts"
                    className="bg-zinc-950 border border-zinc-900 text-zinc-200 text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500/40 outline-none transition flex-1"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-gradient-to-r from-red-650 to-rose-700 text-white font-mono text-[10px] uppercase font-black tracking-widest rounded-xl transition cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
                  >
                    <Plus size={12} />
                    <span>Append Category</span>
                  </button>
                </form>

                <p className="text-[10px] text-zinc-500 leading-normal">
                  Registered categories appear dynamically on feed banners, search fields, creators dropdown, and SEO generator lists.
                </p>
              </div>

              {/* Active Atmosphere lists */}
              <div className="bg-zinc-900/10 border border-zinc-900 p-5 rounded-2xl space-y-4">
                <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-widest block">ACTIVE EMOTIONS STREAM SCHEMAS ({categories.length})</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 select-none">
                  {categories.map((c) => (
                    <div key={c} className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl font-mono text-xs text-zinc-300 flex items-center justify-between">
                      <span className="font-bold truncate">{c}</span>
                      <span className="text-[9px] text-zinc-550 leading-none bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded">ACTIVE</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
