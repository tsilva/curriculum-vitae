"use client";

import { useEffect, useState } from "react";
import { GlitchText } from "./GlitchText";

interface VersionUpdatePopupProps {
  isOpen: boolean;
  onReload: () => void;
  onDismiss: () => void;
}

export function VersionUpdatePopup({ isOpen, onReload, onDismiss }: VersionUpdatePopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onDismiss]);

  if (!isOpen || !isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end md:items-center justify-center modal-backdrop bg-black/90 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <div className="bg-base-light border-2 border-magenta/30 rounded-sm w-full md:w-[480px] mx-4 shadow-[0_0_30px_rgba(255,0,170,0.2),0_0_60px_rgba(255,0,170,0.1)] animate-fade-in-up">
        {/* Terminal window chrome */}
        <div className="bg-base-light/95 backdrop-blur border-b border-magenta/20 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Terminal dots */}
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-magenta/80 animate-pulse" />
              <span className="w-2.5 h-2.5 rounded-full bg-kiroshi-yellow/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-neon-green/80" />
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-sm font-bold text-cool-white">
              <span className="text-magenta">SYSTEM:</span> UPDATE_AVAILABLE
            </h2>
          </div>
          <button
            onClick={onDismiss}
            className="font-[family-name:var(--font-mono)] text-xs text-steel hover:text-cool-white transition-colors"
          >
            [×]
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Alert icon and message */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-magenta/10 border border-magenta/30 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-magenta animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="font-[family-name:var(--font-display)] text-sm font-bold text-magenta">
                <GlitchText text="NEW_VERSION_DETECTED" hoverIntensity={false} />
              </p>
              <p className="font-[family-name:var(--font-body)] text-sm text-steel leading-relaxed">
                A new version of the CV has been deployed. Reload to access the latest content.
              </p>
            </div>
          </div>

          {/* ASCII corner brackets decoration */}
          <div className="relative py-2">
            <div className="absolute top-0 left-0 text-cyan/40 text-xs">┌</div>
            <div className="absolute top-0 right-0 text-cyan/40 text-xs">┐</div>
            <div className="absolute bottom-0 left-0 text-cyan/40 text-xs">└</div>
            <div className="absolute bottom-0 right-0 text-cyan/40 text-xs">┘</div>
            
            <div className="font-[family-name:var(--font-mono)] text-xs text-steel-dim text-center px-4">
              <span className="text-cyan">build_hash:</span>{" "}
              <span className="text-kiroshi-yellow">UPDATED</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onReload}
              className="flex-1 font-[family-name:var(--font-mono)] text-sm font-bold text-base bg-neon-green hover:bg-neon-green/80 transition-all px-4 py-3 rounded-sm border border-neon-green/50 hover:border-neon-green flex items-center justify-center gap-2 group"
            >
              <svg
                className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>RELOAD_NOW</span>
            </button>
            <button
              onClick={onDismiss}
              className="flex-1 font-[family-name:var(--font-mono)] text-sm text-steel hover:text-cool-white bg-transparent hover:bg-steel/10 transition-all px-4 py-3 rounded-sm border border-steel/30 hover:border-steel/50 flex items-center justify-center"
            >
              <span>DISMISS</span>
            </button>
          </div>

          {/* Footer note */}
          <p className="font-[family-name:var(--font-mono)] text-xs text-steel-dim text-center">
            Press <kbd className="font-mono text-steel bg-steel/10 px-1 rounded">ESC</kbd> to dismiss
          </p>
        </div>
      </div>
    </div>
  );
}
