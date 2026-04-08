"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { cvData } from "@/lib/cv-data";
import type { Education as EducationEntry } from "@/types/cv";
import { CornerBrackets } from "./CornerBrackets";

const EducationModal = dynamic(
  () => import("./EducationModal").then((mod) => ({ default: mod.EducationModal })),
  { ssr: false }
);

export function Education() {
  const [modalEducation, setModalEducation] = useState<EducationEntry | null>(null);

  return (
    <section id="education" className="max-w-6xl mx-auto px-6 pt-8 pb-32">
      <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-cyan mb-10 reveal neon-glow-cyan">
        <span className="text-magenta">&gt;</span> TRAINING_MODULES
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {cvData.education.map((entry) => (
          <div
            key={entry.id}
            role="button"
            tabIndex={0}
            onClick={() => setModalEducation(entry)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setModalEducation(entry);
              }
            }}
            aria-label={`Open details for ${entry.institution}`}
            className="card-glow bg-surface border border-cyan/10 rounded-sm p-6 reveal h-full relative cursor-pointer transition-all hover:border-cyan/30 hover:shadow-[0_0_20px_rgba(0,230,230,0.1),0_0_40px_rgba(0,230,230,0.05)] focus-visible:outline-none focus-visible:border-cyan/40 focus-visible:shadow-[0_0_20px_rgba(0,230,230,0.12),0_0_40px_rgba(0,230,230,0.06)] group"
          >
            <CornerBrackets />

            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">{entry.emoji}</span>
              <div className="min-w-0">
                <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-cool-white group-hover:text-cyan transition-colors">
                  {entry.url ? (
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-cyan transition-colors"
                      onClick={(event) => event.stopPropagation()}
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

            <div className="mt-4 pt-3 border-t border-cyan/10 flex items-center gap-2 text-xs font-[family-name:var(--font-mono)] text-steel-dim group-hover:text-cyan transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Click for details
            </div>
          </div>
        ))}
      </div>

      <EducationModal
        education={modalEducation}
        onClose={() => setModalEducation(null)}
      />
    </section>
  );
}
