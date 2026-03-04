import type { Employer } from "@/types/cv";
import { TimelineItem } from "./TimelineItem";

interface ExperienceProps {
  employers: Employer[];
}

export function Experience({ employers }: ExperienceProps) {
  return (
    <section id="experience" className="max-w-4xl mx-auto px-6 py-20">
      <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-cyan mb-10 reveal">
        <span className="text-magenta">&gt;</span> EXPERIENCE_LOG
      </h2>

      <div>
        {employers.map((employer) => (
          <TimelineItem key={employer.id} employer={employer} />
        ))}
      </div>
    </section>
  );
}
