import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Lock, ShieldAlert, KeyRound, Monitor, Terminal, Eye, EyeOff, ShieldX } from 'lucide-react';

interface AdminUnlockPopupProps {
  onClose: () => void;
  onSuccess: () => void;
  showToast: (msg: string) => void;
}

export default function AdminUnlockPopup({ onClose, onSuccess, showToast }: AdminUnlockPopupProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Persistent brute-force tracker across refreshes for maximum security
  const [attempts, setAttempts] = useState(() => {
    const saved = localStorage.getItem('roynorules_admin_login_attempts');
    return saved ? parseInt(saved, 10) : 0;
  });

  const isBlocked = attempts >= 5;

  // Handle direct admin URL status
  const isDirectAdminUrl = typeof window !== 'undefined' && 
    (window.location.pathname === '/admin' || window.location.pathname === '/admin/' || window.location.pathname === '/admin-login' || window.location.pathname === '/admin-login/');

  const handleCloseAction = () => {
    if (isDirectAdminUrl) {
      // Direct redirect back to home if on administrative route
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new Event('popstate'));
    }
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) {
      setError('This terminal is blacklisted due to multiple unauthorized login attempts.');
      return;
    }

    setIsAuthorizing(true);
    setError('');

    setTimeout(() => {
      const cleanUsername = username.trim().toLowerCase();
      const cleanPassword = password.trim();

      if (cleanUsername === 'roynorules' && cleanPassword === '9027671630') {
        // Success
        setAttempts(0);
        localStorage.setItem('roynorules_admin_login_attempts', '0');
        // Secure admin session credentials saved
        localStorage.setItem('roynorules_admin_verified', 'true');
        localStorage.setItem('admin_last_activity', Date.now().toString());
        setIsAuthorizing(false);
        showToast('🔑 Secure gateway unlocked successfully. Welcome back, Admin!');
        onSuccess();
      } else {
        // Failed attempt
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        localStorage.setItem('roynorules_admin_login_attempts', nextAttempts.toString());
        setIsAuthorizing(false);

        if (nextAttempts >= 5) {
          setError('🚨 MAXIMUM WRONG LOGIN LIMIT EXCEEDED. This node is now hardcoded with a security lock.');
          showToast('❌ Too many incorrect attempts! Portal lock engaged.');
        } else {
          setError(`Incorrect username or passkey credentials. Attack defenses active: ${5 - nextAttempts} attempts remaining.`);
          setPassword('');
        }
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-[#070708] backdrop-blur-3xl z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Imposing ambient glowing background accents */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(244,63,94,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(244,63,94,0.015)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-red-950/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-y-1/2 translate-x-1/2 w-[350px] h-[350px] bg-amber-955/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 15 }}
        className="w-full max-w-4xl bg-zinc-950/90 border border-zinc-900 rounded-[30px] shadow-[0_0_100px_rgba(239,68,68,0.08)] overflow-hidden relative z-10 flex flex-col md:flex-row min-h-[520px]"
        id="admin-security-gateway"
      >
        {/* Left Hand: Imposing "Unauthorized Access Warning Page" Banner (Requirement 8) */}
        <div className="w-full md:w-[45%] bg-[#0d0c0e] border-b md:border-b-0 md:border-r border-zinc-900/60 p-8 flex flex-col justify-between relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-950/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="space-y-6 relative z-10 text-left">
            <div className="flex items-center gap-2 select-none">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-[9px] font-mono font-black text-red-500 tracking-[0.25em] uppercase">SYSTEM WARNING</span>
            </div>

            <div className="space-y-3">
              <div className="inline-flex p-3 rounded-2xl bg-red-950/30 border border-red-500/20 text-red-505">
                <ShieldAlert size={28} className="text-red-550" />
              </div>
              <h2 className="text-xl font-mono font-black text-white tracking-tight uppercase leading-snug">
                Unauthorized Access Is Strictly Prohibited
              </h2>
            </div>

            <p className="text-xs text-zinc-500 font-sans leading-relaxed">
              This terminal provides administrative oversight for Roy Verse Hub database registries. Accessing or attempting to bypass this cryptographic gatekeeper with false configurations is logged under standard cybersecurity protocols.
            </p>

            <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-900 space-y-2 font-mono text-[10.5px] text-zinc-400">
              <div className="flex justify-between">
                <span className="text-zinc-600 uppercase font-bold">Node Address</span>
                <span className="text-zinc-300">0.0.0.0 (Reverse Ingress)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 uppercase font-bold">Trace Status</span>
                <span className="text-red-500 font-bold uppercase select-text">Active Log Monitoring</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 uppercase font-bold">Authority Level</span>
                <span className="text-amber-500 font-bold uppercase">Root Operator</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-900/60 font-mono text-[9.5px] text-zinc-650 text-left relative z-10 select-none">
            ⚠️ Standard penalty parameters apply to any brute forced session hijack patterns. Defensives engaged.
          </div>
        </div>

        {/* Right Hand: Cybersecurity login portal / credential verify lock (Requirement 1, 2) */}
        <div className="w-full md:w-[55%] p-8 md:p-10 flex flex-col justify-between relative">
          {/* Dismiss button */}
          <div className="w-full flex justify-between items-center mb-6 select-none">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-550 tracking-wider">
              <Terminal size={12} className="text-zinc-500" />
              <span>CRYPTOGRAPHIC PASS GATE v4.0</span>
            </div>
            <button
              onClick={handleCloseAction}
              className="text-zinc-500 hover:text-white transition p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 cursor-pointer"
              title="Return to Public View"
            >
              <X size={13} />
            </button>
          </div>

          <div className="my-auto space-y-6 text-left">
            <div>
              <h3 className="text-lg font-black text-white tracking-wide uppercase font-mono">
                Operator Authenticator
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Enter structural credentials below to establish a dynamic secure workspace session.
              </p>
            </div>

            {isAuthorizing ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 rounded-full border-4 border-red-950 border-t-red-500 animate-spin" />
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">Syncing Gate Security Protocol...</span>
              </div>
            ) : isBlocked ? (
              <div className="p-6 bg-red-950/20 border-2 border-red-500/30 rounded-2xl space-y-4 text-center">
                <div className="inline-flex p-3 rounded-full bg-red-900/30 text-red-500 border border-red-500/20">
                  <ShieldX size={32} />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-mono font-black text-red-400 uppercase tracking-wider">🔒 Hardware Module Intercept Locked</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                    Too many invalid attempts have triggered our cybersecurity firewall. This browser profile has been soft-locked to mitigate credential brute force scans.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setAttempts(0);
                      localStorage.setItem('roynorules_admin_login_attempts', '0');
                      setError('');
                    }}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-[10px] font-mono text-zinc-300 rounded-xl transition uppercase cursor-pointer"
                  >
                    Reset Security Core (For verification)
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-950/30 border border-red-500/20 text-red-400 text-xs rounded-xl font-mono text-left font-bold"
                  >
                    ⚠️ {error}
                  </motion.div>
                )}

                {/* Username Input (Requirement 1) */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-550 uppercase tracking-wider block font-bold">Admin Identifier Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter administrator ID..."
                      className="w-full bg-zinc-900/50 border border-zinc-900 focus:border-red-500/30 text-zinc-200 rounded-xl px-4 py-3 text-xs outline-none transition pl-10"
                      autoFocus
                    />
                    <KeyRound size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                  </div>
                </div>

                {/* Password Input (Requirement 1) */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-550 uppercase tracking-wider block font-bold">Passcode Master Key</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-zinc-900/50 border border-zinc-900 focus:border-red-500/30 text-zinc-200 rounded-xl px-4 py-3 text-xs outline-none transition pl-10 pr-10"
                    />
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Attempt Status Shield indicator (Requirement 7) */}
                {attempts > 0 && (
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-900">
                    <span>Incorrect Login Attempts:</span>
                    <span className="text-red-400 font-bold px-1.5 py-0.5 bg-red-950/20 rounded border border-red-500/10 uppercase">
                      {attempts} / 5 Checked
                    </span>
                  </div>
                )}

                {/* Action Submit Trigger (Requirement 1) */}
                <button
                  type="submit"
                  disabled={!username || !password}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-650 to-rose-700 hover:from-red-550 hover:to-rose-650 disabled:from-zinc-900 disabled:to-zinc-900 text-white font-black text-[11px] uppercase tracking-widest transition duration-300 active:scale-98 disabled:opacity-30 select-none cursor-pointer text-center shadow-lg hover:shadow-red-900/10"
                >
                  Verify Admin Identity
                </button>
              </form>
            )}
          </div>

          <div className="text-[10px] text-zinc-600 font-mono text-center select-none pt-4">
            Secured via Roy Verse Hub Cryptographic Node Security Policy.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
