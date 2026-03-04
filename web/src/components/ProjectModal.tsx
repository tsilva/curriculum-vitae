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
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center modal-backdrop bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-base-light border border-amber/20 rounded-t-2xl md:rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-base-light/95 backdrop-blur border-b border-amber/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl flex-shrink-0">{project.emoji}</span>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-warm-white truncate">
              {project.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate hover:text-warm-white transition-colors p-1 flex-shrink-0 cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Meta row */}
          <div className="font-[family-name:var(--font-mono)] text-xs text-slate space-y-1.5">
            {project.start && <div><span className="text-amber">Year:</span> {project.start}</div>}
            {project.client && <div><span className="text-amber">Client:</span> {project.client}</div>}
            {project.role && <div><span className="text-amber">Role:</span> {project.role}</div>}
            {project.team && <div><span className="text-amber">Team:</span> {project.team}</div>}
            {project.platforms && <div><span className="text-amber">Platforms:</span> {project.platforms}</div>}
            {project.location && <div><span className="text-amber">Location:</span> {project.location}</div>}
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
          <div className="text-warm-white/90 leading-relaxed text-sm space-y-3">
            {project.narrative.split("\n\n").map((para, i) => (
              <p key={i} className="[&_a]:text-amber [&_a]:hover:underline" dangerouslySetInnerHTML={{ __html: para }} />
            ))}
          </div>

          {/* Links */}
          {project.links.length > 0 && (
            <div className="pt-2 border-t border-amber/10 space-y-2">
              {project.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-amber hover:text-amber-dim transition-colors"
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
