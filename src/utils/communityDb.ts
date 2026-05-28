import { User, Comment, Reply, CommentReaction } from '../types';

// --- PASSWORD CRYPTOGRAPHY (SHA-256 Web Crypto) ---
export async function hashPassword(password: string): Promise<string> {
  try {
    const msgUint8 = new TextEncoder().encode(password + "RoyNoRulesPremiumCryptoSalt_2026");
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    // Synchronous fallback for legacy or headless runtimes
    let hash = 0;
    const combined = password + "RoyNoRulesPremiumCryptoSalt_2026";
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; 
    }
    return 'fallback_' + Math.abs(hash).toString(16);
  }
}

// --- SECURE STORAGE MANAGEMENT ---
const USERS_KEY = 'roynorules_users_db';
const COMMENTS_KEY = 'roynorules_comments_db';
const SESSION_KEY = 'roynorules_active_user_session';
const ACTIVITY_LOGS_KEY = 'roynorules_user_activity_logs';

interface UserActivity {
  id: string;
  username: string;
  action: string;
  details: string;
  timestamp: string;
}

// Pre-define hardcoded hashes for standard default password 'password123'
const SEED_PASS_HASH = "8ac5b6cffebef4c0d0cda802d9dae27f4c017ed2bdcd2fc7ec3aeddfaf18dc76"; // hash of password123 with salt

// --- DEFAULT INITIAL SEED DATA FOR SOCIAL COMMUNITY ---
const DEFAULT_USERS: User[] = [
  {
    id: 'seed-user-1',
    realName: 'Kabir Sharma',
    username: 'KabirSpeaks',
    email: 'kabir.sharma@gmail.com',
    passwordHash: SEED_PASS_HASH,
    status: 'active',
    createdAt: '2026-05-15T10:30:00.000Z',
    activityCount: 18,
    badge: 'Poetry Guru ✨',
    followersCount: 1420,
    isVerified: true,
    auraTheme: 'sigma',
    bio: 'Wandering poet & attitude philosopher. I write what you think but never speak. Join the revolution. 🔱',
    favoriteCategory: 'Attitude',
    followerStrings: ['AadyaRoy', 'RitikRai']
  },
  {
    id: 'seed-user-2',
    realName: 'Aadya Roy',
    username: 'AadyaRoy',
    email: 'aadya.roy@gmail.com',
    passwordHash: SEED_PASS_HASH,
    status: 'active',
    createdAt: '2026-05-18T14:20:00.000Z',
    activityCount: 24,
    badge: 'Vibe Creator 🔥',
    followersCount: 890,
    isVerified: true,
    auraTheme: 'love',
    bio: 'Life is too short to follow rules. Capturing emotional depth, love, and heartbreak. Forever in my feelings. ❤️',
    favoriteCategory: 'Love',
    followerStrings: ['RitikRai']
  },
  {
    id: 'seed-user-3',
    realName: 'Ritik Rai',
    username: 'RitikRai',
    email: 'ritik.rai@gmail.com',
    passwordHash: SEED_PASS_HASH,
    status: 'active',
    createdAt: '2026-05-20T08:15:00.000Z',
    activityCount: 14,
    badge: 'Soul Searcher 🌌',
    followersCount: 110,
    isVerified: true,
    auraTheme: 'motivation',
    bio: 'Roy No Rules is not just a brand, it is an emotion. Live like a king, answerable to none. Hard work & selfmade. ⚡',
    favoriteCategory: 'Motivation',
    followerStrings: ['AadyaRoy']
  },
  {
    id: 'seed-user-4',
    realName: 'Priya Patel',
    username: 'PriyaVibes_X',
    email: 'priya.patel@gmail.com',
    passwordHash: SEED_PASS_HASH,
    status: 'blocked', // One user is blocked by default to test blocked state easily
    createdAt: '2026-05-22T19:45:00.000Z',
    activityCount: 15,
    badge: 'Spammer 🚫',
    followersCount: 5,
    auraTheme: 'dark',
    bio: 'Trying to find peace in chaotic vibes. (Blocked by admin for extreme spam activity) 🤐'
  }
];

