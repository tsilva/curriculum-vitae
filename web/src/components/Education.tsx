import type { Education as EducationType } from "@/types/cv";

interface EducationProps {
  entries: EducationType[];
}

export function Education({ entries }: EducationProps) {
  return (
    <section id="education" className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-cyan mb-10 reveal">
        <span className="text-magenta">&gt;</span> TRAINING_MODULES
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="card-glow bg-surface border border-cyan/10 rounded-sm p-6 reveal h-full"
          >
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">{entry.emoji}</span>
              <div className="min-w-0">
                <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-cool-white">
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
                <div className="font-[family-name:var(--font-mono)] text-xs text-magenta mt-1">
                  {entry.degree}
                </div>
              </div>
            </div>

            <div className="font-[family-name:var(--font-mono)] text-xs text-steel space-y-0.5">
              <div>{entry.duration}</div>
              <div>Grade: {entry.grade}</div>
              <div>{entry.location}</div>
            </div>

            {entry.description && (
              <p
                className="text-sm text-cool-white/80 mt-3 leading-relaxed line-clamp-4 [&_a]:text-cyan [&_a]:hover:underline"
                dangerouslySetInnerHTML={{ __html: entry.description.split("\n")[0] }}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
