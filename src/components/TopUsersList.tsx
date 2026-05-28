import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Award, Zap, ShieldCheck, Flame, MessageSquare, Compass, Users } from 'lucide-react';
import { getTopUsers, initializeCommunityDb, getUsers, calculateRoyCoinsForUser } from '../utils/communityDb';
import { User } from '../types';

interface TopUsersListProps {
  onSelectUser: (username: string) => void;
  // Trigger re-fetch when actions happen
  activityTrigger: number;
}

export default function TopUsersList({ onSelectUser, activityTrigger }: TopUsersListProps) {
  const [topUsers, setTopUsers] = useState<any[]>([]);

  useEffect(() => {
    initializeCommunityDb();
    const list = getTopUsers(5);
    setTopUsers(list);
  }, [activityTrigger]);

  if (topUsers.length === 0) return null;

  return (
    <div id="homepage-top-active-users-widget" className="relative group overflow-hidden bg-zinc-950/80 border border-zinc-900 rounded-3xl p-5 sm:p-6 mb-8 select-none">
      {/* Background neon vibe accents */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.04)_0,rgba(0,0,0,0)_70%)] pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0,rgba(0,0,0,0)_75%)] pointer-events-none" />

      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-zinc-900/80 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="text-xl">🏆</div>
          <div className="text-left">
            <h3 className="text-xs font-black font-mono tracking-widest uppercase text-zinc-100 flex items-center gap-1.5">
              Roy's Hall of Fame
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
              Top Active Creators & Roy Coins Leaderboard
            </p>
          </div>
        </div>
        
        <div className="hidden sm:block">
          <span className="text-[9px] font-mono font-semibold bg-zinc-900 border border-zinc-850 text-amber-500 px-2.5 py-1 rounded-xl flex items-center gap-1">
            Coin Balance Tracking 🪙
          </span>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
        {topUsers.map((item, index) => {
          const userObj = item.user as User;
          
          // Custom style elements depending on order
          const rankColors = [
            'from-yellow-400 via-amber-500 to-orange-500 text-yellow-100 border-yellow-500/30', // rank 1
            'from-zinc-300 via-slate-400 to-zinc-500 text-slate-100 border-slate-500/20',     // rank 2
            'from-amber-650 via-amber-700 to-rose-950 text-amber-200 border-amber-900/20',   // rank 3
            'from-zinc-900 to-zinc-950 text-zinc-300 border-zinc-900/55',                    // rank 4
            'from-zinc-900 to-zinc-950 text-zinc-400 border-zinc-900/60'                     // rank 5
          ];

          // Aura colors
          const auraBorders = {
            sigma: 'group-hover:border-cyan-500/50 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.15)]',
            love: 'group-hover:border-rose-500/50 group-hover:shadow-[0_0_12px_rgba(244,63,94,0.15)]',
            motivation: 'group-hover:border-amber-500/50 group-hover:shadow-[0_0_12px_rgba(245,158,11,0.15)]',
            dark: 'group-hover:border-zinc-700/50 group-hover:shadow-[0_0_12px_rgba(255,255,255,0.02)]',
            emotional: 'group-hover:border-purple-500/50 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.15)]'
          };

          const userAura = userObj.auraTheme || 'dark';
          const activeBorderClass = auraBorders[userAura] || auraBorders.dark;

          // Fetch dynamic coins balance for display
          const { royCoins } = calculateRoyCoinsForUser(userObj.username);

          // Check if user unlocked the featured profile outline spot
          const unlockedStorage = localStorage.getItem(`roynorules_unlocked_${userObj.username.toLowerCase()}`);
          const isFeaturedSpot = unlockedStorage ? JSON.parse(unlockedStorage).includes('featured_profile') : false;

          let featuredSpotClass = '';
          if (isFeaturedSpot) {
            featuredSpotClass = 'border-amber-550/90 shadow-[0_0_16px_rgba(245,158,11,0.22)] ring-1 ring-amber-500/35 relative before:absolute before:inset-0 before:rounded-2xl before:border before:border-amber-400/40 before:animate-pulse';
          }

          return (
            <motion.div
              key={userObj.id}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectUser(userObj.username)}
              className={`bg-zinc-900/20 border border-zinc-900 p-3.5 rounded-2xl flex flex-col justify-between text-left cursor-pointer transition-all duration-300 hover:bg-zinc-900/40 relative group ${activeBorderClass} ${featuredSpotClass}`}
            >
              {/* Rank Crown indicator */}
              <div className="flex justify-between items-center relative z-10">
                <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black bg-gradient-to-br ${rankColors[index]} border shadow-sm`}>
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && index + 1}
                </div>
                
                <span className="text-[9.5px] font-mono text-amber-500 font-extrabold flex items-center gap-0.5">
                  🪙 {royCoins.toLocaleString()}
                </span>
              </div>

              {/* Avatar glow & info & badge */}
              <div className="mt-3.5 space-y-2 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-850 font-black text-center flex items-center justify-center text-xs uppercase text-zinc-200 select-none">
                    {userObj.realName.charAt(0)}
                  </div>
                  
                  <div className="truncate max-w-[calc(100%-2.25rem)]">
                    <span className="text-xs font-black text-zinc-200 hover:text-red-400 block leading-none truncate flex items-center gap-1">
                      {userObj.realName}
                      {userObj.isVerified && (
                        <ShieldCheck size={11} className="text-red-500 shrink-0" />
                      )}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 block leading-tight truncate">@{userObj.username}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-900/50 flex flex-wrap gap-1">
                  <span className="text-[8px] font-mono font-medium text-zinc-400 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-900 truncate max-w-full">
                    {userObj.badge || 'Resident ✨'}
                  </span>
                  {item.uploadsCount > 0 && (
                    <span className="text-[8px] font-mono bg-rose-955/20 border border-rose-900/30 text-rose-450 px-1 py-0.5 rounded">
                      {item.uploadsCount} Posts
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
