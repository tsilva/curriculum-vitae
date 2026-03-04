"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import type { Project } from "@/types/cv";
import { FilterBar } from "./FilterBar";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";

interface ProjectsProps {
  projects: Project[];
  technologies: { name: string; count: number }[];
}

export function Projects({ projects, technologies }: ProjectsProps) {
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [filterKey, setFilterKey] = useState(0); // Used to trigger re-animation

  const filtered = useMemo(() => {
    if (!selectedTech) return projects;
    return projects.filter((p) => p.technologies.includes(selectedTech));
  }, [projects, selectedTech]);

  const gridRef = useRef<HTMLDivElement>(null);

  // Trigger re-animation when filter changes
  useEffect(() => {
    setFilterKey(prev => prev + 1);
  }, [selectedTech]);

  useEffect(() => {
    if (!gridRef.current) return;
    // Reveal all cards immediately when in view
    gridRef.current.querySelectorAll('.reveal').forEach((el) => {
      el.classList.add('visible');
    });
  }, [filtered]);

  return (
    <section id="projects" className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-cyan mb-8 reveal">
        <span className="text-magenta">&gt;</span> PROJECTS_DATABASE
      </h2>

      <FilterBar
        technologies={technologies}
        selected={selectedTech}
        onSelect={setSelectedTech}
      />

      <div className="mt-4 font-[family-name:var(--font-mono)] text-xs text-steel">
        <span className="text-steel-dim">//</span> Displaying {filtered.length} of {projects.length} records
      </div>

      <div 
        ref={gridRef} 
        key={filterKey}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6"
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
            />
          </div>
        ))}
      </div>

      <ProjectModal
        project={modalProject}
        onClose={() => setModalProject(null)}
      />
    </section>
  );
}
