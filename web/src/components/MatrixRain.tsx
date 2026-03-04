"use client";

import { useEffect, useRef } from "react";

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";
const FONT_SIZE = 14;
const FPS = 12;

// Kiroshi cyan at 30% opacity (full), 6% opacity (dimmed) - more aggressive dimming
const DROP_COLOR_FULL = "#55ead44d";
const DROP_COLOR_DIMMED = "#55ead40f";

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInHeroRef = useRef(true);

  useEffect(() => {
    // Disable on mobile/touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;
    
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      const scrollY = window.scrollY;
      // Consider "in hero" if within first 50% of viewport
      isInHeroRef.current = scrollY < heroHeight * 0.5;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Disable on mobile/touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;
    
    // Respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let lastFrame = 0;
    const frameInterval = 1000 / FPS;

    const resize = () => {
      // Don't resize on mobile (when canvas is hidden via hidden md:block)
      if (window.innerWidth < 768) {
        canvas.width = 0;
        canvas.height = 0;
        return;
      }
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const columns = Math.floor(canvas.width / FONT_SIZE);
    const drops: number[] = new Array(columns).fill(0).map(() => Math.random() * -100);

    const draw = (timestamp: number) => {
      animId = requestAnimationFrame(draw);

      if (timestamp - lastFrame < frameInterval) return;
      lastFrame = timestamp;

      ctx.fillStyle = "rgba(10, 10, 18, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Use dimmed color when not in hero, full color when in hero
      ctx.fillStyle = isInHeroRef.current ? DROP_COLOR_FULL : DROP_COLOR_DIMMED;
      ctx.font = `${FONT_SIZE}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * FONT_SIZE;
        const y = drops[i] * FONT_SIZE;

        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []); // Empty dependency array - animation runs once and never resets

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 hidden md:block"
      aria-hidden="true"
    />
  );
}
