import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Clock, Tag, ChevronRight, X, Heart, Eye, Sparkles } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
  views: number;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    title: "Why Midnight Makes Heartbreak Hurt More: The Science of Silent Rooms 💔",
    slug: "science-of-midnight-heartbreak",
    category: "Sadness",
    readTime: "3 min read",
    date: "May 28, 2026",
    views: 1245,
    summary: "Have you ever wondered why old memories, unread chats, and silent rejections feel so heavy after the clock strikes twelve? Let's talk about the raw psychology of quiet nights.",
    content: `If you are awake right now, reading this under the soft glow of your phone, you are not alone. There is a strange, almost cinematic gravity to the night. 

During the daytime, our brains are flooded with noise: traffic, tasks, small talk, alarms, and notifications. This constant stimulus acts as a defensive shield, actively distracting us from unprocessed grief. But when the world goes silent, that shield falls. 

Neurologists suggest that our emotional processing centres (like the amygdala) become highly active when melatonin spikes, while our logical prefrontal cortex gets ready to sleep. This creates the 'Overthinking Engine'—a state where heartbreak, regret, and words left unsaid hit with triple their daytime force. 

On "Roy No Rules...", we compile lines that capture this exact heavy atmosphere. Shayari isn't just words; it's a companion that sits with you in that silent room, proving that what you are feeling has been felt, survived, and written about for centuries.`
  },
  {
    id: "blog-2",
    title: "The Sigma Mindset: How Self-Respect Outlives Unanswered Texts 🔥",
    slug: "sigma-mindset-over-unanswered-texts",
    category: "Sigma & Attitude",
    readTime: "4 min read",
    date: "May 25, 2026",
    views: 2310,
    summary: "When someone ignores your efforts, your instinct might be to double-text. Here is why choosing silence and building your own kingdom is the ultimate return of authority.",
    content: `Silence is the loudest answer you can ever give. 

In a world obsessed with continuous validation and instant double-blue ticks, walking away represents the ultimate act of defiance. When someone chooses to ignore your presence or take your trust for granted, double-texting doesn't change their mind—it only validates their ego at the expense of your own.

The classic Indian Attitude status or 'Sigma guidelines' aren't built on arrogance or hatred. True attitude is silent self-possession. It says: 'I respect my love and my time too much to beg for a response.'

Instead of burning your energy wondering why they changed, redirect that fire into your work, your habits, and your wellness goals. Let them find you in the metrics of your success, not in the backlog of their notifications. Remember, royalty doesn't chase; it rules.`
  },
  {
    id: "blog-3",
    title: "The Art of Pehli Nazar (First Eye Contact): Unexpressed Poetry of Love 💖",
    slug: "pehli-nazar-love-poetry-art",
    category: "Love Vibe",
    readTime: "2 min read",
    date: "May 22, 2026",
    views: 1890,
    summary: "That sudden three-second lock of eyes in a crowded room. Explore the subtle, unexpressed magic of silent romance and pehli nazar mohabbat, translating looks into verses.",
    content: `They say eyes are the window to the soul, but they are also the birthplaces of the most beautiful love shayaris ever written.

Long before emails, texts, or direct messages, romance was a language spoken entirely through brief glances and stolen moments in public spaces. The nervous tension of locking eyes for a mere three seconds—halfway between wanting to be seen and fearing being caught—carries more emotional weight than a thousand curated WhatsApp status messages.

Shayaris in our 'Love' category capture this delicate, floating chemistry. When you read a line that matches your vibe, you realize that true connection is often silent. If you are experiencing that PEHLI NAZAR magic right now, don't rush it. Let the unexpressed romance simmer and breathe its own rhythm.`
  }
];

export default function EmotionalBlogs({ showToast }: { showToast: (msg: string) => void }) {
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  return (
    <div className="w-full bg-zinc-950/40 border border-white/5 p-6 md:p-8 rounded-3xl" id="emotional-knowledge-blogs">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2-h-2 rounded-full bg-red-500 animate-ping inline-block" style={{ width: '8px', height: '8px' }} />
            <h3 className="text-sm font-mono tracking-[0.2em] uppercase font-black text-red-500">
              Emotional Stories & Thoughts
            </h3>
          </div>
          <p className="text-xs text-zinc-500">Read micro-journals on heartbreak, psychology of love, and sigma self-respect.</p>
        </div>
        <BookOpen className="size-5 text-red-500/50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BLOG_POSTS.map((post) => (
          <motion.div
            key={post.id}
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-900 flex flex-col justify-between hover:border-red-500/20 transition-all duration-300 relative group cursor-pointer"
            onClick={() => {
              setSelectedBlog(post);
              showToast(`Opening blog study: "${post.title.substring(0, 30)}..." 📖`);
            }}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-550">
                <span className="text-red-400 bg-red-950/30 px-2 py-0.5 rounded border border-red-950/50">
                  {post.category}
                </span>
                <span>{post.readTime}</span>
              </div>

              <h4 className="text-sm font-bold text-stone-200 tracking-wide leading-snug group-hover:text-white transition duration-200 line-clamp-2">
                {post.title}
              </h4>

              <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3">
                {post.summary}
              </p>
            </div>

            <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/5 text-[10px] font-mono text-zinc-650">
              <span>{post.date}</span>
              <span className="flex items-center gap-1 group-hover:text-red-400 transition-colors uppercase font-black">
                Read Blog <ChevronRight size={10} />
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FULL READ MODAL SCREEN */}
      <AnimatePresence>
        {selectedBlog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/98 backdrop-blur-md overflow-y-auto p-6 sm:p-12 flex items-center justify-center select-text"
          >
            <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-2xl bg-zinc-950/80 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6">
              {/* Head controls */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-zinc-500 uppercase">
                  <Tag size={12} className="text-red-500" />
                  <span>{selectedBlog.category}</span>
                  <span>•</span>
                  <span>{selectedBlog.readTime}</span>
                </div>
                <button
                  onClick={() => setSelectedBlog(null)}
                  className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-red-500 hover:text-red-500 transition cursor-pointer text-zinc-400"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Title */}
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide leading-snug">
                  {selectedBlog.title}
                </h2>
                <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-650">
                  <span>PUBLISHED: {selectedBlog.date}</span>
                  <span>•</span>
                  <span>AUTHORED BY: Roy No Rules Editorial (SEO Safe)</span>
                </div>
              </div>

              {/* Content Body */}
              <p className="text-stone-300 text-sm leading-[1.8] tracking-wide whitespace-pre-line select-text max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {selectedBlog.content}
              </p>

              {/* Interactive bottom notice */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4 text-[10px] font-mono text-zinc-500">
                <span className="flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-500" /> Inspired by unguided night thoughts
                </span>
                <button
                  onClick={() => {
                    setSelectedBlog(null);
                    showToast('Vibe read completed! Search related shayari on top 🌠');
                  }}
                  className="px-6 py-2.5 rounded-full border border-red-500 bg-red-650/10 hover:bg-red-500 hover:text-white transition cursor-pointer font-black text-[9.5px] uppercase tracking-wider"
                >
                  Completed Read
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
