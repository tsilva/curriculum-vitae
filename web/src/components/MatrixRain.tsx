"use client";

import { useEffect, useRef } from "react";

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";
const FONT_SIZE = 14;
const FPS = 12;

const COLOR_FULL = "#55ead4";
const COLOR_DIMMED = "rgba(85, 234, 212, 0.3)";

interface Stream {
  col: number;
  row: number;
  speed: number;
  counter: number;
}

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInHeroRef = useRef(true);
  const isVisibleRef = useRef(true);
  const animIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      const scrollY = window.scrollY;
      isInHeroRef.current = scrollY < heroHeight * 0.5;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let lastFrame = 0;
    const frameInterval = 1000 / FPS;
    let cols = 0;
    let rows = 0;
    let grid: (string | null)[][] = [];
    let streams: Stream[] = [];
    let resizeTimeout: NodeJS.Timeout;

    const resize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (window.innerWidth < 768) {
          canvas.width = 0;
          canvas.height = 0;
          return;
        }
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        cols = Math.floor(canvas.width / FONT_SIZE);
        rows = Math.floor(canvas.height / FONT_SIZE);
        
        // Initialize empty grid
        grid = Array(rows).fill(null).map(() => Array(cols).fill(null));
        
        // Create streams - about 30% of columns have active streams
        const numStreams = Math.floor(cols * 0.3);
        streams = [];
        for (let i = 0; i < numStreams; i++) {
          streams.push({
            col: Math.floor(Math.random() * cols),
            row: Math.floor(Math.random() * -rows), // Start above viewport
            speed: Math.floor(Math.random() * 2) + 1, // 1-2 cells per frame
            counter: 0
          });
        }
      }, 100);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

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

      if (!isVisibleRef.current || document.hidden) return;
      if (timestamp - lastFrame < frameInterval) return;
      lastFrame = timestamp;

      // Clear entire canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update streams and grid
      for (const stream of streams) {
        stream.counter++;
        if (stream.counter >= stream.speed) {
          stream.counter = 0;
          
          // Clear previous cell if within bounds
          if (stream.row >= 0 && stream.row < rows) {
            // Character stays until overwritten by another stream or cleared
          }
          
          // Move down
          stream.row++;
          
          // Place new character if within bounds
          if (stream.row >= 0 && stream.row < rows) {
            grid[stream.row][stream.col] = CHARS[Math.floor(Math.random() * CHARS.length)];
          }
          
          // Reset stream when it goes off bottom
          if (stream.row > rows + 10) {
            stream.row = Math.floor(Math.random() * -20) - 5;
            stream.col = Math.floor(Math.random() * cols);
            stream.speed = Math.floor(Math.random() * 2) + 1;
          }
        }
      }

      // Clear cells that have no active stream (fade effect)
      // Only clear a few random cells per frame for persistence
      const cellsToClear = Math.floor(cols * rows * 0.005); // 0.5% of cells per frame
      for (let i = 0; i < cellsToClear; i++) {
        const clearRow = Math.floor(Math.random() * rows);
        const clearCol = Math.floor(Math.random() * cols);
        grid[clearRow][clearCol] = null;
      }

      // Draw all non-null cells
      ctx.font = `${FONT_SIZE}px monospace`;
      ctx.textBaseline = "top";
      
      const baseColor = isInHeroRef.current ? COLOR_FULL : COLOR_DIMMED;
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const char = grid[row][col];
          if (char) {
            ctx.fillStyle = baseColor;
            ctx.fillText(char, col * FONT_SIZE, row * FONT_SIZE);
          }
        }
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