const DEFAULT_COMMENTS: Comment[] = [
  // Shayari 1 Comments (Motivation)
  {
    id: 'c1',
    shayariId: '1',
    authorRealName: 'Kabir Sharma',
    authorUsername: 'KabirSpeaks',
    text: 'This hit directly in my heart. "ये जो किस्मत अकड़ कर बैठी है..." - Pure attitude and drive! Perfect lines for everyone struggling but building their own path.',
    createdAt: '2026-05-26T14:32:00.000Z',
    reactions: [
      { username: 'AadyaRoy', type: 'fire' },
      { username: 'RitikRai', type: 'heart' }
    ],
    replies: [
      {
        id: 'r1',
        commentId: 'c1',
        authorRealName: 'Aadya Roy',
        authorUsername: 'AadyaRoy',
        text: 'So true Kabir! Absolutely stellar emotional energy. It gives real confidence.',
        createdAt: '2026-05-26T15:05:00.000Z'
      }
    ]
  },
  {
    id: 'c2',
    shayariId: '1',
    authorRealName: 'Aadya Roy',
    authorUsername: 'AadyaRoy',
    text: 'Roy No Rules writes with raw truth. No sugarcoating, just pure fire! 🔥 Can we get an voice player with extra beats?',
    createdAt: '2026-05-26T15:00:00.000Z',
    reactions: [
      { username: 'KabirSpeaks', type: 'mindblown' }
    ],
    replies: []
  },
  // Shayari 2 Comments (Attitude Badshah)
  {
    id: 'c3',
    shayariId: '2',
    authorRealName: 'Ritik Rai',
    authorUsername: 'RitikRai',
    text: 'BAS RULES HUMARE KHUD KE HAIN! 👑 This represents my life motto perfectly. Nobody can control us.',
    createdAt: '2026-05-27T09:12:00.000Z',
    reactions: [
      { username: 'KabirSpeaks', type: 'fire' },
      { username: 'AadyaRoy', type: 'fire' }
    ],
    replies: []
  }
];

const DEFAULT_ACTIVITY: UserActivity[] = [
  { id: 'act-1', username: 'KabirSpeaks', action: 'Comment Created', details: 'Commented on Shayari #1', timestamp: '2026-05-26T14:32:00.000Z' },
  { id: 'act-2', username: 'KabirSpeaks', action: 'Reaction Added', details: 'Reacted with [mindblown] to Aadya\'s comment', timestamp: '2026-05-26T15:10:00.000Z' },
  { id: 'act-3', username: 'AadyaRoy', action: 'Comment Created', details: 'Commented on Shayari #1', timestamp: '2026-05-26T15:00:00.000Z' },
  { id: 'act-4', username: 'AadyaRoy', action: 'Reply Added', details: 'Replied to Kabir\'s comment on Shayari #1', timestamp: '2026-05-26T15:05:00.000Z' },
  { id: 'act-5', username: 'RitikRai', action: 'Comment Created', details: 'Commented on Shayari #2', timestamp: '2026-05-27T09:12:00.000Z' }
];

// --- DB INITIALIZATION HOOK ---
export function initializeCommunityDb() {
  const existingUsers = localStorage.getItem(USERS_KEY);
  if (!existingUsers) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
  } else {
    try {
      const parsed = JSON.parse(existingUsers) as User[];
      // Migrate if any seed users don't have aura theme configured
      if (parsed.length > 0 && !parsed.some(u => u.bio)) {
        localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      }
    } catch (e) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    }
  }
  if (!localStorage.getItem(COMMENTS_KEY)) {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(DEFAULT_COMMENTS));
  }
  if (!localStorage.getItem(ACTIVITY_LOGS_KEY)) {
    localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(DEFAULT_ACTIVITY));
  }
}

// --- SYSTEM GETTERS ---
export function getUsers(): User[] {
  initializeCommunityDb();
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

export function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getComments(shayariId: string): Comment[] {
  initializeCommunityDb();
  const allComments: Comment[] = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
  return allComments.filter(c => c.shayariId === shayariId);
}

export function saveComments(comments: Comment[]) {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}

export function getActivityLogs(): UserActivity[] {
  initializeCommunityDb();
  return JSON.parse(localStorage.getItem(ACTIVITY_LOGS_KEY) || '[]');
}

export function saveActivityLogs(logs: UserActivity[]) {
  localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(logs));
}

