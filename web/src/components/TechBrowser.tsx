"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { TechBadge } from "./TechBadge";

interface TechBrowserProps {
  technologies: { name: string; count: number }[];
  selected: string[];
  onToggle: (tech: string) => void;
  onClear: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export function TechBrowser({
  technologies,
  selected,
  onToggle,
  onClear,
  onClose,
  isOpen,
}: TechBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTechs = useMemo(() => {
    if (!searchQuery.trim()) return technologies;
    const query = searchQuery.toLowerCase();
    return technologies.filter((tech) =>
      tech.name.toLowerCase().includes(query)
    );
  }, [technologies, searchQuery]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-black/80"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-base-light border border-cyan/20 rounded-sm w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-[0_0_30px_rgba(0,230,230,0.1),0_0_60px_rgba(0,230,230,0.05)]">
        {/* Terminal Header */}
        <div className="sticky top-0 bg-base-light/95 backdrop-blur border-b border-cyan/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Terminal dots */}
            <div className="flex gap-1.5 flex-shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-magenta/80 animate-pulse" />
              <span className="w-2.5 h-2.5 rounded-full bg-kiroshi-yellow/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-neon-green/80" />
            </div>
            <h2 className="font-[family-name:var(--font-mono)] text-sm text-cool-white">
              <span className="text-cyan">tech_browser</span>
              <span className="text-steel">.exe</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-steel hover:text-cyan transition-colors font-[family-name:var(--font-mono)] text-sm"
          >
            [ESC] CLOSE
          </button>
        </div>

        {/* Search Input */}
        <div className="px-6 py-4 border-b border-cyan/10 bg-surface/50">
          <div className="flex items-center gap-3">
            <span className="font-[family-name:var(--font-mono)] text-cyan animate-pulse">
              &gt;
            </span>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search technologies..."
              className="flex-1 bg-transparent border-none outline-none font-[family-name:var(--font-mono)] text-sm text-cool-white placeholder:text-steel/50"
            />
            <span className="font-[family-name:var(--font-mono)] text-[10px] text-steel/50">
              {filteredTechs.length} / {technologies.length}
            </span>
          </div>
        </div>

        {/* Selected Filters Summary */}
        {selected.length > 0 && (
          <div className="px-6 py-3 border-b border-cyan/10 bg-neon-green/5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-[family-name:var(--font-mono)] text-[10px] text-neon-green">
                SELECTED:
              </span>
              {selected.map((tech) => {
                const techData = technologies.find((t) => t.name === tech);
                return (
                  <button
                    key={tech}
                    onClick={() => onToggle(tech)}
                    className="font-[family-name:var(--font-mono)] text-xs text-neon-green bg-neon-green/10 px-2 py-1 rounded flex items-center gap-1 hover:bg-neon-green/20 transition-colors"
                  >
                    {tech} [{techData?.count || 0}]
                    <span className="ml-1">×</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tech Grid */}
        <div className="overflow-y-auto max-h-[50vh] p-6">
          {filteredTechs.length === 0 ? (
            <div className="text-center py-8 text-steel font-[family-name:var(--font-mono)] text-sm">
              <span className="text-magenta">ERROR:</span> No technologies found
              matching "{searchQuery}"
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredTechs.map((tech) => {
                const isSelected = selected.includes(tech.name);
                return (
                  <button
                    key={tech.name}
                    onClick={() => onToggle(tech.name)}
                    className={`text-left p-3 rounded-sm border transition-all font-[family-name:var(--font-mono)] text-xs ${
                      isSelected
                        ? "bg-cyan text-base border-cyan shadow-[0_0_15px_rgba(0,255,240,0.3)]"
                        : "bg-surface text-steel border-steel/20 hover:border-cyan/40 hover:text-cool-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{tech.name}</span>
                      {isSelected && (
                        <span className="text-base/70 text-[10px]">✓</span>
                      )}
                    </div>
                    <div
                      className={`text-[10px] mt-1 ${
                        isSelected ? "text-base/70" : "text-steel/50"
                      }`}
                    >
                      [{tech.count} projects]
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-cyan/10 bg-surface/30 flex items-center justify-between text-[10px] font-[family-name:var(--font-mono)] text-steel/50">
          <span>Click to toggle • Esc Close</span>
          {selected.length > 0 && (
            <button
              onClick={onClear}
              className="text-magenta hover:text-magenta/80 transition-colors"
            >
              [CLEAR ALL]
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
