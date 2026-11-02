import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { api } from '../../services/api.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { DEFAULT_REELS } from '../../data/defaultProducts.js';

export default function ReelsShowcase() {
  const { language } = useLanguage();
  const sectionRef = useRef(null);
  const sliderRef = useRef(null);

  const initialReelsList = (DEFAULT_REELS || []).filter(r => r.isActive !== false && (r.videoUrl || r.thumbnailUrl));
  const [reels, setReels] = useState(initialReelsList);
  const [loading, setLoading] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isPausedHover, setIsPausedHover] = useState(false);

  // Per-card playback state: { [reelId]: { isPlaying: boolean, isMuted: boolean } }
  const [mediaState, setMediaState] = useState(() => {
    const states = {};
    initialReelsList.forEach((r) => {
      states[r.id] = { isPlaying: true, isMuted: true };
    });
    return states;
  });
  const videoRefs = useRef({});

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Fetch active reels from backend
  useEffect(() => {
    let isMounted = true;
    api.getReels()
      .then((res) => {
        if (isMounted && res && res.success && Array.isArray(res.reels)) {
          // Filter to active reels with valid video or thumbnail
          const activeReels = res.reels.filter(r => r.isActive !== false && (r.videoUrl || r.thumbnailUrl));
          setReels(activeReels);

          // Initialize media states: all start muted by default for browser autoplay compliance
          const initialStates = {};
          activeReels.forEach((r) => {
            initialStates[r.id] = { isPlaying: true, isMuted: true };
          });
          setMediaState(initialStates);
        }
      })
      .catch((err) => {
        console.warn('Could not load reels from API, falling back:', err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  // IntersectionObserver: auto-play videos when section enters viewport, pause when outside
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        setIsInViewport(inView);
        if (inView) {
          setHasEntered(true);
          // Play visible video muted
          Object.entries(videoRefs.current).forEach(([id, video]) => {
            if (video && video.paused) {
              const playPromise = video.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    setMediaState(prev => ({
                      ...prev,
                      [id]: { ...(prev[id] || { isMuted: true }), isPlaying: true }
                    }));
                  })
                  .catch(() => {});
              }
            }
          });
        } else {
          // Pause when scrolled outside viewport to conserve CPU/battery
          Object.entries(videoRefs.current).forEach(([id, video]) => {
            if (video && !video.paused) {
              video.pause();
              setMediaState(prev => ({
                ...prev,
                [id]: { ...(prev[id] || { isMuted: true }), isPlaying: false }
              }));
            }
          });
        }
      },
      {
        threshold: 0.15,
        rootMargin: '100px 0px 100px 0px',
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [reels]);

  // Automatic Horizontal Slider Interval (Pauses when outside viewport, hovered, or reduced motion)
  useEffect(() => {
    if (reducedMotion || isPausedHover || !isInViewport || reels.length <= 1) return;

    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        // If reached end, wrap smoothly to start
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll by approx one card width
          const cardWidth = sliderRef.current.querySelector('[data-reel-card]')?.clientWidth || 228;
          sliderRef.current.scrollBy({ left: cardWidth + 16, behavior: 'smooth' });
        }
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [reducedMotion, isPausedHover, isInViewport, reels.length]);

  const scrollLeft = () => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.querySelector('[data-reel-card]')?.clientWidth || 228;
      sliderRef.current.scrollBy({ left: -(cardWidth + 16), behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.querySelector('[data-reel-card]')?.clientWidth || 228;
      sliderRef.current.scrollBy({ left: cardWidth + 16, behavior: 'smooth' });
    }
  };

  // Toggle Play / Pause for a specific reel
  const togglePlay = (reelId, e) => {
    if (e) e.stopPropagation();
    const vid = videoRefs.current[reelId];
    if (!vid) return;

    if (vid.paused) {
      vid.play()
        .then(() => {
          setMediaState(prev => ({
            ...prev,
            [reelId]: { ...prev[reelId], isPlaying: true }
          }));
        })
        .catch(err => console.log('Playback error:', err.message));
    } else {
      vid.pause();
      setMediaState(prev => ({
        ...prev,
        [reelId]: { ...prev[reelId], isPlaying: false }
      }));
    }
  };

  // Toggle Mute / Unmute for a specific reel only
  const toggleMute = (reelId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const vid = videoRefs.current[reelId];
    if (!vid) return;

    const currentMuted = vid.muted;
    vid.muted = !currentMuted;

    setMediaState(prev => ({
      ...prev,
      [reelId]: { ...prev[reelId], isMuted: !currentMuted }
    }));
  };

  // Localized Heading Content
  const headingText = {
    en: {
      eyebrow: 'REAL PRODUCTS. REAL PERFORMANCE.',
      heading: 'Watch Mahadev in Action',
      description:
        'Explore our electrical and solar products through real videos, demonstrations, and customer experiences.',
    },
    hinglish: {
      eyebrow: 'REAL PRODUCTS. REAL PERFORMANCE.',
      heading: 'Dekhein Mahadev Ko Action Mein',
      description:
        'Hamare electrical aur solar products ko real videos, demonstrations aur customer experiences ke madhyam se dekhein.',
    },
    hi: {
      eyebrow: 'असली उत्पाद। असली प्रदर्शन।',
      heading: 'महादेव को एक्शन में देखें',
      description:
        'हमारे इलेक्ट्रिकल और सोलर उत्पादों को असली वीडियो, लाइव प्रदर्शन और ग्राहकों के अनुभवों के माध्यम से देखें।',
    },
  };

  const activeHeading = headingText[language] || headingText.en;

  const displayReels = reels.length > 0 ? reels : initialReelsList;

  // If no reels are configured, do not render empty section
  if (!loading && displayReels.length === 0) {
    return null;
  }

  return (
    <section
      id="reels-showcase"
      ref={sectionRef}
      aria-label="Reels Showcase"
      className="relative py-10 sm:py-12 md:py-14 lg:py-16 bg-[#0B0B0B] border-t border-[#202020] overflow-hidden select-none"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* ====================================================================
            SECTION HEADING (Clean, Cinematic with Gold Expanding Underline)
            ==================================================================== */}
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 transition-all duration-700 ease-out ${
            hasEntered || reducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="max-w-2xl text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-[#D6A52A] mb-3">
              <span>{activeHeading.eyebrow}</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-heading font-extrabold text-[#FFFFFF] tracking-tight leading-[1.2] mb-3">
              {activeHeading.heading}
            </h2>

            {/* Subtle Animated Gold Underline */}
            <div className="w-full h-[2.5px] bg-[#202020] rounded-full mb-4 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-[#D6A52A] via-[#F2C75C] to-transparent transition-all duration-1000 ease-out rounded-full ${
                  hasEntered || reducedMotion ? 'w-32 sm:w-44 opacity-100' : 'w-0 opacity-0'
                }`}
              />
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#B5B5B5] leading-relaxed font-normal">
              {activeHeading.description}
            </p>
          </div>

          {/* Slider Prev / Next Controls */}
          <div className="hidden sm:flex items-center gap-3 mt-6 md:mt-0 shrink-0">
            <button
              type="button"
              onClick={scrollLeft}
              aria-label="Previous Reels"
              className="w-10 h-10 rounded-none bg-[#1c1c1c] border border-white/10 hover:border-[#D6A52A] text-white hover:text-[#D6A52A] flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              aria-label="Next Reels"
              className="w-10 h-10 rounded-none bg-[#1c1c1c] border border-white/10 hover:border-[#D6A52A] text-white hover:text-[#D6A52A] flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ====================================================================
            REELS 9:16 PORTRAIT CARDS SLIDER
            - Tall portrait layout: aspect-ratio: 9 / 16 (aspect-[9/16])
            - Desktop target: ~228px - 230px wide × ~400px - 410px high
            - Desktop layout: 5 cards per row aligned with content container
            - Tablet: 3 cards per row in horizontal slider
            - Mobile: 1–2 cards visible in horizontally scrollable slider
            - Subtle border radius (rounded-xl) and overflow: hidden
            - Videos fill entire card: width: 100%, height: 100%, object-fit: cover
            - Top-Left: Category label only
            - Bottom-Right: Mute/Unmute control only
            - All other text overlays/titles/descriptions and controls removed
            - AutoPlay muted, loop, playsInline, IntersectionObserver
            ==================================================================== */}
        <div
          onMouseEnter={() => setIsPausedHover(true)}
          onMouseLeave={() => setIsPausedHover(false)}
          className="relative"
        >
          <div
            ref={sliderRef}
            className="flex items-stretch gap-4 overflow-x-auto scroll-smooth no-scrollbar pb-3 pt-1 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayReels.map((reel, idx) => {
              const reelState = mediaState[reel.id] || { isPlaying: true, isMuted: true };
              const isVideoUrl = reel.videoUrl && (
                reel.videoUrl.endsWith('.mp4') ||
                reel.videoUrl.endsWith('.webm') ||
                reel.videoUrl.includes('/uploads/') ||
                reel.sourceType === 'upload' ||
                reel.sourceType === 'url'
              );

              return (
                <div
                  key={reel.id}
                  data-reel-card="true"
                  style={{
                    aspectRatio: '9 / 16',
                    transitionDelay: reducedMotion ? '0ms' : `${idx * 80}ms`,
                  }}
                  className={`snap-start shrink-0 w-[228px] sm:w-[calc((100%-32px)/3)] lg:w-[calc((100%-64px)/5)] aspect-[9/16] relative bg-[#202020] rounded-xl border border-white/10 hover:border-[#D6A52A]/80 transition-all duration-300 overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-[#D6A52A]/10 select-none ${
                    hasEntered || reducedMotion
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  }`}
                  onClick={() => isVideoUrl && togglePlay(reel.id)}
                >
                  {/* Video or Thumbnail Media Layer - 100% of Card (width: 100%, height: 100%, object-fit: cover) */}
                  {isVideoUrl && hasEntered ? (
                    <video
                      ref={el => videoRefs.current[reel.id] = el}
                      src={reel.videoUrl}
                      poster={reel.thumbnailUrl || '/images/categories/zatka-machines.png'}
                      autoPlay={isInViewport}
                      muted={reelState.isMuted}
                      loop
                      playsInline
                      preload="none"
                      onPlay={() => setMediaState(p => ({ ...p, [reel.id]: { ...(p[reel.id] || {}), isPlaying: true } }))}
                      onPause={() => setMediaState(p => ({ ...p, [reel.id]: { ...(p[reel.id] || {}), isPlaying: false } }))}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <img
                      src={reel.thumbnailUrl || '/images/categories/zatka-machines.png'}
                      alt={reel.category || 'Reel Media'}
                      loading="lazy"
                      decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      className="w-full h-full object-cover rounded-xl transition-transform duration-700 group-hover:scale-105"
                    />
                  )}

                  {/* Top-Left: Category Label Only */}
                  {reel.category && (
                    <div className="absolute top-3 left-3 z-20 pointer-events-none">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-black/60 text-[#D6A52A] border border-[#D6A52A]/40 backdrop-blur-md shadow-md">
                        {reel.category}
                      </span>
                    </div>
                  )}

                  {/* Bottom-Right: Independent Mute / Unmute Button Only */}
                  {isVideoUrl && (
                    <div className="absolute bottom-3 right-3 z-20 pointer-events-auto">
                      <button
                        type="button"
                        onClick={(e) => toggleMute(reel.id, e)}
                        aria-label={reelState.isMuted ? 'Unmute video' : 'Mute video'}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/70 hover:bg-[#D6A52A] text-white hover:text-black border border-white/20 hover:border-[#D6A52A] flex items-center justify-center transition-all duration-200 backdrop-blur-md shadow-lg active:scale-95"
                      >
                        {reelState.isMuted ? (
                          <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D6A52A] hover:text-black" />
                        )}
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
