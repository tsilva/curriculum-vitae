import type { Employer } from "@/types/cv";

interface TimelineItemProps {
  employer: Employer;
}

export function TimelineItem({ employer }: TimelineItemProps) {
  const formattedDuration = employer.duration
    .replace(" - ", " >>> ")
    .replace("Present", "PRESENT");

  return (
    <div className="relative pl-8 pb-12 last:pb-0 group/card">
      {/* Timeline line — cyan circuit trace */}
      <div className="absolute left-[11px] top-4 bottom-0 w-px bg-cyan/20 group-last/card:hidden group-hover/card:bg-cyan/40 transition-colors" />
      {/* Timeline dot — diamond */}
      <div className="absolute left-[3px] top-3 w-[17px] h-[17px] rotate-45 border-2 border-cyan bg-base-light shadow-[0_0_8px_rgba(0,255,240,0.5)] group-hover/card:shadow-[0_0_15px_rgba(0,255,240,0.7)] group-hover/card:border-cyan/80 transition-all" />

      <div className="reveal group-hover/card:translate-x-1 transition-transform">
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-cool-white group-hover/card:text-cyan transition-colors">
            <span className="mr-2">{employer.emoji}</span>
            {employer.url ? (
              <a
                href={employer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan transition-colors"
              >
                {employer.name}
              </a>
            ) : (
              employer.name
            )}
          </h3>
          <span className="font-[family-name:var(--font-mono)] text-xs text-steel">
            [{formattedDuration}]
          </span>
        </div>

        <div className="font-[family-name:var(--font-mono)] text-sm text-neon-green mt-2 tracking-wide">
          {employer.role}
        </div>

        <div className="font-[family-name:var(--font-mono)] text-xs text-steel-dim mt-1 flex items-center gap-1">
          <span className="text-steel/50">&#x25C7;</span> {employer.location}
        </div>

        {employer.description && (
          <div
            className="text-sm text-cool-white/80 mt-4 leading-[1.8] [&_a]:text-cyan [&_a]:hover:underline max-w-3xl"
            dangerouslySetInnerHTML={{ __html: employer.description.split("\n")[0] }}
          />
        )}

        {employer.projectIds.length > 0 && (
          <div className="mt-3 font-[family-name:var(--font-mono)] text-xs text-steel-dim">
            {employer.projectIds.length} project{employer.projectIds.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
