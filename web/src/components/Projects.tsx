"use client";

import { useState, useMemo, useEffect } from "react";
import type { Project } from "@/types/cv";
import { cvData } from "@/lib/cv-data";
import { FilterBar } from "./FilterBar";
import { TechBrowser } from "./TechBrowser";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";
import { GalleryModal } from "./GalleryModal";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

export function Projects() {
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [isTechBrowserOpen, setIsTechBrowserOpen] = useState(false);
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [galleryModalProject, setGalleryModalProject] = useState<Project | null>(null);
  const [filterKey, setFilterKey] = useState(0);

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
    const handleOpenGallery = (e: CustomEvent<Project>) => {
      setGalleryModalProject(e.detail);
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
      <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-cyan mb-10 reveal neon-glow-cyan">
        <span className="text-magenta">&gt;</span> PROJECTS_DB
      </h2>

      <FilterBar
        technologies={technologies}
        selected={selectedTechs}
        onSelect={handleTechSelect}
        onBrowseAll={() => setIsTechBrowserOpen(true)}
      />

      <div className="mt-6 font-[family-name:var(--font-mono)] text-sm text-steel">
        <span className="text-steel-dim">//</span> Displaying {visible.length}{" "}
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
        project={galleryModalProject}
        onClose={() => setGalleryModalProject(null)}
      />
    </section>
  );
}
