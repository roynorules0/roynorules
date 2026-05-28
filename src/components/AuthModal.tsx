import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Key, Mail, User as UserIcon, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { registerUser, loginUser, hashPassword, getUsers } from '../utils/communityDb';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  showToast: (msg: string) => void;
  initialTab?: 'login' | 'signup';
}

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  showToast,
  initialTab = 'login',
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [realName, setRealName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Handle Login Submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    try {
      // Synchronously compute password hash first
      const passwordHashAttempt = await hashPassword(password);
      const res = await loginUser(username.trim(), passwordHashAttempt);

      if (res.success && res.user) {
        onAuthSuccess(res.user);
        showToast(`Welcome back, ${res.user.realName}! 🌌`);
        onClose();
        resetForm();
      } else {
        setErrorMsg(res.error || 'Authentication failed.');
      }
    } catch (e: any) {
      setErrorMsg('An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Signup Submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Local standard field validations
    if (!realName.trim() || !username.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMsg('All fields are required.');
      return;
    }

    // Username unique check fast preview
    const existingUsers = getUsers();
    const nameTaken = existingUsers.some((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (nameTaken) {
      setErrorMsg('Username in use. Choose another vibe.');
      return;
    }

    // Email pattern check
    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailPattern.test(email.trim().toLowerCase())) {
      setErrorMsg('Only valid @gmail.com accounts are permitted!');
      return;
    }

    // Password Match check
    if (password !== confirmPassword) {
      setErrorMsg('Confirm password does not match.');
      return;
    }

    // Length check
    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const signupRes = await registerUser(
        realName.trim(),
        username.trim(),
        email.trim(),
        password
      );

      if (signupRes.success && signupRes.user) {
        // Automatically log in the user on signup success
        const passHash = await hashPassword(password);
        const loginRes = await loginUser(username.trim(), passHash);
        if (loginRes.success && loginRes.user) {
          onAuthSuccess(loginRes.user);
          showToast(`Account Created! Welcome to the brotherhood ${realName}! 🔥`);
          onClose();
          resetForm();
        }
      } else {
        setErrorMsg(signupRes.error || 'Registration failed.');
      }
    } catch (e) {
      setErrorMsg('An error occurred during account registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setRealName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrorMsg('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-[#000000]/85 backdrop-blur-md z-[60] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        id="auth-modal-screen-container"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="relative w-full max-w-md bg-zinc-950/95 border border-zinc-900 rounded-[24px] shadow-[0_0_40px_rgba(239,68,68,0.15)] overflow-y-auto max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cyberpunk Top Neon Accent Line */}
          <div className="h-[2.5px] w-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white bg-zinc-900/55 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 rounded-xl transition cursor-pointer z-20"
            aria-label="Close dialog"
          >
            <X size={15} />
          </button>

          {/* Header branding */}
          <div className="p-6 pb-4 text-center select-none">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-red-950/25 border border-red-500/20 text-red-500 mb-2.5 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <ShieldAlert size={20} className="animate-pulse" />
            </div>
            <h3 className="text-xl font-black font-sans tracking-wide text-white uppercase bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              {activeTab === 'login' ? 'Roy No Rules Identity' : 'Join The Community'}
            </h3>
            <p className="text-[11px] text-zinc-400 tracking-wide font-mono mt-1">
              {activeTab === 'login' ? 'ENTER SOCIAL HUB VIBES' : 'CREATE REAL USER ID'}
            </p>
          </div>

          {/* Form Tabs */}
          <div className="flex border-b border-zinc-900/80 px-4">
            <button
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-3 text-xs font-black font-mono tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'border-red-500 text-red-500 shadow-[inset_0_-8px_10px_rgba(239,68,68,0.02)]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setErrorMsg('');
              }}
              className={`flex-1 py-3 text-xs font-black font-mono tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                activeTab === 'signup'
                  ? 'border-red-500 text-red-500 shadow-[inset_0_-8px_10px_rgba(239,68,68,0.02)]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Authentications Content */}
          <div className="p-6 pt-5">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-4.5 p-3.5 bg-red-950/25 border border-red-500/35 text-red-400 text-xs rounded-xl flex items-start gap-2.5 font-medium shadow-[0_0_12px_rgba(239,68,68,0.05)]"
                id="auth-error-block"
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-500" />
                <span className="leading-relaxed">{errorMsg}</span>
              </motion.div>
            )}

            {/* LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <UserIcon size={14} />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. KabirSpeaks"
                      required
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)] transition-all placeholder:text-zinc-650"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                    Secret Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Lock size={14} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)] transition-all placeholder:text-zinc-650"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 active:scale-95 text-white font-bold py-3 px-4 rounded-xl text-xs tracking-widest uppercase transition-all duration-300 cursor-pointer disabled:opacity-45 select-none font-mono flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? 'Decrypting Session...' : 'Authenticate'}
                </button>
              </form>
            )}

            {/* SIGNUP FORM */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-3.5">
                {/* Real Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                    Real Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <UserIcon size={14} />
                    </div>
                    <input
                      type="text"
                      value={realName}
                      onChange={(e) => setRealName(e.target.value)}
                      placeholder="e.g. Aadya Roy"
                      required
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)] transition-all placeholder:text-zinc-650"
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                    Username (Unique)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <UserIcon size={14} className="text-zinc-500" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))} // No spaces in username
                      placeholder="e.g. AadyaRoy"
                      required
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)] transition-all placeholder:text-zinc-650"
                    />
                  </div>
                </div>

                {/* Gmail Address */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                    Gmail Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Mail size={14} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="username@gmail.com"
                      required
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)] transition-all placeholder:text-zinc-650"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                        <Key size={14} />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••"
                        required
                        className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)] transition-all placeholder:text-zinc-650"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                      Confirm Pass
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                        <Key size={14} />
                      </div>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••"
                        required
                        className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)] transition-all placeholder:text-zinc-650"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms notification constraint */}
                <div className="p-2.5 bg-zinc-900/40 rounded-xl border border-zinc-900 text-[10px] text-zinc-500 leading-normal text-left">
                  🛡️ Password is securely encrypted in your client container utilizing browser-native WebCrypto SHA-256. Admin panel never exposes your plaintext keys.
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 active:scale-95 text-white font-bold py-3 px-4 rounded-xl text-xs tracking-widest uppercase transition-all duration-300 cursor-pointer disabled:opacity-45 select-none font-mono flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Creating Identity...' : 'Join Brotherhood'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
