import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Info, FileText, AlertTriangle, Mail, Phone, 
  MapPin, Send, MessageSquare, CheckCircle, ArrowLeft, ExternalLink, ShieldCheck as VerifiedIcon, Heart, Sparkles, Flame
} from 'lucide-react';

interface ContactFormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface TrustPagesProps {
  activePath: string; // e.g. '/about-us', '/privacy-policy', '/terms-and-conditions', '/disclaimer', '/contact-us'
  onNavigate: (path: string) => void;
  onClose: () => void;
}

export default function TrustPages({ activePath, onNavigate, onClose }: TrustPagesProps) {
  const [form, setForm] = useState<ContactFormState>({ name: '', email: '', subject: 'Shayari Upload/Inquiry', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Custom states for contact support ticket log
  const [activeTicketCount, setActiveTicketCount] = useState(() => {
    return Math.floor(Math.random() * 5) + 2; 
  });

  // SEO setup and synchronization effect
  useEffect(() => {
    let seoTitle = 'Roy No Rules...';
    let seoDesc = 'Discover premium Hinglish emotional shayari, motivation, status customizer and creative rules.';
    
    switch (activePath) {
      case '/about-us':
        seoTitle = 'About Our Sanctuary - Roy No Rules...';
        seoDesc = 'Who we are. Behind the shayari sanctuary, emotional dark-cyberpunk aesthetics, free recitation player, and midnight rebellion.';
        break;
      case '/privacy-policy':
        seoTitle = 'Privacy Safeguards & Consent - Roy No Rules...';
        seoDesc = 'Full transparency on secure SHA-256 local-first client states, future AdSense cookie guidelines, and zero-selling policies.';
        break;
      case '/terms-and-conditions':
        seoTitle = 'Terms of Human Conduct - Roy No Rules...';
        seoDesc = 'Respectful engagement guidelines, copyright claims handling, creative standards, anti-abuse regulations, and moderator policies.';
        break;
      case '/disclaimer':
        seoTitle = 'Creative & Ownership Disclaimers - Roy No Rules...';
        seoDesc = 'Ownership terms of emotional, motivational, and fan-made cultural shayari. Take-down policy guidelines.';
        break;
      case '/contact-us':
        seoTitle = 'Connect With Us Directly - Roy No Rules...';
        seoDesc = 'Need a personal touch? Ring us at +91 9027671630 or write to roynoruless@gmail.com for fast support.';
        break;
    }

    document.title = seoTitle + ' | ⚡ Roy No Rules... ⚡';
    
    // Attempt dynamic update of meta description
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
          message: form.message
        })
      });

      if (response.ok) {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setForm({ name: '', email: '', subject: 'Feedback', message: '' });
        setActiveTicketCount(prev => prev + 1);
        
        // Auto reset success state after 7 seconds
        setTimeout(() => setSubmitSuccess(false), 7000);
      } else {
        throw new Error('Formspree response not ok');
      }
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError('Transmission failed. Try again.');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/98 backdrop-blur-md z-50 flex flex-col overflow-y-auto"
      id="trust-pages-modal-root"
    >
      {/* 1. CINEMATIC PREMIUM TOP NAV BAR */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-white/5 z-30 px-4 py-4 md:px-8 flex items-center justify-between select-none">
        
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono font-black text-zinc-400 hover:text-white border border-zinc-900 rounded-lg hover:border-red-500/30 transition bg-black/40 cursor-pointer"
        >
          <ArrowLeft size={13} className="text-red-500" />
          <span>RETURN TO HOME</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <h1 className="text-xs font-sans font-black tracking-[0.2em] uppercase text-white">
            TRUST CENTER
          </h1>
        </div>

        <div className="hidden md:flex gap-1">
          <span className="text-[9px] font-mono text-zinc-500 border border-zinc-900 px-2 py-1 rounded bg-zinc-950/40 uppercase tracking-widest">
            AdSense Safe Verified ID
          </span>
        </div>
      </div>

      {/* 2. TABBED PANEL CONTENT EXPLORER */}
      <div className="max-w-4xl mx-auto w-full px-4 md:px-6 py-8 flex-1 flex flex-col md:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <div className="w-full md:w-[240px] shrink-0 flex flex-col gap-1.5 select-none md:sticky md:top-24 h-fit">
          <div className="px-3 mb-2">
            <span className="text-[9px] font-mono text-zinc-650 tracking-[0.15em] uppercase font-bold block">
              Official Directories
            </span>
          </div>

          {[
            { path: '/about-us', label: '📖 About Us', desc: 'Who we represent' },
            { path: '/privacy-policy', label: '🔒 Privacy Policy', desc: 'User data protection' },
            { path: '/terms-and-conditions', label: '⚖️ Terms of Conduct', desc: 'Core platform rules' },
            { path: '/disclaimer', label: '📢 Legal Disclaimer', desc: 'Ownership disclaimer' },
            { path: '/contact-us', label: '📞 Connect Directly', desc: 'Feedback & assistance' }
          ].map((item) => {
            const isSelected = activePath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`py-3 px-4 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-center ${
                  isSelected
                    ? 'border-red-500 bg-red-950/15 text-white shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                    : 'border-zinc-950 bg-zinc-950/30 text-zinc-400 hover:text-white hover:border-zinc-805'
                }`}
              >
                <span className="text-xs font-bold leading-normal">{item.label}</span>
                <span className="text-[9px] font-mono text-zinc-500 mt-1">{item.desc}</span>
              </button>
            );
          })}

          <div className="mt-8 p-4 rounded-xl bg-zinc-950/25 border border-zinc-900/60 text-center select-none hidden md:block">
            <span className="text-[10px] font-mono text-zinc-500 leading-normal block">
              Need assistance immediately?<br />
              <b className="text-red-500 font-bold block mt-1">+91 9027671630</b>
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
              transition={{ duration: 0.35 }}
              className="bg-zinc-950/50 border border-zinc-850 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.8)]"
            >
              {/* Dynamic Aura neon gradient */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-red-650/5 blur-[70px] pointer-events-none rounded-full" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-zinc-800/5 blur-[70px] pointer-events-none rounded-full" />

              {/* VIEW: ABOUT US */}
              {activePath === '/about-us' && (
                <div className="space-y-6">
                  {/* Decorative Icon Banner */}
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4 select-none">
                    <span className="w-10 h-10 rounded-xl bg-red-950/30 border border-red-500/20 text-red-500 flex items-center justify-center">
                      <Sparkles size={20} className="animate-spin" style={{ animationDuration: '8s' }} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black font-sans tracking-wide text-white uppercase leading-none">
                        Our Story
                      </h2>
                      <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest mt-1.5 block">
                        Behind the shayari sanctuary & midnight rebellion
                      </span>
                    </div>
                  </div>

                  <div className="text-zinc-300 space-y-4 text-xs md:text-sm leading-relaxed font-sans">
                    <p className="first-letter:text-4xl first-letter:font-black first-letter:text-red-500 first-letter:float-left first-letter:mr-2">
                      Welcome to <span className="text-white font-bold">"Roy No Rules..."</span>, a digital escape designed for souls who feel deeply, live passionately, and refuse to define their lives by standard visual conventions. We are not just another website containing listed text; we are a dedicated Hinglish and Hindi emotional sanctuary.
                    </p>

                    <p>
                      Our existence is rooted in isolation, rebellion, and authentic creative expression. Here, we help users capture and celebrate midnight thoughts, romantic soundscapes, heavy motivation, and standard unbreakable attitudes.
                    </p>

                    <h4 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      What can you accomplish inside Roy No Rules?
                    </h4>

                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 select-none">
                      <li className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl flex items-start gap-2.5 text-xs text-zinc-400">
                        <span className="text-xs text-red-400 mt-0.5">🌠</span>
                        <div>
                          <b className="text-white block font-bold mb-0.5">Live Status Customizer</b>
                          Procedurally generate stunning IG/WhatsApp status cards in beautiful high contrast presets.
                        </div>
                      </li>
                      <li className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl flex items-start gap-2.5 text-xs text-zinc-400">
                        <span className="text-xs text-red-400 mt-0.5">📢</span>
                        <div>
                          <b className="text-white block font-bold mb-0.5">Free Recitation Player</b>
                          Listen to high-quality synthesized voice renditions of emotional poetry instantly.
                        </div>
                      </li>
                      <li className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl flex items-start gap-2.5 text-xs text-zinc-400">
                        <span className="text-xs text-red-400 mt-0.5">❤️</span>
                        <div>
                          <b className="text-white block font-bold mb-0.5">Secure Collections Vault</b>
                          Bookmark entries safely inside offline-first device local cache folders.
                        </div>
                      </li>
                      <li className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl flex items-start gap-2.5 text-xs text-zinc-400">
                        <span className="text-xs text-red-400 mt-0.5">🕊️</span>
                        <div>
                          <b className="text-white block font-bold mb-0.5">Submit Original Artwork</b>
                          Participate in active community scores, gain aura milestones, and get verified.
                        </div>
                      </li>
                    </ul>

                    <p className="mt-6">
                      Every shayari listed in our directory underwent physical moderation and alignment formatting to ensure top literary value. We strongly support self-motivated poetry creators and provide free graphic tooling so they can focus purely on original storytelling.
                    </p>
                  </div>
                </div>
              )}

              {/* VIEW: PRIVACY POLICY */}
              {activePath === '/privacy-policy' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4 select-none">
                    <span className="w-10 h-10 rounded-xl bg-red-950/30 border border-red-500/20 text-red-500 flex items-center justify-center">
                      <ShieldCheck size={20} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black font-sans tracking-wide text-white uppercase leading-none">
                        Privacy Safeguards
                      </h2>
                      <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest mt-1.5 block">
                        Strict account cryptography policies & cookies disclosure
                      </span>
                    </div>
                  </div>

                  <div className="text-zinc-300 space-y-4 text-xs md:text-sm leading-relaxed">
                    <p>
                      At <span className="text-white">Roy No Rules...</span>, privacy is not a theoretical compliance checklist. It is a fundamental right. We do not engage in aggressive cookies harvesting, trace tracking, or user tracking across web domains. Your data is protected by default.
                    </p>

                    <h4 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      1. Account & Cryptography Security
                    </h4>
                    <p>
                      When you initialize a Resident Account Profile, we request your designated password to synchronize folder preferences. This password field is IMMEDIATELY formatted via standard hashes before getting written into the client registry. We do not store, review, or print plain text credentials.
                    </p>

                    <h4 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      2. Cookie Disclosures (Google AdSense Ready)
                    </h4>
                    <p>
                      We utilize basic, lightweight localized cookies (localStorage) to sustain your favorite bookmarks, selected music states, current sound levels, and active screen color settings. These stay strictly isolated to your immediate browser sandboxing.
                    </p>
                    <p>
                      Please note: For future monetization and sustainability, this website intends to deploy Google AdSense verification. Search engine integration involves basic cookies that serve targeted ads based on non-identifiable user interests. You reserve the absolute right to restrict third-party cookies inside your personal browser security settings at any point.
                    </p>

                    <h4 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      3. Data Sharing Protection Commitment
                    </h4>
                    <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-900 text-xs font-mono text-zinc-400 space-y-2 select-none">
                      <p>✅ PASSWORDS ARE SECURELY ENCRYPTED VIA CLIENT HASH CODES</p>
                      <p>✅ EMAIL INBOX DETAILS ARE STRICTLY SHIELDED & PRIVATE</p>
                      <p>❌ CORPORATE SELL-OFFS OR CLOUD BROKER MARKETING IS FORBIDDEN</p>
                    </div>

                    <p>
                      If you ever decide to delete your resident account profile, simply click the Cache reset button inside configuration panel to securely swipe away all traces.
                    </p>
                  </div>
                </div>
              )}

              {/* VIEW: TERMS & CONDITIONS */}
              {activePath === '/terms-and-conditions' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4 select-none">
                    <span className="w-10 h-10 rounded-xl bg-red-950/30 border border-red-500/20 text-red-500 flex items-center justify-center">
                      <FileText size={20} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black font-sans tracking-wide text-white uppercase leading-none">
                        Terms of Human Conduct
                      </h2>
                      <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest mt-1.5 block">
                        Respectful engagement, moderation rights & intellectual standards
                      </span>
                    </div>
                  </div>

                  <div className="text-zinc-300 space-y-4 text-xs md:text-sm leading-relaxed">
                    <p>
                      This community is built on mutual respect and shared artistic space. By continuing to explore, download, and participate in our directory, you agree to these fundamental guidelines:
                    </p>

                    <h4 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      1. Respectful Creative Engagement
                    </h4>
                    <p>
                      Our platform allows and encourages community submissions. However, users are strictly prohibited from submitting abusive, spammy, copy-pasted, threatening, or vulgar content. Our moderator panel reserves the absolute right to block accounts, remove logs, and restrict publishing indices for any user breaking this pact.
                    </p>

                    <h4 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      2. Copyright Responsibilities
                    </h4>
                    <p>
                      Users submitting poetry or quotes represent that they hold the copyrights or are quoting with legal consent and attribution to the original writers. If any piece infringes your legal intellectual copyright, write to us directly at roynoruless@gmail.com with reasonable evidence, and we will take immediate prompt actions under standard DMCA rules.
                    </p>

                    <h4 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      3. Abuse Mitigation Policy
                    </h4>
                    <p>
                      Any form of algorithmic scraping, flood submitting, script testing, or brute forcing is heavily restricted. We protect our container bandwidth and ensure other readers receive top speed access. Infringing entities will be permanently blacklisted from accessing this server.
                    </p>
                  </div>
                </div>
              )}

              {/* VIEW: DISCLAIMER */}
              {activePath === '/disclaimer' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4 select-none">
                    <span className="w-10 h-10 rounded-xl bg-red-950/30 border border-red-500/20 text-red-500 flex items-center justify-center">
                      <AlertTriangle size={20} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black font-sans tracking-wide text-white uppercase leading-none">
                        Artistic & Legal Disclaimer
                      </h2>
                      <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest mt-1.5 block">
                        Purpose of content & original creators protection guidelines
                      </span>
                    </div>
                  </div>

                  <div className="text-zinc-300 space-y-4 text-xs md:text-sm leading-relaxed">
                    <p>
                      Let us make everything crystal clear and completely honest:
                    </p>

                    <div className="p-4 border-l border-red-500 bg-red-950/10 text-zinc-300 rounded-r-xl italic space-y-2 text-xs">
                      <p>
                        "The materials and shayari posted on Roy No Rules... are provided strictly for emotional expression, creative motivation, and constructive visual entertainment purposes."
                      </p>
                    </div>

                    <h4 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-500 pl-2.5">
                      1. Emotional & Mental Well-being
                    </h4>
                    <p>
                      While we write extensively about heartbreak, sadness, isolation, and romance, this portal represents an artistic hub. It is not professional psychoanalysis, mental health counsel, or relationship advisory. If you are going through rough emotional states, please seek professional human consulting.
                    </p>

                    <h4 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-550 pl-2.5">
                      2. Respect of Authorship
                    </h4>
                    <p>
                      A portion of the shayari entries displayed in the default stream are fan-compiled tribute lines shared as cultural relics of Urdu, Hindi, and Punjabi shayari. They belong to their respective legendary poets. We do not claim exclusive commercial copyright ownership over classic poetry lines.
                    </p>

                    <h4 className="text-xs font-black font-mono tracking-widest uppercase text-white mt-6 mb-2 border-l-2 border-red-550 pl-2.5">
                      3. Take-down Removal Rights
                    </h4>
                    <p>
                      If you are the legal creator of any featured poetry, statement, or quote, and you object to its presence in our directory, please CONNECT immediately. We honor all takedown requests inside 24 hours.
                    </p>
                  </div>
                </div>
              )}

              {/* VIEW: CONTACT US */}
              {activePath === '/contact-us' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 select-none">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-red-950/30 border border-red-500/20 text-red-500 flex items-center justify-center">
                        <Phone size={20} className="animate-bounce" />
                      </span>
                      <div>
                        <h2 className="text-lg font-black font-sans tracking-wide text-white uppercase leading-none">
                          Connect With Us
                        </h2>
                        <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest mt-1.5 block">
                          Instant official contact & feedback channel
                        </span>
                      </div>
                    </div>
                    <span className="text-[8px] font-mono bg-zinc-900 border border-white/5 p-1.5 rounded-full text-zinc-400 uppercase tracking-widest">
                      Response: &lt; 2 hours
                    </span>
                  </div>

                  {/* Two Column Layout for Contacts Info + Glass Form */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                    
                    {/* Official Contact Cards Grid */}
                    <div className="lg:col-span-5 space-y-4">
                      
                      {/* Tele-support Card */}
                      <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-900 flex items-start gap-4 transition hover:border-red-500/20 select-text">
                        <span className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/20 text-red-505 shrink-0">
                          <Phone size={16} className="text-red-500" />
                        </span>
                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">TELE-SUPPORT PHONE</span>
                          <span className="text-sm font-black text-white mt-0.5 block">+91 9027671630</span>
                          <span className="text-[10px] text-zinc-400 mt-1 block">Active on Caller IDs & Telegram chats</span>
                        </div>
                      </div>

                      {/* Mail Support Card */}
                      <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-900 flex items-start gap-4 transition hover:border-red-500/20 select-text">
                        <span className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/20 text-red-505 shrink-0">
                          <Mail size={16} className="text-red-500" />
                        </span>
                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">OFFICIAL EMAIL SUPPORT</span>
                          <span className="text-sm font-black text-white mt-0.5 block">roynoruless@gmail.com</span>
                          <span className="text-[10px] text-zinc-400 mt-1 block">Write to us for partnerships, reports or licensing</span>
                        </div>
                      </div>

                      {/* Location Office Card */}
                      <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-900 flex items-start gap-4 select-none">
                        <span className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/20 text-red-505 shrink-0">
                          <MapPin size={16} className="text-red-500" />
                        </span>
                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">BASE SANCTUARY OFFICE</span>
                          <span className="text-sm font-black text-white mt-0.5 block">Uttar Pradesh, India</span>
                          <span className="text-[10px] text-zinc-400 mt-1 block">Rooted securely in the heart of classic Hindi-Urdu heritage</span>
                        </div>
                      </div>

                    </div>

                    {/* Interactive Glassmorphism Form Area */}
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
                              <h4 className="text-sm font-black text-white uppercase tracking-wider">Message transmitted successfully 👀🔥</h4>
                              <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                                Thank you for connecting with "Roy No Rules...". Our support team will verify your query and follow back within 2 hours.
                              </p>
                            </div>
                            <button
                              onClick={() => setSubmitSuccess(false)}
                              className="px-4 py-1.5 border border-zinc-800 text-[10px] font-mono text-zinc-400 hover:text-white rounded-lg transition duration-200 cursor-pointer"
                            >
                              Send Another Ticket
                            </button>
                          </motion.div>
                        ) : (
                          <form action="https://formspree.io/f/xzdworly" method="POST" onSubmit={handleContactSubmit} className="space-y-4 text-left">
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
                                <option value="Content Contribution">Contribution Proposal</option>
                                <option value="Licensing & Rights">Partnership Opportunities</option>
                                <option value="AdSense Feedback">Website Feedback</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-mono text-zinc-500 uppercase font-black">ENCRYPTED MESSAGE</label>
                              <textarea
                                required
                                rows={4}
                                value={form.message}
                                onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="Write your core request, suggestions, or shayari contribution details..."
                                className="w-full bg-zinc-950 border border-zinc-850 focus:border-red-500/50 text-white rounded-xl p-3 text-xs outline-none resize-none"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={isSubmitting || !form.name || !form.email || !form.message}
                              className="w-full h-11 pointer-events-auto bg-red-650 hover:bg-red-700 active:scale-95 disabled:opacity-50 text-white font-black text-[11px] uppercase tracking-widest rounded-xl transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_5px_15px_rgba(220,38,38,0.3)] hover:shadow-[0_5px_20px_rgba(220,38,38,0.5)]"
                            >
                              <Send size={13} />
                              <span>{isSubmitting ? 'TRANSMITTING BYTES...' : 'TRANSMIT SECURE TICKET'}</span>
                            </button>
                          </form>
                        )}
                      </AnimatePresence>

                    </div>

                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* 3. TRUST FOOTER PRESETS inside page overlay */}
      <div className="p-6 bg-black border-t border-white/5 select-none shrink-0 mt-auto text-center space-y-2">
        <p className="text-[9.5px] font-mono text-zinc-650 uppercase tracking-[0.15em]">
          OFFICIAL VERIFIED CRYPTOGRAPHIC IDENTITY CARD INDEX
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-zinc-500 max-w-md mx-auto">
          <span>🛡️ SSL SECURED</span>
          <span>🔒 DMCA PROTECTED </span>
          <span>⚡ GOOGLE ADSENSE READY</span>
        </div>
      </div>

    </div>
  );
}
