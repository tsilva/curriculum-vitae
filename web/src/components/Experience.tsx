"use client";

import { useCVData } from "@/hooks/useCVData";
import { TimelineItem } from "./TimelineItem";

export function Experience() {
  const { data, isLoading, error } = useCVData();

  if (isLoading) {
    return (
      <section id="experience" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-cyan mb-16 reveal neon-glow-cyan">
          <span className="text-magenta">&gt;</span> EXPERIENCE_LOG
        </h2>
        <div className="flex items-center justify-center py-10">
          <div className="animate-pulse text-steel font-[family-name:var(--font-mono)]">
            <span className="text-cyan">&gt;</span> Loading experience data...
          </div>
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section id="experience" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-cyan mb-16 reveal neon-glow-cyan">
          <span className="text-magenta">&gt;</span> EXPERIENCE_LOG
        </h2>
        <div className="text-magenta font-[family-name:var(--font-mono)] p-4 border border-magenta/30 rounded bg-magenta/5">
          <span className="text-magenta">✗</span> Error loading experience data
        </div>
      </section>
    );
  }

  return (
    <section id="experience" className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-cyan mb-16 reveal neon-glow-cyan">
        <span className="text-magenta">&gt;</span> EXPERIENCE_LOG
      </h2>

      <div className="space-y-6">
        {data.employers.map((employer) => (
          <TimelineItem key={employer.id} employer={employer} />
        ))}
      </div>
    </section>
  );
}
