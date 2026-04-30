"use client";
/* eslint-disable @next/next/no-img-element */

import { memo, useMemo, useState } from "react";
import { cvData } from "@/lib/cv-data";
import type { GalleryMedia, Project } from "@/types/cv";
import { GalleryModal } from "./GalleryModal";

interface GalleryPreviewTileProps {
  item: GalleryMedia;
  index: number;
  onClick: () => void;
}

const GalleryPreviewTile = memo(({ item, index, onClick }: GalleryPreviewTileProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-square overflow-hidden rounded-sm border border-cyan/10 bg-surface text-left transition-all hover:border-cyan/50 hover:shadow-[0_0_22px_rgba(0,230,230,0.12)]"
      aria-label={`Open combined gallery at preview item ${index + 1}`}
    >
      {item.type === "image" ? (
        <img
          src={item.path}
          alt={`${item.projectTitle} - ${item.filename}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="relative h-full w-full bg-black">
          <video
            src={item.path}
            poster={item.thumbnail}
            className="pointer-events-none h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            autoPlay
            loop
            preload="metadata"
            muted
            playsInline
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 transition-colors group-hover:bg-black/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan/80 transition-transform group-hover:scale-110">
              <svg className="ml-1 h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      <div className="absolute left-2 top-2 max-w-[calc(100%-1rem)] border border-black/40 bg-black/70 px-2 py-1 backdrop-blur-sm">
        <div className="flex min-w-0 items-center gap-1.5">
          {item.projectEmoji && <span className="shrink-0 text-sm">{item.projectEmoji}</span>}
          <span className="truncate font-[family-name:var(--font-mono)] text-[10px] uppercase text-cool-white">
            {item.projectTitle}
          </span>
        </div>
      </div>

      <div className="absolute bottom-2 right-2 border border-cyan/30 bg-black/70 px-2 py-0.5">
        <span className="font-[family-name:var(--font-mono)] text-xs text-cyan">
          {String(index + 1).padStart(3, "0")}
        </span>
      </div>

      {item.type === "video" && (
        <div className="absolute bottom-2 left-2 bg-magenta/80 px-2 py-0.5">
          <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase text-white">VIDEO</span>
        </div>
      )}
    </button>
  );
});

GalleryPreviewTile.displayName = "GalleryPreviewTile";

export function MainGallery() {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const gallery = useMemo<GalleryMedia[]>(() => {
    return cvData.projects_db.flatMap((project) =>
      (project.gallery ?? []).map((media) => ({
        ...media,
        projectId: project.id,
        projectTitle: project.title,
        projectEmoji: project.emoji,
      }))
    );
  }, []);

  const projectsWithGalleries = useMemo(
    () => cvData.projects_db.filter((project) => project.gallery?.length).length,
    []
  );

  const combinedProject = useMemo<Project>(
    () => ({
      id: "all-galleries",
      emoji: "[]",
      title: "All Project Galleries",
      tldr: "Combined project gallery stream",
      start: "",
      client: "",
      technologies: [],
      narrative: "",
      links: [],
      gallery,
    }),
    [gallery]
  );

  if (gallery.length === 0) return null;

  const preview = gallery.slice(0, 10);

  return (
    <section id="gallery" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-cyan neon-glow-cyan md:text-4xl">
            <span className="text-magenta">&gt;</span> GALLERY_STREAM
          </h2>
          <p className="mt-3 max-w-2xl font-[family-name:var(--font-mono)] text-sm leading-relaxed text-steel">
            <span className="text-steel-dim">{"//"}</span> {gallery.length} captures from{" "}
            {projectsWithGalleries} project galleries, ordered by CV project sequence and then by
            each project&apos;s internal media order.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsGalleryOpen(true)}
          className="w-full border border-magenta/60 bg-magenta/20 px-4 py-3 font-[family-name:var(--font-mono)] text-sm uppercase text-cool-white shadow-[0_0_18px_rgba(255,0,170,0.18)] transition-colors hover:bg-magenta/35 md:w-auto"
          aria-label={`Open combined gallery with ${gallery.length} items`}
        >
          Open {gallery.length} items
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {preview.map((item, index) => (
          <div
            key={`${item.projectId}:${item.filename}`}
            style={{
              animation: `stagger-fade-in 0.35s ease-out ${index * 0.025}s both`,
            }}
          >
            <GalleryPreviewTile item={item} index={index} onClick={() => setIsGalleryOpen(true)} />
          </div>
        ))}
      </div>

      <div className="mt-4 font-[family-name:var(--font-mono)] text-xs uppercase text-steel-dim">
        <span className="text-cyan">INDEX:</span> CV_ORDER / MEDIA_ORDER
      </div>

      <GalleryModal
        project={isGalleryOpen ? combinedProject : null}
        onClose={() => setIsGalleryOpen(false)}
      />
    </section>
  );
}
