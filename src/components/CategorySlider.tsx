import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategorySliderProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategorySlider({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategorySliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full py-4 flex items-center group/slider">
      {/* Scroll Left Button */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 z-10 p-2 rounded-full bg-black/90 border border-zinc-800 hover:border-red-500/50 hover:text-white text-zinc-400 backdrop-blur-sm opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 pointer-events-auto hidden md:flex items-center justify-center cursor-pointer"
        aria-label="Scroll Categories Left"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Categories Outer Container */}
      <div
        ref={containerRef}
        className="w-full overflow-x-auto flex gap-3 px-1 no-scrollbar scroll-smooth"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {categories.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <motion.button
              key={category}
              onClick={() => onSelectCategory(category)}
              whileTap={{ scale: 0.95 }}
              className={`relative flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer backdrop-blur-sm ${
                isActive
                  ? 'bg-red-950/70 border border-red-500/80 text-white shadow-sm'
                  : 'bg-zinc-950/90 border border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800'
              }`}
            >
              <span className="relative z-10">{category}</span>
              {isActive && (
                <motion.span
                   layoutId="activeCategoryIndicator"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-red-650/10 to-rose-700/10 glow-border"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 z-10 p-2 rounded-full bg-black/90 border border-zinc-800 hover:border-red-500/50 hover:text-white text-zinc-400 backdrop-blur-sm opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 pointer-events-auto hidden md:flex items-center justify-center cursor-pointer"
        aria-label="Scroll Categories Right"
      >
        <ChevronRight size={16} />
      </button>

      {/* Custom Styles for styling hiding scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
