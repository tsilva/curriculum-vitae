import type { Project } from "@/types/cv";
import { TechBadge } from "./TechBadge";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <button
      onClick={onClick}
      className="card-glow bg-surface border border-amber/10 rounded-xl p-5 text-left w-full h-full cursor-pointer transition-all hover:border-amber/30 group flex flex-col"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl flex-shrink-0">{project.emoji}</span>
          <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-warm-white group-hover:text-amber transition-colors truncate">
            {project.title}
          </h3>
        </div>
        <span className="font-[family-name:var(--font-mono)] text-xs text-slate flex-shrink-0">
          {project.start}
        </span>
      </div>

      <p className="text-sm text-slate leading-relaxed mb-3 line-clamp-2">
        {project.tldr}
      </p>

      {project.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto">
          {project.technologies.slice(0, 5).map((tech) => (
            <TechBadge key={tech} name={tech} />
          ))}
          {project.technologies.length > 5 && (
            <span className="font-[family-name:var(--font-mono)] text-xs text-slate-dim px-2 py-1">
              +{project.technologies.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Quick links */}
      {project.links.length > 0 && (
        <div className="flex gap-3 mt-3 pt-3 border-t border-amber/5">
          {project.links.slice(0, 2).map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-[family-name:var(--font-mono)] text-xs text-amber/70 hover:text-amber transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </button>
  );
}
