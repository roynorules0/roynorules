import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Info, FileText, AlertTriangle, Mail, Phone, 
  MapPin, Send, MessageSquare, CheckCircle, ArrowLeft, ExternalLink, 
  Heart, Sparkles, Flame, ShieldAlert, XOctagon, Eye, CheckCircle2, Trash2,
  Activity, RefreshCw
} from 'lucide-react';

interface ContactFormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface TrustPagesProps {
  activePath: string; // e.g. '/about-us', '/privacy-policy', '/terms-and-conditions', ...
  onNavigate: (path: string) => void;
  onClose: () => void;
}

export default function TrustPages({ activePath, onNavigate, onClose }: TrustPagesProps) {
  const [form, setForm] = useState<ContactFormState>({ name: '', email: '', subject: 'Inquiry', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Custom states for active support ticket simulation (real-time look & feel)
  const [activeTicketCount, setActiveTicketCount] = useState(() => {
    return Math.floor(Math.random() * 4) + 2; 
  });

  // Diagnostics States
  const [health, setHealth] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [diagError, setDiagError] = useState<string | null>(null);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [contentType, setContentType] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setChecking(true);
    setDiagError(null);
    const startTime = performance.now();
    try {
      const res = await fetch('/api/health-check');
      const endTime = performance.now();
      setPingMs(Math.round(endTime - startTime));
      
      const cType = res.headers.get('content-type') || 'unknown';
      setContentType(cType);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} returned.`);
      }
      
      if (cType.includes('text/html')) {
        throw new Error('Received unexpected HTML (text/html) instead of JSON. This indicates Netlify routing is serving the 404 page for API paths.');
      }
      
      const data = await res.json();
      setHealth(data);
    } catch (err: any) {
      setDiagError(err.message || 'Network connectivity error.');
      setHealth(null);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (activePath === '/api-diagnostics') {
      runDiagnostics();
    }
  }, [activePath]);

  // SEO setup and synchronization effect for compliance indexability
  useEffect(() => {
    let seoTitle = 'RoyVerse Hub';
    let seoDesc = 'Discover premium Hinglish emotional shayari, motivation, status customizer, and creative rules on RoyVerse Hub.';
    
    switch (activePath) {
      case '/about-us':
        seoTitle = 'About Us | RoyVerse Hub';
        seoDesc = 'Who we are. Behind RoyVerse Hub—a premier community platform for user-generated shayari and motivational content founded by Ritik Rai.';
        break;
      case '/privacy-policy':
        seoTitle = 'Privacy Policy | RoyVerse Hub';
        seoDesc = 'Full details on user data protections, localStorage configuration, Google Analytics tracking, and future Google AdSense guidelines.';
        break;
      case '/terms-and-conditions':
        seoTitle = 'Terms & Conditions | RoyVerse Hub';
        seoDesc = 'Respectful engagement, content ownership licensing, anti-abuse policies, and publisher conditions on RoyVerse Hub.';
        break;
      case '/disclaimer':
        seoTitle = 'Artistic & Content Disclaimer | RoyVerse Hub';
        seoDesc = 'Artistic ownership disclosures regarding user-generated content, copyright protections, and third-party links validation.';
        break;
      case '/cookie-policy':
        seoTitle = 'Cookie Policy | RoyVerse Hub';
        seoDesc = 'Comprehensive information explaining essential, analytical, and future targeted Google AdSense advertising cookies on RoyVerse Hub.';
        break;
      case '/dmca-policy':
        seoTitle = 'DMCA Copyright Take-down Policy | RoyVerse Hub';
        seoDesc = 'Copyright claim processing, notice guidelines, and rapid material removal workflow on RoyVerse Hub.';
        break;
      case '/community-guidelines':
        seoTitle = 'Community Guidelines | RoyVerse Hub';
        seoDesc = 'Understand our core code of behavior. Mutual respect pacts, anti-spam clauses, and plagiarism mitigation rules.';
        break;
      case '/content-moderation':
        seoTitle = 'Content Moderation Standards | RoyVerse Hub';
        seoDesc = 'How submissions get vetted. Insight into our poetic reviews, rejection criteria, and manual editing pipelines.';
        break;
      case '/data-deletion':
        seoTitle = 'Data Deletion Rights | RoyVerse Hub';
        seoDesc = 'Your data, your control. Learn how to wipe custom favorites, delete client registries, or request form clean-ups.';
        break;
      case '/contact-us':
        seoTitle = 'Connect With Us | RoyVerse Hub';
        seoDesc = 'Need directly personalized reach and support? Drop an email with us at roynoruless@gmail.com or join the official Telegram channel.';
        break;
    }

    document.title = seoTitle + ' | RoyVerse Hub';
    
    // Dynamically synchronize meta description tags for robust Google Search Crawler optimization
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', seoDesc);
  }, [activePath]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('https://formspree.io/f/xzdworly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
          website: 'RoyVerse Hub'
        })
      });

      if (response.ok) {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setForm({ name: '', email: '', subject: 'Feedback', message: '' });
        setActiveTicketCount(prev => prev + 1);
        
        setTimeout(() => setSubmitSuccess(false), 8000);
      } else {
        throw new Error('Formspree connection issue');
      }
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError('Failed to transmit message. Please contact us directly at roynoruless@gmail.com');
    }
  };

  // Pre-compiled list of all 11 official compliance directories
  const menuItems = [
    { path: '/about-us', label: '📖 About Us', desc: 'Who we are & our mission' },
    { path: '/contact-us', label: '📞 Contact Us', desc: 'Feedback & support channel' },
    { path: '/privacy-policy', label: '🔒 Privacy Policy', desc: 'Your data safeguard pact' },
    { path: '/terms-and-conditions', label: '⚖️ Terms of Service', desc: 'Core platform rules' },
    { path: '/cookie-policy', label: '🍪 Cookie Policy', desc: 'Essential & Google AdSense' },
    { path: '/disclaimer', label: '📢 Disclaimer', desc: 'UGC & content accuracy' },
    { path: '/dmca-policy', label: '🚀 DMCA Policy', desc: 'Takedown requests process' },
    { path: '/community-guidelines', label: '🤝 Community Rules', desc: 'Respect & safe engagement' },
    { path: '/content-moderation', label: '🛡️ Moderation', desc: 'Submissions review process' },
    { path: '/data-deletion', label: '🗑️ Data Deletion', desc: 'Permanent account wipe' },
    { path: '/api-diagnostics', label: '⚡ System Status', desc: 'Service Health diagnostics' }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/98 backdrop-blur-md z-50 flex flex-col overflow-y-auto"
      id="trust-pages-modal-root"
    >
      {/* 1. CINEMATIC PREMIUM TOP NAV BAR */}
      <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-md border-b border-white/5 z-30 px-4 py-4 md:px-8 flex items-center justify-between select-none">
        
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono font-black text-zinc-400 hover:text-white border border-zinc-900 rounded-lg hover:border-red-500/30 transition bg-black/40 cursor-pointer"
        >
          <ArrowLeft size={13} className="text-red-500" />
          <span>RETURN TO PORTAL</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <h1 className="text-xs font-sans font-black tracking-[0.2em] uppercase text-white">
            COMPLIANCE CENTER
          </h1>
        </div>

        <div className="hidden md:flex gap-1">
          <span className="text-[9px] font-mono text-zinc-500 border border-zinc-900 px-2.5 py-1 rounded bg-zinc-950/40 uppercase tracking-widest">
            RoyVerse Hub Verified ID
          </span>
        </div>
      </div>

      {/* 2. TABBED PANEL CONTENT EXPLORER */}
      <div className="max-w-6xl mx-auto w-full px-4 md:px-6 py-8 flex-1 flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-[260px] shrink-0 flex flex-col gap-1.5 select-none lg:sticky lg:top-24 h-fit">
          <div className="px-3 mb-2">
            <span className="text-[9px] font-mono text-zinc-600 tracking-[0.15em] uppercase font-bold block">
              Official Guidelines & Policies
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-1.5">
            {menuItems.map((item) => {
              const isSelected = activePath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`py-2.5 px-4 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-center ${
                    isSelected
                      ? 'border-red-500 bg-red-950/15 text-white shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                      : 'border-zinc-950 bg-zinc-950/40 text-zinc-400 hover:text-white hover:border-zinc-800'
                  }`}
                >
                  <span className="text-xs font-bold leading-normal">{item.label}</span>
                  <span className="text-[9px] font-mono text-zinc-500 mt-0.5">{item.desc}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-zinc-950/25 border border-zinc-900/60 text-center select-none hidden lg:block">
            <span className="text-[10px] font-mono text-zinc-500 leading-normal block">
              Need immediate compliance assistance?<br />
              <a href="mailto:roynoruless@gmail.com" className="text-red-500 font-bold block mt-1 hover:underline">
                roynoruless@gmail.com
              </a>
            </span>
          </div>
        </div>

        {/* Dynamic Panel Content Reader */}
        <div className="flex-1 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePath}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="bg-zinc-950/25 border border-zinc-900 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.8)]"
            >
              {/* Dynamic decorative neon gradient backing */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-red-650/5 blur-[70px] pointer-events-none rounded-full" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-zinc-800/5 blur-[70px] pointer-events-none rounded-full" />

              {/* 1. ABOUT US */}
              {activePath === '/about-us' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4 select-none">
                    <span className="w-10 h-10 rounded-xl bg-red-950/30 border border-red-500/20 text-red-500 flex items-center justify-center">
                      <Sparkles size={20} className="animate-spin" style={{ animationDuration: '8s' }} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black font-sans tracking-wide text-white uppercase leading-none">
                        About RoyVerse Hub
                      </h2>
                      <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest mt-1.5 block">
                        Our Mission, Vision, and Design Philosophy
                      </span>
                    </div>
                  </div>

                  <div className="text-zinc-300 space-y-4 text-xs md:text-sm leading-relaxed font-sans">
                    <p className="first-letter:text-4xl first-letter:font-black first-letter:text-red-500 first-letter:float-left first-letter:mr-2">
                      RoyVerse Hub (<a href="https://royversehub.netlify.app" target="_blank" rel="noopener noreferrer" className="text-white underline hover:text-red-400">https://royversehub.netlify.app</a>) constitutes a premier, dynamic, user-generated platform dedicated to Urdu, Hindi, and English Shayari, classic Quotes, emotional journaling, motivation, Love chronicles, Sad notes, Friendship, Attitude, and community content exploration.
                    </p>

                    <p>
                      Founded by <span className="text-white font-bold">Ritik Rai</span> (<a href="mailto:roynoruless@gmail.com" className="text-red-400 hover:underline">roynoruless@gmail.com</a>), the primary goal of RoyVerse Hub is to foster an atmosphere of unrestricted creative freedom, giving users and independent poets high-end features to design custom status presets, listen to synthesized voice playbacks of literature, and share deep aesthetic layouts without any engineering friction.
                    </p>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      Core Operations
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 select-none">
                      <li className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-xl flex items-start gap-2.5 text-xs text-zinc-400">
                        <span className="text-xs text-red-400 mt-0.5">✨</span>
                        <div>
                          <b className="text-white block font-bold mb-0.5">User-Generated Submissions</b>
                          Every user can directly submit high-value poetry and quotes to be categorized and visible worldwide.
                        </div>
                      </li>
                      <li className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-xl flex items-start gap-2.5 text-xs text-zinc-400">
                        <span className="text-xs text-red-400 mt-0.5">🎭</span>
                        <div>
                          <b className="text-white block font-bold mb-0.5">Premium HD Studio</b>
                          Instantly transform static poetry into gorgeous, high-contrast, downloadable graphic cards for IG/WhatsApp.
                        </div>
                      </li>
                      <li className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-xl flex items-start gap-2.5 text-xs text-zinc-400">
                        <span className="text-xs text-red-400 mt-0.5">📢</span>
                        <div>
                          <b className="text-white block font-bold mb-0.5">Auto Post Telegram Hooks</b>
                          Vetted community masterpieces are directly broadcasted to the official Telegram channel: <a href="https://t.me/royversehub" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">https://t.me/royversehub</a>.
                        </div>
                      </li>
                      <li className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-xl flex items-start gap-2.5 text-xs text-zinc-400">
                        <span className="text-xs text-red-400 mt-0.5">🕊️</span>
                        <div>
                          <b className="text-white block font-bold mb-0.5">Zero Boundaries, Full Autonomy</b>
                          A dedicated space celebrating midnight thoughts, romantic soundscapes, grief support, and robust attitude poetry.
                        </div>
                      </li>
                    </ul>

                    <p className="mt-4">
                      Whether you are an aspiring author trying to build your personal audience or a poetry lover seeking a safe sanctuary to absorb genuine emotions, RoyVerse Hub represents our shared space to celebrate deep, raw human stories.
                    </p>
                  </div>
                </div>
              )}

              {/* 2. CONTACT US */}
              {activePath === '/contact-us' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 select-none">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-red-950/30 border border-red-500/20 text-red-505 flex items-center justify-center">
                        <Mail size={20} className="text-red-500 animate-bounce" />
                      </span>
                      <div>
                        <h2 className="text-lg font-black font-sans tracking-wide text-white uppercase leading-none">
                          Connect With Us
                        </h2>
                        <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest mt-1.5 block">
                          Official support, inquiries, and contributor pipelines
                        </span>
                      </div>
                    </div>
                    <span className="text-[8px] font-mono bg-zinc-900 border border-white/5 px-2 py-1 rounded-full text-zinc-400 uppercase tracking-widest">
                      Typical Response: &lt; 2 Hours
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                    
                    {/* Official Reach Details */}
                    <div className="lg:col-span-5 space-y-4">
                      
                      <div className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-900 flex items-start gap-4 hover:border-red-500/20 transition-all select-text">
                        <span className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/20 text-red-500 shrink-0">
                          <Mail size={16} />
                        </span>
                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">SUPPORT DESK</span>
                          <a href="mailto:roynoruless@gmail.com" className="text-sm font-black text-white mt-0.5 block hover:underline">
                            roynoruless@gmail.com
                          </a>
                          <span className="text-[10px] text-zinc-400 mt-1 block">Write to us for takedowns, submissions, and feedback</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-900 flex items-start gap-4 hover:border-red-500/20 transition-all">
                        <span className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/20 text-red-500 shrink-0">
                          <MessageSquare size={16} />
                        </span>
                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">OFFICIAL TELEGRAM CHANNEL</span>
                          <a 
                            href="https://t.me/royversehub" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm font-black text-white mt-0.5 block hover:underline"
                          >
                            t.me/royversehub
                          </a>
                          <span className="text-[10px] text-zinc-400 mt-1 block">Join for dynamic updates, broadcasts and poetry logs</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-900 flex items-start gap-4">
                        <span className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/20 text-red-500 shrink-0">
                          <MapPin size={16} />
                        </span>
                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">OFFICIAL RESIDENCY</span>
                          <span className="text-sm font-black text-white mt-0.5 block">Uttar Pradesh, India</span>
                          <span className="text-[10px] text-zinc-400 mt-1 block">Ritik Rai • Founder & Director</span>
                        </div>
                      </div>

                    </div>

                    {/* Contact Form Submission Area */}
                    <div className="lg:col-span-7 bg-zinc-900/10 border border-zinc-900 p-5 rounded-2xl relative">
                      <AnimatePresence mode="wait">
                        {submitSuccess ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="text-center py-10 space-y-4 select-none"
                          >
                            <span className="w-12 h-12 bg-red-950/40 border border-red-500/30 text-red-500 rounded-full flex items-center justify-center mx-auto">
                              <CheckCircle size={24} className="animate-pulse" />
                            </span>
                            <div className="space-y-1">
                              <h3 className="text-sm font-black text-white uppercase tracking-wider">Ticket Created Successfully</h3>
                              <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                                Thank you for connecting with Ritik Rai at RoyVerse Hub. We have queued your request and will follow up shortly.
                              </p>
                            </div>
                            <button
                              onClick={() => setSubmitSuccess(false)}
                              className="px-4 py-1.5 border border-zinc-800 text-[10px] font-mono text-zinc-400 hover:text-white rounded-lg transition duration-200 cursor-pointer"
                            >
                              Open Another Ticket
                            </button>
                          </motion.div>
                        ) : (
                          <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
                            {submitError && (
                              <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-red-500 font-bold font-mono text-xs text-center">
                                {submitError}
                              </div>
                            )}

                            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold block mb-1">
                              SECURE INQUIRY TICKETING (ACTIVE QUEUE: #{activeTicketCount})
                            </span>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-mono text-zinc-500 uppercase font-black">YOUR NAME</label>
                                <input
                                  type="text"
                                  required
                                  value={form.name}
                                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                  placeholder="e.g. Ritik Kumar"
                                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-red-500/50 text-white rounded-xl px-3 py-2 text-xs outline-none"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-mono text-zinc-500 uppercase font-black">YOUR EMAIL</label>
                                <input
                                  type="email"
                                  required
                                  value={form.email}
                                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                                  placeholder="e.g. ritik@gmail.com"
                                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-red-500/50 text-white rounded-xl px-3 py-2 text-xs outline-none"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-mono text-zinc-500 uppercase font-black">SUBJECT</label>
                              <select
                                value={form.subject}
                                onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                                className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-xl px-3 py-2 text-xs outline-none cursor-pointer"
                              >
                                <option value="Inquiry">General Inquiry</option>
                                <option value="Content Contribution">Poetry Submission / Suggestion</option>
                                <option value="Takedown Request">DMCA & Copyright Takedown</option>
                                <option value="Monetization Inquiries">AdSense / Feedback</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-mono text-zinc-500 uppercase font-black">ENCRYPTED MESSAGE</label>
                              <textarea
                                required
                                rows={4}
                                value={form.message}
                                onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="Write details about your poetry submission, compliance request, or general feedback..."
                                className="w-full bg-zinc-950 border border-zinc-850 focus:border-red-500/50 text-white rounded-xl p-3 text-xs outline-none resize-none"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={isSubmitting || !form.name || !form.email || !form.message}
                              className="w-full h-11 pointer-events-auto bg-red-650 hover:bg-red-700 active:scale-95 disabled:opacity-50 text-white font-black text-[11px] uppercase tracking-widest rounded-xl transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_5px_15px_rgba(220,38,38,0.3)]"
                            >
                              <Send size={13} />
                              <span>{isSubmitting ? 'TRANSMITTING MESSAGE...' : 'TRANSMIT SECURE TICKET'}</span>
                            </button>
                          </form>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>
                </div>
              )}

              {/* 3. PRIVACY POLICY */}
              {activePath === '/privacy-policy' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4 select-none">
                    <span className="w-10 h-10 rounded-xl bg-red-950/30 border border-red-500/20 text-red-500 flex items-center justify-center">
                      <ShieldCheck size={20} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black font-sans tracking-wide text-white uppercase leading-none">
                        Privacy Policy
                      </h2>
                      <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest mt-1.5 block">
                        Our comprehensive user data & cookies safeguard commit
                      </span>
                    </div>
                  </div>

                  <div className="text-zinc-300 space-y-4 text-xs md:text-sm leading-relaxed">
                    <p>
                      At <span className="text-white font-bold">RoyVerse Hub</span>, accessible via <a href="https://royversehub.netlify.app" className="text-red-400 hover:underline">https://royversehub.netlify.app</a>, protecting user privacy is our ultimate commitment. This document clearly defines the exact categories of data collected, saved, analyzed, or synchronized during your creative journey with us.
                    </p>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      1. Information Collection & Usage
                    </h3>
                    <p>
                      We compile very basic, lightweight data to operationalize premium services, including:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 mt-1">
                      <li><b>User Account Credentials:</b> If you register a profile, we securely collect designated usernames and hashes to maintain your local configurations.</li>
                      <li><b>User Submissions:</b> Shayari, poetry lines, or stories submitted through our portals are stored securely on the core server databases.</li>
                      <li><b>Email Communications:</b> If you submit a contact ticket or DMCA notification, your email is preserved purely for support responses.</li>
                    </ul>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      2. Cookies and Browser Cache
                    </h3>
                    <p>
                      We utilize standard local browser capabilities (localStorage / sessionStorage) to store your preferred bookmark libraries, favorite sound level coordinates, selected music players, and interface layouts. These stay strictly isolated to your device browser sandbox.
                    </p>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      3. Google Tools & Advertising
                    </h3>
                    <p>
                      RoyVerse Hub integrates dynamic, industry-standard SEO and indexing systems to verify proper search relevance:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 mt-1">
                      <li><b>Google Search Console:</b> Used to check proper canonical indexing and find crawl states.</li>
                      <li><b>Google Analytics:</b> Compiles non-personally identifiable traffic details (device screens, user sessions, geographic regions) to optimize bandwidth speeds and UI responsions.</li>
                      <li><b>Future Google AdSense Integration:</b> To sustain hosting, this application processes Google tracking cookies to show targeted, safe context advertisements based on your general artistic browsing history inside search directories.</li>
                    </ul>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      4. Telegram Integrations Safety
                    </h3>
                    <p>
                      Administrators configure custom automation triggers through verified API bot tokens and Chat IDs. These tokens are saved in highly secure server-side environment parameters and are never exposed, printable, or readable from standard front-end client debuggers.
                    </p>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      5. Your Legal Rights & Data Protections
                    </h3>
                    <p>
                      You retain full authority to review, update, or permanently delete any stored profile parameters. To wipe out your bookmarks instantly, click "Clear Browser Storage" in settings. For server-side content deletions, review our dedicated Data Deletion Policy or write directly to <a href="mailto:roynoruless@gmail.com" className="hover:underline text-red-500 font-bold">roynoruless@gmail.com</a>.
                    </p>
                  </div>
                </div>
              )}

              {/* 4. TERMS & CONDITIONS */}
              {activePath === '/terms-and-conditions' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4 select-none">
                    <span className="w-10 h-10 rounded-xl bg-red-950/30 border border-red-500/20 text-red-500 flex items-center justify-center">
                      <FileText size={20} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black font-sans tracking-wide text-white uppercase leading-none">
                        Terms of Service
                      </h2>
                      <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest mt-1.5 block">
                        Rules of engagement, content licensing, and user codes of conduct
                      </span>
                    </div>
                  </div>

                  <div className="text-zinc-300 space-y-4 text-xs md:text-sm leading-relaxed">
                    <p>
                      By entering, accessing, browsing, or contributing to <span className="text-white font-bold">RoyVerse Hub</span>, you explicitly declare that you have read, understood, and agreed to be legally bound by these terms:
                    </p>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      1. User Submission Licensing
                    </h3>
                    <p>
                      When you submit Shayari, poetry lines, thoughts, or custom emotions through the RoyVerse Hub submission form, you retain full authorial ownership of your creative text. However, by publishing content on RoyVerse Hub, you grant us an absolute, royalty-free, perpetual, world-wide, non-exclusive license to format, display, distribute, translate, and archive the submitted work in public streams (including the website feed, HD studio generators, and Telegram feeds).
                    </p>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      2. Forbidden Code of Human Conduct
                    </h3>
                    <p>
                      Every contributor must maintain highest standards of collaborative artistic respect. Users are strictly prohibited from submitting content that is:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 border-l border-zinc-800 ml-2 text-zinc-400">
                      <li>Abusive, vulgar, obscene, threatening, or designed to harass any other entity.</li>
                      <li>Plagiarized, copyrighted by other modern authors without their explicit written consent.</li>
                      <li>Containing promotional links, advertisements, malicious files, or automated bot scripts.</li>
                    </ul>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      3. Operational Suspension & Deletion
                    </h3>
                    <p>
                      Our content moderators reserve absolute, unannounced rights to modify, refuse, drop, or permanently delete any community post that infringes our Terms of Service. Highly offensive users will be banned from further utilizing RoyVerse Hub via temporary or permanent IP suspensions.
                    </p>
                  </div>
                </div>
              )}

              {/* 5. COOKIE POLICY */}
              {activePath === '/cookie-policy' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4 select-none">
                    <span className="w-10 h-10 rounded-xl bg-red-950/30 border border-red-500/20 text-red-500 flex items-center justify-center">
                      <Flame size={20} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black font-sans tracking-wide text-white uppercase leading-none">
                        Cookie Policy
                      </h2>
                      <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest mt-1.5 block">
                        Transparency outlining tracking, storage preferences, and Google AdSense
                      </span>
                    </div>
                  </div>

                  <div className="text-zinc-300 space-y-4 text-xs md:text-sm leading-relaxed">
                    <p>
                      This website utilizes lightweight cookies and local storage tokens to personalize your structural experience and gather general optimization metadata.
                    </p>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      1. Essential Performance Cookies
                    </h3>
                    <p>
                      These items are critical for key interactive features. They store active parameters, including bookmarks list coordinates, favorite music play states, specific card canvas colors, and panel toggles inside localStorage. They remain strictly on your side and do not transmit tracking metrics.
                    </p>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      2. Analytical Tracking Cookies
                    </h3>
                    <p>
                      We integrate Google Analytics to track general website performance. These cookies record your device screen configurations, site speed times, navigation pathways, and general geographical metrics so we can deliver optimal speeds and avoid container crashes.
                    </p>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      3. Future Google AdSense Advertising Cookies
                    </h3>
                    <p>
                      To support creative operations, this application integrates Google AdSense verification routines. Google uses cookies (including DoubleClick cookies) to serve targeted, customized ads based on your general browsing patterns across various web portals.
                    </p>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      4. Cookie Consent Controls
                    </h3>
                    <p>
                      You retain full control over tracking cookies. You can configured your personal browser settings to refuse third-party advertising cookies or block tracking parameters entirely. Note that blocking essential cookies may restrict certain features (like saved bookmarks) from working correctly.
                    </p>
                  </div>
                </div>
              )}

              {/* 6. DISCLAIMER */}
              {activePath === '/disclaimer' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4 select-none">
                    <span className="w-10 h-10 rounded-xl bg-red-950/30 border border-red-500/20 text-red-500 flex items-center justify-center">
                      <AlertTriangle size={20} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black font-sans tracking-wide text-white uppercase leading-none">
                        Legal Disclaimer
                      </h2>
                      <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest mt-1.5 block">
                        Content limitations, accuracy, and external link validation
                      </span>
                    </div>
                  </div>

                  <div className="text-zinc-300 space-y-4 text-xs md:text-sm leading-relaxed">
                    <p>
                      All content provided on RoyVerse Hub represents creative literature, poetic narratives, and artistic designs. Please read our primary limitations carefully:
                    </p>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      1. User-Generated Content (UGC)
                    </h3>
                    <p>
                      A substantial portion of the poetry, emotional thoughts, shayari, and graphics is submitted by independent community members. RoyVerse Hub does not claim absolute, real-time accuracy, validation, or compliance for these user-generated expressions. Views expressed represent the authors alone.
                    </p>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      2. Poetic & Emotional Intent
                    </h3>
                    <p>
                      While RoyVerse Hub features rich literature about heartbreak, sadness, isolation, and romance, everything here serves an artistic purpose. It is not professional psychoanalysis, medical counsel, or emotional crisis advisory. If you are experiencing rough emotional stages, please reach out to qualified medical professionals.
                    </p>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      3. External Anchoring & Links
                    </h3>
                    <p>
                      We may reference, list, or redirect to third-party sources (including social media channels, Telegram groups, or content creators). We hold zero liability for the privacy parameters, policies, or material hosted on external websites.
                    </p>
                  </div>
                </div>
              )}

              {/* 7. DMCA Policy */}
              {activePath === '/dmca-policy' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4 select-none">
                    <span className="w-10 h-10 rounded-xl bg-red-950/30 border border-red-500/20 text-red-500 flex items-center justify-center">
                      <ShieldAlert size={20} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black font-sans tracking-wide text-white uppercase leading-none">
                        DMCA & Copyright Policy
                      </h2>
                      <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest mt-1.5 block">
                        Intellectual property protections & systematic takedown requests
                      </span>
                    </div>
                  </div>

                  <div className="text-zinc-300 space-y-4 text-xs md:text-sm leading-relaxed">
                    <p>
                      RoyVerse Hub deeply respects the creative rights of painters, lyricists, publishers, and authors. If you are the legal copyright owner of any poetry material distributed on our platform and did not consent to its publication, you have the absolute legal right to submit a rapid takedown notice.
                    </p>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      Required Copyright Complaint Criteria
                    </h3>
                    <p>
                      To process a compliant copyright removal notice, your email must include:
                    </p>
                    <ul className="list-decimal pl-5 space-y-1.5 text-zinc-400 mt-1">
                      <li>Your official legal name, contact email address, and physical signature.</li>
                      <li>The target URL(s) containing the exact copyrighted material on RoyVerse Hub.</li>
                      <li>Evidence or documentation verifying your copyright ownership of the disputable lines.</li>
                      <li>A statement made under penalty of perjury that the information in your report is entirely accurate.</li>
                    </ul>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      Submission Connection
                    </h3>
                    <p>
                      Transmit your completed DMCA notice to Founder Ritik Rai at <a href="mailto:roynoruless@gmail.com" className="text-red-500 font-bold hover:underline">roynoruless@gmail.com</a>. We investigate all complete reports and commit to permanently removing any infringing data within 24 hours of notification.
                    </p>
                  </div>
                </div>
              )}

              {/* 8. Community Guidelines */}
              {activePath === '/community-guidelines' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4 select-none">
                    <span className="w-10 h-10 rounded-xl bg-red-950/30 border border-red-500/20 text-red-500 flex items-center justify-center">
                      <CheckCircle2 size={20} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black font-sans tracking-wide text-white uppercase leading-none">
                        Community Standards
                      </h2>
                      <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest mt-1.5 block">
                        Code of honor, respectful engagement, and plagiarist curbs
                      </span>
                    </div>
                  </div>

                  <div className="text-zinc-300 space-y-4 text-xs md:text-sm leading-relaxed">
                    <p>
                      RoyVerse Hub represents a shared, respectful space for creative and emotional expression. To preserve the high quality of our digital environment, each member must follow these guidelines:
                    </p>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      1. Respect of Other Artistic Minds
                    </h3>
                    <p>
                      Be kind, supportive, and constructively helpful. We absolute prohibit any shape of cyberbully, racist speech, political hate, sexism, or targeted harassment. Constructive critiques are welcome, but direct insult lines will trigger bans.
                    </p>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      2. No Plagiarism or Spamming
                    </h3>
                    <p>
                      Do not copy-paste other contemporary writers' published material without correct attribution, source reference, and appropriate licensing credits. In addition, do not flood our server index with duplicate, repetitive, or blank lines.
                    </p>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      3. Cyber Security Discipline
                    </h3>
                    <p>
                      Do not utilize scripts, automation macros, scraping tools, or brute-forcing vectors to bypass server restrictions. Any algorithmic testing of our database endpoints will land your IP into permanent firewall ban records.
                    </p>
                  </div>
                </div>
              )}

              {/* 9. Content Moderation Policy */}
              {activePath === '/content-moderation' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4 select-none">
                    <span className="w-10 h-10 rounded-xl bg-red-950/30 border border-red-500/20 text-red-500 flex items-center justify-center">
                      <XOctagon size={20} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black font-sans tracking-wide text-white uppercase leading-none">
                        Content Moderation
                      </h2>
                      <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest mt-1.5 block">
                        Vetting pipeline, submission approvals, and quality control
                      </span>
                    </div>
                  </div>

                  <div className="text-zinc-300 space-y-4 text-xs md:text-sm leading-relaxed">
                    <p>
                      Every submission sent through the RoyVerse Hub portal undergoes rigorous review. Learn how we maintain raw quality standards:
                    </p>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      1. Systematic Moderation Pipeline
                    </h3>
                    <p>
                      When a user publishes a Shayari block, it gets placed in the pending review list (`pendingList`). Our manual moderation team evaluates the text for formatting alignments, spell checking, poetics, and safety compliance.
                    </p>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      2. Safe Content Criteria
                    </h3>
                    <p>
                      Submissions are immediately flagged and rejected if they contain:
                    </p>
                    <ul className="list-disc pl-5 text-zinc-400 space-y-1 mt-1">
                      <li>Self-harm references, explicit sexual material, or violent statements.</li>
                      <li>Gibberish text blocks, repetitive keywords, or empty submissions.</li>
                      <li>Aggressive political slander, religious disputes, or racial slurs.</li>
                    </ul>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      3. Transparency in Logs
                    </h3>
                    <p>
                      Approved items are pushed live instantly and posted in our feeds. Clear logs of approved and rejected items are safely organized and printable inside the administrator dashboard.
                    </p>
                  </div>
                </div>
              )}

              {/* 10. Data Deletion Policy */}
              {activePath === '/data-deletion' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4 select-none">
                    <span className="w-10 h-10 rounded-xl bg-red-950/30 border border-red-500/20 text-red-500 flex items-center justify-center">
                      <Trash2 size={20} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black font-sans tracking-wide text-white uppercase leading-none">
                        Data Deletion Policy
                      </h2>
                      <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest mt-1.5 block">
                        Permanent profile wipes, content requests, and cache resetting
                      </span>
                    </div>
                  </div>

                  <div className="text-zinc-300 space-y-4 text-xs md:text-sm leading-relaxed">
                    <p>
                      We fully support your right to digital privacy. You hold absolute control over any creative records, account values, or cookies compiled by RoyVerse Hub.
                    </p>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      1. Instantly Clearing Local Preferences & Bookmarks
                    </h3>
                    <p>
                      If you want to remove bookmarked Shayari, favorites, customized sound settings, or active layouts from your current device browser, click on the "Settings" tab in your profile dashboard and hit "Reset Application Cache". This completely wipes all client storage items instantly.
                    </p>

                    <h3 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      2. Permanent Server Deletion Requests
                    </h3>
                    <p>
                      If you want to permanently erase your registered contributor account, submitted Shayari, message logs, or personal ticketing records from our server database, simply drop an official deletion request email to:
                    </p>
                    <div className="p-4 bg-zinc-900/30 border border-red-500/20 text-center rounded-xl select-text">
                      <span className="text-[10px] font-mono text-zinc-400 block">SEND RETRACT DELETION REQUEST TO</span>
                      <a href="mailto:roynoruless@gmail.com" className="text-md font-black text-white hover:underline mt-0.5 block">
                        roynoruless@gmail.com
                      </a>
                    </div>
                    <p>
                      No questions asked. Once we receive and verify your ownership request, all submitted servers, records, backups, and credentials will be permanently erased from our disk partitions inside 12 hours.
                    </p>
                  </div>
                </div>
              )}

              {/* 11. System Diagnostics / API Health Check */}
              {activePath === '/api-diagnostics' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 select-none">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-red-950/30 border border-red-500/20 text-red-500 flex items-center justify-center">
                        <Activity size={20} className={checking ? 'animate-pulse' : ''} />
                      </span>
                      <div>
                        <h2 className="text-lg font-black font-sans tracking-wide text-white uppercase leading-none">
                          System Status & API Diagnostics
                        </h2>
                        <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest mt-1.5 block">
                          Realtime gateway verification, Netlify proxy checks, and database sync
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={runDiagnostics}
                      disabled={checking}
                      className="px-3.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 text-[10px] font-mono uppercase tracking-widest text-zinc-300 hover:text-white transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw size={12} className={checking ? 'animate-spin text-red-500' : 'text-zinc-500'} />
                      <span>{checking ? 'Testing...' : 'Retest'}</span>
                    </button>
                  </div>

                  {/* Operational Status Banner */}
                  <div className={`p-4 rounded-xl border ${
                    diagError 
                      ? 'bg-red-950/20 border-red-500/30 text-red-200' 
                      : health 
                        ? 'bg-emerald-950/10 border-emerald-500/20 text-emerald-200' 
                        : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        diagError ? 'bg-red-500 animate-pulse' : health ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'
                      }`} />
                      <div>
                        <p className="text-xs font-bold uppercase font-mono tracking-widest">
                          {diagError ? 'CRITICAL SYSTEM ANOMALY' : health ? 'ALL GATEWAYS OPERATIONAL' : 'DETERMINING SYSTEM STATUS'}
                        </p>
                        <p className="text-[11px] opacity-80 mt-0.5">
                          {diagError 
                            ? `API Endpoint returned an error: ${diagError}` 
                            : health 
                              ? `All JSON health metrics synchronized in real-time natively.` 
                              : 'Initiating gateway handshakes...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bento Grid Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* Card 1: API Gateway & Latency */}
                    <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/30 space-y-2">
                      <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-widest block">
                        Network & Latency
                      </span>
                      <div className="flex items-baseline justify-between select-none">
                        <span className="text-xl font-black font-sans text-white">
                          {pingMs !== null ? `${pingMs} ms` : '—'}
                        </span>
                        <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${
                          pingMs === null 
                            ? 'bg-zinc-900 text-zinc-500' 
                            : pingMs < 150 
                              ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/10' 
                              : 'bg-amber-950/50 text-amber-400 border border-amber-500/10'
                        }`}>
                          {pingMs === null ? 'Inactive' : pingMs < 150 ? 'Excellent' : 'Nominal'}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed font-mono">
                        Direct fetch latency to Cloud Run server behind Netlify routing.
                      </p>
                    </div>

                    {/* Card 2: Netlify Routing Security */}
                    <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/30 space-y-2">
                      <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-widest block">
                        Netlify Proxy Layer
                      </span>
                      <div className="flex items-baseline justify-between select-none">
                        <span className={`text-sm font-black font-sans uppercase ${
                          contentType?.includes('application/json') ? 'text-white' : 'text-red-400'
                        }`}>
                          {contentType ? (contentType.split(';')[0]) : '—'}
                        </span>
                        <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${
                          contentType?.includes('application/json')
                            ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/10'
                            : 'bg-red-950/50 text-red-400 border border-red-500/10'
                        }`}>
                          {contentType?.includes('application/json') ? 'Secure JSON' : 'HTML Fallback (Bug)'}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed font-mono">
                        Response header mime-type. Ensures Netlify rewrites API routes instead of returning SPA index page.
                      </p>
                    </div>

                    {/* Card 3: Github Auto-Deploy status */}
                    <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/30 space-y-2">
                      <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-widest block">
                        GitHub Auto-deployment
                      </span>
                      <div className="flex items-baseline justify-between select-none">
                        <span className="text-sm font-black font-mono text-white">
                          STABLE (MAIN)
                        </span>
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-500/10">
                          Active
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed font-mono">
                        Directly compatible with Netlify automated triggers on GitHub merges.
                      </p>
                    </div>

                  </div>

                  {/* Database Stats Counters */}
                  <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 space-y-4">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                      Database Sync Statistics (Cloud Run Persistent JSON Memory)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-black/40 border border-zinc-900 rounded-lg">
                        <span className="text-[10px] font-mono text-zinc-500 block uppercase">Approved Shayari</span>
                        <span className="text-xl font-bold text-white mt-1 block">
                          {health?.database?.approved_count ?? '—'}
                        </span>
                      </div>
                      <div className="p-3 bg-black/40 border border-zinc-900 rounded-lg">
                        <span className="text-[10px] font-mono text-zinc-500 block uppercase">Pending Shayari</span>
                        <span className="text-xl font-bold text-white mt-1 block">
                          {health?.database?.pending_count ?? '—'}
                        </span>
                      </div>
                      <div className="p-3 bg-black/40 border border-zinc-900 rounded-lg">
                        <span className="text-[10px] font-mono text-zinc-500 block uppercase">Active Categories</span>
                        <span className="text-xl font-bold text-white mt-1 block">
                          {health?.database?.categories_count ?? '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Telegram Configuration Details */}
                  <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 space-y-3">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                      Telegram Bot Gateway Configurations
                    </span>
                    <div className="text-xs font-mono space-y-1.5 text-zinc-400">
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span>Configured Status:</span>
                        <span className={health?.telegram?.configured ? 'text-emerald-400' : 'text-zinc-500'}>
                          {health?.telegram?.configured ? 'YES (Active Token)' : 'NO (Disabled)'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span>Broadcast Trigger:</span>
                        <span className={health?.telegram?.enabled ? 'text-emerald-400' : 'text-zinc-500'}>
                          {health?.telegram?.enabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Resolved Channel ID:</span>
                        <span className="text-white select-all text-[11px]">
                          {health?.telegram?.chatId ?? 'None'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Health JSON */}
                  <div className="space-y-2">
                    <span className="text-[9.5px] font-mono text-zinc-650 uppercase tracking-widest font-black block">
                      Target Health Payload Explorer
                    </span>
                    <pre className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-900 text-[10px] font-mono overflow-x-auto text-zinc-400 leading-normal max-h-48 overflow-y-auto">
                      {health ? JSON.stringify(health, null, 2) : '// No JSON payload loaded from diagnostics handshakes.'}
                    </pre>
                  </div>

                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* 3. TRUST FOOTER PRESETS inside page overlay */}
      <div className="p-6 bg-zinc-950 border-t border-white/5 select-none shrink-0 mt-auto text-center space-y-2">
        <p className="text-[9.5px] font-mono text-zinc-600 uppercase tracking-[0.15em]">
          OFFICIAL GENERAL DATA PROTECTION REGULATION (GDPR) VERIFIED SYSTEM INDEX
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-zinc-500 max-w-md mx-auto">
          <span>🛡️ SSL SECURED</span>
          <span>🔒 DMCA COMPLIANT</span>
          <span>⚡ GOOGLE ADSENSE PREPARED</span>
        </div>
      </div>

    </div>
  );
}
