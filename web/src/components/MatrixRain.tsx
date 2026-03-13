"use client";

import { useEffect, useRef, useState } from "react";

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";
const FONT_SIZE = 14;
const FPS = 12;

interface Cell {
  char: string;
  age: number;
  baselineOpacity: number;
}

interface Stream {
  col: number;
  row: number;
  speed: number;
  counter: number;
}

const MAX_AGE_BRIGHT = 3;
const MAX_AGE_FADE = 30;
const BASELINE_OPACITY_MIN = 0.05;
const BASELINE_OPACITY_MAX = 0.10;
const MAX_STREAMS_PERCENT = 0.35;
const SPAWN_DELAY_MAX = 60;
const STREAM_RESET_DELAY_MIN = -30;
const STREAM_RESET_DELAY_MAX = -5;
const HERO_CANVAS_OPACITY = 0.45;

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isVisibleRef = useRef(true);
  const inHeroRef = useRef(true);
  const animIdRef = useRef<number | undefined>(undefined);
  const [canvasOpacity, setCanvasOpacity] = useState(HERO_CANVAS_OPACITY);

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
    const filledColumns = new Set<number>();

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
        
        grid = Array(rows).fill(null).map(() => Array(cols).fill(null));
        
        filledColumns.clear();
        
        const getUnfilledColumns = (): number[] => {
          const unfilled = [];
          for (let i = 0; i < cols; i++) {
            if (!filledColumns.has(i)) {
              unfilled.push(i);
            }
          }
          return unfilled;
        };
        
        const numStreams = Math.floor(cols * MAX_STREAMS_PERCENT);
        streams = [];
        for (let i = 0; i < numStreams; i++) {
          const unfilled = getUnfilledColumns();
          const col = unfilled.length > 0 
            ? unfilled[Math.floor(Math.random() * unfilled.length)]
            : Math.floor(Math.random() * cols);
          
          filledColumns.add(col);
          
          streams.push({
            col,
            row: Math.floor(Math.random() * (STREAM_RESET_DELAY_MAX - STREAM_RESET_DELAY_MIN) + STREAM_RESET_DELAY_MIN),
            speed: Math.floor(Math.random() * 2) + 1,
            counter: -Math.floor(Math.random() * SPAWN_DELAY_MAX)
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

    const checkHeroVisibility = () => {
      const hero = document.getElementById('hero');
      if (!hero) return;
      
      const heroRect = hero.getBoundingClientRect();
      const isInHero = heroRect.bottom > 0;
      
      inHeroRef.current = isInHero;
      setCanvasOpacity(isInHero ? HERO_CANVAS_OPACITY : 0);
    };

    checkHeroVisibility();
    window.addEventListener("scroll", checkHeroVisibility, { passive: true });

    const draw = (timestamp: number) => {
      animIdRef.current = requestAnimationFrame(draw);

      if (!isVisibleRef.current || document.hidden) return;
      if (isResizing || grid.length === 0) return;
      if (timestamp - lastFrame < frameInterval) return;
      lastFrame = timestamp;

      if (!inHeroRef.current) {
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let row = 0; row < rows && row < grid.length; row++) {
        for (let col = 0; col < cols && col < grid[row].length; col++) {
          const cell = grid[row][col];
          if (cell) {
            cell.age++;
          }
        }
      }

      for (const stream of streams) {
        if (stream.counter < 0) {
          stream.counter++;
          continue;
        }
        
        stream.counter++;
        if (stream.counter >= stream.speed) {
          stream.counter = 0;
          
          stream.row++;
          
          if (stream.row >= 0 && stream.row < rows && stream.col >= 0 && stream.col < cols) {
            grid[stream.row][stream.col] = {
              char: CHARS[Math.floor(Math.random() * CHARS.length)],
              age: 0,
              baselineOpacity: BASELINE_OPACITY_MIN + Math.random() * (BASELINE_OPACITY_MAX - BASELINE_OPACITY_MIN)
            };
          }
          
          if (stream.row > rows + 5) {
            const getUnfilledColumns = (): number[] => {
              const unfilled = [];
              for (let i = 0; i < cols; i++) {
                if (!filledColumns.has(i)) {
                  unfilled.push(i);
                }
              }
              return unfilled;
            };
            
            const unfilled = getUnfilledColumns();
            if (unfilled.length > 0) {
              stream.col = unfilled[Math.floor(Math.random() * unfilled.length)];
            } else {
              stream.col = Math.floor(Math.random() * cols);
            }
            filledColumns.add(stream.col);
            
            stream.row = Math.floor(Math.random() * (STREAM_RESET_DELAY_MAX - STREAM_RESET_DELAY_MIN) + STREAM_RESET_DELAY_MIN);
          }
        }
      }

      ctx.font = `${FONT_SIZE}px monospace`;
      ctx.textBaseline = "top";
      
      for (let row = 0; row < rows && row < grid.length; row++) {
        for (let col = 0; col < cols && col < grid[row].length; col++) {
          const cell = grid[row][col];
          if (cell) {
            let opacity: number;
            if (cell.age < MAX_AGE_BRIGHT) {
              opacity = 1;
            } else if (cell.age < MAX_AGE_FADE) {
              const fadeProgress = (cell.age - MAX_AGE_BRIGHT) / (MAX_AGE_FADE - MAX_AGE_BRIGHT);
              opacity = 1 - (fadeProgress * (1 - cell.baselineOpacity));
            } else {
              opacity = cell.baselineOpacity;
            }
            
            ctx.fillStyle = `rgba(85, 234, 212, ${opacity})`;
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
      window.removeEventListener("scroll", checkHeroVisibility);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 hidden md:block will-change-transform transition-opacity duration-700 ease-out"
      style={{ opacity: canvasOpacity }}
      aria-hidden="true"
    />
  );
}
