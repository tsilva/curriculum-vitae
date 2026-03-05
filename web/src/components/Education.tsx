"use client";

import { education } from "@/lib/data";

export function Education() {
  return (
    <section id="education" className="max-w-6xl mx-auto px-6 pt-8 pb-32">
      <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-cyan mb-10 reveal neon-glow-cyan">
        <span className="text-magenta">&gt;</span> TRAINING_MODULES
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {education.map((entry) => (
          <div
            key={entry.id}
            className="card-glow bg-surface border border-cyan/10 rounded-sm p-6 reveal h-full relative"
          >
            {/* Corner bracket decorations - matching ProjectCard style */}
            <span className="absolute top-2 left-2 text-cyan/30 font-[family-name:var(--font-mono)] text-xs select-none">&#x250C;&#x2500;</span>
            <span className="absolute top-2 right-2 text-cyan/30 font-[family-name:var(--font-mono)] text-xs select-none">&#x2500;&#x2510;</span>
            <span className="absolute bottom-2 left-2 text-cyan/30 font-[family-name:var(--font-mono)] text-xs select-none">&#x2514;&#x2500;</span>
            <span className="absolute bottom-2 right-2 text-cyan/30 font-[family-name:var(--font-mono)] text-xs select-none">&#x2500;&#x2518;</span>

            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">{entry.emoji}</span>
              <div className="min-w-0">
                <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-cool-white">
                  {entry.url ? (
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-cyan transition-colors"
                    >
                      {entry.institution}
                    </a>
                  ) : (
                    entry.institution
                  )}
                </h3>
                <div className="font-[family-name:var(--font-mono)] text-sm text-magenta mt-1">
                  {entry.degree}
                </div>
              </div>
            </div>

            <div className="font-[family-name:var(--font-mono)] text-sm text-steel space-y-1">
              <div>{entry.duration}</div>
              <div>Grade: {entry.grade}</div>
              <div>{entry.location}</div>
            </div>

            {entry.description && (
              <div
                className="text-sm text-cool-white/80 mt-4 leading-[1.7] line-clamp-4 [&_a]:text-cyan [&_a]:hover:underline"
                dangerouslySetInnerHTML={{ __html: entry.description.split("\n")[0] }}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
