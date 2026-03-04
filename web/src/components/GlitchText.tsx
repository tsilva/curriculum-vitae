"use client";

export function GlitchText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`glitch-once glitch-text inline-block ${className}`} data-text={text}>
      {text}
    </span>
  );
}
