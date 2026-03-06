"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import type { Project } from "@/types/cv";
import { projects as allProjects, data } from "@/lib/data";
import { FilterBar } from "./FilterBar";
import { TechBrowser } from "./TechBrowser";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";
import { GalleryModal } from "./GalleryModal";

const ITEMS_PER_PAGE = 12; // Number of items to render at once
const ITEM_HEIGHT_ESTIMATE = 280; // Estimated height of a project card

export function Projects() {
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [isTechBrowserOpen, setIsTechBrowserOpen] = useState(false);
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [galleryModalProject, setGalleryModalProject] = useState<Project | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [filterKey, setFilterKey] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const projects = useMemo(() => allProjects, []);
  
  const technologies = useMemo(() => {
    const techMap: Record<string, number> = {};
    for (const project of allProjects) {
      for (const tech of project.technologies) {
        techMap[tech] = (techMap[tech] || 0) + 1;
      }
    }
    return Object.entries(techMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const filtered = useMemo(() => {
    if (selectedTechs.length === 0) return projects;
    return projects.filter((p) =>
      selectedTechs.some((tech) => p.technologies.includes(tech))
    );
  }, [projects, selectedTechs]);

  // Virtualized: only render visible items
  const visibleProjects = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
    setFilterKey((prev) => prev + 1);
  }, [selectedTechs]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || visibleCount >= filtered.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filtered.length));
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleCount, filtered.length]);

  // Debug: Log projects with galleries
  useEffect(() => {
    const withGalleries = projects.filter(p => p.gallery && p.gallery.length > 0);
    console.log(`Projects with galleries: ${withGalleries.length}`, withGalleries.map(p => p.id));
  }, [projects]);

  // Listen for gallery open events from ProjectModal
  useEffect(() => {
    const handleOpenGallery = (e: CustomEvent<Project>) => {
      setGalleryModalProject(e.detail);
    };
    
    window.addEventListener('openProjectGallery', handleOpenGallery as EventListener);
    
    return () => {
      window.removeEventListener('openProjectGallery', handleOpenGallery as EventListener);
    };
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

  const handleTechToggle = (tech: string) => {
    setSelectedTechs((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const remainingCount = filtered.length - visibleProjects.length;

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
        <span className="text-steel-dim">//</span> Displaying {visibleProjects.length}{" "}
        of {projects.length} records
        {selectedTechs.length > 0 && (
          <span className="text-cyan ml-2">
            (matching {selectedTechs.length} filter
            {selectedTechs.length > 1 ? "s" : ""})
          </span>
        )}
        {remainingCount > 0 && (
          <span className="text-steel-dim ml-2">
            — {remainingCount} more below
          </span>
        )}
      </div>

      <div
        ref={gridRef}
        key={filterKey}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8 content-visibility-auto"
      >
        {visibleProjects.map((project, index) => (
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
              onGalleryClick={() => setGalleryModalProject(project)}
            />
          </div>
        ))}
      </div>

      {/* Load more trigger */}
      {remainingCount > 0 && (
        <div 
          ref={loadMoreRef}
          className="mt-8 py-8 text-center"
        >
          <div className="font-[family-name:var(--font-mono)] text-sm text-steel-dim animate-pulse">
            <span className="text-cyan">...</span> Loading more projects <span className="text-cyan">...</span>
          </div>
        </div>
      )}

      <TechBrowser
        technologies={technologies}
        selected={selectedTechs}
        onToggle={handleTechToggle}
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
