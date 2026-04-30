"use client";
/* eslint-disable @next/next/no-img-element */

import { Fragment, useEffect, useState, useRef, memo, useCallback, useId, useMemo } from "react";
import { createPortal } from "react-dom";
import type { Project, GalleryMedia } from "@/types/cv";
import PhotoSwipe from "photoswipe";
import "photoswipe/style.css";
import { useModal } from "@/hooks/useModal";

interface GalleryModalProps {
  project: Project | null;
  onClose: () => void;
}

// Memoized grid item with lazy loading
const GridItem = memo(({ media, index, onClick }: { media: GalleryMedia; index: number; onClick: () => void }) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      type="button"
      ref={ref}
      onClick={onClick}
      aria-label={`Open gallery item ${index + 1}${media.projectTitle ? ` from ${media.projectTitle}` : ""}`}
      className="relative aspect-square bg-surface border border-cyan/10 rounded-sm overflow-hidden group hover:border-cyan/40 transition-all hover:shadow-[0_0_20px_rgba(0,230,230,0.1)] cursor-pointer"
    >
      {media.type === 'image' ? (
        isInView ? (
          <img src={media.path} alt={media.filename} className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" decoding="async" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface">
            <div className="font-[family-name:var(--font-mono)] text-cyan/30 text-xs">Loading...</div>
          </div>
        )
      ) : isInView ? (
        <div className="relative w-full h-full bg-black">
          <video
            src={media.path}
            className="pointer-events-none w-full h-full object-cover transition-transform group-hover:scale-105"
            autoPlay
            loop
            preload="metadata"
            muted
            playsInline
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
            <div className="w-16 h-16 rounded-full bg-cyan/80 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-surface">
          <svg className="w-12 h-12 text-cyan/50" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
      )}

      <div className="absolute top-2 right-2 bg-black/60 border border-cyan/30 px-2 py-0.5 rounded-sm">
        <span className="font-[family-name:var(--font-mono)] text-xs text-cyan">{index + 1}</span>
      </div>

      {media.type === 'video' && (
        <div className="absolute top-2 left-2 bg-magenta/80 px-2 py-0.5 rounded-sm">
          <span className="font-[family-name:var(--font-mono)] text-xs text-white uppercase">VIDEO</span>
        </div>
      )}

    </button>
  );
});

GridItem.displayName = 'GridItem';

