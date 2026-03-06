"use client";

import { employers } from "@/lib/data";
import { TimelineItem } from "./TimelineItem";

// Parse start date from duration string (e.g., "Sep 2016 - May 2024" -> Date)
function parseStartDate(duration: string): Date {
  const startPart = duration.split(" - ")[0].split(" · ")[0];
  
  // Check if it has a month (contains a space)
  if (startPart.includes(" ")) {
    return new Date(startPart);
  }
  
  // Just a year - assume January for sorting purposes
  return new Date(`${startPart}-01-01`);
}

// Sort employers by start date (descending - most recent first)
const sortedEmployers = [...employers].sort((a, b) => {
  const dateA = parseStartDate(a.duration);
  const dateB = parseStartDate(b.duration);
  return dateB.getTime() - dateA.getTime();
});

export function Experience() {
  return (
    <section id="experience" className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-cyan mb-16 reveal neon-glow-cyan">
        <span className="text-magenta">&gt;</span> EXPERIENCE_LOG
      </h2>

      <div className="space-y-6">
        {sortedEmployers.map((employer) => (
          <TimelineItem key={employer.id} employer={employer} />
        ))}
      </div>
    </section>
  );
}