export function logUserActivity(username: string, action: string, details: string) {
  const logs = getActivityLogs();
  const newLog: UserActivity = {
    id: 'act-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    username,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog); // newest first
  saveActivityLogs(logs);

  // Increment user activityCount
  const users = getUsers();
  const userIdx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
  if (userIdx !== -1) {
    users[userIdx].activityCount = (users[userIdx].activityCount || 0) + 1;
    saveUsers(users);
  }
}

// --- AUTH ACTIONS ---
export async function registerUser(realName: string, username: string, email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
  const users = getUsers();
  const sanitizedUsername = username.trim();
  const sanitizedEmail = email.trim().toLowerCase();

  // Validate inputs
  if (!realName.trim()) return { success: false, error: 'Real Name is required!' };
  if (!sanitizedUsername) return { success: false, error: 'Username is required!' };
  if (!sanitizedEmail) return { success: false, error: 'Gmail address is required!' };
  if (!password) return { success: false, error: 'Password is required!' };

  // Unique Username Check
  const usernameExists = users.some(u => u.username.toLowerCase() === sanitizedUsername.toLowerCase());
  if (usernameExists) {
    return { success: false, error: 'Username already taken! Choose another.' };
  }

  // Gmail Regex Match (Must end with @gmail.com)
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  if (!gmailRegex.test(sanitizedEmail)) {
    return { success: false, error: 'Only valid Gmail addresses (@gmail.com) are allowed!' };
  }

  // Build New user
  const passwordHash = await hashPassword(password);
  const newUser: User = {
    id: 'user-' + Date.now(),
    realName: realName.trim(),
    username: sanitizedUsername,
    email: sanitizedEmail,
    passwordHash,
    status: 'active',
    createdAt: new Date().toISOString(),
    activityCount: 1,
    badge: 'Member ✨',
    followersCount: 0
  };

  users.push(newUser);
  saveUsers(users);

  logUserActivity(newUser.username, 'Account Created', `Registered with email: ${newUser.email}`);

  return { success: true, user: newUser };
}

export async function loginUser(username: string, passwordHashAttempt: string): Promise<{ success: boolean; error?: string; user?: User }> {
  const users = getUsers();
  const sanitizedUsername = username.trim();

  const user = users.find(u => u.username.toLowerCase() === sanitizedUsername.toLowerCase());
  if (!user) {
    return { success: false, error: 'Username not found!' };
  }

  if (user.status === 'blocked') {
    return { success: false, error: '🚫 Your account is blocked by Admin. You cannot access Roy No Rules community!' };
  }

  // Compare standard password hash
  const hashedPasswordInDb = user.passwordHash;
  if (passwordHashAttempt !== hashedPasswordInDb) {
    return { success: false, error: 'Incorrect password! Please try again.' };
  }

  // Store Session
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  logUserActivity(user.username, 'Login Success', 'Logged into the platform');

  return { success: true, user };
}

export function logoutUser() {
  const activeUser = getCurrentUser();
  if (activeUser) {
    logUserActivity(activeUser.username, 'Logout', 'Logged out of session');
  }
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): User | null {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;

  // Sync state with latest block status inside DB to instantly enforce blocks
  try {
    const user = JSON.parse(session) as User;
    const users = getUsers();
    const latestUser = users.find(u => u.id === user.id);
    if (!latestUser || latestUser.status === 'blocked') {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return latestUser;
  } catch (e) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

// --- COMMENTS INTERACTION ACTIONS ---
export function createComment(shayariId: string, text: string): { success: boolean; error?: string; comment?: Comment } {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Must be logged in to comment!' };
  }
  if (user.status === 'blocked') {
    return { success: false, error: 'Your account is blocked!' };
  }

  const allComments: Comment[] = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
  const newComment: Comment = {
    id: 'comment-' + Date.now() + '-' + Math.floor(Math.random() * 100),
    shayariId,
    authorRealName: user.realName,
    authorUsername: user.username,
    text: text.trim(),
    createdAt: new Date().toISOString(),
    reactions: [],
    replies: []
  };

  allComments.push(newComment);
  saveComments(allComments);

  logUserActivity(user.username, 'Comment Created', `Commented on Shayari #${shayariId}`);

  return { success: true, comment: newComment };
}

export function createReply(commentId: string, text: string): { success: boolean; error?: string; reply?: Reply } {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Must be logged in to reply!' };
  }
  if (user.status === 'blocked') {
    return { success: false, error: 'Your account is blocked!' };
  }

  const allComments: Comment[] = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
  const commentIdx = allComments.findIndex(c => c.id === commentId);
  if (commentIdx === -1) {
    return { success: false, error: 'Parent comment not found!' };
  }

  const newReply: Reply = {
    id: 'reply-' + Date.now() + '-' + Math.floor(Math.random() * 100),
    commentId,
    authorRealName: user.realName,
    authorUsername: user.username,
    text: text.trim(),
    createdAt: new Date().toISOString()
  };

  allComments[commentIdx].replies.push(newReply);
  saveComments(allComments);

  logUserActivity(user.username, 'Reply Created', `Replied to comment #${commentId}`);

  return { success: true, reply: newReply };
}

export function toggleCommentReaction(commentId: string, reactionType: 'heart' | 'fire' | 'sad' | 'laugh' | 'mindblown'): { success: boolean; error?: string } {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Must be logged in to react!' };
  }
  if (user.status === 'blocked') {
    return { success: false, error: 'Your account is blocked!' };
  }

  const allComments: Comment[] = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
  const commentIdx = allComments.findIndex(c => c.id === commentId);
  if (commentIdx === -1) {
    return { success: false, error: 'Comment not found!' };
  }

  const comment = allComments[commentIdx];
  const existingReactionIdx = comment.reactions.findIndex(r => r.username === user.username);

  if (existingReactionIdx !== -1) {
    const existingType = comment.reactions[existingReactionIdx].type;
    // If same reaction, remove it (untoggle)
    if (existingType === reactionType) {
      comment.reactions.splice(existingReactionIdx, 1);
    } else {
      // Modify type
      comment.reactions[existingReactionIdx].type = reactionType;
    }
  } else {
    // Add reaction
    comment.reactions.push({
      username: user.username,
      type: reactionType
    });
  }

  saveComments(allComments);
  logUserActivity(user.username, 'Comment Reaction Toggled', `Toggled [${reactionType}] on comment #${commentId}`);

  return { success: true };
}