export function GalleryModal({ project, onClose }: GalleryModalProps) {
  const gallery = useMemo(() => project?.gallery ?? [], [project?.gallery]);
  const gallerySections = useMemo(() => {
    const sections: {
      key: string;
      groupKey: string;
      title: string;
      emoji?: string;
      startIndex: number;
      items: GalleryMedia[];
    }[] = [];
    let itemCount = 0;

    for (const media of gallery) {
      const title = media.projectTitle;
      const key = media.projectId ?? title ?? "gallery";
      const current = sections[sections.length - 1];

      if (!title || current?.groupKey === key) {
        if (current) {
          current.items.push(media);
        } else {
          sections.push({
            key: `${key}:${itemCount}`,
            groupKey: key,
            title: title ?? project?.title ?? "Gallery",
            emoji: media.projectEmoji,
            startIndex: itemCount,
            items: [media],
          });
        }
        itemCount += 1;
        continue;
      }

      sections.push({
        key: `${key}:${itemCount}`,
        groupKey: key,
        title,
        emoji: media.projectEmoji,
        startIndex: itemCount,
        items: [media],
      });
      itemCount += 1;
    }

    return sections;
  }, [gallery, project?.title]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useModal({
    isOpen: !!project && gallery.length > 0,
    onClose,
    dialogRef,
    initialFocusRef: closeButtonRef,
  });

  // Open PhotoSwipe lightbox at a given index
  const openLightbox = useCallback((index: number) => {
    const items = gallery.map((media) => {
      const label = `${media.projectEmoji ? `${media.projectEmoji} ` : ""}${media.projectTitle ?? project?.title ?? ""}`;
      if (media.type === 'video') {
        return {
          html: `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%"><video data-gallery-video src="${media.path}" ${media.thumbnail ? `poster="${media.thumbnail}"` : ''} controls autoplay playsinline preload="auto" style="max-width:100%;max-height:100%"></video></div>`,
          alt: `${label} - ${media.filename}`,
        };
      }
      return { src: media.path, w: 1920, h: 1080, msrc: media.path, alt: `${label} - ${media.filename}` };
    });

    const pswp = new PhotoSwipe({
      dataSource: items,
      index,
      bgOpacity: 0.95,
      showHideAnimationType: 'fade',
      pswpModule: PhotoSwipe,
    });

    const getSlideVideo = (slide = pswp.currSlide) =>
      slide?.holderElement?.querySelector<HTMLVideoElement>("video[data-gallery-video]") ?? null;

    const pauseInactiveVideos = () => {
      const currentVideo = getSlideVideo();
      pswp.element
        ?.querySelectorAll<HTMLVideoElement>("video[data-gallery-video]")
        .forEach((video) => {
          if (video !== currentVideo) {
            video.pause();
          }
        });
    };

    const playCurrentVideo = () => {
      const video = getSlideVideo();
      if (!video) return;

      video.autoplay = true;
      video.playsInline = true;

      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch(() => {
          video.muted = true;
          video.play().catch(() => {
            // Browser policy can still block autoplay; controls remain available.
          });
        });
      }
    };

    const activateCurrentVideo = () => {
      pauseInactiveVideos();
      playCurrentVideo();
      window.requestAnimationFrame(playCurrentVideo);
    };

    // Dynamically size images once loaded
    pswp.on('gettingData', (e) => {
      const item = e.data;
      if (item.src && (!item.w || item.w === 1920)) {
        const img = new Image();
        img.onload = () => {
          item.w = img.naturalWidth;
          item.h = img.naturalHeight;
          pswp.refreshSlideContent(e.index);
        };
        img.src = item.src;
      }
    });

    pswp.on("uiRegister", () => {
      pswp.ui?.registerElement({
        name: "custom-caption",
        order: 9,
        isButton: false,
        appendTo: "root",
        html: "",
        onInit: (el, photoSwipe) => {
          const updateCaption = () => {
            const currentMedia = gallery[photoSwipe.currIndex];
            if (!currentMedia) {
              el.textContent = "";
              return;
            }
            const label = currentMedia.projectTitle ?? project?.title ?? "";
            el.textContent = `${currentMedia.projectEmoji ? `${currentMedia.projectEmoji} ` : ""}${label} / ${currentMedia.filename}`;
          };
          updateCaption();
          photoSwipe.on("change", updateCaption);
        },
      });
    });

    pswp.on("afterInit", activateCurrentVideo);
    pswp.on("change", activateCurrentVideo);
    pswp.on("appendHeavyContent", (e) => {
      if (e.slide.index === pswp.currIndex) {
        activateCurrentVideo();
      }
    });
    pswp.on("slideActivate", activateCurrentVideo);
    pswp.on("slideDeactivate", (e) => {
      getSlideVideo(e.slide)?.pause();
    });
    pswp.on("close", () => {
      pswp.element?.querySelectorAll<HTMLVideoElement>("video[data-gallery-video]").forEach((video) => {
        video.pause();
      });
    });

    pswp.init();
    activateCurrentVideo();
  }, [gallery, project?.title]);

  if (!project || gallery.length === 0) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full h-full flex flex-col max-w-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-cyan/20 bg-base-light/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-cyan text-xl">{project.emoji}</span>
            <div>
              <h2 id={titleId} className="font-[family-name:var(--font-display)] text-lg font-bold text-cool-white">{project.title}</h2>
              <p className="font-[family-name:var(--font-mono)] text-xs text-steel-dim">
                <span className="text-cyan">GALLERY://</span> {gallery.length} items
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label={`Close ${project.title} gallery`}
            className="font-[family-name:var(--font-mono)] text-sm text-steel hover:text-magenta transition-colors border border-steel/30 hover:border-magenta/40 px-3 py-2 rounded-sm cursor-pointer"
          >
            [ESC]
          </button>
        </div>

        {/* Grid View */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 content-visibility-auto max-w-7xl mx-auto">
            {gallerySections.map((section) => (
              <Fragment key={section.key}>
                {section.title && section.items.some((item) => item.projectTitle) && (
                  <div className="col-span-full mt-4 first:mt-0 border-b border-cyan/20 pb-2">
                    <h3 className="flex min-w-0 items-center gap-2 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-normal text-cyan">
                      {section.emoji && <span className="shrink-0 text-lg">{section.emoji}</span>}
                      <span className="truncate">{section.title}</span>
                      <span className="shrink-0 font-[family-name:var(--font-mono)] text-xs font-normal text-steel-dim">
                        [{section.items.length}]
                      </span>
                    </h3>
                  </div>
                )}
                {section.items.map((media, sectionIndex) => {
                  const index = section.startIndex + sectionIndex;
                  return (
                    <GridItem
                      key={`${media.projectId ?? project.id}:${media.filename}`}
                      media={media}
                      index={index}
                      onClick={() => openLightbox(index)}
                    />
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="px-4 py-2 border-t border-cyan/10 bg-black/60">
          <p className="font-[family-name:var(--font-mono)] text-xs text-steel-dim text-center">
            Click thumbnail to open lightbox
            <span className="mx-2">|</span>
            <span className="text-cyan">ESC</span> Close
          </p>
        </div>
      </div>

      {/* Scanlines effect */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-[60] opacity-15" />
    </div>,
    document.body
  );
}
