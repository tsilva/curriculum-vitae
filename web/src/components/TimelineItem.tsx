import type { Employer } from "@/types/cv";

interface TimelineItemProps {
  employer: Employer;
}

export function TimelineItem({ employer }: TimelineItemProps) {
  return (
    <div className="relative pl-8 pb-10 last:pb-0 group">
      {/* Timeline line */}
      <div className="absolute left-[7px] top-3 bottom-0 w-px bg-amber/20 group-last:hidden" />
      {/* Timeline dot */}
      <div className="absolute left-0 top-2 w-[15px] h-[15px] rounded-full border-2 border-amber bg-base-light" />

      <div className="reveal">
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-warm-white">
            <span className="mr-2">{employer.emoji}</span>
            {employer.url ? (
              <a
                href={employer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber transition-colors"
              >
                {employer.name}
              </a>
            ) : (
              employer.name
            )}
          </h3>
          <span className="font-[family-name:var(--font-mono)] text-xs text-slate">
            {employer.duration}
          </span>
        </div>

        <div className="font-[family-name:var(--font-mono)] text-xs text-amber mt-1">
          {employer.role}
        </div>

        <div className="font-[family-name:var(--font-mono)] text-xs text-slate-dim mt-0.5">
          {employer.location}
        </div>

        {employer.description && (
          <p className="text-sm text-warm-white/80 mt-3 leading-relaxed">
            {employer.description.split("\n")[0]}
          </p>
        )}

        {employer.projectIds.length > 0 && (
          <div className="mt-3 font-[family-name:var(--font-mono)] text-xs text-slate-dim">
            {employer.projectIds.length} project{employer.projectIds.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