// --- ADMIN CONTROL ACTIONS ---
export function setBlockUserStatus(userId: string, isBlocked: boolean): boolean {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return false;

  const user = users[index];
  users[index].status = isBlocked ? 'blocked' : 'active';
  
  // Future ready: update badge to represent block status optionally
  if (isBlocked) {
    users[index].badge = 'Blocked 🚫';
  } else {
    users[index].badge = 'Member ✨';
  }

  saveUsers(users);

  logUserActivity('Roynorules_Admin', isBlocked ? 'User Blocked' : 'User Unblocked', `Changed block status of user: @${user.username}`);
  return true;
}

export function deleteUserFromDb(userId: string): boolean {
  const users = getUsers();
  const userToDelete = users.find(u => u.id === userId);
  if (!userToDelete) return false;

  const updated = users.filter(u => u.id !== userId);
  saveUsers(updated);

  // Also purge metadata comments or assign them to "deleted user" or keep them in DB as deleted
  const allComments: Comment[] = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
  const cleanedComments = allComments.map(c => {
    if (c.authorUsername === userToDelete.username) {
      return { ...c, authorRealName: 'Deleted Community User', authorUsername: 'deleted_user' };
    }
    const cleanedReplies = c.replies.map(r => {
      if (r.authorUsername === userToDelete.username) {
        return { ...r, authorRealName: 'Deleted Community User', authorUsername: 'deleted_user' };
      }
      return r;
    });
    return { ...c, replies: cleanedReplies };
  });
  saveComments(cleanedComments);

  logUserActivity('Roynorules_Admin', 'User Account Deleted', `Permanently deleted user: @${userToDelete.username}`);
  return true;
}

// --- USER PROFILE & MODERN COMMUNITY ENGINE ---

export function updateUserProfile(username: string, updates: Partial<User>): User | null {
  const users = getUsers();
  const index = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
  if (index === -1) return null;

  const currentSession = getCurrentUser();

  users[index] = {
    ...users[index],
    ...updates,
  };
  saveUsers(users);

  // Sync active session if it's the logged-in user
  if (currentSession && currentSession.username.toLowerCase() === username.toLowerCase()) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(users[index]));
  }

  logUserActivity(username, 'Profile Updated', 'Modified social information, bio, or aura');
  return users[index];
}

