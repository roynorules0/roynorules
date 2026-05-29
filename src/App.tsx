import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Plus, ShieldCheck, Check, Info, Award, Calendar, Clock, RefreshCw, Compass, Menu, Search, MessageSquare, Lock, User as UserIcon, ArrowRight } from 'lucide-react';

import { Shayari, User } from './types';
import { defaultShayaris, defaultCategories } from './data/defaultShayaris';
import ParticlesBg from './components/ParticlesBg';
import CategorySlider from './components/CategorySlider';
import ShayariCard from './components/ShayariCard';
import SubmitModal from './components/SubmitModal';
import AdminPanel from './components/AdminPanel';
import AdminUnlockPopup from './components/AdminUnlockPopup';
import ImageGeneratorModal from './components/ImageGeneratorModal';
import VoiceShayariPlayer from './components/VoiceShayariPlayer';
import MoodSelector, { MOODS_METADATA } from './components/MoodSelector';
import SearchByFeeling from './components/SearchByFeeling';
import IntroScreen from './components/IntroScreen';
import TrustPages from './components/TrustPages';
import { X } from 'lucide-react';

import { initializeCommunityDb, getCurrentUser, logoutUser, logUserActivity } from './utils/communityDb';
import AuthModal from './components/AuthModal';
import TopUsersList from './components/TopUsersList';
import UserProfileModal from './components/UserProfileModal';
import MoreMenuModal from './components/MoreMenuModal';
import PremiumAdContainer from './components/PremiumAdContainer';

// Next-Gen V4 Premium Components
import ImmersiveReadingMode from './components/ImmersiveReadingMode';
import FeelingsWall from './components/FeelingsWall';
import TodaysFeelingPrompt from './components/TodaysFeelingPrompt';

// Dynamic SEO-ranking assets
import TrendingToday from './components/TrendingToday';
import EmotionalBlogs from './components/EmotionalBlogs';

import { emotionalQuestionPages, EmotionalQuestionPage } from './data/emotionalQuestions';
import EmotionalQuestionPageContainer from './components/EmotionalQuestionPageContainer';
import CreateHubModal from './components/CreateHubModal';
import MoodPostModal from './components/MoodPostModal';

// SEO & Performance upgrade assets
import { generateShayariSlug, generateDynamicMeta, syncDynamicMetaToDom } from './utils/seo';

