import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ShieldCheck } from 'lucide-react';

export interface AdsConfig {
  isEnabled: boolean;
  adsterraScript: string;
  adFrequency: number;
  placements: {
    homeTopBanner: boolean;
    betweenShayaris: boolean;
    afterFivePosts: boolean;
    bottomFeedAd: boolean;
    sidebarAd: boolean;
    wallpaperCreatorBottomAd: boolean;
    profilePageAd: boolean;
    searchResultAd: boolean;
  };
}

export const DEFAULT_ADS_CONFIG: AdsConfig = {
  isEnabled: true,
  adsterraScript: `<!-- Sample Adsterra Banner Widget -->
<script type="text/javascript">
	atOptions = {
		'key' : 'sample_adsterra_key_9fcf3d0b2f',
		'format' : 'iframe',
		'height' : 90,
		'width' : 728,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//www.creativeformat.com/sample_key/invoke.js"></script>`,
  adFrequency: 5,
  placements: {
    homeTopBanner: true,
    betweenShayaris: true,
    afterFivePosts: true,
    bottomFeedAd: true,
    sidebarAd: true,
    wallpaperCreatorBottomAd: true,
    profilePageAd: true,
    searchResultAd: true,
  },
};

export function getStoredAdsConfig(): AdsConfig {
  const saved = localStorage.getItem('roynorules_ads_config');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return DEFAULT_ADS_CONFIG;
    }
  }
  // Initialize with defaults if none exists
  localStorage.setItem('roynorules_ads_config', JSON.stringify(DEFAULT_ADS_CONFIG));
  return DEFAULT_ADS_CONFIG;
}

export function saveAdsConfig(config: AdsConfig) {
  localStorage.setItem('roynorules_ads_config', JSON.stringify(config));
  // Dispatch a custom storage event so other components receive immediate notice
  window.dispatchEvent(new Event('roynorules_ads_updated'));
}

interface PremiumAdContainerProps {
  placement: keyof AdsConfig['placements'];
  forcePreview?: boolean;
}

export default function PremiumAdContainer({ placement, forcePreview = false }: PremiumAdContainerProps) {
  const [config, setConfig] = useState<AdsConfig>(getStoredAdsConfig());
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(getStoredAdsConfig());
    };

    window.addEventListener('roynorules_ads_updated', handleUpdate);
    return () => {
      window.removeEventListener('roynorules_ads_updated', handleUpdate);
    };
  }, []);

  const isAdEnabled = forcePreview || (config.isEnabled && config.placements[placement]);

  useEffect(() => {
    if (!isAdEnabled || !iframeRef.current || !config.adsterraScript) return;

    // Build responsive sandboxed content inside the iframe
    const iframe = iframeRef.current;
    
    // We construct a clean HTML page with styles and center alignment
    const isBannerFormat = config.adsterraScript.includes('width') ? true : false;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: transparent;
              color: #a1a1aa;
              font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              height: 100vh;
              width: 100vw;
            }
            .ad-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="ad-container">
            ${config.adsterraScript}
          </div>
        </body>
      </html>
    `;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    } catch (e) {
      console.warn("Iframe sandboxing safe limit encountered: ", e);
    }
  }, [isAdEnabled, config.adsterraScript]);

  if (!isAdEnabled) return null;

  // Render Premium Ad container with glassmorphic style and glowing borders
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full relative mx-auto my-3 px-1 sm:px-4 shrink-0 select-none"
    >
      <div className="relative rounded-2xl bg-zinc-950/60 border border-zinc-900/65 backdrop-blur-md overflow-hidden max-w-2xl mx-auto shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
        {/* Ad Premium Badge Header */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-gradient-to-r from-red-950/20 via-zinc-950 to-zinc-950/10 border-b border-zinc-900/60 select-none text-[8px] font-mono tracking-widest text-zinc-500 uppercase">
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles size={8} className="text-red-500 animate-pulse" />
            <span>Featured Partner</span>
          </div>
          <div className="flex items-center gap-1 font-medium">
            <ShieldCheck size={9} className="text-zinc-600" />
            <span>Verified Post</span>
          </div>
        </div>

        {/* Ad Workspace Content Frame */}
        <div className="p-3 flex justify-center items-center min-h-[90px] w-full overflow-hidden">
          {config.adsterraScript && !config.adsterraScript.includes('sample_adsterra_key') ? (
            <iframe
              ref={iframeRef}
              title={`Roy Ads ${placement}`}
              className="w-full border-0 bg-transparent overflow-hidden"
              style={{
                height: config.adsterraScript.includes("'height'") || config.adsterraScript.includes('height:') 
                  ? '130px' 
                  : '90px',
                maxWidth: '728px',
              }}
              sandbox="allow-scripts allow-same-origin allow-popups"
              scrolling="no"
            />
          ) : (
            /* Aesthetic Preview placeholder for sample or empty scripts */
            <div className="flex flex-col items-center justify-center p-3 text-center space-y-1 w-full border border-dashed border-zinc-900 rounded-xl bg-zinc-900/20">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#E11D48] uppercase">
                Adsterra Space Available
              </span>
              <p className="text-[9px] text-zinc-500 max-w-sm leading-relaxed font-sans">
                Native responsive banner script triggers here. Clean layout prevents shift and maintains emotional Gen-Z vibe.
              </p>
              <div className="text-[8px] font-mono text-zinc-600 bg-black/40 px-2 py-0.5 rounded border border-zinc-900/50 mt-1">
                placement: {String(placement).replace(/([A-Z])/g, ' $1').toLowerCase()}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