export function getUserProfile(username: string): User | null {
  const users = getUsers();
  const found = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  return found || null;
}

export function getLikesCountReceivedForUser(username: string): number {
  const approvedSaved = localStorage.getItem('roynorules_approved_shayaris');
  const allShayaris = approvedSaved ? JSON.parse(approvedSaved) : [];
  let totalLikes = 0;
  allShayaris.forEach((s: any) => {
    if (s.uploaderUsername && s.uploaderUsername.toLowerCase() === username.toLowerCase()) {
      totalLikes += (s.likes || 0);
    }
  });
  return totalLikes;
}

export function getUploadsForUser(username: string): { approved: any[]; pending: any[] } {
  const approvedSaved = localStorage.getItem('roynorules_approved_shayaris');
  const allApproved = approvedSaved ? JSON.parse(approvedSaved) : [];
  
  const pendingSaved = localStorage.getItem('roynorules_pending_shayaris');
  const allPending = pendingSaved ? JSON.parse(pendingSaved) : [];

  const userApproved = allApproved.filter((s: any) => s.uploaderUsername && s.uploaderUsername.toLowerCase() === username.toLowerCase());
  const userPending = allPending.filter((s: any) => s.uploaderUsername && s.uploaderUsername.toLowerCase() === username.toLowerCase());

  return { approved: userApproved, pending: userPending };
}

export function getDynamicBadges(user: User): string[] {
  const badges: string[] = ['👑 Royal Member'];
  
  const allComments: Comment[] = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
  const userComments = allComments.filter(c => c.authorUsername.toLowerCase() === user.username.toLowerCase());
  const commentsCount = userComments.length;

  const uploadsData = getUploadsForUser(user.username);
  const uploadsCount = uploadsData.approved.length + uploadsData.pending.length;

  // Active Soul badge (>= 10 activityCount, or sum >= 5)
  if ((user.activityCount || 0) >= 10 || (commentsCount + uploadsCount) >= 5) {
    badges.push('⚡ Active Soul');
  }

  // Deep Thinker badge (>= 3 comments)
  if (commentsCount >= 3) {
    badges.push('💭 Deep Thinker');
  }

  // Motivation King
  if (user.favoriteCategory === 'Motivation' || uploadsData.approved.some(u => u.category === 'Motivation')) {
    badges.push('🔥 Motivation King');
  }

  // Love Writer
  if (user.favoriteCategory === 'Love' || uploadsData.approved.some(u => u.category === 'Love')) {
    badges.push('❤️ Love Writer');
  }

  // Sigma Legend
  if (user.auraTheme === 'sigma') {
    badges.push('🔱 Sigma Legend');
  }

  return badges;
}

export function toggleFollowUser(followerUsername: string, targetUsername: string): { followed: boolean; followersCount: number; followingCount: number } {
  const users = getUsers();
  const followerIdx = users.findIndex(u => u.username.toLowerCase() === followerUsername.toLowerCase());
  const targetIdx = users.findIndex(u => u.username.toLowerCase() === targetUsername.toLowerCase());

  if (followerIdx === -1 || targetIdx === -1) {
    return { followed: false, followersCount: 0, followingCount: 0 };
  }

  const followerUser = users[followerIdx];
  const targetUser = users[targetIdx];

  const followerList = targetUser.followerStrings || [];
  const followingList = followerUser.followingStrings || [];

  const existingIdx = followerList.findIndex(f => f.toLowerCase() === followerUsername.toLowerCase());
  let followed = false;

  if (existingIdx !== -1) {
    // Unfollow
    followerList.splice(existingIdx, 1);
    const selfIdx = followingList.findIndex(g => g.toLowerCase() === targetUsername.toLowerCase());
    if (selfIdx !== -1) {
      followingList.splice(selfIdx, 1);
    }
    followed = false;
  } else {
    // Follow
    followerList.push(followerUsername);
    followingList.push(targetUsername);
    followed = true;
  }

  targetUser.followerStrings = followerList;
  targetUser.followersCount = followerList.length;

  followerUser.followingStrings = followingList;
  followerUser.followingCount = followingList.length;

  users[followerIdx] = followerUser;
  users[targetIdx] = targetUser;
  saveUsers(users);

  // Sync session
  const activeUser = getCurrentUser();
  if (activeUser && activeUser.username.toLowerCase() === followerUsername.toLowerCase()) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(followerUser));
  } else if (activeUser && activeUser.username.toLowerCase() === targetUsername.toLowerCase()) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(targetUser));
  }

  logUserActivity(followerUsername, followed ? 'Followed User' : 'Unfollowed User', `Interacted with @${targetUsername}`);

  return {
    followed,
    followersCount: targetUser.followersCount,
    followingCount: followerUser.followingCount || 0
  };
}

