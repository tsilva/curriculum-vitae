"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { Project, GalleryMedia } from "@/types/cv";

interface GalleryModalProps {
  project: Project | null;
  onClose: () => void;
}

export function GalleryModal({ project, onClose }: GalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'lightbox'>('grid');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const gallery = project?.gallery || [];
  const currentMedia = gallery[currentIndex];

  // Reset state when project changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsLoading(true);
    setViewMode('grid');
    setIsFullscreen(false);
    setShowControls(true);
    setShowThumbnails(true);
  }, [project?.id]);

  // Reset loading state when media changes
  useEffect(() => {
    setIsLoading(true);
  }, [currentIndex]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    if (viewMode === 'lightbox' && !isFullscreen) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [viewMode, isFullscreen]);

  // Show controls on interaction
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  // Keyboard navigation
  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen();
        } else if (viewMode === 'lightbox') {
          setViewMode('grid');
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        navigatePrev();
      } else if (e.key === 'ArrowRight') {
        navigateNext();
      } else if (e.key === 'Enter' && viewMode === 'grid' && gallery.length > 0) {
        setViewMode('lightbox');
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 't' || e.key === 'T') {
        setShowThumbnails(prev => !prev);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [project, viewMode, isFullscreen, gallery.length, onClose, toggleFullscreen]);

  // Start auto-hide timer when entering lightbox
  useEffect(() => {
    if (viewMode === 'lightbox') {
      resetControlsTimeout();
    } else {
      setShowControls(true);
    }
  }, [viewMode, resetControlsTimeout]);

  const navigateNext = useCallback(() => {
    if (gallery.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % gallery.length);
      showControlsTemporarily();
    }
  }, [gallery.length, showControlsTemporarily]);

  const navigatePrev = useCallback(() => {
    if (gallery.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
      showControlsTemporarily();
    }
  }, [gallery.length, showControlsTemporarily]);

  // Touch/swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      navigateNext();
    } else if (distance < -minSwipeDistance) {
      navigatePrev();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Double tap to toggle controls on mobile
  const lastTapRef = useRef<number>(0);
  const handleContainerClick = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap
      setShowControls(prev => !prev);
    }
    lastTapRef.current = now;
  };

  if (!project || gallery.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black ${isFullscreen ? '' : 'backdrop-blur-sm'}`}
      style={{ backgroundColor: isFullscreen ? '#000' : 'rgba(0,0,0,0.95)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (viewMode === 'lightbox') {
            setViewMode('grid');
          } else {
            onClose();
          }
        }
      }}
    >
      {/* Main container - takes full width/height in lightbox mode */}
      <div 
        className={`relative w-full h-full flex flex-col ${viewMode === 'lightbox' ? 'max-w-none' : 'max-w-7xl mx-auto'}`}
        onMouseMove={showControlsTemporarily}
        onClick={handleContainerClick}
      >
        {/* Header - auto-hides in lightbox mode */}
        <div 
          className={`flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-cyan/20 bg-base-light/80 backdrop-blur transition-transform duration-300 ${viewMode === 'lightbox' && !showControls ? '-translate-y-full absolute top-0 left-0 right-0 z-20' : 'relative'}`}
        >
          <div className="flex items-center gap-3">
            <span className="text-cyan text-xl">{project.emoji}</span>
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-cool-white">
                {project.title}
              </h2>
              <p className="font-[family-name:var(--font-mono)] text-xs text-steel-dim">
                <span className="text-cyan">GALLERY://</span> {gallery.length} items
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            {/* View toggle */}
            <div className="flex items-center gap-1 bg-base-light border border-cyan/20 rounded-sm p-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMode('grid');
                }}
                className={`px-2 md:px-3 py-1.5 rounded-sm text-sm font-[family-name:var(--font-mono)] transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-cyan/20 text-cyan' 
                    : 'text-steel hover:text-cyan'
                }`}
                title="Grid view"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/>
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMode('lightbox');
                }}
                className={`px-2 md:px-3 py-1.5 rounded-sm text-sm font-[family-name:var(--font-mono)] transition-colors ${
                  viewMode === 'lightbox' 
                    ? 'bg-cyan/20 text-cyan' 
                    : 'text-steel hover:text-cyan'
                }`}
                title="Lightbox view"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
              </button>
            </div>

            {/* Fullscreen toggle - only in lightbox */}
            {viewMode === 'lightbox' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="hidden md:flex px-2 md:px-3 py-1.5 rounded-sm text-sm font-[family-name:var(--font-mono)] text-steel hover:text-cyan transition-colors border border-steel/30 hover:border-cyan/40"
                title="Toggle fullscreen (F)"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  {isFullscreen ? (
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                  ) : (
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                  )}
                </svg>
              </button>
            )}

            {/* Thumbnail toggle - only in lightbox */}
            {viewMode === 'lightbox' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowThumbnails(prev => !prev);
                }}
                className={`hidden md:flex px-2 md:px-3 py-1.5 rounded-sm text-sm font-[family-name:var(--font-mono)] transition-colors border ${
                  showThumbnails 
                    ? 'bg-cyan/20 text-cyan border-cyan/40' 
                    : 'text-steel hover:text-cyan border-steel/30 hover:border-cyan/40'
                }`}
                title="Toggle thumbnails (T)"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h4v2H4zm0 5h4v2H4zm0 5h4v2H4zm6-10h10v2H10zm0 5h10v2H10zm0 5h10v2H10z"/>
                </svg>
              </button>
            )}

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (viewMode === 'lightbox') {
                  setViewMode('grid');
                } else {
                  onClose();
                }
              }}
              className="font-[family-name:var(--font-mono)] text-sm text-steel hover:text-magenta transition-colors border border-steel/30 hover:border-magenta/40 px-3 py-2 rounded-sm"
            >
              {viewMode === 'lightbox' ? '[BACK]' : '[ESC]'}
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden relative">
          {viewMode === 'grid' ? (
            /* Grid View */
            <div className="h-full overflow-y-auto p-4 md:p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {gallery.map((media, index) => (
                  <button
                    key={media.filename}
                    onClick={() => {
                      setCurrentIndex(index);
                      setViewMode('lightbox');
                    }}
                    className="relative aspect-square bg-surface border border-cyan/10 rounded-sm overflow-hidden group hover:border-cyan/40 transition-all hover:shadow-[0_0_20px_rgba(0,230,230,0.1)]"
                  >
                    {media.type === 'image' ? (
                      <img
                        src={media.path}
                        alt={media.filename}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface">
                        <div className="relative">
                          <svg className="w-12 h-12 text-cyan/50" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                          <div className="absolute inset-0 animate-pulse">
                            <svg className="w-12 h-12 text-cyan/20" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Overlay with filename */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <p className="font-[family-name:var(--font-mono)] text-xs text-cyan truncate">
                        {media.filename}
                      </p>
                      <p className="font-[family-name:var(--font-mono)] text-xs text-steel-dim uppercase">
                        {media.type}
                      </p>
                    </div>

                    {/* Index badge */}
                    <div className="absolute top-2 right-2 bg-black/60 border border-cyan/30 px-2 py-0.5 rounded-sm">
                      <span className="font-[family-name:var(--font-mono)] text-xs text-cyan">
                        {index + 1}
                      </span>
                    </div>

                    {/* Video indicator */}
                    {media.type === 'video' && (
                      <div className="absolute top-2 left-2 bg-magenta/80 px-2 py-0.5 rounded-sm">
                        <span className="font-[family-name:var(--font-mono)] text-xs text-white uppercase">
                          VIDEO
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Lightbox View - Fullscreen immersive mode */
            <div 
              className="h-full flex flex-col"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Main media display area - takes maximum space */}
              <div className="flex-1 relative flex items-center justify-center p-2 md:p-4">
                {/* Navigation arrows - hidden on mobile, shown on hover/desktop */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigatePrev();
                  }}
                  className={`hidden md:flex absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/60 border border-cyan/30 rounded-sm text-cyan hover:bg-cyan/20 transition-all hover:scale-110 ${gallery.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={gallery.length <= 1}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateNext();
                  }}
                  className={`hidden md:flex absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/60 border border-cyan/30 rounded-sm text-cyan hover:bg-cyan/20 transition-all hover:scale-110 ${gallery.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={gallery.length <= 1}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </button>

                {/* Media container - fills available space */}
                <div 
                  className="relative w-full h-full flex items-center justify-center cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Click right side to go next, left side to go prev
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    if (x > rect.width / 2) {
                      navigateNext();
                    } else {
                      navigatePrev();
                    }
                  }}
                >
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="font-[family-name:var(--font-mono)] text-cyan animate-pulse">
                        LOADING...
                      </div>
                    </div>
                  )}
                  
                  {currentMedia?.type === 'image' ? (
                    <img
                      src={currentMedia.path}
                      alt={currentMedia.filename}
                      className="max-w-full max-h-full w-auto h-auto object-contain"
                      style={{ 
                        maxHeight: isFullscreen ? '100vh' : 'calc(100vh - 180px)',
                        maxWidth: '100%'
                      }}
                      onLoad={() => setIsLoading(false)}
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      src={currentMedia?.path}
                      controls
                      className="max-w-full max-h-full w-auto h-auto"
                      style={{ 
                        maxHeight: isFullscreen ? '100vh' : 'calc(100vh - 180px)',
                        maxWidth: '100%'
                      }}
                      onLoadedData={() => setIsLoading(false)}
                      autoPlay
                    />
                  )}

                  {/* Mobile tap zones indicator */}
                  <div className="md:hidden absolute inset-0 flex">
                    <div className="flex-1 flex items-center justify-start pl-4">
                      <svg className="w-8 h-8 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                      </svg>
                    </div>
                    <div className="flex-1 flex items-center justify-end pr-4">
                      <svg className="w-8 h-8 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom control bar - auto-hides */}
              <div 
                className={`transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}
              >
                {/* Info bar */}
                <div className="px-4 py-2 md:py-3 bg-gradient-to-t from-black/90 to-transparent">
                  <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <p className="font-[family-name:var(--font-mono)] text-sm text-steel truncate flex-1 mr-4">
                      {currentMedia?.filename}
                    </p>
                    
                    <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigatePrev();
                        }}
                        className="md:hidden font-[family-name:var(--font-mono)] text-xs text-steel hover:text-cyan transition-colors px-2 py-1 border border-steel/30 rounded-sm"
                        disabled={gallery.length <= 1}
                      >
                        &lt;
                      </button>
                      
                      <span className="font-[family-name:var(--font-mono)] text-cyan text-sm">
                        {currentIndex + 1} / {gallery.length}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateNext();
                        }}
                        className="md:hidden font-[family-name:var(--font-mono)] text-xs text-steel hover:text-cyan transition-colors px-2 py-1 border border-steel/30 rounded-sm"
                        disabled={gallery.length <= 1}
                      >
                        &gt;
                      </button>

                      {/* Desktop nav buttons */}
                      <div className="hidden md:flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigatePrev();
                          }}
                          className="font-[family-name:var(--font-mono)] text-xs text-steel hover:text-cyan transition-colors px-2 py-1 border border-steel/30 hover:border-cyan/40 rounded-sm"
                          disabled={gallery.length <= 1}
                        >
                          &lt; PREV
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateNext();
                          }}
                          className="font-[family-name:var(--font-mono)] text-xs text-steel hover:text-cyan transition-colors px-2 py-1 border border-steel/30 hover:border-cyan/40 rounded-sm"
                          disabled={gallery.length <= 1}
                        >
                          NEXT &gt;
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thumbnail strip - toggleable */}
                {showThumbnails && (
                  <div className="px-4 py-2 bg-black/80 border-t border-cyan/10">
                    <div className="flex gap-2 overflow-x-auto max-w-full pb-2 scrollbar-thin scrollbar-thumb-cyan/30 scrollbar-track-transparent">
                      {gallery.map((media, index) => (
                        <button
                          key={media.filename}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentIndex(index);
                          }}
                          className={`flex-shrink-0 w-14 h-14 md:w-16 md:h-16 border rounded-sm overflow-hidden transition-all ${
                            index === currentIndex
                              ? 'border-cyan shadow-[0_0_10px_rgba(0,230,230,0.3)]'
                              : 'border-cyan/20 hover:border-cyan/50'
                          }`}
                        >
                          {media.type === 'image' ? (
                            <img
                              src={media.path}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-surface">
                              <svg className="w-5 h-5 md:w-6 md:h-6 text-cyan/50" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keyboard shortcuts hint */}
                <div className="px-4 py-2 border-t border-cyan/10 bg-black/60">
                  <p className="font-[family-name:var(--font-mono)] text-xs text-steel-dim text-center">
                    <span className="text-cyan hidden md:inline">←</span>
                    <span className="text-cyan hidden md:inline">→</span>
                    <span className="hidden md:inline"> Navigate </span>
                    <span className="mx-1 md:mx-2">|</span>
                    <span className="text-cyan md:hidden">TAP</span>
                    <span className="hidden md:inline text-cyan">F</span>
                    <span className="md:hidden"> Toggle Controls</span>
                    <span className="hidden md:inline"> Fullscreen </span>
                    <span className="mx-1 md:mx-2">|</span>
                    <span className="text-cyan">T</span> Thumbnails
                    <span className="mx-1 md:mx-2">|</span>
                    <span className="text-cyan">ESC</span> {viewMode === 'lightbox' ? 'Back' : 'Close'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scanlines effect - less opacity in lightbox for better viewing */}
      <div className={`pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-[60] ${viewMode === 'lightbox' ? 'opacity-10' : 'opacity-30'}`} />
    </div>
  );
}
