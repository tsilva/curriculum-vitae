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

type ShowcaseMedia = {
  projectId: string;
  filename: string;
};

const SHOWCASE_MEDIA: ShowcaseMedia[] = [
  {
    projectId: "block-ide-arcade-maker",
    filename: "027-bopem-010.webp",
  },
  {
    projectId: "help-agent",
    filename: "002-parents_chat_1.webp",
  },
  {
    projectId: "byjus-coding-cup",
    filename: "039-Screenshot 2024-04-03 at 6.56.12 PM.webp",
  },
  {
    projectId: "live-classes",
    filename: "v004-Cosmic Chronicles：Secure Underwater Base Buildi.mp4",
  },
  {
    projectId: "quizzer",
    filename: "009-placement-block-test-009.webp",
  },
  {
    projectId: "coaching-system",
    filename: "002-002.webp",
  },
  {
    projectId: "collaborative-learning-system",
    filename: "008-Screenshot 2024-04-03 at 7.46.26 PM.webp",
  },
  {
    projectId: "block-ide-version-30",
    filename: "077-Screenshot_3(7).webp",
  },
  {
    projectId: "crystal-clash",
    filename: "001-crystal-clash.webp",
  },
  {
    projectId: "mythicraft",
    filename: "v001-Mythicraft_tvai.mp4",
  },
  {
    projectId: "kaboom",
    filename: "005-IMG_0670.webp",
  },
  {
    projectId: "karl-kustomize",
    filename: "002-FireShot Capture 12 - Karl_ - http___karl-test..webp",
  },
  {
    projectId: "lugar-da-joia",
    filename: "001-Screen Shot 2016-06-28 at 19.25.40.webp",
  },
  {
    projectId: "minecraft-editor",
    filename: "020-Screenshot_31.webp",
  },
  {
    projectId: "myswear-harrods-holographic-pyramid",
    filename: "003-image.webp",
  },
  {
    projectId: "windows-dev-center-app-middleware-partners",
    filename: "001-microsoft1.webp",
  },
  {
    projectId: "details-pal",
    filename: "039-11.details.pal.webp",
  },
  {
    projectId: "dont-mess-with-texas-report-a-litterer",
    filename: "009-13.dont.mess.with.texas.webp",
  },
  {
    projectId: "energi-coach",
    filename: "005-20.energi.webp",
  },
  {
    projectId: "myswear-online-store",
    filename: "001-003(1).webp",
  },
  {
    projectId: "speakwrite",
    filename: "001-IMG_0695.webp",
  },
  {
    projectId: "talkit",
    filename: "007-16.talkit.webp",
  },
  {
    projectId: "topshelf",
    filename: "005-12.topshelf.webp",
  },
  {
    projectId: "us-likey",
    filename: "014-18.us.likey.webp",
  },
  {
    projectId: "win-atlas",
    filename: "008-08.winatlas.webp",
  },
  {
    projectId: "academy-sports-live-fit",
    filename: "001-Screen__15.webp",
  },
  {
    projectId: "active-heroes",
    filename: "002-09.active.heroes.webp",
  },
  {
    projectId: "furtile",
    filename: "005-03.furtile.webp",
  },
  {
    projectId: "knod",
    filename: "001-13124498_587539498068194_2810866045740281380_n.webp",
  },
  {
    projectId: "map-my-fitness-challenges",
    filename: "001-Challenges_v5_Details.webp",
  },
  {
    projectId: "project-capture",
    filename: "002-project-capture_interface_four.webp",
  },
  {
    projectId: "randid",
    filename: "016-06.randid.webp",
  },
  {
    projectId: "valettab",
    filename: "003-app_preview.webp",
  },
  {
    projectId: "wego",
    filename: "017-7.wego.webp",
  },
  {
    projectId: "china-pro-tools",
    filename: "002-2-Market-Share-analysis.webp",
  },
  {
    projectId: "clockadoodle",
    filename: "050-02.clockadoodle.webp",
  },
  {
    projectId: "discover-your-city",
    filename: "004-5-Main-page-Preview-building.webp",
  },
  {
    projectId: "rocklobby",
    filename: "012-004.webp",
  },
  {
    projectId: "rocklobby-ios-app",
    filename: "009-1.webp",
  },
  {
    projectId: "fresh-deck-poker",
    filename: "012-3.webp",
  },
  {
    projectId: "bargania",
    filename: "001-03.webp",
  },
  {
    projectId: "a-la-carte",
    filename: "001-a_la_carte_4.webp",
  },
  {
    projectId: "mariachi",
    filename: "001-mariachi_iphone_512.webp",
  },
  {
    projectId: "panzerini",
    filename: "008-24.webp",
  },
  {
    projectId: "schoooools",
    filename: "005-38.webp",
  },
  {
    projectId: "take-the-bill",
    filename: "019-take_the_bill_2.webp",
  },
  {
    projectId: "colony-framework",
    filename: "012-hive.wallpapers_02_1920x1200.webp",
  },
  {
    projectId: "frontdoor",
    filename: "012-21.webp",
  },
  {
    projectId: "neuralj",
    filename: "001-1602180471271.webp",
  },
  {
    projectId: "computer-capers",
    filename: "001-computer_capers.webp",
  },
];

function getShowcasePreview(gallery: GalleryMedia[]) {
  const byProjectAndFilename = new Map(
    gallery.map((item) => [`${item.projectId}:${item.filename}`, item])
  );
  const preview: GalleryMedia[] = [];
  const usedProjectIds = new Set<string>();
  const projectCount = new Set(gallery.map((item) => item.projectId).filter(Boolean)).size;

  SHOWCASE_MEDIA.forEach((showcaseItem) => {
    if (usedProjectIds.has(showcaseItem.projectId)) return;

    const key = `${showcaseItem.projectId}:${showcaseItem.filename}`;
    const item = byProjectAndFilename.get(key);

    if (item) {
      preview.push(item);
      usedProjectIds.add(showcaseItem.projectId);
    }
  });

  if (preview.length < projectCount) {
    gallery.some((item) => {
      const projectId = item.projectId;

      if (projectId && !usedProjectIds.has(projectId)) {
        preview.push(item);
        usedProjectIds.add(projectId);
      }

      return preview.length >= projectCount;
    });
  }

  return preview;
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

  const preview = getShowcasePreview(gallery);

  return (
    <section id="gallery" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-cyan neon-glow-cyan md:text-4xl">
            <span className="text-magenta">&gt;</span> GALLERY_STREAM
          </h2>
          <p className="mt-3 max-w-2xl font-[family-name:var(--font-mono)] text-sm leading-relaxed text-steel">
            <span className="text-steel-dim">{"//"}</span> {gallery.length} captures from{" "}
            {projectsWithGalleries} project galleries, previewing one curated highlight per project. Open the full
            stream for CV project sequence and each project&apos;s internal media order.
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
        <span className="text-cyan">INDEX:</span> ONE_PER_PROJECT_SHOWCASE
      </div>

      <GalleryModal
        project={isGalleryOpen ? combinedProject : null}
        onClose={() => setIsGalleryOpen(false)}
      />
    </section>
  );
}
