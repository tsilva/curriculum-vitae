"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
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

  const paragraphs = project.narrative.split("\n\n");

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-base-light border border-cyan/20 rounded-sm w-full max-w-3xl h-[90vh] flex flex-col shadow-[0_0_30px_rgba(0,230,230,0.1),0_0_60px_rgba(0,230,230,0.05)] mx-4">
        {/* Terminal window chrome - fixed header */}
        <div className="flex-shrink-0 bg-base-light/95 backdrop-blur border-b border-cyan/10 px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Terminal dots */}
            <div className="flex gap-1.5 flex-shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-magenta/80 animate-pulse" />
              <span className="w-2.5 h-2.5 rounded-full bg-kiroshi-yellow/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-neon-green/80" />
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-base font-bold text-cool-white truncate">
              <span className="text-cyan">ACCESSING:</span> {project.title.toLowerCase().replace(/\s+/g, "_")}.dat
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Gallery button - prominent if gallery exists */}
            {project.gallery && project.gallery.length > 0 && (
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openProjectGallery', { detail: project }));
                }}
                className="flex items-center gap-1.5 font-[family-name:var(--font-mono)] text-xs text-cool-white hover:text-white transition-colors border border-magenta hover:border-magenta bg-magenta/40 hover:bg-magenta/60 px-2 py-1 rounded-sm animate-pulse shadow-[0_0_10px_rgba(255,0,170,0.4)]"
                title={`View Gallery (${project.gallery.length} items)`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
                <span className="hidden sm:inline">Gallery ({project.gallery.length})</span>
                <span className="sm:hidden">({project.gallery.length})</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="font-[family-name:var(--font-mono)] text-sm text-steel hover:text-cyan transition-colors flex-shrink-0 cursor-pointer border border-steel/30 hover:border-cyan/40 px-2 py-1 rounded-sm"
            >
              [ESC]
            </button>
          </div>
        </div>

        {/* Body - scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 space-y-6">
          {/* Section: Meta Data */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-cyan text-base">■</span>
              <span className="font-[family-name:var(--font-display)] text-sm font-bold text-cyan tracking-widest uppercase">
                Mission Parameters
              </span>
            </div>
            <div className="font-[family-name:var(--font-mono)] text-sm text-steel space-y-2 pl-4 border-l-2 border-cyan/20">
              {project.start && (
                <div className="flex gap-2">
                  <span className="text-steel-dim w-20 flex-shrink-0">year:</span>
                  <span className="text-kiroshi-yellow">{project.start}</span>
                </div>
              )}
              {project.client && (
                <div className="flex gap-2">
                  <span className="text-steel-dim w-20 flex-shrink-0">client:</span>
                  <span className="text-cool-white">{project.client}</span>
                </div>
              )}
              {project.role && (
                <div className="flex gap-2">
                  <span className="text-steel-dim w-20 flex-shrink-0">role:</span>
                  <span className="text-cyan">{project.role}</span>
                </div>
              )}
              {project.team && (
                <div className="flex gap-2">
                  <span className="text-steel-dim w-20 flex-shrink-0">team:</span>
                  <span className="text-cool-white">{project.team}</span>
                </div>
              )}
              {project.platforms && (
                <div className="flex gap-2">
                  <span className="text-steel-dim w-20 flex-shrink-0">platforms:</span>
                  <span className="text-steel">{project.platforms}</span>
                </div>
              )}
              {project.location && (
                <div className="flex gap-2">
                  <span className="text-steel-dim w-20 flex-shrink-0">location:</span>
                  <span className="text-steel">{project.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section: Narrative */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-kiroshi-yellow text-base">■</span>
              <span className="font-[family-name:var(--font-display)] text-sm font-bold text-kiroshi-yellow tracking-widest uppercase">
                Mission Log
              </span>
            </div>
            <div className="text-cool-white/90 leading-relaxed text-base space-y-4 pl-4 border-l-2 border-kiroshi-yellow/20">
              {paragraphs.map((para, i) => (
                <p 
                  key={i} 
                  className="[&_a]:text-cyan [&_a]:hover:underline"
                  dangerouslySetInnerHTML={{ __html: para }} 
                />
              ))}
            </div>
          </div>

          {/* Section: Technologies */}
          {project.technologies.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-neon-green text-base">■</span>
                <span className="font-[family-name:var(--font-display)] text-sm font-bold text-neon-green tracking-widest uppercase">
                  Tech Stack
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pl-4 border-l-2 border-neon-green/20">
                {project.technologies.map((tech) => (
                  <TechBadge key={tech} name={tech} />
                ))}
              </div>
            </div>
          )}


          {project.links.length > 0 && (
            <div className="pt-4 border-t border-cyan/10 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-magenta text-base">■</span>
                <span className="font-[family-name:var(--font-display)] text-sm font-bold text-magenta tracking-widest uppercase">
                  External Links
                </span>
              </div>
              <div className="space-y-2 pl-4 border-l-2 border-magenta/20">
                {project.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-base text-cyan hover:text-cyan/80 transition-colors group/link"
                  >
                    <svg className="w-4 h-4 flex-shrink-0 group-hover/link:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span className="group-hover/link:glitch-hover">{link.label}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
