"use client";

import { useEffect, useRef } from "react";

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";
const FONT_SIZE = 14;
const FPS = 12;

const COLOR_FULL = "#55ead4";
const COLOR_DIMMED = "rgba(85, 234, 212, 0.3)";

interface Cell {
  char: string;
  age: number;
}

interface Stream {
  col: number;
  row: number;
  speed: number;
  counter: number;
}

const MAX_AGE = 15; // Characters live for 15 frames max

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
    let grid: (Cell | null)[][] = [];
    let streams: Stream[] = [];
    let resizeTimeout: NodeJS.Timeout;
    let isResizing = false;

    const resize = () => {
      isResizing = true;
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
        
        // Create streams - about 40% of columns have active streams (less dense)
        const numStreams = Math.floor(cols * 0.4);
        streams = [];
        for (let i = 0; i < numStreams; i++) {
          streams.push({
            col: Math.floor(Math.random() * cols),
            row: Math.floor(Math.random() * -rows * 2), // Start way above viewport
            speed: Math.floor(Math.random() * 2) + 1, // 1-2 cells per frame
            counter: Math.floor(Math.random() * 3)
          });
        }
        
        isResizing = false;
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
      if (isResizing || grid.length === 0) return; // Skip frame during resize
      if (timestamp - lastFrame < frameInterval) return;
      lastFrame = timestamp;

      // Clear entire canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Age all cells
      for (let row = 0; row < rows && row < grid.length; row++) {
        for (let col = 0; col < cols && col < grid[row].length; col++) {
          const cell = grid[row][col];
          if (cell) {
            cell.age++;
            if (cell.age > MAX_AGE) {
              grid[row][col] = null;
            }
          }
        }
      }

      // Update streams and place new characters
      for (const stream of streams) {
        stream.counter++;
        if (stream.counter >= stream.speed) {
          stream.counter = 0;
          
          // Move down
          stream.row++;
          
          // Place new character if within bounds
          if (stream.row >= 0 && stream.row < rows && stream.col >= 0 && stream.col < cols) {
            grid[stream.row][stream.col] = {
              char: CHARS[Math.floor(Math.random() * CHARS.length)],
              age: 0
            };
          }
          
          // Reset stream when it goes off bottom
          if (stream.row > rows + 5) {
            stream.row = Math.floor(Math.random() * -30) - 10;
            stream.col = Math.floor(Math.random() * cols);
          }
        }
      }

      // Draw all cells with age-based fade
      ctx.font = `${FONT_SIZE}px monospace`;
      ctx.textBaseline = "top";
      
      const baseColor = isInHeroRef.current ? COLOR_FULL : COLOR_DIMMED;
      
      for (let row = 0; row < rows && row < grid.length; row++) {
        for (let col = 0; col < cols && col < grid[row].length; col++) {
          const cell = grid[row][col];
          if (cell) {
            // Fade based on age: new = bright, old = dim
            const opacity = 1 - (cell.age / MAX_AGE);
            ctx.fillStyle = baseColor.startsWith("rgba") 
              ? baseColor.replace(/[\d.]+\)$/, `${opacity * 0.3})`)
              : baseColor + Math.floor(opacity * 255).toString(16).padStart(2, '0');
            ctx.fillText(cell.char, col * FONT_SIZE, row * FONT_SIZE);
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
