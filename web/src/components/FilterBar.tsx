"use client";

import { TechBadge } from "./TechBadge";

interface FilterBarProps {
  technologies: { name: string; count: number }[];
  selected: string | null;
  onSelect: (tech: string | null) => void;
}

export function FilterBar({ technologies, selected, onSelect }: FilterBarProps) {
  return (
    <div className="sticky top-0 z-30 bg-base/90 backdrop-blur-sm py-3 -mx-6 px-6 border-b border-amber/5">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        <TechBadge
          name="All"
          active={selected === null}
          onClick={() => onSelect(null)}
        />
        {technologies.map((tech) => (
          <TechBadge
            key={tech.name}
            name={`${tech.name} (${tech.count})`}
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
