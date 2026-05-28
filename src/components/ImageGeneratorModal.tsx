import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Download, Type, AlignCenter, AlignLeft, AlignRight, 
  Share2, Clipboard, Sparkles, Sliders, Palette, Smartphone, Move, Flame
} from 'lucide-react';
import { Shayari } from '../types';
import PremiumAdContainer from './PremiumAdContainer';

interface ImageGeneratorModalProps {
  shayari: Shayari;
  onClose: () => void;
}

interface BackgroundTheme {
  id: string;
  name: string;
  gradientStart: string;
  gradientEnd: string;
  textColor: string;
  highlightColor: string;
  borderColor: string;
  glowColor: string;
}

const BACKGROUND_THEMES: BackgroundTheme[] = [
  {
    id: 'dark-aesthetic',
    name: 'Dark Aesthetic 🖤',
    gradientStart: '#09090b',
    gradientEnd: '#1c1917',
    textColor: '#ffffff',
    highlightColor: '#f87171',
    borderColor: '#e11d48',
    glowColor: 'rgba(225, 29, 72, 0.45)'
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow ⚡',
    gradientStart: '#120024',
    gradientEnd: '#020005',
    textColor: '#ffffff',
    highlightColor: '#ff007f',
    borderColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.55)'
  },
  {
    id: 'rain-mood',
    name: 'Rain Mood 🌧️',
    gradientStart: '#0d1527',
    gradientEnd: '#020617',
    textColor: '#f1f5f9',
    highlightColor: '#38bdf8',
    borderColor: '#0284c7',
    glowColor: 'rgba(3, 105, 161, 0.5)'
  },
  {
    id: 'love-vibes',
    name: 'Love Vibes ❤️',
    gradientStart: '#2e020d',
    gradientEnd: '#050002',
    textColor: '#ffe4e6',
    highlightColor: '#fda4af',
    borderColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.5)'
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Black-Red 👿',
    gradientStart: '#000000',
    gradientEnd: '#1e0505',
    textColor: '#ffffff',
    highlightColor: '#f87171',
    borderColor: '#dc2626',
    glowColor: 'rgba(220, 38, 38, 0.6)'
  },
  {
    id: 'motivation-gold',
    name: 'Motivation Gold 💛',
    gradientStart: '#1d1300',
    gradientEnd: '#050300',
    textColor: '#fef3c7',
    highlightColor: '#fbbf24',
    borderColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.55)'
  },
  {
    id: 'anime-vibe',
    name: 'Anime Vibe 🌆',
    gradientStart: '#311042',
    gradientEnd: '#fdba74',
    textColor: '#ffffff',
    highlightColor: '#fbcfe8',
    borderColor: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.45)'
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean 📄',
    gradientStart: '#fafafa',
    gradientEnd: '#d4d4d8',
    textColor: '#18181b',
    highlightColor: '#dc2626',
    borderColor: '#52525b',
    glowColor: 'rgba(82, 82, 91, 0.15)'
  },
  {
    id: 'sad-blue',
    name: 'Sad Blue Theme 🌌',
    gradientStart: '#040d21',
    gradientEnd: '#010307',
    textColor: '#e0f2fe',
    highlightColor: '#60a5fa',
    borderColor: '#2563eb',
    glowColor: 'rgba(37, 99, 235, 0.45)'
  }
];

const FONTS = [
  { id: 'Rozha One', name: 'Rozha One (Traditional)', category: 'Hindi' },
  { id: 'Teko', name: 'Teko (Modern Bold)', category: 'Hindi' },
  { id: 'Rajdhani', name: 'Rajdhani (Sleek Tech)', category: 'Hindi' },
  { id: 'Yatra One', name: 'Yatra One (Heritage)', category: 'Hindi' },
  { id: 'Caveat', name: 'Caveat (Warm Marker)', category: 'Handwritten' },
  { id: 'Satisfy', name: 'Satisfy (Smooth Script)', category: 'Handwritten' },
  { id: 'Dancing Script', name: 'Dancing Script (Playful)', category: 'Handwritten' },
  { id: 'Architects Daughter', name: 'Architects Daughter (Edgy)', category: 'Handwritten' },
  { id: 'Oswald', name: 'Oswald (Strong & Heavy)', category: 'Bold Attitude' },
  { id: 'Space Grotesk', name: 'Space Grotesk (Modern Tech)', category: 'Bold Attitude' },
  { id: 'Impact', name: 'Impact (Brutalist Statement)', category: 'Bold Attitude' },
  { id: 'Playfair Display', name: 'Playfair Display (Classy Serif)', category: 'Elegant Editorial' },
  { id: 'Cinzel', name: 'Cinzel (Royal Stone)', category: 'Elegant Editorial' },
  { id: 'Cormorant Garamond', name: 'Cormorant (Vibey Italic)', category: 'Elegant Editorial' },
  { id: 'Lora', name: 'Lora (Contemporary Serif)', category: 'Elegant Editorial' }
];