export function getTopUsers(limit: number = 5): any[] {
  const users = getUsers().filter(u => u.status !== 'blocked');
  const allComments: Comment[] = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');

  return users.map(user => {
    const userComments = allComments.filter(c => c.authorUsername.toLowerCase() === user.username.toLowerCase());
    const commentsCount = userComments.length;
    
    const uploadsData = getUploadsForUser(user.username);
    const uploadsCount = uploadsData.approved.length;

    const likesReceived = getLikesCountReceivedForUser(user.username);
    const followersCount = user.followerStrings ? user.followerStrings.length : (user.followersCount || 0);

    // Score layout: activityCount (1x) + comments (3x) + uploads (5x) + likes (2x) + followers (4x)
    const score = (user.activityCount || 0) * 1 + commentsCount * 3 + uploadsCount * 5 + likesReceived * 2 + followersCount * 4;

    return {
      user,
      commentsCount,
      uploadsCount,
      likesReceived,
      followersCount,
      score: Math.round(score)
    };
  })
  .sort((a, b) => b.score - a.score)
  .slice(0, limit);
}

export function calculateRoyCoinsForUser(username: string): {
  royCoins: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalSaves: number;
  engagementScore: number;
} {
  const profileUser = getUserProfile(username);
  if (!profileUser) {
    return {
      royCoins: 0,
      totalViews: 0,
      totalLikes: 0,
      totalShares: 0,
      totalSaves: 0,
      engagementScore: 0
    };
  }

  const uploads = getUploadsForUser(username);
  const totalUploads = uploads.approved.length;
  const totalLikes = getLikesCountReceivedForUser(username);
  const totalViews = (totalLikes * 18) + (totalUploads * 142) + ((profileUser.activityCount || 0) * 12) + 74;
  const totalShares = Math.floor(totalLikes * 0.45 + (totalUploads * 8) + 3);
  const totalSaves = Math.floor(totalLikes * 0.6) + totalUploads;
  const engagementScore = totalUploads > 0 ? Math.min(9.9, Math.max(1.2, parseFloat((4.5 + (totalLikes * 0.8) / totalUploads).toFixed(1)))) : 0;

  // Let's calculate Roy Coins dynamically using the requested metrics:
  // 100 views = 10 Roy Coins (0.1 Coins per view)
  const viewsCoins = Math.floor(totalViews * 0.1);
  // 5 Roy Coins per Like
  const likesCoins = totalLikes * 5;
  // 8 Roy Coins per Save
  const savesCoins = totalSaves * 8;
  // 10 Roy Coins per Share
  const sharesCoins = totalShares * 10;
  // 25 Roy Coins per Approved Upload
  const uploadsCoins = totalUploads * 25;
  
  // Custom Boosts
  const trendingBoost = totalLikes >= 15 ? 150 : 0; // Trending Shayari bonus
  const audienceFavoriteBoost = engagementScore >= 7.0 ? 100 : 0;

  let totalCoins = viewsCoins + likesCoins + savesCoins + sharesCoins + uploadsCoins + trendingBoost + audienceFavoriteBoost;
  
  // High quality seed assets to feel extremely premium
  if (username.toLowerCase() === 'kabirspeaks') {
    totalCoins += 1250;
  } else if (username.toLowerCase() === 'aadyaroy') {
    totalCoins += 950;
  } else if (username.toLowerCase() === 'ritikrai') {
    totalCoins += 480;
  }

  return {
    royCoins: Math.max(10, Math.round(totalCoins)),
    totalViews,
    totalLikes,
    totalShares,
    totalSaves,
    engagementScore
  };
}

