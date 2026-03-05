"use client";

import { employers } from "@/lib/data";
import { TimelineItem } from "./TimelineItem";

export function Experience() {
  return (
    <section id="experience" className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-cyan mb-16 reveal neon-glow-cyan">
        <span className="text-magenta">&gt;</span> EXPERIENCE_LOG
      </h2>

      <div className="space-y-6">
        {employers.map((employer) => (
          <TimelineItem key={employer.id} employer={employer} />
        ))}
      </div>
    </section>
  );
}
