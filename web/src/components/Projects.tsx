"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import type { Project } from "@/types/cv";
import { useCVData, preloadCVData } from "@/hooks/useCVData";
import { FilterBar } from "./FilterBar";
import { TechBrowser } from "./TechBrowser";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";
import { GalleryModal } from "./GalleryModal";

// Preload data as early as possible
if (typeof window !== "undefined") {
  preloadCVData().catch(() => {
    // Silent fail - will be handled by the component
  });
}

export function Projects() {
  const { data, isLoading, error } = useCVData();
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [isTechBrowserOpen, setIsTechBrowserOpen] = useState(false);
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [galleryModalProject, setGalleryModalProject] = useState<Project | null>(null);
  const [filterKey, setFilterKey] = useState(0);

  const projects = useMemo(() => data?.projects ?? [], [data]);
  
  const technologies = useMemo(() => {
    if (!data) return [];
    const techMap: Record<string, number> = {};
    for (const project of data.projects) {
      for (const tech of project.technologies) {
        techMap[tech] = (techMap[tech] || 0) + 1;
      }
    }
    return Object.entries(techMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  // Debug: Log projects with galleries
  useEffect(() => {
    const withGalleries = projects.filter(p => p.gallery && p.gallery.length > 0);
    console.log(`Projects with galleries: ${withGalleries.length}`, withGalleries.map(p => p.id));
  }, [projects]);

  const filtered = useMemo(() => {
    if (selectedTechs.length === 0) return projects;
    return projects.filter((p) =>
      selectedTechs.some((tech) => p.technologies.includes(tech))
    );
  }, [projects, selectedTechs]);

  const gridRef = useRef<HTMLDivElement>(null);

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

  // Trigger re-animation when filter changes
  useEffect(() => {
    setFilterKey((prev) => prev + 1);
  }, [selectedTechs]);

  useEffect(() => {
    if (!gridRef.current) return;
    gridRef.current.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("visible");
    });
  }, [filtered]);

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

  if (isLoading) {
    return (
      <section id="projects" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-cyan mb-10 reveal neon-glow-cyan">
          <span className="text-magenta">&gt;</span> PROJECTS_DATABASE
        </h2>
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-steel font-[family-name:var(--font-mono)]">
            <span className="text-cyan">&gt;</span> Loading project data...
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="projects" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-cyan mb-10 reveal neon-glow-cyan">
          <span className="text-magenta">&gt;</span> PROJECTS_DATABASE
        </h2>
        <div className="text-magenta font-[family-name:var(--font-mono)] p-4 border border-magenta/30 rounded bg-magenta/5">
          <span className="text-magenta">✗</span> Error loading projects: {error.message}
        </div>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <section id="projects" className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-cyan mb-10 reveal neon-glow-cyan">
        <span className="text-magenta">&gt;</span> PROJECTS_DATABASE
      </h2>

      <FilterBar
        technologies={technologies}
        selected={selectedTechs}
        onSelect={handleTechSelect}
        onBrowseAll={() => setIsTechBrowserOpen(true)}
      />

      <div className="mt-6 font-[family-name:var(--font-mono)] text-sm text-steel">
        <span className="text-steel-dim">//</span> Displaying {filtered.length}{" "}
        of {projects.length} records
        {selectedTechs.length > 0 && (
          <span className="text-cyan ml-2">
            (matching {selectedTechs.length} filter
            {selectedTechs.length > 1 ? "s" : ""})
          </span>
        )}
      </div>

      <div
        ref={gridRef}
        key={filterKey}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8"
      >
        {filtered.map((project, index) => (
          <div
            key={project.id}
            className="h-full"
            style={{
              animation: `stagger-fade-in 0.5s ease-out ${index * 0.05}s both`,
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
