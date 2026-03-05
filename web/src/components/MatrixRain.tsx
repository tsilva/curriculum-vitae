"use client";

import { useEffect, useRef } from "react";

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";
const FONT_SIZE = 14;
const FPS = 8; // Reduced from 12 to 8 FPS

// Kiroshi cyan at 30% opacity (full), 6% opacity (dimmed)
const DROP_COLOR_FULL = "#55ead44d";
const DROP_COLOR_DIMMED = "#55ead40f";

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInHeroRef = useRef(true);
  const isVisibleRef = useRef(true);
  const animIdRef = useRef<number | undefined>(undefined);

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
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Disable on mobile/touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;
    
    // Respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d", { alpha: true }); // Optimize for transparency
    if (!ctx) return;

    let lastFrame = 0;
    const frameInterval = 1000 / FPS;
    let columns = 0;
    let drops: number[] = [];
    let resizeTimeout: NodeJS.Timeout;

    const resize = () => {
      // Debounce resize
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Don't resize on mobile (when canvas is hidden via hidden md:block)
        if (window.innerWidth < 768) {
          canvas.width = 0;
          canvas.height = 0;
          return;
        }
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Recalculate columns and reset drops array on resize
        columns = Math.floor(canvas.width / FONT_SIZE);
        drops = new Array(columns).fill(0).map(() => Math.random() * -100);
      }, 100);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    // IntersectionObserver to pause when not visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    const draw = (timestamp: number) => {
      animIdRef.current = requestAnimationFrame(draw);

      // Skip frames when not visible or tab hidden
      if (!isVisibleRef.current || document.hidden) return;
      if (timestamp - lastFrame < frameInterval) return;
      lastFrame = timestamp;

      ctx.fillStyle = "rgba(10, 10, 18, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Use dimmed color when not in hero, full color when in hero
      ctx.fillStyle = isInHeroRef.current ? DROP_COLOR_FULL : DROP_COLOR_DIMMED;
      ctx.font = `${FONT_SIZE}px monospace`;

      // Only render every 3rd column for performance (sparse effect)
      for (let i = 0; i < drops.length; i += 2) {
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

    animIdRef.current = requestAnimationFrame(draw);

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", resize);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 hidden md:block will-change-transform"
      aria-hidden="true"
    />
  );
}
