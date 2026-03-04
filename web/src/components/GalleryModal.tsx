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
  const videoRef = useRef<HTMLVideoElement>(null);

  const gallery = project?.gallery || [];
  const currentMedia = gallery[currentIndex];

  // Reset state when project changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsLoading(true);
    setViewMode('grid');
  }, [project?.id]);

  // Reset loading state when media changes
  useEffect(() => {
    setIsLoading(true);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewMode === 'lightbox') {
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
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, viewMode, currentIndex, gallery.length, onClose]);

  const navigateNext = useCallback(() => {
    if (gallery.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % gallery.length);
    }
  }, [gallery.length]);

  const navigatePrev = useCallback(() => {
    if (gallery.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
    }
  }, [gallery.length]);

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

  if (!project || gallery.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
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
      {/* Main container */}
      <div className="relative w-full h-full max-w-7xl mx-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-cyan/20 bg-base-light/50 backdrop-blur">
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
          
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex items-center gap-1 bg-base-light border border-cyan/20 rounded-sm p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-sm text-sm font-[family-name:var(--font-mono)] transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-cyan/20 text-cyan' 
                    : 'text-steel hover:text-cyan'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('lightbox')}
                className={`px-3 py-1.5 rounded-sm text-sm font-[family-name:var(--font-mono)] transition-colors ${
                  viewMode === 'lightbox' 
                    ? 'bg-cyan/20 text-cyan' 
                    : 'text-steel hover:text-cyan'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={() => {
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
            /* Lightbox View */
            <div 
              className="h-full flex flex-col items-center justify-center p-4"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Navigation arrows */}
              <button
                onClick={navigatePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-base-light/80 border border-cyan/30 rounded-sm text-cyan hover:bg-cyan/20 transition-all hover:scale-110"
                disabled={gallery.length <= 1}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                </svg>
              </button>
              <button
                onClick={navigateNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-base-light/80 border border-cyan/30 rounded-sm text-cyan hover:bg-cyan/20 transition-all hover:scale-110"
                disabled={gallery.length <= 1}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
              </button>

              {/* Main media display */}
              <div className="relative max-w-5xl max-h-[70vh] w-full flex items-center justify-center">
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
                    className="max-w-full max-h-[70vh] object-contain border border-cyan/20 rounded-sm"
                    onLoad={() => setIsLoading(false)}
                  />
                ) : (
                  <video
                    ref={videoRef}
                    src={currentMedia?.path}
                    controls
                    className="max-w-full max-h-[70vh] border border-cyan/20 rounded-sm"
                    onLoadedData={() => setIsLoading(false)}
                    autoPlay
                  />
                )}
              </div>

              {/* Bottom info bar */}
              <div className="mt-4 text-center">
                <p className="font-[family-name:var(--font-mono)] text-sm text-steel mb-2">
                  {currentMedia?.filename}
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={navigatePrev}
                    className="font-[family-name:var(--font-mono)] text-xs text-steel hover:text-cyan transition-colors px-2 py-1 border border-steel/30 rounded-sm"
                    disabled={gallery.length <= 1}
                  >
                    &lt; PREV
                  </button>
                  <span className="font-[family-name:var(--font-mono)] text-cyan">
                    {currentIndex + 1} / {gallery.length}
                  </span>
                  <button
                    onClick={navigateNext}
                    className="font-[family-name:var(--font-mono)] text-xs text-steel hover:text-cyan transition-colors px-2 py-1 border border-steel/30 rounded-sm"
                    disabled={gallery.length <= 1}
                  >
                    NEXT &gt;
                  </button>
                </div>
              </div>

              {/* Thumbnail strip */}
              <div className="mt-4 flex gap-2 overflow-x-auto max-w-full px-4 pb-2">
                {gallery.map((media, index) => (
                  <button
                    key={media.filename}
                    onClick={() => setCurrentIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 border rounded-sm overflow-hidden transition-all ${
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
                        <svg className="w-6 h-6 text-cyan/50" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="px-4 py-2 border-t border-cyan/10 bg-base-light/30">
          <p className="font-[family-name:var(--font-mono)] text-xs text-steel-dim text-center">
            <span className="text-cyan">←</span> <span className="text-cyan">→</span> Navigate 
            <span className="mx-2">|</span> 
            <span className="text-cyan">ESC</span> {viewMode === 'lightbox' ? 'Back to Grid' : 'Close'}
            <span className="mx-2">|</span> 
            <span className="text-cyan">↵</span> Enter Lightbox
          </p>
        </div>
      </div>

      {/* Scanlines effect */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-[60] opacity-30" />
    </div>
  );
}
