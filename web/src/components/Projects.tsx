"use client";

import dynamic from "next/dynamic";
import { useState, useMemo, useEffect } from "react";
import type { Project } from "@/types/cv";
import { cvData } from "@/lib/cv-data";
import { FilterBar } from "./FilterBar";
import { ProjectCard } from "./ProjectCard";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

interface GalleryOpenDetail {
  project: Project;
  returnFocusTo?: HTMLElement | null;
}

const TechBrowser = dynamic(
  () => import("./TechBrowser").then((mod) => ({ default: mod.TechBrowser })),
  { ssr: false }
);
const ProjectModal = dynamic(
  () => import("./ProjectModal").then((mod) => ({ default: mod.ProjectModal })),
  { ssr: false }
);
const GalleryModal = dynamic(
  () => import("./GalleryModal").then((mod) => ({ default: mod.GalleryModal })),
  { ssr: false }
);

export function Projects() {
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [isTechBrowserOpen, setIsTechBrowserOpen] = useState(false);
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [galleryModalState, setGalleryModalState] = useState<GalleryOpenDetail | null>(null);
  const [filterKey, setFilterKey] = useState(0);

  const fullGalleryProject = useMemo<Project | null>(() => {
    const gallery = cvData.projects_db.flatMap((project) =>
      (project.gallery ?? []).map((media) => ({
        ...media,
        projectId: project.id,
        projectTitle: project.title,
        projectEmoji: project.emoji,
      }))
    );

    if (gallery.length === 0) return null;

    return {
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
    };
  }, []);

  const galleryItemCount = fullGalleryProject?.gallery?.length ?? 0;

  const technologies = useMemo(() => {
    const techMap: Record<string, number> = {};
    for (const project of cvData.projects_db) {
      for (const tech of project.technologies) {
        techMap[tech] = (techMap[tech] || 0) + 1;
      }
    }
    return Object.entries(techMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const filtered = useMemo(() => {
    if (selectedTechs.length === 0) return cvData.projects_db;
    return cvData.projects_db.filter((p) =>
      selectedTechs.some((tech) => p.technologies.includes(tech))
    );
  }, [selectedTechs]);

  const { visible, remaining, loadMoreRef, ITEMS_PER_PAGE } = useInfiniteScroll(filtered, [selectedTechs]);

  // Reset filter key for animation
  useEffect(() => {
    setFilterKey((prev) => prev + 1);
  }, [selectedTechs]);

  // Listen for gallery open events from ProjectModal
  useEffect(() => {
    const handleOpenGallery = (e: CustomEvent<GalleryOpenDetail>) => {
      setGalleryModalState(e.detail);
    };

    window.addEventListener('openProjectGallery', handleOpenGallery as EventListener);
    return () => window.removeEventListener('openProjectGallery', handleOpenGallery as EventListener);
  }, []);

  const handleTechSelect = (tech: string | null) => {
    if (tech === null) {
      setSelectedTechs([]);
    } else {
      setSelectedTechs((prev) =>
        prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
      );
    }
  };

  return (
    <section id="projects" className="max-w-6xl mx-auto px-6 py-20">
      <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-cyan reveal neon-glow-cyan">
          <span className="text-magenta">&gt;</span> PROJECTS_DB
        </h2>

        {fullGalleryProject && (
          <button
            type="button"
            onClick={(event) =>
              setGalleryModalState({
                project: fullGalleryProject,
                returnFocusTo: event.currentTarget,
              })
            }
            className="group flex w-full items-center gap-4 border border-magenta/70 bg-magenta/20 px-5 py-4 text-left font-[family-name:var(--font-mono)] uppercase text-cool-white shadow-[0_0_24px_rgba(255,0,170,0.22)] transition-all hover:border-magenta hover:bg-magenta/35 hover:shadow-[0_0_32px_rgba(255,0,170,0.32)] md:w-auto md:min-w-80"
            aria-label={`Open projects gallery with ${galleryItemCount} project screenshots`}
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center border border-cyan/50 bg-black/25 text-cyan shadow-[0_0_18px_rgba(0,255,240,0.12)] transition-colors group-hover:border-cyan group-hover:text-cool-white"
              aria-hidden="true"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 5h16v14H4z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 9h2.5M7 16l3.2-3.4 2.5 2.2 2.1-2.5L18 16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>
              <span className="block text-sm tracking-normal text-magenta group-hover:text-cool-white">
                Open Projects Gallery
              </span>
              <span className="mt-1 block text-xs text-steel group-hover:text-cool-white">
                {galleryItemCount} Project Screenshots
              </span>
            </span>
          </button>
        )}
      </div>

      <FilterBar
        technologies={technologies}
        selected={selectedTechs}
        onSelect={handleTechSelect}
        onBrowseAll={() => setIsTechBrowserOpen(true)}
      />

      <div className="mt-6 font-[family-name:var(--font-mono)] text-sm text-steel">
        <span className="text-steel-dim">{"//"}</span> Displaying {visible.length}{" "}
        of {cvData.projects_db.length} records
        {selectedTechs.length > 0 && (
          <span className="text-cyan ml-2">
            (matching {selectedTechs.length} filter
            {selectedTechs.length > 1 ? "s" : ""})
          </span>
        )}
        {remaining > 0 && (
          <span className="text-steel-dim ml-2">
            — {remaining} more below
          </span>
        )}
      </div>

      <div
        key={filterKey}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8 content-visibility-auto"
      >
        {visible.map((project, index) => (
          <div
            key={project.id}
            className="h-full contain-layout"
            style={{
              animation: index < ITEMS_PER_PAGE
                ? `stagger-fade-in 0.4s ease-out ${index * 0.04}s both`
                : undefined,
            }}
          >
            <ProjectCard
              project={project}
              onClick={() => setModalProject(project)}
            />
          </div>
        ))}
      </div>

      {remaining > 0 && (
        <div ref={loadMoreRef} className="mt-8 py-8 text-center">
          <div className="font-[family-name:var(--font-mono)] text-sm text-steel-dim animate-pulse">
            <span className="text-cyan">...</span> Loading more projects <span className="text-cyan">...</span>
          </div>
        </div>
      )}

      <TechBrowser
        technologies={technologies}
        selected={selectedTechs}
        onToggle={(tech) => handleTechSelect(tech)}
        onClear={() => setSelectedTechs([])}
        onClose={() => setIsTechBrowserOpen(false)}
        isOpen={isTechBrowserOpen}
      />

      <ProjectModal
        project={modalProject}
        onClose={() => setModalProject(null)}
      />

      <GalleryModal
        project={galleryModalState?.project ?? null}
        onClose={() => {
          const target = galleryModalState?.returnFocusTo;
          setGalleryModalState(null);
          window.requestAnimationFrame(() => {
            target?.focus();
          });
        }}
      />
    </section>
  );
}
