import { Shayari } from '../types';

export function transliterateDevanagari(text: string): string {
  const map: Record<string, string> = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
    'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
    'ं': 'n', 'ः': 'h', 'ँ': 'n', '़': '', '्': '',
    'ज़': 'z', 'फ़': 'f', 'ख़': 'kh', 'ग़': 'g', 'ढ़': 'dh', 'ड़': 'd'
  };

  let transliterated = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1] || '';
    const combo = char + nextChar;
    
    if (map[combo] !== undefined) {
      transliterated += map[combo];
      i++; // skip next character
    } else if (map[char] !== undefined) {
      transliterated += map[char];
    } else {
      transliterated += char;
    }
  }
  return transliterated;
}

export function generateShayariSlug(s: Shayari): string {
  if (s.slug) {
    return s.slug;
  }
  
  const categoryPart = (s.category || 'emotion').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  
  // Decide the source text to use
  let sourceText = s.text;
  if (s.seoTitle) {
    sourceText = s.seoTitle.replace(/shayari|status|-|ultimate|royal|attitude|quotes|by.*$/gi, '').trim();
  }
  
  // Transliterate Devanagari first to latin
  const romanized = transliterateDevanagari(sourceText);
  
  // Clean up: only alphanumeric and spaces
  const clean = romanized
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
    
  // Extract first 4-5 words
  const parts = clean.split('-').filter(Boolean).slice(0, 5).join('-');
  const finalPart = parts || 'vibe';
  
  return `${categoryPart}/${finalPart}-${s.id}`;
}

export interface DynamicSeoMeta {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  ogImage: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
}

export function generateDynamicMeta(s: Shayari, origin: string = 'https://royversehub.netlify.app'): DynamicSeoMeta {
  // Extract first emotional lines from the shayari automatically for description
  const cleanLines = s.text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  
  const firstLine = cleanLines[0] || '';
  const secondLine = cleanLines[1] || '';
  const excerpt = `${firstLine} ${secondLine}`.replace(/"/g, "'").trim().substring(0, 150);
  
  const title = s.seoTitle || `${s.category} Shayari by ${s.author} | Roy No Rules`;
  const description = s.seoDesc || `"${excerpt}..." - Read this premium ${s.category} Shayari by ${s.author} on Roy No Rules, cinematic emotional universe.`;
  
  const keywords = `${s.category.toLowerCase()}, shayari, status, emotional, attitude, quotes, roy no rules, ${s.author.toLowerCase()}`;
  const slug = generateShayariSlug(s);
  const ogUrl = `${origin}/${slug}`;
  const ogImage = `${origin}/logo.png`; // Placeholder for branding image

  return {
    title,
    description,
    keywords,
    ogTitle: title,
    ogDescription: description,
    ogUrl,
    ogImage,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description
  };
}

export function syncDynamicMetaToDom(meta: DynamicSeoMeta) {
  if (typeof document === 'undefined') return;
  
  // Update Title
  document.title = meta.title;
  
  // Helper to set/update meta tag
  const setMetaTag = (attrs: Record<string, string>, content: string) => {
    let selector = 'meta';
    Object.entries(attrs).forEach(([key, val]) => {
      selector += `[${key}="${val}"]`;
    });
    
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      Object.entries(attrs).forEach(([key, val]) => el!.setAttribute(key, val));
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };
  
  // Description
  setMetaTag({ name: 'description' }, meta.description);
  // Keywords
  setMetaTag({ name: 'keywords' }, meta.keywords);
  
  // OpenGraph properties
  setMetaTag({ property: 'og:title' }, meta.ogTitle);
  setMetaTag({ property: 'og:description' }, meta.ogDescription);
  setMetaTag({ property: 'og:url' }, meta.ogUrl);
  setMetaTag({ property: 'og:image' }, meta.ogImage);
  setMetaTag({ property: 'og:type' }, 'website');
  
  // Twitter Card
  setMetaTag({ name: 'twitter:card' }, meta.twitterCard);
  setMetaTag({ name: 'twitter:title' }, meta.twitterTitle);
  setMetaTag({ name: 'twitter:description' }, meta.twitterDescription);
  setMetaTag({ name: 'twitter:image' }, meta.ogImage);
}
