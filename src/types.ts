export interface Shayari {
  id: string;
  text: string;
  category: string;
  author: string;
  highlightedWords: string[];
  likes: number;
  shares: number;
  createdAt: string;
  status: 'approved' | 'pending';
  uploaderUsername?: string;
  slug?: string;
  seoTitle?: string;
  seoDesc?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface User {
  id: string;
  realName: string;
  username: string;
  email: string;
  passwordHash: string; // SHA-256 encrypted string, never displayed or sent to frontend inputs in plain text
  status: 'active' | 'blocked';
  createdAt: string;
  activityCount: number;
  badge?: string; // Future ready: user badges
  followersCount?: number; // Future ready: follower system
  followingCount?: number; // Future ready: following system
  bio?: string; // Profile bio
  auraTheme?: 'sigma' | 'love' | 'motivation' | 'dark' | 'emotional'; 
  favoriteCategory?: string;
  isVerified?: boolean;
  badges?: string[];
  followingStrings?: string[]; // list of usernames followed
  followerStrings?: string[]; // list of usernames following them
}

export interface CommentReaction {
  username: string;
  type: 'heart' | 'fire' | 'sad' | 'laugh' | 'mindblown';
}

export interface Reply {
  id: string;
  commentId: string;
  authorRealName: string;
  authorUsername: string;
  text: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  shayariId: string;
  authorRealName: string;
  authorUsername: string;
  text: string;
  createdAt: string;
  reactions: CommentReaction[];
  replies: Reply[];
}
