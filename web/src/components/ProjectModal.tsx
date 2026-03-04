"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/types/cv";
import { TechBadge } from "./TechBadge";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

// Typewriter hook
function useTypewriter(text: string, speed: number = 15, enabled: boolean = true) {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayed(text);
      setIsDone(true);
      return;
    }

    setDisplayed("");
    setIsDone(false);
    let index = 0;
    
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayed(text.slice(0, index + 1));
        index++;
      } else {
        setIsDone(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, enabled]);

  return { displayed, isDone };
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [hasOpened, setHasOpened] = useState(false);

  useEffect(() => {
    if (!project) {
      setHasOpened(false);
      return;
    }
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEsc);
    
    // Mark as opened after a short delay to trigger typewriter
    const timer = setTimeout(() => setHasOpened(true), 100);
    
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
      clearTimeout(timer);
    };
  }, [project, onClose]);

  // Combine all narrative text for typewriter
  const fullNarrative = project?.narrative || "";
  const { displayed: typedNarrative, isDone: typingDone } = useTypewriter(
    fullNarrative,
    8,
    hasOpened
  );

  if (!project) return null;

  const paragraphs = typingDone 
    ? project.narrative.split("\n\n")
    : typedNarrative.split("\n\n").filter(p => p.trim());

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center modal-backdrop bg-black/80"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-base-light border border-cyan/20 rounded-sm w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-[0_0_40px_rgba(0,255,240,0.15),0_0_80px_rgba(0,255,240,0.05)]">
        {/* Terminal window chrome */}
        <div className="sticky top-0 bg-base-light/95 backdrop-blur border-b border-cyan/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Terminal dots */}
            <div className="flex gap-1.5 flex-shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-magenta/80 animate-pulse" />
              <span className="w-2.5 h-2.5 rounded-full bg-kiroshi-yellow/80" />
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
          {/* Section: Meta Data */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-cyan text-sm">■</span>
              <span className="font-[family-name:var(--font-display)] text-xs font-bold text-cyan tracking-widest uppercase">
                Mission Parameters
              </span>
            </div>
            <div className="font-[family-name:var(--font-mono)] text-xs text-steel space-y-1.5 pl-4 border-l-2 border-cyan/20">
              {project.start && (
                <div className="flex gap-2">
                  <span className="text-steel-dim w-16">year:</span>
                  <span className="text-kiroshi-yellow">{project.start}</span>
                </div>
              )}
              {project.client && (
                <div className="flex gap-2">
                  <span className="text-steel-dim w-16">client:</span>
                  <span className="text-cool-white">{project.client}</span>
                </div>
              )}
              {project.role && (
                <div className="flex gap-2">
                  <span className="text-steel-dim w-16">role:</span>
                  <span className="text-kiroshi-cyan">{project.role}</span>
                </div>
              )}
              {project.team && (
                <div className="flex gap-2">
                  <span className="text-steel-dim w-16">team:</span>
                  <span className="text-cool-white">{project.team}</span>
                </div>
              )}
              {project.platforms && (
                <div className="flex gap-2">
                  <span className="text-steel-dim w-16">platforms:</span>
                  <span className="text-steel">{project.platforms}</span>
                </div>
              )}
              {project.location && (
                <div className="flex gap-2">
                  <span className="text-steel-dim w-16">location:</span>
                  <span className="text-steel">{project.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section: Technologies */}
          {project.technologies.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-neon-green text-sm">■</span>
                <span className="font-[family-name:var(--font-display)] text-xs font-bold text-neon-green tracking-widest uppercase">
                  Tech Stack
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pl-4 border-l-2 border-neon-green/20">
                {project.technologies.map((tech) => (
                  <TechBadge key={tech} name={tech} />
                ))}
              </div>
            </div>
          )}

          {/* Section: Narrative */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-kiroshi-yellow text-sm">■</span>
              <span className="font-[family-name:var(--font-display)] text-xs font-bold text-kiroshi-yellow tracking-widest uppercase">
                Mission Log
              </span>
            </div>
            <div className="text-cool-white/90 leading-relaxed text-sm space-y-3 pl-4 border-l-2 border-kiroshi-yellow/20">
              {paragraphs.map((para, i) => (
                <p 
                  key={i} 
                  className="[&_a]:text-cyan [&_a]:hover:underline"
                  dangerouslySetInnerHTML={{ __html: para + (!typingDone && i === paragraphs.length - 1 ? '<span class="inline-block w-2 h-4 bg-kiroshi-yellow ml-0.5 animate-pulse"></span>' : '') }} 
                />
              ))}
            </div>
          </div>

          {/* Section: Links */}
          {project.links.length > 0 && (
            <div className="pt-4 border-t border-cyan/10 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-magenta text-sm">■</span>
                <span className="font-[family-name:var(--font-display)] text-xs font-bold text-magenta tracking-widest uppercase">
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
                    className="flex items-center gap-2 text-sm text-cyan hover:text-cyan/80 transition-colors group/link"
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
    </div>
  );
}
