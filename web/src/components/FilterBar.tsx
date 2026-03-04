"use client";

import { TechBadge } from "./TechBadge";

interface FilterBarProps {
  technologies: { name: string; count: number }[];
  selected: string[];
  onSelect: (tech: string | null) => void;
  onBrowseAll: () => void;
}

export function FilterBar({
  technologies,
  selected,
  onSelect,
  onBrowseAll,
}: FilterBarProps) {
  // Show top 8 technologies by count
  const topTechs = technologies.slice(0, 8);

  return (
    <div className="sticky top-0 z-30 bg-base/95 backdrop-blur-md py-4 -mx-6 px-6 border-y border-cyan/20 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-2">
        {/* Terminal Prompt */}
        <span className="font-[family-name:var(--font-mono)] text-xs text-neon-green flex-shrink-0 animate-pulse">
          $
        </span>
        <span className="font-[family-name:var(--font-mono)] text-xs text-steel flex-shrink-0 hidden sm:inline">
          filter --tech=
        </span>

        {/* Quick Access Techs */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 flex-1">
          <TechBadge
            name="ALL"
            active={selected.length === 0}
            onClick={() => onSelect(null)}
          />
          <span className="text-steel/30 flex-shrink-0">|</span>
          {topTechs.map((tech) => (
            <TechBadge
              key={tech.name}
              name={`${tech.name} [${tech.count}]`}
              active={selected.includes(tech.name)}
              onClick={() => onSelect(tech.name)}
            />
          ))}
        </div>

        {/* Browse All Button */}
        <button
          onClick={onBrowseAll}
          className="flex-shrink-0 font-[family-name:var(--font-mono)] text-xs px-3 py-1.5 rounded-sm border border-dashed border-cyan/40 text-cyan hover:border-cyan hover:bg-cyan/10 transition-all whitespace-nowrap"
        >
          Browse all [{technologies.length}]
        </button>
      </div>

      {/* Current Filter Display */}
      {selected.length > 0 && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="font-[family-name:var(--font-mono)] text-[10px] text-steel/50">
            Active filters:
          </span>
          {selected.map((tech) => (
            <span
              key={tech}
              className="font-[family-name:var(--font-mono)] text-xs text-neon-green bg-neon-green/10 px-2 py-0.5 rounded flex items-center gap-1"
            >
              {tech}
              <button
                onClick={() => onSelect(tech)}
                className="text-neon-green/70 hover:text-neon-green ml-1"
              >
                ×
              </button>
            </span>
          ))}
          <button
            onClick={() => onSelect(null)}
            className="font-[family-name:var(--font-mono)] text-[10px] text-magenta hover:text-magenta/80 transition-colors"
          >
            [CLEAR ALL]
          </button>
        </div>
      )}
    </div>
  );
}