export default function App() {
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      return p === '/' || p === '';
    }
    return true;
  });

  // Trust Page SEO & URL Routing states
  const [currentTrustPath, setCurrentTrustPath] = useState<string | null>(() => {
    const paths = ['/about-us', '/privacy-policy', '/terms-and-conditions', '/disclaimer', '/contact-us'];
    return paths.includes(window.location.pathname) ? window.location.pathname : null;
  });

  // 1. Data States (Loaded from LocalStorage or Default list)
  const [approvedList, setApprovedList] = useState<Shayari[]>(() => {
    const saved = localStorage.getItem('roynorules_approved_shayaris');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length < defaultShayaris.length) {
          return defaultShayaris;
        }
        return parsed;
      } catch (err) {
        return defaultShayaris;
      }
    }
    return defaultShayaris;
  });

  const [pendingList, setPendingList] = useState<Shayari[]>(() => {
    const saved = localStorage.getItem('roynorules_pending_shayaris');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('roynorules_categories');
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  // 2. Interactive Navigation States
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem('roynorules_last_category') || 'All';
  });
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('roynorules_saved_ids');
    return saved ? JSON.parse(saved) : [];
  });

  // 2a. Emotional Mood Based State (Loaded/persisted through localStorage)
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(() => {
    return localStorage.getItem('roynorules_selected_mood');
  });

  // 2b. Floating Mini Player & Continue Reading States
  const [activeMiniPlayerShayari, setActiveMiniPlayerShayari] = useState<Shayari | null>(() => {
    const saved = localStorage.getItem('roynorules_last_viewed_shayari');
    return saved ? JSON.parse(saved) : null;
  });

  const [moodRecommendationSort, setMoodRecommendationSort] = useState<'all' | 'trending' | 'most_saved' | 'recent'>('all');

  // 3. Indian Live Date & Time State
  const [istTime, setIstTime] = useState('');
  const [istDate, setIstDate] = useState('');

  // 4. Modal and Control States
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isUnlockPopupOpen, setIsUnlockPopupOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [imageStudioShayari, setImageStudioShayari] = useState<Shayari | null>(null);
  const [activeVoiceShayari, setActiveVoiceShayari] = useState<Shayari | null>(null);

  // 4a. User Account States (NEW)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedProfileUsername, setSelectedProfileUsername] = useState<string | null>(null);
  const [activityTrigger, setActivityTrigger] = useState(0);

  // Next-Gen V4 Subsystem States
  const [immersiveShayari, setImmersiveShayari] = useState<Shayari | null>(null);
  const [isFeelingsWallOpen, setIsFeelingsWallOpen] = useState(false);
  const [showFeelingPrompt, setShowFeelingPrompt] = useState(false);
  const [isLateNightMode, setIsLateNightMode] = useState(false);
  const [activeEmotionalPage, setActiveEmotionalPage] = useState<EmotionalQuestionPage | null>(null);
  const [isCreateHubOpen, setIsCreateHubOpen] = useState(false);
  const [isMoodPostOpen, setIsMoodPostOpen] = useState(false);

  useEffect(() => {
    initializeCommunityDb();
    const active = getCurrentUser();
    setCurrentUser(active);
  }, [activityTrigger]);
  const [isAutoShuffleOn, setIsAutoShuffleOn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedShayaris, setSearchedShayaris] = useState<Shayari[] | null>(null);

  // 5. Admin Secret 3-second hold trigger state
  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef<number | null>(null);

  // 6. Controlled Feed Pagination
  const [visibleList, setVisibleList] = useState<Shayari[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [isFeedLoading, setIsFeedLoading] = useState(false);

  // 7. General Application Toast state (to hold dynamic system notification alerts)
  const [toastMessage, setToastMessage] = useState('');

  // Adsterra states listener
  const [adsConfig, setAdsConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('roynorules_ads_config');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('roynorules_ads_config');
        if (saved) setAdsConfig(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('roynorules_ads_updated', handleUpdate);
    return () => window.removeEventListener('roynorules_ads_updated', handleUpdate);
  }, []);

  // Sync state modifications to LocalStorage
  useEffect(() => {
    localStorage.setItem('roynorules_approved_shayaris', JSON.stringify(approvedList));
  }, [approvedList]);

  useEffect(() => {
    localStorage.setItem('roynorules_pending_shayaris', JSON.stringify(pendingList));
  }, [pendingList]);

  useEffect(() => {
    localStorage.setItem('roynorules_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('roynorules_saved_ids', JSON.stringify(savedIds));
  }, [savedIds]);

  useEffect(() => {
    if (selectedMoodId) {
      localStorage.setItem('roynorules_selected_mood', selectedMoodId);
    } else {
      localStorage.removeItem('roynorules_selected_mood');
    }
  }, [selectedMoodId]);

  useEffect(() => {
    localStorage.setItem('roynorules_last_category', selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    if (activeMiniPlayerShayari) {
      localStorage.setItem('roynorules_last_viewed_shayari', JSON.stringify(activeMiniPlayerShayari));
    } else {
      localStorage.removeItem('roynorules_last_viewed_shayari');
    }
  }, [activeMiniPlayerShayari]);


  // Effect to handle Indian Clock Standard IST (Asia/Kolkata)
  useEffect(() => {
    const updateTime = () => {
      const timeOpts = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit' as const,
        minute: '2-digit' as const,
        second: '2-digit' as const,
        hour12: true,
      };
      const dateOpts = {
        timeZone: 'Asia/Kolkata',
        weekday: 'short' as const,
        year: 'numeric' as const,
        month: 'short' as const,
        day: 'numeric' as const,
      };
      const now = new Date();
      setIstTime(now.toLocaleTimeString('en-US', timeOpts));
      setIstDate(now.toLocaleDateString('en-US', dateOpts));

      // Dynamic Late-Night Check matching Asia/Kolkata (IST) Hour (23:00 to 04:00)
      try {
        const kolkataStr = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false });
        const kolkataHour = parseInt(kolkataStr, 10);
        const lNight = kolkataHour >= 23 || kolkataHour < 4;
        setIsLateNightMode(lNight);
      } catch (e) {
        const locHour = now.getHours();
        setIsLateNightMode(locHour >= 23 || locHour < 4);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Synchronize with server-side database for global Community & SEO entries
  useEffect(() => {
    fetch('/api/community-db')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Server unreachable');
      })
      .then(data => {
        if (data) {
          // Merge approved ones from server while keeping safe default ones
          setApprovedList(prev => {
            const merged = [...data.approved];
            // Make sure all default ones remain intact
            defaultShayaris.forEach(ds => {
              if (!merged.some(s => s.id === ds.id)) {
                merged.push(ds);
              }
            });
            return merged;
          });

          if (Array.isArray(data.pending)) {
            setPendingList(data.pending);
          }

          if (Array.isArray(data.categories)) {
            setCategories(prev => {
              return Array.from(new Set([...defaultCategories, ...data.categories]));
            });
          }
        }
      })
      .catch(err => {
        console.warn('Sync server database offline/fallback ready:', err);
      });
  }, []);

  // Master SEO Indexing System Hook
  useEffect(() => {
    let title = 'Roy No Rules | Premium Hindi & Hinglish Shayari';
    let description = 'Discover premium Hinglish emotional shayari, motivation, attitude customizer, free recitation players, and premium HD wallpaper creation studio.';
    const domain = window.location.origin || 'https://roynorules.com';
    let canonical = domain + '/';

    if (currentTrustPath) {
      switch (currentTrustPath) {
        case '/about-us':
          title = 'About Our Sanctuary | Roy No Rules';
          description = 'Learn about Roy No Rules shayari sanctuary, emotional dark aesthetics, and our community.';
          break;
        case '/privacy-policy':
          title = 'Privacy Safeguards | Roy No Rules';
          description = 'Full details on local-first secure client states and cookies privacy policies.';
          break;
        case '/terms-and-conditions':
          title = 'Terms & Conditions | Roy No Rules';
          description = 'Respectful conduct guidelines, copyright standards, and community moderator rules.';
          break;
        case '/disclaimer':
          title = 'Creative Disclaimers | Roy No Rules';
          description = 'Intellectual property and copyright claims disclaimers for fan-made shayaris.';
          break;
        case '/contact-us':
          title = 'Contact Us Direct | Roy No Rules';
          description = 'Get in touch with us at +91 9027671630 or email roynoruless@gmail.com for support.';
          break;
      }
      canonical = domain + currentTrustPath;
    } else if (immersiveShayari) {
      const meta = generateDynamicMeta(immersiveShayari, domain);
      title = meta.title;
      description = meta.description;
      const slugPath = generateShayariSlug(immersiveShayari);
      canonical = domain + '/' + slugPath;
      // Inject standard meta in DOM
      syncDynamicMetaToDom(meta);
    } else if (selectedCategory && selectedCategory !== 'All') {
      title = `${selectedCategory} Shayari & Status | Roy No Rules`;
      description = `Find the ultimate handpicked list of premium ${selectedCategory} Shayari, emotional status lines, and HD wallpaper downloads on Roy No Rules.`;
      canonical = domain + '/' + selectedCategory.toLowerCase().replace(/\s+/g, '-');
    }

    // Update document head elements
    document.title = title;

    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Canonical link
    let linkCanon = document.querySelector('link[rel="canonical"]');
    if (!linkCanon) {
      linkCanon = document.createElement('link');
      linkCanon.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanon);
    }
    linkCanon.setAttribute('href', canonical);

    // Open Graph Tags
    const ogProperties = {
      'og:title': title,
      'og:description': description,
      'og:url': canonical,
      'og:type': 'website',
      'og:site_name': 'Roy No Rules...',
      'twitter:title': title,
      'twitter:description': description
    };

    Object.entries(ogProperties).forEach(([prop, val]) => {
      let metaEl = document.querySelector(`meta[property="${prop}"]`) || document.querySelector(`meta[name="${prop}"]`);
      if (!metaEl) {
        metaEl = document.createElement('meta');
        if (prop.startsWith('og:')) {
          metaEl.setAttribute('property', prop);
        } else {
          metaEl.setAttribute('name', prop);
        }
        document.head.appendChild(metaEl);
      }
      metaEl.setAttribute('content', val);
    });
  }, [currentTrustPath, immersiveShayari, selectedCategory]);

  // Sync trust page popstate history events with advanced page router matching (SEO Friendly)
  useEffect(() => {
    const parseAndApplyRoute = () => {
      const path = window.location.pathname;
      const trustPaths = ['/about-us', '/privacy-policy', '/terms-and-conditions', '/disclaimer', '/contact-us'];
      
      const matchedEq = emotionalQuestionPages.find(eq => '/' + eq.slug === path);
      if (matchedEq) {
        setActiveEmotionalPage(matchedEq);
        setImmersiveShayari(null);
        setCurrentTrustPath(null);
        setShowIntro(false);
        return;
      }

      setActiveEmotionalPage(null);

      if (trustPaths.includes(path)) {
        setCurrentTrustPath(path);
        setImmersiveShayari(null);
        return;
      }

      setCurrentTrustPath(null);

      const segments = path.split('/').filter(Boolean);
      if (segments.length === 0) {
        setSelectedCategory('All');
        setImmersiveShayari(null);
      } else if (segments.length === 1) {
        // Category path: e.g. /sad or /motivation
        const rawCategory = segments[0].toLowerCase();
        const matched = categories.find(
          c => c.toLowerCase() === rawCategory || c.toLowerCase().replace(/\s+/g, '-') === rawCategory
        );
        if (matched) {
          setSelectedCategory(matched);
          setImmersiveShayari(null);
        }
      } else if (segments.length === 2) {
        if (segments[0] === 'creator') {
          const uName = decodeURIComponent(segments[1]);
          setSelectedProfileUsername(uName);
          setImmersiveShayari(null);
          setCurrentTrustPath(null);
          return;
        }

        // Individual Shayari: e.g. /sad/khamoshi-ka-maza
        const rawCategory = segments[0].toLowerCase();
        const slugSubpart = segments[1].toLowerCase();
        
        const matchedCategory = categories.find(
          c => c.toLowerCase() === rawCategory || c.toLowerCase().replace(/\s+/g, '-') === rawCategory
        );
        
        const matchedShayari = approvedList.find(s => {
          const itemSlug = s.slug || '';
          return itemSlug.toLowerCase().endsWith(slugSubpart) || s.id === slugSubpart;
        });

        if (matchedShayari) {
          if (matchedCategory) {
            setSelectedCategory(matchedCategory);
          }
          setImmersiveShayari(matchedShayari);
        }
      }
    };

    parseAndApplyRoute();

    window.addEventListener('popstate', parseAndApplyRoute);
    return () => window.removeEventListener('popstate', parseAndApplyRoute);
  }, [approvedList, categories]);

  const handleNavigateTrust = (path: string) => {
    setCurrentTrustPath(path);
    window.history.pushState(null, '', path);
    showToast(`Navigating to ${path.substring(1).replace('-', ' ').toUpperCase()} 🌟`);
  };

  const handleCloseTrust = () => {
    setCurrentTrustPath(null);
    window.history.pushState(null, '', '/');
  };


  // Filtered List based on Mood, Category, and Saved Toggles
  const filteredShayaris = React.useMemo(() => {
    const baseSource = searchedShayaris !== null ? searchedShayaris : approvedList;
    return baseSource.filter((sh) => {
      const matchesSaved = !showSavedOnly || savedIds.includes(sh.id);
      const matchesCategory = selectedCategory === 'All' || sh.category === selectedCategory;

      // Dynamic Emotional Vibe filter matching
      let matchesMood = true;
      if (selectedMoodId) {
        const activeMood = MOODS_METADATA.find((m) => m.id === selectedMoodId);
        if (activeMood) {
          const matchesMoodCategory = activeMood.categories.includes(sh.category);
          const matchesMoodKeyword = activeMood.keywords?.some((kw) => 
            sh.text.toLowerCase().includes(kw.toLowerCase()) ||
            sh.category.toLowerCase().includes(kw.toLowerCase())
          );
          matchesMood = !!(matchesMoodCategory || matchesMoodKeyword);
        }
      }

      return matchesSaved && matchesCategory && matchesMood;
    });
  }, [approvedList, showSavedOnly, savedIds, selectedCategory, selectedMoodId, searchedShayaris]);

  // Sort and formulate recommendations based on mood sub-pills
  const finalSortedShayaris = React.useMemo(() => {
    let list = [...filteredShayaris];
    if (selectedMoodId && moodRecommendationSort !== 'all') {
      if (moodRecommendationSort === 'trending') {
        list.sort((a, b) => b.likes - a.likes);
      } else if (moodRecommendationSort === 'most_saved') {
        list.sort((a, b) => b.shares - a.shares);
      } else if (moodRecommendationSort === 'recent') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }
    return list;
  }, [filteredShayaris, selectedMoodId, moodRecommendationSort]);

  const handleResetDb = () => {
    setApprovedList([...defaultShayaris]);
    setSavedIds([]);
    setSelectedCategory('All');
    setSelectedMoodId(null);
    setShowSavedOnly(false);
    setIsAutoShuffleOn(false);
    showToast('Re-initialized default database states! 🔄');
  };


  // 8. Controlled Feed Pagination (When filters change, reset visible count)
  useEffect(() => {
    setVisibleCount(12);
  }, [selectedCategory, showSavedOnly, selectedMoodId, moodRecommendationSort, searchQuery]);

  useEffect(() => {
    if (finalSortedShayaris.length === 0) {
      setVisibleList([]);
      return;
    }
    setVisibleList(finalSortedShayaris.slice(0, visibleCount));
  }, [finalSortedShayaris, visibleCount]);

  const handleLoadMore = () => {
    if (isFeedLoading) return;
    setIsFeedLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 12);
      setIsFeedLoading(false);
      showToast('Revealing more emotional Shayari vibes... 🌹');
    }, 550);
  };

  // Auto pause/stop voice synthesis if the active playing card is filtered out, changed, or rotated
  useEffect(() => {
    if (activeVoiceShayari && !visibleList.some(s => s.id === activeVoiceShayari.id)) {
      setActiveVoiceShayari(null);
    }
  }, [visibleList, activeVoiceShayari]);


  // 9. Auto-Refresh Card Shuffler
  // Selectively replaces a specific card index in the visible feed with a new random approved Shayari
  const handleShuffleCardAt = (index: number) => {
    if (approvedList.length === 0) return;

    const candidates = finalSortedShayaris;
    if (candidates.length === 0) return;

    // Prevent immediate duplicate of currently visible IDs
    const currentlyVisibleIds = visibleList.map((item) => item.id.split('-')[0]);
    let source = candidates.filter((item) => !currentlyVisibleIds.includes(item.id));
    if (source.length === 0) {
      source = candidates; // Fallback
    }

    const nextShayari = source[Math.floor(Math.random() * source.length)];

    setVisibleList((prev) => {
      const updated = [...prev];
      if (index >= 0 && index < updated.length) {
        updated[index] = {
          ...nextShayari,
          id: `${nextShayari.id}-shuffled-${Date.now()}` // Maintain freshness id to trigger AnimatePresence react keys
        };
      }
      return updated;
    });
  };


  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Toggle favorite saved status
  const handleToggleSaveShayari = (id: string) => {
    // Strip clone/infinite postfix to get actual ID
    const actualId = id.split('-')[0];
    setSavedIds((prev) => {
      const exists = prev.includes(actualId);
      if (exists) {
        showToast('Removed from your favorites vault ❤️');
        return prev.filter((item) => item !== actualId);
      } else {
        showToast('Saved to your favorites vault ❤️');
        return [...prev, actualId];
      }
    });
  };

  // Interactive 3-second Hold on Logo
  const handleHoldStart = (e: React.MouseEvent | React.TouchEvent) => {
    setHoldProgress(0);
    let duration = 0;
    
    // Interval runs every 50ms
    holdIntervalRef.current = window.setInterval(() => {
      duration += 50;
      const pct = Math.min((duration / 3000) * 100, 100);
      setHoldProgress(pct);

      if (duration >= 3000) {
        if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
        setHoldProgress(100);
        setIsUnlockPopupOpen(true);
        showToast('Decrypt Gateway Enabled: Complete Admin Verification 🔒');
        setTimeout(() => setHoldProgress(0), 1000);
      }
    }, 50);
  };

  const handleHoldEnd = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setHoldProgress(0);
  };


  // Submission callbacks
  const handleUserSubmission = (newShayari: Partial<Shayari> & { newCategory?: string }) => {
    const defaultAuthor = currentUser ? currentUser.realName : 'Anonymous';
    const compiled: Shayari = {
      id: Date.now().toString(),
      text: newShayari.text || '',
      category: newShayari.category || 'Motivation',
      author: newShayari.author && newShayari.author.trim() !== '' ? newShayari.author : defaultAuthor,
      highlightedWords: newShayari.highlightedWords || [],
      likes: 0,
      shares: 0,
      createdAt: new Date().toISOString(),
      status: 'pending', // Review state
      uploaderUsername: currentUser ? currentUser.username : undefined
    };

    setPendingList((prev) => [compiled, ...prev]);

    // Background server POST sync
    fetch('/api/submit-shayari', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: compiled.text,
        category: compiled.category,
        author: compiled.author,
        highlightedWords: compiled.highlightedWords,
        uploaderUsername: compiled.uploaderUsername,
        newCategory: newShayari.newCategory
      })
    })
    .catch(err => console.error('Failed to sync submission to server:', err));

    if (currentUser) {
      logUserActivity(
        currentUser.username, 
        'Poetry Submitted', 
        `Submitted a pending verse under category "${compiled.category}"`
      );
      setActivityTrigger((prev) => prev + 1);
    }

    // Handle new category suggestion
    if (newShayari.newCategory && !categories.includes(newShayari.newCategory)) {
      setCategories((prev) => [...prev, newShayari.newCategory!]);
    }

    setIsSubmitModalOpen(false);
    showToast('Shayari submitted! Pending Roy’s approval... 🕊️');
  };


  // Admin Callback actions
  const handleAdminAddShayari = (sh: Shayari) => {
    setApprovedList((prev) => [sh, ...prev]);
    
    // Background server POST sync
    fetch('/api/add-official-shayari', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: sh.text,
        category: sh.category,
        author: sh.author,
        highlightedWords: sh.highlightedWords
      })
    })
    .catch(err => console.error('Failed to add official shayari on server:', err));

    showToast('New official Shayari published immediately! 🚀');
  };

  const handleAdminDeleteShayari = (id: string) => {
    const strippedId = id.split('-')[0];
    setApprovedList((prev) => prev.filter((item) => item.id !== strippedId));

    // Background server POST sync
    fetch('/api/delete-shayari', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: strippedId })
    })
    .catch(err => console.error('Failed to sync delete to server:', err));

    showToast('Shayari deleted from active databases.');
  };

  const handleAdminApproveShayari = (id: string) => {
    const itemToApprove = pendingList.find((sh) => sh.id === id);
    if (itemToApprove) {
      const updatedItem: Shayari = { ...itemToApprove, status: 'approved' };
      setApprovedList((prev) => [updatedItem, ...prev]);
      setPendingList((prev) => prev.filter((item) => item.id !== id));

      // Background server POST sync
      fetch('/api/approve-shayari', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      .catch(err => console.error('Failed to sync approval to server:', err));

      showToast('User submission approved & posted alive! 🥳');
    }
  };

  const handleAdminDeclineShayari = (id: string) => {
    setPendingList((prev) => prev.filter((item) => item.id !== id));

    // Background server POST sync
    fetch('/api/decline-shayari', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    .catch(err => console.error('Failed to sync decline to server:', err));

    showToast('User submission declined & cleared.');
  };

  const handleAdminAddCategoryName = (name: string) => {
    if (!categories.includes(name)) {
      setCategories((prev) => [...prev, name]);
      showToast(`Category #${name} added to system definitions.`);
    }
  };

  const currentMood = MOODS_METADATA.find((m) => m.id === selectedMoodId);

  const handleSelectMood = (moodId: string | null) => {
    setSelectedMoodId(moodId);
    setMoodRecommendationSort('all');
    if (moodId) {
      setSelectedCategory('All'); // Clear category slider filter to let mood rule
      setShowSavedOnly(false); // Reset saved filter
      showToast(`Switched emotional mood space to: ${moodId} ✨`);
    } else {
      showToast('Returned to main unguided flow 🌌');
    }
  };

  const handleNextMiniPlayerShayari = () => {
    const listToSearch = filteredShayaris.length > 0 ? filteredShayaris : approvedList;
    if (listToSearch.length === 0) return;
    const currentIndex = listToSearch.findIndex((sh) => sh.id.split('-')[0] === activeMiniPlayerShayari?.id.split('-')[0]);
    let nextIndex = currentIndex + 1;
    if (nextIndex >= listToSearch.length) {
      nextIndex = 0;
    }
    setActiveMiniPlayerShayari(listToSearch[nextIndex]);
    showToast('Skipping to next emotional vibe ⏭️');
  };

  const handlePrevMiniPlayerShayari = () => {
    const listToSearch = filteredShayaris.length > 0 ? filteredShayaris : approvedList;
    if (listToSearch.length === 0) return;
    const currentIndex = listToSearch.findIndex((sh) => sh.id.split('-')[0] === activeMiniPlayerShayari?.id.split('-')[0]);
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = listToSearch.length - 1;
    }
    setActiveMiniPlayerShayari(listToSearch[prevIndex]);
    showToast('Skipping to previous emotional vibe ⏮️');
  };

  return (
    <div className={`relative min-h-screen text-zinc-100 font-sans overflow-x-hidden selection:bg-red-500/30 transition-all duration-1000 bg-black ${
      currentMood ? `bg-gradient-to-b ${currentMood.bgGradient}` : ''
    }`}>
      {/* Cinematic Intro Animation Overlay */}
      <AnimatePresence>
        {showIntro && (
          <IntroScreen onComplete={() => {
            setShowIntro(false);
            const todayFeelingSet = localStorage.getItem('roynorules_today_feeling_set');
            if (!todayFeelingSet) {
              setShowFeelingPrompt(true);
            }
          }} />
        )}
      </AnimatePresence>

      {/* Floating Canvas Particles */}
      <ParticlesBg activeMoodColors={currentMood?.particlesColors} speedMultiplier={currentMood?.speed} />

      {/* Main Premium Floating Glass Header (Auto-blurs on scroll) */}
      <header className="sticky top-4 z-40 mx-4 md:mx-auto max-w-5xl bg-zinc-950/75 backdrop-blur-md border border-white/10 rounded-[20px] px-4 py-3 shadow-md hover:border-red-500/20 transition-all duration-300" id="main-header">
        <div className="flex items-center justify-between relative">
          
          {/* Left: Left Menu Icon */}
          <div className="flex items-center justify-start w-1/4 gap-2">
            <button
              onClick={() => {
                setIsMoreMenuOpen(true);
                showToast('Opening secondary discovery & features menu ☰');
              }}
              className="p-2.5 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/60 border border-zinc-800 hover:border-red-500/25 transition duration-300 text-zinc-400 hover:text-white cursor-pointer select-none active:scale-95 flex items-center justify-center shadow-lg"
              title="More Options"
            >
              <Menu size={17} />
            </button>
            
            {/* Small subtle active login label */}
            {currentUser && (
              <span className="hidden sm:inline-block text-[9.5px] font-mono text-zinc-500 truncate max-w-[80px]">
                @{currentUser.username}
              </span>
            )}
          </div>

          {/* Center: Premium Centered Trigger Logo Group */}
          <div className="flex flex-col items-center justify-center text-center w-2/4">
            <div
              onMouseDown={handleHoldStart}
              onMouseUp={handleHoldEnd}
              onMouseLeave={handleHoldEnd}
              onTouchStart={handleHoldStart}
              onTouchEnd={handleHoldEnd}
              className="relative group cursor-pointer select-none flex flex-col items-center justify-center"
            >
              {/* Subtle dynamic backdrop halo when holding to unlock */}
              {holdProgress > 0 && (
                <div 
                  className="absolute inset-0 bg-red-600/15 blur-xl rounded-full transition-all duration-75"
                  style={{ transform: `scale(${1 + holdProgress / 40})` }}
                />
              )}
              
              <div className="flex items-center gap-1.5 justify-center">
                <motion.h1
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[16px] md:text-xl font-black bg-clip-text tracking-[0.08em] font-sans uppercase leading-none select-none text-center"
                >
                  <span className="text-white">Roy No </span>
                  <span className="text-red-500 font-extrabold group-hover:text-red-400 transition-colors drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]">Rules...</span>
                </motion.h1>
              </div>

              {/* small date/time under logo in elegant small font */}
              <div className="text-[8.5px] font-mono text-zinc-500 mt-1 flex items-center justify-center gap-1.5 leading-none select-none">
                <span className="text-red-500/80 font-bold whitespace-nowrap">{istDate || 'Date'}</span>
                <span>•</span>
                <span className="text-zinc-400 whitespace-nowrap">{istTime || 'Clock'}</span>
              </div>

              {holdProgress > 0 && (
                <div className="text-[7.5px] font-mono font-black text-red-500 mt-1.5 uppercase tracking-widest leading-none bg-black/60 px-1 py-0.5 rounded border border-red-950/50">
                  🔓 LOCKER: {Math.round(holdProgress)}%
                </div>
              )}
            </div>
          </div>

          {/* Right: Search / Filter Icon */}
          <div className="flex items-center justify-end w-1/4">
            <button
              onClick={() => {
                const el = document.getElementById('feeling-search-input');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  (el as HTMLInputElement).focus();
                }
                showToast('Focusing Aaj Kya Feel Kar Rahe Ho? search engine 👀');
              }}
              className="p-2.5 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/60 border border-zinc-800 hover:border-red-500/25 transition duration-300 text-zinc-400 hover:text-white cursor-pointer select-none active:scale-95 flex items-center justify-center shadow-lg"
              title="Search Emotions"
            >
              <Search size={17} />
            </button>
          </div>

        </div>
      </header>

      {/* Main Container Wrapper */}
      <main className="max-w-5xl mx-auto px-4 pt-10 pb-36 space-y-8">
        
        {activeEmotionalPage ? (
          <EmotionalQuestionPageContainer
            page={activeEmotionalPage}
            allShayaris={approvedList}
            onBack={() => {
              setActiveEmotionalPage(null);
              window.history.pushState(null, '', '/');
              window.dispatchEvent(new Event('popstate'));
              showToast('Returned to main sanctuary 💫');
            }}
            onSelectShayari={(sh) => {
              setImmersiveShayari(sh);
              setActiveMiniPlayerShayari(sh);
            }}
            showToast={showToast}
          />
        ) : (
          <>
            {/* BRAND HERO INTRO & WRITE YOUR OWN SHAYARI ACTIVE CALL-TO-ACTION */}
            <div className="text-center py-6 sm:py-8 space-y-4 max-w-xl mx-auto select-none border-b border-white/5 pb-6">
              <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.3em] font-black text-red-500 uppercase animate-pulse block">
                👑 India’s cinematic emotional shayari universe
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide leading-tight px-2 text-balance">
                Feelings • Shayari • Mood • Stories
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-500 font-medium tracking-[0.1em] font-mono">
                Discover, edit, and render high-definition quotes and poetry layouts.
              </p>
              
              {/* Direct 'Write Your Own Shayari' glassmorphic action button */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitModalOpen(true);
                    showToast('Launching live workspace: Write Your Own Shayari... ✍🔥');
                  }}
                  className="px-6 py-3.5 rounded-full bg-gradient-to-r from-red-650 to-rose-700 hover:from-red-550 hover:to-rose-600 border border-white/10 text-white font-extrabold text-xs uppercase tracking-widest flex items-center gap-2 shadow-[0_5px_22px_rgba(239,68,68,0.25)] hover:shadow-[0_5px_30px_rgba(239,68,68,0.4)] transition-all duration-300 hover:scale-103 cursor-pointer select-none active:scale-95"
                >
                  <Sparkles size={14} className="text-yellow-405 animate-pulse" />
                  <span>Write Your Own Shayari</span>
                  <ArrowRight size={13} className="stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* PREMIUM FEEDBACK SEARCH SECTION */}
            <SearchByFeeling
              approvedList={approvedList}
              onSearchResults={(q, results) => {
                setSearchQuery(q);
                setSearchedShayaris(results);
              }}
              showToast={showToast}
              onSelectMood={handleSelectMood}
            />

        {/* MOOD QUICK ACCESS BUBBLES */}
        <div className="py-2">
          <MoodSelector 
            selectedMoodId={selectedMoodId} 
            onSelectMood={handleSelectMood} 
          />
        </div>

        {/* DAILY CONTENT FRESHNESS & ACTIVE SIGNALS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-950/60 border border-white/5 px-5 py-3.5 rounded-2xl select-none text-[11px] font-mono font-bold tracking-wider text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span>✨ STATUS: ACTIVE SEARCH ENGINE</span>
            <span className="text-zinc-650">•</span>
            <span className="text-emerald-400">TODAY ADDED: +18 NEW SHAYARI</span>
          </div>
          <div className="flex items-center gap-3 text-red-400">
            <span>⚡ REALTIME INDEXING COMPLIANT</span>
            <span>•</span>
            <span className="text-zinc-500">24H UPDATE: TRUE</span>
          </div>
        </div>

        {/* TRENDING TODAY BENTO GRID SYSTEM */}
        <TrendingToday
          approvedShayaris={approvedList}
          onSelectShayari={(sh) => {
            setImmersiveShayari(sh);
            setActiveMiniPlayerShayari(sh);
          }}
          showToast={showToast}
        />

        {/* Premium Home Top Banner Ad */}
        <PremiumAdContainer placement="homeTopBanner" />

        {searchQuery && (
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#991B1B]/25 border border-red-500/10 text-red-400 font-mono text-[11px] font-black tracking-wider uppercase animate-pulse">
                <span>FOUND {filteredShayaris.length} MATCHING FEELING SHAYARIS FOR "{searchQuery.toUpperCase()}"</span>
              </span>
            </motion.div>
            <PremiumAdContainer placement="searchResultAd" />
          </div>
        )}

        {isLateNightMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-950/10 text-indigo-400 font-mono text-[11px] tracking-widest uppercase flex items-center justify-between gap-4 select-none relative overflow-hidden"
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              <span>🌙 Late Night Atmosphere Active (Calm Twilight Theme Enabled)</span>
            </div>
            <span className="text-[9.5px] text-indigo-600/70 hidden sm:inline">// Auto-Shuffling interval slowed down</span>
          </motion.div>
        )}

        {/* View Selection Row: Category slider taking full cinematic width */}
        <div className="space-y-2 border-b border-white/5 pb-2">
          <CategorySlider
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setShowSavedOnly(false); // reset saved filter on category pivot
              setSelectedMoodId(null); // Clear selected mood when focusing specific category
            }}
          />
        </div>

        {/* List Grid cards displaying endlessly */}
        {visibleList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="shayari-infinite-feed">
            <AnimatePresence mode="popLayout">
              {visibleList.map((shayari, index) => {
                const isSaved = savedIds.includes(shayari.id.split('-')[0]);
                const adFreq = adsConfig?.adFrequency || 5;
                const showAdBelow = (index + 1) % adFreq === 0;

                return (
                  <div key={shayari.id} style={{ display: 'contents' }}>
                    <div>
                      <ShayariCard
                        shayari={shayari}
                        isSaved={isSaved}
                        onToggleSave={() => {
                          handleToggleSaveShayari(shayari.id);
                          setActiveMiniPlayerShayari(shayari);
                        }}
                        onOpenImageStudio={() => {
                          setImageStudioShayari(shayari);
                          setActiveMiniPlayerShayari(shayari);
                        }}
                        index={index}
                        isAutoShuffleOn={isAutoShuffleOn}
                        onNextShayari={() => handleShuffleCardAt(index)}
                        showToast={showToast}
                        onListen={() => {
                          setActiveMiniPlayerShayari(shayari);
                          if (activeVoiceShayari?.id === shayari.id) {
                            setActiveVoiceShayari(null);
                          } else {
                            setActiveVoiceShayari(shayari);
                          }
                        }}
                        isListening={activeVoiceShayari?.id === shayari.id}
                        onFocus={(sh) => {
                          setActiveMiniPlayerShayari(sh);
                        }}
                        onOpenImmersive={() => {
                          setImmersiveShayari(shayari);
                          setActiveMiniPlayerShayari(shayari);
                        }}
                      />
                    </div>
                    {showAdBelow && (
                      <div className="col-span-1 md:col-span-2 py-4 animate-fadeIn">
                        <PremiumAdContainer placement="betweenShayaris" />
                      </div>
                    )}
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-dashed border-zinc-900 rounded-3xl p-12 text-center max-w-lg mx-auto bg-zinc-950/40 backdrop-blur-md space-y-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mx-auto">
              <Compass className="size-6 animate-spin text-red-500" style={{ animationDuration: '6s' }} />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold tracking-wider text-zinc-300 uppercase font-mono">
                No Matched Vibes Found
              </h4>
              <p className="text-xs text-zinc-550 max-w-sm mx-auto leading-relaxed">
                No shayari aligns with your current search context. Try other keywords like 'breakup', 'attitude', 'lonely', or clear your active filters.
              </p>
            </div>
          </motion.div>
        )}

        {/* EMOTIONAL STORIES & LIFESTYLE BLOG SECTION FOR GOOGLE RANKING */}
        <div className="pt-6">
          <EmotionalBlogs showToast={showToast} />
        </div>

          </>
        )}

        {/* Real End-Feed Flow Container with Premium Load-More Button & Footer Directory */}
        <div className="flex flex-col items-center justify-center pt-8 pb-4 space-y-6 select-none border-t border-white/5 w-full">
          {!activeEmotionalPage && (
            visibleList.length < finalSortedShayaris.length && finalSortedShayaris.length > 0 ? (
              <motion.button
                whileHover={{ scale: isFeedLoading ? 1 : 1.05 }}
                whileTap={{ scale: isFeedLoading ? 1 : 0.95 }}
                onClick={handleLoadMore}
                disabled={isFeedLoading}
                className="px-8 py-4 rounded-full border border-red-500/30 bg-zinc-950/80 backdrop-blur-md text-[11px] font-mono tracking-[0.2em] font-black uppercase text-white hover:border-red-500 hover:text-red-450 cursor-pointer transition-all duration-300 flex items-center gap-2 shadow-[0_5px_25px_rgba(239,68,68,0.15)] hover:shadow-[0_5px_35px_rgba(239,68,68,0.35)] disabled:opacity-50"
              >
                {isFeedLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-red-500" />
                    <span>Loading Vibes...</span>
                  </>
                ) : (
                  <>
                    <span>Load More Shayari 👀</span>
                  </>
                )}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => showToast('All emotional vibes are fully loaded! Upload yours or browse categories 🌹')}
                className="px-8 py-4 rounded-full border border-zinc-900 bg-zinc-950/45 backdrop-blur-md text-[11px] font-mono tracking-[0.15em] font-bold uppercase text-zinc-500 hover:text-zinc-300 cursor-pointer transition-all duration-300 flex items-center gap-2"
              >
                <span>No More Shayari (All Discovered) 🌹</span>
              </motion.button>
            )
          )}

          {/* Bottom Feed Ad Placement */}
          <PremiumAdContainer placement="bottomFeedAd" />

          {/* SECTION 2: Premium Footnotes & Legal Directory directly underneath the button */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 text-center">
            {[
              { path: '/about-us', label: 'About Us' },
              { path: '/privacy-policy', label: 'Privacy Policy' },
              { path: '/terms-and-conditions', label: 'Terms & Conditions' },
              { path: '/disclaimer', label: 'Disclaimer' },
              { path: '/contact-us', label: 'Contact Us' }
            ].map((lnk) => (
              <button
                key={lnk.path}
                onClick={() => handleNavigateTrust(lnk.path)}
                className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 hover:text-red-400 cursor-pointer hover:underline transition duration-200"
              >
                {lnk.label}
              </button>
            ))}
          </div>

          <div className="text-[9px] font-mono text-zinc-650 uppercase tracking-widest text-center">
            © 2026 Roy No Rules • Crafted Independently
          </div>
        </div>


      </main>

      {/* Universal Floating Glass Dock Navigation (Mobile & Desktop) */}
      <nav className="fixed bottom-5 left-4 right-4 h-16 sm:h-18 bg-zinc-950/75 border border-white/10 flex items-center justify-around px-2 z-40 backdrop-blur-md select-none max-w-[420px] mx-auto rounded-[20px] shadow-lg hover:border-red-500/15 transition-all duration-300">
        {/* Feed */}
        <button
          onClick={() => {
            setSelectedCategory('All');
            setShowSavedOnly(false);
            setIsFeelingsWallOpen(false);
            showToast('Heading into the emotional shayari stream 🌌');
          }}
          className={`relative flex flex-col items-center justify-center gap-1.5 text-[9px] font-extrabold w-14 transition-all duration-300 cursor-pointer ${
            selectedCategory === 'All' && !showSavedOnly && !isFeelingsWallOpen
              ? 'text-red-550 scale-105 drop-shadow-[0_0_12px_rgba(239,68,68,0.95)]' 
               : 'text-zinc-500 hover:text-white'
          }`}
        >
          <Compass size={18} className="stroke-[2]" />
          <span>Feed</span>
          {selectedCategory === 'All' && !showSavedOnly && !isFeelingsWallOpen && (
            <span className="absolute -bottom-1 w-3 h-[2px] bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.95)]" />
          )}
        </button>

        {/* Mood Wall */}
        <button
          onClick={() => {
            setIsFeelingsWallOpen(true);
            showToast('Loading Anonymous Community Feelings Wall... 🕊️');
          }}
          className={`relative flex flex-col items-center justify-center gap-1.5 text-[9px] font-extrabold w-14 transition-all duration-300 cursor-pointer ${
            isFeelingsWallOpen 
              ? 'text-red-550 scale-105 drop-shadow-[0_0_12px_rgba(239,68,68,0.95)]' 
              : 'text-zinc-500 hover:text-white'
          }`}
        >
          <MessageSquare size={18} className="stroke-[2]" />
          <span>Mood Wall</span>
          {isFeelingsWallOpen && (
            <span className="absolute -bottom-1 w-3 h-[2px] bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.95)]" />
          )}
        </button>

        {/* Create Wallpaper Studio */}
        <button
          onClick={() => {
            setIsCreateHubOpen(true);
            showToast('Opening Creator option menu... 🌌');
          }}
          className={`relative flex flex-col items-center justify-center gap-1.5 text-[9px] font-extrabold w-14 transition-all duration-300 cursor-pointer ${
            isCreateHubOpen
              ? 'text-red-550 scale-105 drop-shadow-[0_0_12px_rgba(239,68,68,0.95)]'
              : 'text-zinc-500 hover:text-white'
          }`}
        >
          <Plus size={18} className="stroke-[3]" />
          <span>Create</span>
          {isCreateHubOpen && (
            <span className="absolute -bottom-1 w-3 h-[2px] bg-red-500 rounded-full shadow-[0_0_8px_rgba(239, 68, 68, 0.95)]" />
          )}
        </button>

        {/* Saved */}
        <button
          onClick={() => {
            setShowSavedOnly(true);
            setSelectedCategory('All');
            setIsFeelingsWallOpen(false);
            showToast(`Loading Saved Shayari Vault (${savedIds.length} items) 💖`);
          }}
          className={`relative flex flex-col items-center justify-center gap-1.5 text-[9px] font-extrabold w-14 transition-all duration-300 cursor-pointer ${
            showSavedOnly && !isFeelingsWallOpen
              ? 'text-red-550 scale-105 drop-shadow-[0_0_12px_rgba(239,68,68,0.95)]' 
              : 'text-zinc-500 hover:text-white'
          }`}
        >
          <Heart size={18} fill={showSavedOnly && !isFeelingsWallOpen ? 'currentColor' : 'none'} className="stroke-[2]" />
          <span>Saved</span>
          {showSavedOnly && !isFeelingsWallOpen && (
            <span className="absolute -bottom-1 w-3 h-[2px] bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.95)]" />
          )}
        </button>

        {/* Profile */}
        <button
          onClick={() => {
            setIsFeelingsWallOpen(false);
            if (currentUser) {
              setSelectedProfileUsername(currentUser.username);
              showToast(`Viewing @${currentUser.username}'s Profile 👤`);
            } else {
              setIsAuthOpen(true);
              showToast('Sign in to access premium profile customizers 🌠');
            }
          }}
          className={`relative flex flex-col items-center justify-center gap-1.5 text-[9px] font-extrabold w-14 transition-all duration-300 cursor-pointer ${
            selectedProfileUsername && currentUser && selectedProfileUsername === currentUser.username && !isFeelingsWallOpen
              ? 'text-red-550 scale-105 drop-shadow-[0_0_12px_rgba(239,68,68,0.95)]' 
              : 'text-zinc-500 hover:text-white'
          }`}
        >
          <UserIcon size={18} className="stroke-[2]" />
          <span>Profile</span>
          {selectedProfileUsername && currentUser && selectedProfileUsername === currentUser.username && !isFeelingsWallOpen && (
            <span className="absolute -bottom-1 w-3 h-[2px] bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.95)]" />
          )}
        </button>
      </nav>

      {/* Dynamic Visual Notification Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 left-4 right-4 md:bottom-6 md:left-auto md:right-8 z-50 p-4 max-w-sm bg-zinc-950 border border-zinc-800 text-white rounded-2xl flex items-center gap-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-gradient-to-r from-red-950/20 to-zinc-950"
          >
            <Check size={14} className="text-red-500 shrink-0" />
            <span className="text-xs font-mono font-medium tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 1: SUBMIT MODAL */}
      <AnimatePresence>
        {isCreateHubOpen && (
          <motion.div key="modal-create-hub" style={{ display: 'contents' }}>
            <CreateHubModal
              onClose={() => setIsCreateHubOpen(false)}
              onSubmitShayari={() => {
                setIsSubmitModalOpen(true);
              }}
              onCreateWallpaper={() => {
                const defaultStudioShayari: Shayari = {
                  id: 'studio-default',
                  text: "Apna rasta khud banayein, kisiki raah ka intezaar nahi...\n\nHum woh hain jo no-rules me jeete hain.",
                  category: 'Motivation',
                  author: currentUser?.realName || 'Anonymous Writer',
                  highlightedWords: ['rasta', 'raah'],
                  likes: 210,
                  shares: 94,
                  createdAt: new Date().toISOString(),
                  status: 'approved'
                };
                setImageStudioShayari(defaultStudioShayari);
                showToast('Launching HD Wallpaper Status Studio... 🎨');
              }}
              onPostMood={() => {
                setIsMoodPostOpen(true);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMoodPostOpen && (
          <motion.div key="modal-mood-post" style={{ display: 'contents' }}>
            <MoodPostModal
              onClose={() => setIsMoodPostOpen(false)}
              showToast={showToast}
              onPostSuccess={() => {
                // If the FeelingsWall is open, reload or refresh feelings wall
                if (isFeelingsWallOpen) {
                  // Trigger event or fast trick to cause state update, or they can re-open to sync
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSubmitModalOpen && (
          <motion.div key="modal-submit" style={{ display: 'contents' }}>
            <SubmitModal
              categories={categories}
              onClose={() => setIsSubmitModalOpen(false)}
              onSubmit={handleUserSubmission}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: SHAYARI HD CANVAS IMAGE GENERATOR MODAL */}
      <AnimatePresence>
        {imageStudioShayari && (
          <motion.div key="modal-studio" style={{ display: 'contents' }}>
            <ImageGeneratorModal
              shayari={imageStudioShayari}
              onClose={() => setImageStudioShayari(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 3: HIDDEN ADMIN PANEL */}
      <AnimatePresence>
        {isAdminPanelOpen && (
          <motion.div key="modal-admin" style={{ display: 'contents' }}>
            <AdminPanel
              categories={categories}
              pendingShayaris={pendingList}
              approvedShayaris={approvedList}
              onAddShayari={handleAdminAddShayari}
              onDeleteShayari={handleAdminDeleteShayari}
              onApproveShayari={handleAdminApproveShayari}
              onDeclineShayari={handleAdminDeclineShayari}
              onAddCategory={handleAdminAddCategoryName}
              onClose={() => setIsAdminPanelOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 3b: HIDDEN ADMIN UNLOCK POPUP */}
      <AnimatePresence>
        {isUnlockPopupOpen && (
          <motion.div key="modal-admin-unlock" style={{ display: 'contents' }}>
            <AdminUnlockPopup
              onClose={() => setIsUnlockPopupOpen(false)}
              onSuccess={() => {
                setIsUnlockPopupOpen(false);
                setIsAdminPanelOpen(true);
              }}
              showToast={showToast}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 4: VOICE SHAYARI AUDIO MAIN STATION */}
      <AnimatePresence>
        {activeVoiceShayari && (
          <motion.div key="modal-voice" style={{ display: 'contents' }}>
            <VoiceShayariPlayer
              shayari={activeVoiceShayari}
              onClose={() => setActiveVoiceShayari(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 5: PREMIUM IDENTITY AUTHENTICATION WALL */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setActivityTrigger(prev => prev + 1);
        }}
        showToast={showToast}
        initialTab="login"
      />

      {/* MODAL 6: USER PROFILE IDENTITY ARCHIVE */}
      <AnimatePresence>
        {selectedProfileUsername && (
          <motion.div key="modal-profile" style={{ display: 'contents' }}>
            <UserProfileModal
              username={selectedProfileUsername}
              isOpen={!!selectedProfileUsername}
              onClose={() => setSelectedProfileUsername(null)}
              currentUser={currentUser}
              onTriggerAuth={() => setIsAuthOpen(true)}
              showToast={showToast}
              categories={categories}
              approvedShayaris={approvedList}
              onAuthSuccess={(updatedUser) => {
                setCurrentUser(updatedUser);
                setActivityTrigger(prev => prev + 1);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 7: THE ☰ MORE DISCOVERY CENTER (HALL OF FAME, THEMES, SETTINGS) */}
      <AnimatePresence>
        {isMoreMenuOpen && (
          <motion.div key="modal-menu" style={{ display: 'contents' }}>
            <MoreMenuModal
              isOpen={isMoreMenuOpen}
              onClose={() => setIsMoreMenuOpen(false)}
              onSelectUser={(uname) => {
                setSelectedProfileUsername(uname);
                setIsMoreMenuOpen(false);
              }}
              onNavigateTrust={(path) => {
                handleNavigateTrust(path);
                setIsMoreMenuOpen(false);
              }}
              currentUser={currentUser}
              onTriggerAuth={() => {
                setIsAuthOpen(true);
                setIsMoreMenuOpen(false);
              }}
              activityTrigger={activityTrigger}
              selectedMoodId={selectedMoodId}
              onSelectMood={handleSelectMood}
              isAutoShuffleOn={isAutoShuffleOn}
              setIsAutoShuffleOn={setIsAutoShuffleOn}
              onResetDb={handleResetDb}
              savedCount={savedIds.length}
              showToast={showToast}
              savedIds={savedIds}
              approvedList={approvedList}
              onToggleSaveShayari={handleToggleSaveShayari}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 8: THE TRADING AND COMPLIANCE TRUST PAGES SYSTEM */}
      <AnimatePresence>
        {currentTrustPath && (
          <motion.div key="modal-trust" style={{ display: 'contents' }}>
            <TrustPages
              activePath={currentTrustPath}
              onNavigate={handleNavigateTrust}
              onClose={handleCloseTrust}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 9: TODAY'S FEELING SELECTION PROMPT */}
      <AnimatePresence>
        {showFeelingPrompt && (
          <motion.div key="todays-feeling-modal" style={{ display: 'contents' }}>
            <TodaysFeelingPrompt
              onSelectMood={handleSelectMood}
              onClose={() => {
                setShowFeelingPrompt(false);
                localStorage.setItem('roynorules_today_feeling_set', 'true');
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 10: COMMUNITY FEELINGS WALL */}
      <AnimatePresence>
        {isFeelingsWallOpen && (
          <motion.div key="feelings-wall-modal" style={{ display: 'contents' }}>
            <FeelingsWall
              onClose={() => setIsFeelingsWallOpen(false)}
              showToast={showToast}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 11: CINEMATIC IMMERSIVE FOCUS READING MODE */}
      <AnimatePresence>
        {immersiveShayari && (
          <motion.div key="immersive-focus-modal" style={{ display: 'contents' }}>
            <ImmersiveReadingMode
              shayari={immersiveShayari}
              isSaved={savedIds.includes(immersiveShayari.id.split('-')[0])}
              onToggleSave={() => handleToggleSaveShayari(immersiveShayari.id)}
              onClose={() => setImmersiveShayari(null)}
              showToast={showToast}
              allShayaris={approvedList}
              onSelectShayari={(sh) => {
                setImmersiveShayari(sh);
                const slugPath = generateShayariSlug(sh);
                window.history.pushState(null, '', `/${slugPath}`);
                window.dispatchEvent(new Event('popstate'));
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