const EXPORT_SIZES = [
  { id: 'story', name: 'WhatsApp / IG Story (9:16)', width: 1080, height: 1920, icon: '📱' },
  { id: 'post', name: 'Instagram Square (1:1)', width: 1080, height: 1080, icon: '⬜' },
  { id: 'wallpaper', name: 'Universal Wallpaper (9:20)', width: 1080, height: 2400, icon: '🌠' }
];

export default function ImageGeneratorModal({ shayari, onClose }: ImageGeneratorModalProps) {
  // Modal Navigation tabs inside bottom edit sheet
  const [activeTab, setActiveTab] = useState<'themes' | 'typography' | 'effects' | 'watermark' | 'formats'>('themes');
  
  // Custom status configuration settings
  const [selectedTheme, setSelectedTheme] = useState<BackgroundTheme>(BACKGROUND_THEMES[0]);
  const [selectedFont, setSelectedFont] = useState<string>('Space Grotesk');
  const [fontSize, setFontSize] = useState<number>(26);
  const [lineHeight, setLineHeight] = useState<number>(1.6);
  const [letterSpacing, setLetterSpacing] = useState<number>(1);
  const [glowIntensity, setGlowIntensity] = useState<number>(15);
  const [vignetteOpacity, setVignetteOpacity] = useState<number>(0.6);
  const [alignment, setAlignment] = useState<'center' | 'left' | 'right'>('center');
  const [watermark, setWatermark] = useState<string>('Roy No Rules...');
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [particlesEnabled, setParticlesEnabled] = useState<boolean>(true);
  const [animatePreview, setAnimatePreview] = useState<boolean>(true);
  const [activeSize, setActiveSize] = useState(EXPORT_SIZES[0]); 

  const [toastMessage, setToastMessage] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderFrameIdRef = useRef<number | null>(null);
  
  // Pre-generate stable random coordinate configurations to sustain extreme performant frame cycles
  const particlesSeedRef = useRef<{ x: number; y: number; r: number; val: number; speed: number }[]>([]);
  if (particlesSeedRef.current.length === 0) {
    const list = [];
    for (let i = 0; i < 120; i++) {
      list.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 5 + 1.5,
        val: Math.random() * 100,
        speed: Math.random() * 0.15 + 0.05
      });
    }
    particlesSeedRef.current = list;
  }

  // Load specific premium google fonts on demand
  useEffect(() => {
    const linkId = 'roy-status-google-fonts';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Rozha+One&family=Yatra+One&family=Teko:wght@500;700&family=Rajdhani:wght@600;700&family=Caveat:wght@600;700&family=Satisfy&family=Dancing+Script:wght@700&family=Architects+Daughter&family=Oswald:wght@500;700&family=Space+Grotesk:wght@500;700&family=Playfair+Display:ital,wght@0,600;1,600&family=Cinzel:wght@700;900&family=Cormorant+Garamond:ital,wght@1,600;1,700&family=Lora:ital,wght@0,500;1,600&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const showLocalToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Main high contrast canvas vector rendering engine block
  const drawOnCanvas = (nowTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = activeSize.width;
    const height = activeSize.height;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Linear background canvas elements
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, selectedTheme.gradientStart);
    gradient.addColorStop(1, selectedTheme.gradientEnd);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. High fidelity procedurally simulated vector visual effects
    const timeDelta = animatePreview ? nowTime : 0;

    if (particlesEnabled) {
      ctx.save();
      
      if (selectedTheme.id === 'dark-aesthetic') {
        particlesSeedRef.current.forEach((ptc) => {
          const px = ptc.x * width + Math.sin(ptc.val + timeDelta * 0.0004) * 15;
          const py = (ptc.y * height + timeDelta * ptc.speed * 0.1) % height;
          const size = ptc.r * (0.6 + 0.4 * Math.sin(ptc.val + timeDelta * 0.002));
          
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + 0.15 * Math.sin(ptc.val + timeDelta * 0.0015)})`;
          ctx.fill();
        });
      }

      else if (selectedTheme.id === 'neon-glow') {
        ctx.strokeStyle = selectedTheme.borderColor + '0d';
        ctx.lineWidth = 15;
        const lineOffset = (timeDelta * 0.1) % 400;
        for (let xOffset = -width; xOffset < width * 2; xOffset += 250) {
          ctx.beginPath();
          ctx.moveTo(xOffset + lineOffset, 0);
          ctx.lineTo(xOffset + lineOffset - 400, height);
          ctx.stroke();
        }

        particlesSeedRef.current.slice(0, 60).forEach((ptc) => {
          const px = ptc.x * width;
          const py = (ptc.y * height - timeDelta * ptc.speed * 0.2 + height) % height;
          ctx.fillStyle = `rgba(168, 85, 247, ${0.2 + ptc.speed})`;
          ctx.fillRect(px, py, ptc.r * 1.5, ptc.r * 1.5);
        });
      }

      else if (selectedTheme.id === 'rain-mood') {
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.14)';
        ctx.lineWidth = 1.5;
        particlesSeedRef.current.forEach((ptc, idx) => {
          const rx = ptc.x * width + (idx % 10 - 5) * 40;
          const ry1 = (ptc.y * height + timeDelta * 1.2 * ptc.speed + height) % height;
          const ry2 = ry1 + 35;
          
          ctx.beginPath();
          ctx.moveTo(rx - 8, ry1);
          ctx.lineTo(rx - 2, ry2);
          ctx.stroke();
        });
      }

      else if (selectedTheme.id === 'love-vibes') {
        particlesSeedRef.current.slice(0, 30).forEach((ptc) => {
          const hSize = ptc.r * 2.8 + 6;
          const hx = ptc.x * width + Math.sin(ptc.val + timeDelta * 0.001) * 20;
          const hy = (ptc.y * height - timeDelta * ptc.speed * 0.25 + height) % height;

          ctx.fillStyle = `rgba(244, 63, 94, ${0.08 + ptc.speed * 0.15})`;
          ctx.beginPath();
          ctx.moveTo(hx, hy + hSize / 4);
          ctx.quadraticCurveTo(hx, hy, hx - hSize / 2, hy);
          ctx.quadraticCurveTo(hx - hSize, hy, hx - hSize, hy + hSize / 3);
          ctx.quadraticCurveTo(hx - hSize, hy + hSize * 0.75, hx, hy + hSize);
          ctx.quadraticCurveTo(hx + hSize, hy + hSize * 0.75, hx + hSize, hy + hSize / 3);
          ctx.quadraticCurveTo(hx + hSize, hy, hx + hSize / 2, hy);
          ctx.quadraticCurveTo(hx, hy, hx, hy + hSize / 4);
          ctx.closePath();
          ctx.fill();
        });
      }

      else if (selectedTheme.id === 'cyberpunk-neon') {
        ctx.fillStyle = 'rgba(220, 38, 38, 0.04)';
        const laserY = (timeDelta * 0.15) % height;
        ctx.fillRect(0, laserY - 15, width, 30);
        ctx.strokeStyle = `rgba(220, 38, 38, ${0.4 + 0.1 * Math.sin(timeDelta * 0.01)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, laserY);
        ctx.lineTo(width, laserY);
        ctx.stroke();

        particlesSeedRef.current.slice(0, 40).forEach((ptc, idx) => {
          if (idx % 3 === 0) {
            const bx = ptc.x * width;
            const by = (ptc.y * height + timeDelta * 0.05) % height;
            ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
            ctx.fillRect(bx, by, ptc.r * 4, ptc.r * 1.5);
          }
        });
      }

      else if (selectedTheme.id === 'motivation-gold') {
        particlesSeedRef.current.forEach((ptc) => {
          const px = ptc.x * width + Math.sin(ptc.val + timeDelta * 0.0006) * 12;
          const py = (ptc.y * height - timeDelta * ptc.speed * 0.28 + height) % height;
          const size = ptc.r * 0.8;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245, 158, 11, ${0.12 + 0.18 * Math.sin(ptc.val + timeDelta * 0.003)})`;
          ctx.fill();
        });
      }

      else if (selectedTheme.id === 'anime-vibe') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
        particlesSeedRef.current.slice(0, 15).forEach((ptc, idx) => {
          const cx = (ptc.x * width + timeDelta * 0.02 + idx * 80) % (width + 300) - 150;
          const cy = height * 0.6 + ptc.y * height * 0.25;
          const cr = 60 + ptc.r * 12;
          ctx.beginPath();
          ctx.arc(cx, cy, cr, 0, Math.PI * 2);
          ctx.fill();
        });

        const beamAngle = timeDelta * 0.00004;
        ctx.strokeStyle = 'rgba(253, 186, 116, 0.03)';
        ctx.lineWidth = 140;
        const beamCenterX = width / 2;
        const beamCenterY = height;
        for (let a = -Math.PI/2 - 0.5; a < -Math.PI/2 + 0.5; a += 0.25) {
          ctx.beginPath();
          ctx.moveTo(beamCenterX, beamCenterY);
          ctx.lineTo(beamCenterX + Math.cos(a + beamAngle) * height, beamCenterY + Math.sin(a + beamAngle) * height);
          ctx.stroke();
        }
      }

      else if (selectedTheme.id === 'minimal-clean') {
        ctx.fillStyle = 'rgba(113, 113, 122, 0.06)';
        for (let gx = 40; gx < width; gx += 60) {
          for (let gy = 40; gy < height; gy += 60) {
            ctx.beginPath();
            ctx.arc(gx, gy, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      else if (selectedTheme.id === 'sad-blue') {
        particlesSeedRef.current.slice(0, 10).forEach((ptc, idx) => {
          const cx = ptc.x * width + Math.sin(ptc.val + timeDelta * 0.0002) * 40;
          const cy = ptc.y * height;
          const cr = 100 + ptc.r * 30;
          
          const gradMist = ctx.createRadialGradient(cx, cy, 10, cx, cy, cr);
          gradMist.addColorStop(0, `rgba(59, 130, 246, ${0.12 + 0.04 * Math.sin(ptc.val + timeDelta * 0.001)})`);
          gradMist.addColorStop(1, 'rgba(0,0,0,0)');
          
          ctx.fillStyle = gradMist;
          ctx.fillRect(cx - cr, cy - cr, cr * 2, cr * 2);
        });
      }

      ctx.restore();
    }

    // 3. Draw high-end cinematic studio dark vignette
    if (vignetteOpacity > 0) {
      const radGrad = ctx.createRadialGradient(
        width / 2, height / 2, Math.max(width, height) * 0.35, 
        width / 2, height / 2, Math.max(width, height) * 0.8
      );
      radGrad.addColorStop(0, 'rgba(0,0,0,0)');
      radGrad.addColorStop(1, `rgba(0,0,0, ${vignetteOpacity})`);
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // 4. Double Line Aesthetics & premium frames overlay
    const margin = width * 0.07;
    const boxRadius = 24;
    ctx.strokeStyle = selectedTheme.borderColor + '3d';
    ctx.lineWidth = 3.5;
    
    ctx.beginPath();
    ctx.roundRect(margin, margin, width - margin * 2, height - margin * 2, boxRadius);
    ctx.stroke();

    const bracketLen = Math.min(width * 0.06, 50);
    ctx.strokeStyle = selectedTheme.borderColor;
    ctx.lineWidth = 6;

    ctx.beginPath();
    ctx.moveTo(margin, margin + bracketLen);
    ctx.lineTo(margin, margin);
    ctx.lineTo(margin + bracketLen, margin);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width - margin - bracketLen, margin);
    ctx.lineTo(width - margin, margin);
    ctx.lineTo(width - margin, margin + bracketLen);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(margin, height - margin - bracketLen);
    ctx.lineTo(margin, height - margin);
    ctx.lineTo(margin + bracketLen, height - margin);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width - margin - bracketLen, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.lineTo(width - margin, height - margin - bracketLen);
    ctx.stroke();

    // 5. Draw Header Shield/Lock-status Header
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = selectedTheme.borderColor;
    ctx.font = '800 24px "Space Grotesk", sans-serif';
    ctx.shadowBlur = glowIntensity * 0.8;
    ctx.shadowColor = selectedTheme.borderColor;
    ctx.fillText('⚡ ROY NO RULES... ⚡', width / 2, margin + 45);
    ctx.restore();

    ctx.strokeStyle = selectedTheme.borderColor + '2b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - width * 0.15, margin + 65);
    ctx.lineTo(width / 2 + width * 0.15, margin + 65);
    ctx.stroke();

    // 6. Print Quote lines securely (100% stable visibility - never masking words)
    ctx.save();
    ctx.fillStyle = selectedTheme.textColor;
    ctx.textAlign = alignment;
    
    if (glowIntensity > 0) {
      ctx.shadowBlur = glowIntensity;
      ctx.shadowColor = selectedTheme.borderColor;
    } else {
      ctx.shadowBlur = 0;
    }

    const finalFontSize = fontSize * 1.5;
    ctx.font = `600 ${finalFontSize}px "${selectedFont}", "Outfit", system-ui, sans-serif`;
    
    try {
      (ctx as any).letterSpacing = `${letterSpacing}px`;
    } catch (_) {}

    const paddingX = width * 0.12;
    const maxTextWidth = width - paddingX * 2;
    const rawLines = shayari.text.split('\n');
    const wrappedLines: string[] = [];

    rawLines.forEach((rLine) => {
      const words = rLine.split(' ');
      let currentLine = '';

      for (let wIdx = 0; wIdx < words.length; wIdx++) {
        const testLine = currentLine + words[wIdx] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxTextWidth && wIdx > 0) {
          wrappedLines.push(currentLine.trim());
          currentLine = words[wIdx] + ' ';
        } else {
          currentLine = testLine;
        }
      }
      wrappedLines.push(currentLine.trim());
    });

    const customLineHeight = finalFontSize * lineHeight;
    const totalTextHeight = wrappedLines.length * customLineHeight;
    
    let startY = (height / 2) - (totalTextHeight / 2) + 15;
    if (activeSize.id === 'story') {
      startY = (height * 0.48) - (totalTextHeight / 2);
    }

    wrappedLines.forEach((lineText) => {
      const wordsInLine = lineText.split(/(\s+)/);

      if (alignment === 'left') {
        let runningX = paddingX;
        wordsInLine.forEach((w) => {
          const isHighlight = shayari.highlightedWords.some(hw => w.toLowerCase().includes(hw.toLowerCase()));
          ctx.font = isHighlight 
            ? `800 ${finalFontSize}px "${selectedFont}", "Space Grotesk", sans-serif` 
            : `500 ${finalFontSize}px "${selectedFont}", "Outfit", sans-serif`;
          ctx.fillStyle = isHighlight ? selectedTheme.highlightColor : selectedTheme.textColor;
          
          if (isHighlight && glowIntensity > 0) {
            ctx.shadowBlur = glowIntensity + 8;
            ctx.shadowColor = selectedTheme.borderColor;
          } else if (glowIntensity > 0) {
            ctx.shadowBlur = glowIntensity;
            ctx.shadowColor = selectedTheme.borderColor;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.fillText(w, runningX, startY);
          runningX += ctx.measureText(w).width;
        });
      } 
      
      else if (alignment === 'right') {
        const totalLineWidth = ctx.measureText(lineText).width;
        let runningX = width - paddingX - totalLineWidth;
        wordsInLine.forEach((w) => {
          const isHighlight = shayari.highlightedWords.some(hw => w.toLowerCase().includes(hw.toLowerCase()));
          ctx.font = isHighlight 
            ? `800 ${finalFontSize}px "${selectedFont}", "Space Grotesk", sans-serif` 
            : `500 ${finalFontSize}px "${selectedFont}", "Outfit", sans-serif`;
          ctx.fillStyle = isHighlight ? selectedTheme.highlightColor : selectedTheme.textColor;
          
          if (isHighlight && glowIntensity > 0) {
            ctx.shadowBlur = glowIntensity + 8;
            ctx.shadowColor = selectedTheme.borderColor;
          } else if (glowIntensity > 0) {
            ctx.shadowBlur = glowIntensity;
            ctx.shadowColor = selectedTheme.borderColor;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.fillText(w, runningX, startY);
          runningX += ctx.measureText(w).width;
        });
      } 
      
      else {
        const lineWithStyles: { text: string; width: number; isHighlight: boolean }[] = wordsInLine.map((w) => {
          const isHighlight = shayari.highlightedWords.some(hw => w.toLowerCase().includes(hw.toLowerCase()));
          ctx.font = isHighlight 
            ? `800 ${finalFontSize}px "${selectedFont}", "Space Grotesk", sans-serif` 
            : `500 ${finalFontSize}px "${selectedFont}", "Outfit", sans-serif`;
          return {
            text: w,
            width: ctx.measureText(w).width,
            isHighlight
          };
        });

        const computedLineWidth = lineWithStyles.reduce((sum, item) => sum + item.width, 0);
        let runningX = (width - computedLineWidth) / 2;

        lineWithStyles.forEach((item) => {
          ctx.font = item.isHighlight 
            ? `800 ${finalFontSize}px "${selectedFont}", "Space Grotesk", sans-serif` 
            : `500 ${finalFontSize}px "${selectedFont}", "Outfit", sans-serif`;
          ctx.fillStyle = item.isHighlight ? selectedTheme.highlightColor : selectedTheme.textColor;
          ctx.textAlign = 'left';

          if (item.isHighlight && glowIntensity > 0) {
            ctx.shadowBlur = glowIntensity + 10;
            ctx.shadowColor = selectedTheme.borderColor;
          } else if (glowIntensity > 0) {
            ctx.shadowBlur = glowIntensity;
            ctx.shadowColor = selectedTheme.borderColor;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.fillText(item.text, runningX, startY);
          runningX += item.width;
        });
      }

      ctx.shadowBlur = 0; 
      startY += customLineHeight;
    });

    ctx.restore();

    // 7. Render Authorship Hashtaq
    ctx.textAlign = 'center';
    ctx.font = '700 20px "Space Grotesk", sans-serif';
    ctx.fillStyle = selectedTheme.borderColor + 'df';
    ctx.fillText(`#${shayari.category}`, width / 2, startY + 45);

    // 8. Draw customizable bottom brand trademark watermark
    if (showWatermark && watermark) {
      ctx.textAlign = 'center';
      
      let watermarkY = height - margin - 50;
      if (activeSize.id === 'story') {
        watermarkY = height - margin - 100;
      } else if (activeSize.id === 'wallpaper') {
        watermarkY = height - margin - 140;
      }

      ctx.font = '500 18px "JetBrains Mono", monospace';
      ctx.fillStyle = selectedTheme.id === 'minimal-clean' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.38)';
      ctx.fillText(watermark, width / 2, watermarkY);
    }
  };

  // Live Canvas render loops
  useEffect(() => {
    const loop = (timestamp: number) => {
      drawOnCanvas(timestamp);
      if (animatePreview) {
        renderFrameIdRef.current = requestAnimationFrame(loop);
      }
    };

    if (animatePreview) {
      renderFrameIdRef.current = requestAnimationFrame(loop);
    } else {
      drawOnCanvas(0);
    }

    return () => {
      if (renderFrameIdRef.current) {
        cancelAnimationFrame(renderFrameIdRef.current);
      }
    };
  }, [
    selectedTheme, selectedFont, fontSize, lineHeight, letterSpacing, 
    glowIntensity, vignetteOpacity, alignment, watermark, showWatermark, 
    particlesEnabled, animatePreview, activeSize
  ]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsExporting(true);
    showLocalToast('Packaging Ultra HD Artwork... 🎨');

    setTimeout(() => {
      try {
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `RoyNoRules_${activeSize.id}_${shayari.id}.png`;
        link.href = dataURL;
        link.click();
        showLocalToast('Premium status wallpaper saved! 📲');
      } catch (err) {
        showLocalToast('Error exporting. Choose Copy Share or screenshot instead! ⚠️');
      } finally {
        setIsExporting(false);
      }
    }, 600);
  };

  const handleCopyToClipboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    showLocalToast('Buffering direct binary bytes... 📦');

    setTimeout(() => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showLocalToast('Failed to parse artwork bytes! ⚠️');
          setIsExporting(false);
          return;
        }

        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          showLocalToast('Copied directly! Paste instantly in WhatsApp, IG, or Telegram! ❤️');
        } catch (e) {
          showLocalToast('System blocked canvas copy. Download HD PNG instead! 💾');
        } finally {
          setIsExporting(false);
        }
      }, 'image/png');
    }, 300);
  };

  const handleSystemShare = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) {
        showLocalToast('Failed to load artwork buffer. ⚠️');
        return;
      }

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [] })) {
        try {
          const file = new File([blob], 'roy_story_status.png', { type: 'image/png' });
          await navigator.share({
            files: [file],
            title: 'Roy No Rules... Studio status',
            text: `Designed Shayari Status: "${shayari.text}"`
          });
          showLocalToast('Artwork Shared! 🚀');
        } catch (e) {
          if ((e as Error).name !== 'AbortError') {
            showLocalToast('Direct sharing aborted. Try raw downloading! 📥');
          }
        }
      } else {
        showLocalToast('Sharing blocked on current shell browser. Copied to Clipboard instead! 📋');
        handleCopyToClipboard();
      }
    }, 'image/png');
  };

  const previewBoxStyle = useMemo(() => {
    if (activeSize.id === 'post') {
      return { aspectClass: 'aspect-square', sizeName: 'SQUARE FEED (1:1)' };
    } else if (activeSize.id === 'story') {
      return { aspectClass: 'aspect-[9/16]', sizeName: 'STORY / STATUS (9:16)' };
    } else {
      return { aspectClass: 'aspect-[9/20]', sizeName: 'MOBILE WALLPAPER (9:20)' };
    }
  }, [activeSize]);

  return (
    <div 
      className="fixed inset-0 bg-black/99 backdrop-blur-md z-50 flex flex-col justify-between overflow-hidden"
      id="status-editor-fullscreen"
    >
      {/* Dynamic Local Notification Indicator */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:max-w-md z-[100] p-4 bg-zinc-950/98 border border-red-500/30 text-white rounded-2xl flex items-center gap-2.5 shadow-[0_15px_40px_rgba(239,68,68,0.35)] select-none"
          >
            <Sparkles size={16} className="text-red-500 shrink-0 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP BAR TOOLBAR (Small, Premium & Elegant) */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/5 bg-black/45 backdrop-blur-md shrink-0 select-none z-10 w-full">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-red-950/50 border border-red-500/20 text-red-500">
            <Flame size={14} className="animate-pulse" />
          </span>
          <div>
            <h2 className="text-[11px] md:text-xs font-sans font-black tracking-widest uppercase text-white flex items-center gap-1.5 leading-none">
              Roy Studio Pro
              <span className="text-[8px] font-mono text-zinc-500 border border-white/5 px-1.5 py-0.5 rounded-full bg-white/5">CREATIVE ENGINE</span>
            </h2>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-90 w-9 transition-all cursor-pointer bg-zinc-904 hover:bg-zinc-900 text-zinc-400 border border-zinc-900 hover:text-white hover:border-red-500"
          title="Return to Feed"
        >
          <X size={15} />
        </button>
      </div>

      {/* 2. MAIN CENTER PREVIEW ZONE (Takes 70-80% Screen Space Focus) */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 overflow-hidden relative select-none">
        
        {/* Soft background ambient glow matching dynamic template coordinates */}
        <div 
          className="absolute w-[240px] md:w-[325px] h-[240px] md:h-[325px] rounded-full blur-[100px] md:blur-[140px] opacity-20 pointer-events-none transition-all duration-[800ms]"
          style={{ background: selectedTheme.borderColor }}
        />
        
        {/* Centered Large-Scale Wallpaper canvas preview frame */}
        <div className="relative w-full h-full flex items-center justify-center max-h-[50vh] sm:max-h-[55vh] md:max-h-[58vh] lg:max-h-[62vh] xl:max-h-[65vh]">
          <div className={`relative max-w-full h-full ${previewBoxStyle.aspectClass} bg-neutral-950 rounded-2xl border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.95)] overflow-hidden flex items-center justify-center transition-all duration-500 hover:border-white/20`}>
            {/* Direct canvas mount */}
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain block select-none rounded-[15px]"
              style={{ maxHeight: '100%', maxWidth: '100%' }}
            />
          </div>
        </div>
        
        {/* Aspect Ratio Status Badge overlay */}
        <div className="mt-4 flex items-center justify-center gap-2 bg-zinc-950/80 border border-white/5 px-3 py-1.5 rounded-full text-[9px] font-mono tracking-widest text-zinc-400 shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          STUDIO RENDERING: <b className="text-white font-black">{previewBoxStyle.sizeName}</b>
        </div>

        {/* Premium Wallpaper Creator Bottom Ad */}
        <div className="w-full max-w-lg mt-2 select-none z-10 px-4">
          <PremiumAdContainer placement="wallpaperCreatorBottomAd" />
        </div>
      </div>

      {/* 3. COMPACT SLIDING BOTTOM EDITOR PANEL & FLOATING EXPORTS */}
      <div className="border-t border-white/10 bg-zinc-950/98 backdrop-blur-md shrink-0 select-none overflow-hidden flex flex-col z-20">
        
        {/* Compact Horizontal Tab Selector */}
        <div className="flex items-center border-b border-white/5 bg-black/60 overflow-x-auto scrollbar-none shrink-0 px-2">
          {[
            { id: 'themes', label: '🎨 Art', icon: <Palette size={13} /> },
            { id: 'typography', label: '🎚️ Style', icon: <Type size={13} /> },
            { id: 'effects', label: '⚙️ FX', icon: <Sparkles size={13} /> },
            { id: 'watermark', label: '🎫 Brand', icon: <Sliders size={13} /> },
            { id: 'formats', label: '🌠 Ratio', icon: <Smartphone size={13} /> }
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[75px] py-3.5 px-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-mono font-black tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-red-500 text-red-400 bg-white/5 font-black' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label.split(' ')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Compact Sub-Tab Options Zone (Set to perfect 160px height to maximize preview area) */}
        <div className="p-4 sm:p-5 h-[155px] sm:h-[175px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
          
          {/* TAB: THEMES SELECTOR */}
          {activeTab === 'themes' && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x h-full items-center">
              {BACKGROUND_THEMES.map((theme) => {
                const isSelected = selectedTheme.id === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setSelectedTheme(theme);
                      showLocalToast(`Preset Active: ${theme.name}`);
                    }}
                    className={`flex-shrink-0 snap-center w-[120px] sm:w-[140px] h-[95px] flex flex-col justify-between p-2.5 rounded-xl border text-left transition-all duration-300 cursor-pointer relative overflow-hidden bg-zinc-900/40 ${
                      isSelected 
                        ? 'border-red-500 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.25)] text-white' 
                        : 'border-white/5 hover:border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div 
                      className="w-full h-8 rounded-lg border border-white/5 bg-gradient-to-r flex items-center justify-end px-2"
                      style={{ 
                        backgroundImage: `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})` 
                      }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ background: theme.borderColor }} />
                    </div>
                    <span className="text-[10px] font-sans font-bold tracking-tight truncate w-full">{theme.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB: TYPOGRAPHY STYLE CONTROLS */}
          {activeTab === 'typography' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full items-center">
              <div className="space-y-3">
                <div className="flex gap-2.5 items-center">
                  <select
                    value={selectedFont}
                    onChange={(e) => {
                      setSelectedFont(e.target.value);
                      showLocalToast(`Font updated: ${e.target.value}`);
                    }}
                    className="flex-1 bg-zinc-900 border border-white/10 text-white rounded-lg px-2.5 py-2 text-[11px] font-sans font-bold outline-none cursor-pointer"
                  >
                    {['Hindi', 'Handwritten', 'Bold Attitude', 'Elegant Editorial'].map((cat) => (
                      <optgroup key={cat} label={`📂 ${cat.toUpperCase()}`}>
                        {FONTS.filter((f) => f.category === cat).map((font) => (
                          <option key={font.id} value={font.id}>
                            {font.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>

                  <div className="flex border border-white/10 rounded-lg overflow-hidden shrink-0">
                    {([
                      { id: 'left', icon: <AlignLeft size={13} /> },
                      { id: 'center', icon: <AlignCenter size={13} /> },
                      { id: 'right', icon: <AlignRight size={13} /> }
                    ] as const).map((align) => (
                      <button
                        key={align.id}
                        onClick={() => setAlignment(align.id)}
                        className={`p-2 transition-all cursor-pointer text-xs ${
                          alignment === align.id 
                            ? 'bg-red-500 text-white font-bold' 
                            : 'bg-zinc-900 text-zinc-500 hover:text-white'
                        }`}
                      >
                        {align.icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] sm:text-[9px] font-mono text-zinc-400">
                    <span className="uppercase tracking-widest font-bold">Font Scale</span>
                    <span>{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="40"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full accent-red-500 cursor-pointer h-1 bg-zinc-900 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] sm:text-[9px] font-mono text-zinc-400">
                    <span className="uppercase tracking-widest font-bold">Line Spacing</span>
                    <span>{lineHeight}x</span>
                  </div>
                  <input
                    type="range"
                    min="1.2"
                    max="2.3"
                    step="0.05"
                    value={lineHeight}
                    onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                    className="w-full accent-red-500 cursor-pointer h-1 bg-zinc-900 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] sm:text-[9px] font-mono text-zinc-400">
                    <span className="uppercase tracking-widest font-bold">Kerning Spacing</span>
                    <span>{letterSpacing}px</span>
                  </div>
                  <input
                    type="range"
                    min="-2"
                    max="10"
                    step="1"
                    value={letterSpacing}
                    onChange={(e) => setLetterSpacing(parseInt(e.target.value))}
                    className="w-full accent-red-500 cursor-pointer h-1 bg-zinc-900 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: EFFECTS SYSTEM */}
          {activeTab === 'effects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full items-center">
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] sm:text-[9px] font-mono text-zinc-400">
                    <span className="uppercase tracking-widest font-bold">Text Glow Intensity</span>
                    <span>{glowIntensity}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="35"
                    value={glowIntensity}
                    onChange={(e) => setGlowIntensity(parseInt(e.target.value))}
                    className="w-full accent-red-500 cursor-pointer h-1 bg-zinc-900 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] sm:text-[9px] font-mono text-zinc-400">
                    <span className="uppercase tracking-widest font-bold">Vignette Boundary</span>
                    <span>{Math.round(vignetteOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.85"
                    step="0.05"
                    value={vignetteOpacity}
                    onChange={(e) => setVignetteOpacity(parseFloat(e.target.value))}
                    className="w-full accent-red-500 cursor-pointer h-1 bg-zinc-900 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] bg-zinc-900/60 border border-white/5 px-2.5 py-1.5 rounded-lg select-none">
                  <span className="font-mono text-zinc-400 font-bold uppercase tracking-wide">Drifting Particles</span>
                  <input
                    type="checkbox"
                    checked={particlesEnabled}
                    onChange={(e) => setParticlesEnabled(e.target.checked)}
                    className="accent-red-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] bg-zinc-900/60 border border-white/5 px-2.5 py-1.5 rounded-lg select-none">
                  <span className="font-mono text-zinc-400 font-bold uppercase tracking-wide">Live Animations</span>
                  <input
                    type="checkbox"
                    checked={animatePreview}
                    onChange={(e) => setAnimatePreview(e.target.checked)}
                    className="accent-red-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: BRAND LOGO WATERMARK */}
          {activeTab === 'watermark' && (
            <div className="flex flex-col gap-3 h-full justify-center">
              <div className="flex items-center justify-between text-[11px] bg-zinc-900/60 border border-white/5 px-3 py-2 rounded-lg select-none">
                <span className="font-mono text-zinc-400 font-black uppercase tracking-wider">Embed Studio Watermark Logo</span>
                <input
                  type="checkbox"
                  checked={showWatermark}
                  onChange={(e) => setShowWatermark(e.target.checked)}
                  className="accent-red-500 cursor-pointer scale-110"
                />
              </div>

              {showWatermark && (
                <input
                  type="text"
                  value={watermark}
                  onChange={(e) => setWatermark(e.target.value)}
                  placeholder="Enter Signature Tag... (e.g. Roy No Rules...)"
                  maxLength={28}
                  className="w-full bg-zinc-900 border border-white/10 focus:border-red-500 text-white rounded-lg px-3 py-2 text-xs outline-none font-mono"
                />
              )}
            </div>
          )}

          {/* TAB: ASPECT RATIO STENCILS */}
          {activeTab === 'formats' && (
            <div className="flex gap-3 h-full items-center justify-center">
              {EXPORT_SIZES.map((size) => {
                const isSelected = activeSize.id === size.id;
                return (
                  <button
                    key={size.id}
                    onClick={() => {
                      setActiveSize(size);
                      showLocalToast(`Output changed to: ${size.name}`);
                    }}
                    className={`flex-1 max-w-[150px] py-3.5 px-3 border rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-red-500 bg-red-950/20 text-white shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                        : 'border-white/5 bg-zinc-900/40 text-zinc-500 hover:border-zinc-850 hover:text-white'
                    }`}
                  >
                    <span className="text-sm sm:text-base">{size.icon}</span>
                    <span className="text-[9px] font-mono font-black uppercase tracking-wider">{size.id}</span>
                  </button>
                );
              })}
            </div>
          )}

        </div>

        {/* 4. PREMIUM COMPACT SHARING HUB & THE CONNOTED FLOATING EXPORT CORE */}
        <div className="p-3 bg-black/60 border-t border-white/5 flex items-center justify-between gap-3 w-full shrink-0">
          
          <div className="flex items-center gap-2">
            {/* Copy Bytes Action */}
            <button
              disabled={isExporting}
              onClick={handleCopyToClipboard}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:border-red-500/30 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              title="Copy Graphic PNG bytes to clipboard"
            >
              <Clipboard size={15} />
            </button>

            {/* Direct Share Action */}
            <button
              disabled={isExporting}
              onClick={handleSystemShare}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:border-red-500/30 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              title="Share directly via system"
            >
              <Share2 size={15} />
            </button>
          </div>

          {/* The Absolute Hero Export Action Button: EXPORT HD */}
          <button
            disabled={isExporting}
            onClick={handleDownload}
            className="flex-1 max-w-[320px] h-11 bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-60 text-white text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-[0_4px_25px_rgba(220,38,38,0.45)] flex items-center justify-center gap-2 cursor-pointer transition-all duration-300"
          >
            <Download size={14} className="stroke-[2.5]" />
            <span>{isExporting ? 'EXPORTING...' : 'EXPORT HD'}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
