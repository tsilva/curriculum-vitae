"use client";

import { useState } from "react";

interface GlitchTextProps {
  text: string;
  className?: string;
  hoverIntensity?: boolean;
}

export function GlitchText({ text, className = "", hoverIntensity = true }: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);

  return (
    <span 
      className={`glitch-once glitch-text inline-block ${isGlitching ? 'glitch-active' : ''} ${className}`} 
      data-text={text}
      onMouseEnter={() => hoverIntensity && setIsGlitching(true)}
      onMouseLeave={() => setIsGlitching(false)}
    >
      {text}
    </span>
  );
}
