"use client";

import { TechBadge } from "./TechBadge";

interface FilterBarProps {
  technologies: { name: string; count: number }[];
  selected: string | null;
  onSelect: (tech: string | null) => void;
}

export function FilterBar({ technologies, selected, onSelect }: FilterBarProps) {
  return (
    <div className="sticky top-0 z-30 bg-base/95 backdrop-blur-md py-4 -mx-6 px-6 border-y border-cyan/20 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-1">
        <span className="font-[family-name:var(--font-mono)] text-xs text-neon-green flex-shrink-0 animate-pulse">$</span>
        <span className="font-[family-name:var(--font-mono)] text-xs text-steel flex-shrink-0">filter --tech=</span>
        <TechBadge
          name="ALL"
          active={selected === null}
          onClick={() => onSelect(null)}
        />
        <span className="text-steel/30 flex-shrink-0">|</span>
        {technologies.map((tech) => (
          <TechBadge
            key={tech.name}
            name={`${tech.name} [${tech.count}]`}
            active={selected === tech.name}
            onClick={() =>
              onSelect(selected === tech.name ? null : tech.name)
            }
          />
        ))}
      </div>
    </div>
  );
}
