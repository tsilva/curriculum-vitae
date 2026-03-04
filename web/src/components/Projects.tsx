"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import type { Project } from "@/types/cv";
import { FilterBar } from "./FilterBar";
import { TechBrowser } from "./TechBrowser";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";
import { GalleryModal } from "./GalleryModal";

interface ProjectsProps {
  projects: Project[];
  technologies: { name: string; count: number }[];
}

export function Projects({ projects, technologies }: ProjectsProps) {
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [isTechBrowserOpen, setIsTechBrowserOpen] = useState(false);
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [galleryModalProject, setGalleryModalProject] = useState<Project | null>(null);
  const [filterKey, setFilterKey] = useState(0); // Used to trigger re-animation

  // Debug: Log projects with galleries
  useEffect(() => {
    const withGalleries = projects.filter(p => p.gallery && p.gallery.length > 0);
    console.log(`Projects with galleries: ${withGalleries.length}`, withGalleries.map(p => p.id));
  }, [projects]);

  const filtered = useMemo(() => {
    if (selectedTechs.length === 0) return projects;
    // OR logic: show projects that have ANY of the selected technologies
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
    // Reveal all cards immediately when in view
    gridRef.current.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("visible");
    });
  }, [filtered]);

  const handleTechSelect = (tech: string | null) => {
    if (tech === null) {
      // Clear all filters
      setSelectedTechs([]);
    } else {
      // Toggle the technology
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
