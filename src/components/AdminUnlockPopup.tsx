import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, ShieldAlert, KeyRound, Monitor, Terminal } from 'lucide-react';

interface AdminUnlockPopupProps {
  onClose: () => void;
  onSuccess: () => void;
  showToast: (msg: string) => void;
}

export default function AdminUnlockPopup({ onClose, onSuccess, showToast }: AdminUnlockPopupProps) {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const handleKeypadPress = (val: string) => {
    setError('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.toLowerCase() !== 'roynorules') {
      setError('Unknown Secret Username');
      return;
    }
    if (pin === '9027671630') {
      setIsAuthorizing(true);
      setTimeout(() => {
        setIsAuthorizing(false);
        showToast('System Override Accepted. Loading HQ Dashboard... ⚡');
        onSuccess();
      }, 1000);
    } else {
      setError('Cryptographic Passkey Rejected!');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/98 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-sm bg-zinc-950 border border-red-550/20 rounded-[28px] p-6 shadow-[0_0_80px_rgba(239,68,68,0.25)] relative overflow-hidden flex flex-col items-center text-center"
        id="admin-auth-popup"
      >
        {/* Decorative Grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="w-full flex justify-between items-center select-none mb-4 relative z-10">
          <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 tracking-wider">
            <Terminal size={12} className="text-red-500" />
            <span>SECURE GATEWAY v3.2</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition p-1 rounded-full bg-zinc-900 border border-zinc-850 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Shield Icon Decoration */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-red-650/10 to-transparent border border-red-550/20 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(239,68,68,0.08)]">
          <ShieldAlert className="text-red-500 animate-pulse" size={26} />
        </div>

        <h3 className="text-lg font-black text-white tracking-wide uppercase select-none">
          Decrypt Core Console
        </h3>
        <p className="text-[11px] text-zinc-500 font-mono mt-1 mb-5 select-none leading-relaxed max-w-[280px]">
          Enter your unique system identity credentials to load full admin control vectors.
        </p>

        {isAuthorizing ? (
          <div className="py-12 space-y-4">
            <div className="w-8 h-8 rounded-full border-2 border-red-950 border-t-red-500 animate-spin mx-auto" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Establishing Decryption...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-4 relative z-10 text-left">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-955/20 border border-red-550/30 text-red-400 text-[11px] rounded-xl font-mono text-center font-bold"
              >
                ⚠️ {error}
              </motion.div>
            )}

            {/* Username */}
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">ID Name</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. roynorules"
                className="w-full bg-zinc-900/60 border border-zinc-900 focus:border-red-500/40 text-zinc-100 rounded-xl px-3.5 py-2.5 text-xs outline-none transition"
              />
            </div>

            {/* Hidden passcode visual representation */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block text-center">PIN Code (10 Digits)</label>
              <div className="flex justify-center gap-1.5 py-1 select-none">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full border transition-all duration-300 ${
                      pin.length > idx
                        ? 'bg-red-505 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] scale-110'
                        : 'border-zinc-800 bg-zinc-900'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-1.5 bg-zinc-900/40 p-2.5 rounded-2xl border border-zinc-900">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'backspace'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeypadPress(key)}
                  className={`h-9 text-xs font-bold rounded-xl flex items-center justify-center transition active:scale-95 cursor-pointer shadow-sm ${
                    key === 'C'
                      ? 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-red-500 border border-zinc-850'
                      : key === 'backspace'
                      ? 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-850'
                      : 'bg-zinc-950 hover:bg-zinc-900 text-white border border-zinc-900/60'
                  }`}
                >
                  {key === 'backspace' ? '⌫' : key}
                </button>
              ))}
            </div>

            {/* Confirm Override Trigger */}
            <button
              type="submit"
              disabled={!username || pin.length !== 10}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-650 to-rose-700 hover:from-red-550 hover:to-rose-650 disabled:from-zinc-900 disabled:to-zinc-900 text-white font-extrabold text-[11px] uppercase tracking-widest transition duration-300 active:scale-98 disabled:opacity-40 select-none cursor-pointer text-center"
            >
              Verify Core Override
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
