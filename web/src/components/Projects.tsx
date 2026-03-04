"use client";

import { useState, useMemo } from "react";
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

  const filtered = useMemo(() => {
    if (!selectedTech) return projects;
    return projects.filter((p) => p.technologies.includes(selectedTech));
  }, [projects, selectedTech]);

  return (
    <section id="projects" className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-cyan mb-8 reveal">
        &lt; PROJECTS_DATABASE /&gt;
      </h2>

      <FilterBar
        technologies={technologies}
        selected={selectedTech}
        onSelect={setSelectedTech}
      />

      <div className="mt-4 font-[family-name:var(--font-mono)] text-xs text-steel">
        <span className="text-steel-dim">//</span> Displaying {filtered.length} of {projects.length} records
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filtered.map((project) => (
          <div key={project.id} className="reveal h-full">
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
