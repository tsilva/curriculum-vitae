"use client";

export function GlitchText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`glitch-once inline-block ${className}`}>
      {text}
    </span>
  );
}
