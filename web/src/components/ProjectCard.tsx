import type { Project } from "@/types/cv";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <button
      onClick={onClick}
      className="card-glow bg-surface border border-cyan/20 rounded-sm p-5 text-left w-full h-full cursor-pointer transition-all hover:border-cyan/50 hover:shadow-[0_0_25px_rgba(0,255,240,0.15),0_0_50px_rgba(0,255,240,0.05)] group flex flex-col relative"
    >
      {/* Corner bracket decorations */}
      <span className="absolute top-1 left-2 text-cyan/40 font-[family-name:var(--font-mono)] text-xs select-none">&#x250C;&#x2500;</span>
      <span className="absolute top-1 right-2 text-cyan/40 font-[family-name:var(--font-mono)] text-xs select-none">&#x2500;&#x2510;</span>
      <span className="absolute bottom-1 left-2 text-cyan/40 font-[family-name:var(--font-mono)] text-xs select-none">&#x2514;&#x2500;</span>
      <span className="absolute bottom-1 right-2 text-cyan/40 font-[family-name:var(--font-mono)] text-xs select-none">&#x2500;&#x2518;</span>

      <div className="flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl flex-shrink-0">{project.emoji}</span>
        <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-cool-white group-hover:text-cyan transition-colors truncate glitch-hover">
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
      </div>

      {/* Quick links - always at footer */}
      <div className="flex gap-3 mt-auto pt-3 border-t border-cyan/10 justify-end">
        {project.links.length > 0 && project.links.slice(0, 2).map((link) => {
          // SVG icons matching Hero component style
          const getIcon = (url: string, label: string) => {
            if (url.includes('github.com')) {
              // GitHub icon
              return (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              );
            }
            if (url.includes('photos.app.goo.gl')) {
              // Gallery/Images icon
              return (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
              );
            }
            if (label.toLowerCase().includes('demo')) {
              // Demo/Gamepad icon
              return (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
              );
            }
            if (label.toLowerCase().includes('gallery')) {
              // Gallery icon
              return (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
              );
            }
            // Default external link icon
            return (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
              </svg>
            );
          };
          
          return (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="group/link relative text-steel hover:text-kiroshi-cyan transition-colors p-1 hover:shadow-[0_0_10px_rgba(85,234,212,0.2)]"
            >
              {getIcon(link.url, link.label)}
              {/* Tooltip */}
              <span className="absolute -top-8 right-0 bg-base-light border border-cyan/30 px-2 py-1 rounded-sm text-xs font-[family-name:var(--font-mono)] text-cyan whitespace-nowrap opacity-0 group-hover/link:opacity-100 transition-opacity pointer-events-none z-10">
                {link.label}
              </span>
            </a>
          );
        })}
      </div>
    </button>
  );
}
