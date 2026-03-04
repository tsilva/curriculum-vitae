"use client";

import { useEffect } from "react";
import type { Project } from "@/types/cv";
import { TechBadge } from "./TechBadge";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    if (!project) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center modal-backdrop bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-base-light border border-cyan/20 rounded-sm w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-[0_0_30px_rgba(0,255,240,0.1)]">
        {/* Terminal window chrome */}
        <div className="sticky top-0 bg-base-light/95 backdrop-blur border-b border-cyan/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Terminal dots */}
            <div className="flex gap-1.5 flex-shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-magenta/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-neon-yellow/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-neon-green/80" />
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-sm font-bold text-cool-white truncate">
              <span className="text-cyan">ACCESSING:</span> {project.title.toLowerCase().replace(/\s+/g, "_")}.dat
            </h2>
          </div>
          <button
            onClick={onClose}
            className="font-[family-name:var(--font-mono)] text-xs text-steel hover:text-cyan transition-colors flex-shrink-0 cursor-pointer border border-steel/30 hover:border-cyan/40 px-2 py-1 rounded-sm"
          >
            [ESC]
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Meta row */}
          <div className="font-[family-name:var(--font-mono)] text-xs text-slate space-y-1.5">
            {project.start && <div><span className="text-neon-green">year:</span> {project.start}</div>}
            {project.client && <div><span className="text-neon-green">client:</span> {project.client}</div>}
            {project.role && <div><span className="text-neon-green">role:</span> {project.role}</div>}
            {project.team && <div><span className="text-neon-green">team:</span> {project.team}</div>}
            {project.platforms && <div><span className="text-neon-green">platforms:</span> {project.platforms}</div>}
            {project.location && <div><span className="text-neon-green">location:</span> {project.location}</div>}
          </div>

          {/* Tech badges */}
          {project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.map((tech) => (
                <TechBadge key={tech} name={tech} />
              ))}
            </div>
          )}

          {/* Narrative */}
          <div className="text-cool-white/90 leading-relaxed text-sm space-y-3">
            {project.narrative.split("\n\n").map((para, i) => (
              <p key={i} className="[&_a]:text-cyan [&_a]:hover:underline" dangerouslySetInnerHTML={{ __html: para }} />
            ))}
          </div>

          {/* Links */}
          {project.links.length > 0 && (
            <div className="pt-2 border-t border-cyan/10 space-y-2">
              {project.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-cyan hover:text-cyan/80 transition-colors"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
