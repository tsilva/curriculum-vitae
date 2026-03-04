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
      className="card-glow bg-surface border border-cyan/10 rounded-sm p-5 text-left w-full h-full cursor-pointer transition-all hover:border-cyan/40 group flex flex-col relative"
    >
      {/* Corner bracket decorations */}
      <span className="absolute top-1 left-2 text-cyan/40 font-[family-name:var(--font-mono)] text-xs select-none">&#x250C;&#x2500;</span>
      <span className="absolute top-1 right-2 text-cyan/40 font-[family-name:var(--font-mono)] text-xs select-none">&#x2500;&#x2510;</span>
      <span className="absolute bottom-1 left-2 text-cyan/40 font-[family-name:var(--font-mono)] text-xs select-none">&#x2514;&#x2500;</span>
      <span className="absolute bottom-1 right-2 text-cyan/40 font-[family-name:var(--font-mono)] text-xs select-none">&#x2500;&#x2518;</span>

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl flex-shrink-0">{project.emoji}</span>
          <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-cool-white group-hover:text-cyan transition-colors truncate">
            {project.title}
          </h3>
        </div>
        <span className="font-[family-name:var(--font-mono)] text-xs text-steel flex-shrink-0">
          <span className="text-steel-dim">//</span> {project.start}
        </span>
      </div>

      <p
        className="text-sm text-steel leading-relaxed mb-3 line-clamp-2 [&_a]:text-cyan [&_a]:hover:underline"
        dangerouslySetInnerHTML={{ __html: project.tldr }}
      />

      {project.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto">
          {project.technologies.slice(0, 5).map((tech) => (
            <TechBadge key={tech} name={tech} />
          ))}
          {project.technologies.length > 5 && (
            <span className="font-[family-name:var(--font-mono)] text-xs text-steel-dim px-2 py-1">
              +{project.technologies.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Quick links */}
      {project.links.length > 0 && (
        <div className="flex gap-3 mt-3 pt-3 border-t border-cyan/10">
          {project.links.slice(0, 2).map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-[family-name:var(--font-mono)] text-xs text-cyan/70 hover:text-cyan transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </button>
  );
}
