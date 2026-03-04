import type { Employer } from "@/types/cv";

interface TimelineItemProps {
  employer: Employer;
}

export function TimelineItem({ employer }: TimelineItemProps) {
  const formattedDuration = employer.duration
    .replace(" - ", " >>> ")
    .replace("Present", "PRESENT");

  return (
    <div className="relative pl-8 pb-10 last:pb-0 group">
      {/* Timeline line — cyan circuit trace */}
      <div className="absolute left-[7px] top-3 bottom-0 w-px bg-cyan/20 group-last:hidden" />
      {/* Timeline dot — diamond */}
      <div className="absolute left-0 top-2 w-[15px] h-[15px] rotate-45 border-2 border-cyan bg-base-light shadow-[0_0_6px_rgba(0,255,240,0.4)]" />

      <div className="reveal">
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-cool-white">
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

        <div className="font-[family-name:var(--font-mono)] text-xs text-neon-green mt-1">
          {employer.role}
        </div>

        <div className="font-[family-name:var(--font-mono)] text-xs text-steel-dim mt-0.5">
          {employer.location}
        </div>

        {employer.description && (
          <p
            className="text-sm text-cool-white/80 mt-3 leading-relaxed [&_a]:text-cyan [&_a]:hover:underline"
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
