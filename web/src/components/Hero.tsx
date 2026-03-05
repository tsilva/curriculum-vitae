"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { GlitchText } from "./GlitchText";
import { CountUp } from "./CountUp";

const socialLinks = [
  {
    label: "GitHub",
    url: "https://github.com/tsilva",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  {
    label: "X",
    url: "https://x.com/tiagosilva",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/engtiagosilva/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "HuggingFace",
    url: "https://huggingface.co/tsilva",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm2.5-3c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm4 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm-5.5 4c1.38 0 2.5-1.12 2.5-2.5h-5c0 1.38 1.12 2.5 2.5 2.5zm3 0c1.38 0 2.5-1.12 2.5-2.5h-5c0 1.38 1.12 2.5 2.5 2.5z"/>
        <path d="M8 7c-1.1 0-2 .9-2 2v1c0 1.1.9 2 2 2s2-.9 2-2V9c0-1.1-.9-2-2-2zm8 0c-1.1 0-2 .9-2 2v1c0 1.1.9 2 2 2s2-.9 2-2V9c0-1.1-.9-2-2-2z"/>
        <path d="M6.5 10.5c-.28 0-.5-.22-.5-.5V8c0-1.66 1.34-3 3-3h6c1.66 0 3 1.34 3 3v2c0 .28-.22.5-.5.5s-.5-.22-.5-.5V8c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2c0 .28-.22.5-.5.5z"/>
        <path d="M4 14c-.55 0-1-.45-1-1 0-2.21 1.79-4 4-4h10c2.21 0 4 1.79 4 4 0 .55-.45 1-1 1s-1-.45-1-1c0-1.65-1.35-3-3-3H7c-1.65 0-3 1.35-3 3 0 .55-.45 1-1 1z"/>
        <ellipse cx="12" cy="16" rx="3" ry="1.5"/>
      </svg>
    ),
  },
  {
    label: "YouTube",
    url: "https://www.youtube.com/@tiagoshiruba",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: "Portfolio",
    url: "https://photos.app.goo.gl/QQkFqqXiNBvnRaZm6",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
      </svg>
    ),
  },
  {
    label: "Podcast",
    url: "https://drive.google.com/file/d/1mI_kDTRpEhqn0xzEg1lQjEodMI0tZ_hB/view?usp=sharing",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zm-1 14.93A5.002 5.002 0 0 1 7 11h2a3 3 0 0 0 6 0h2a5.002 5.002 0 0 1-4 4.93V19h3v2H8v-2h3v-3.07z" />
      </svg>
    ),
  },
];

// HUD data that updates randomly
const THREAT_LEVELS = ["NONE", "LOW", "MONITOR"];
const ICE_STATUS = ["CLEAN", "SCANNING", "VERIFIED"];
const STOCK_LEVELS = ["FULL", "98%", "NOMINAL"];

export function Hero() {
  const [isHovered, setIsHovered] = useState(false);
  const [threat, setThreat] = useState("NONE");
  const [ice, setIce] = useState("CLEAN");
  const [stock, setStock] = useState("FULL");
  const [hp, setHp] = useState(8);

  // Randomize HUD data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setThreat(THREAT_LEVELS[Math.floor(Math.random() * THREAT_LEVELS.length)]);
      }
      if (Math.random() > 0.6) {
        setIce(ICE_STATUS[Math.floor(Math.random() * ICE_STATUS.length)]);
      }
      if (Math.random() > 0.5) {
        setStock(STOCK_LEVELS[Math.floor(Math.random() * STOCK_LEVELS.length)]);
      }
      setHp(Math.floor(Math.random() * 3) + 6); // 6-8 HP blocks
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
    >
      {/* Kiroshi scan frame — red corner brackets with interactive pulse */}
      <div 
        className={`absolute inset-8 md:inset-16 pointer-events-none transition-all duration-500 ${isHovered ? 'scale-[1.02]' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top-left */}
        <div className={`absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-kiroshi-red/60 transition-all duration-300 ${isHovered ? 'border-kiroshi-red shadow-[0_0_15px_rgba(232,0,63,0.4)]' : ''}`} />
        {/* Top-right */}
        <div className={`absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-kiroshi-red/60 transition-all duration-300 ${isHovered ? 'border-kiroshi-red shadow-[0_0_15px_rgba(232,0,63,0.4)]' : ''}`} />
        {/* Bottom-left */}
        <div className={`absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-kiroshi-red/60 transition-all duration-300 ${isHovered ? 'border-kiroshi-red shadow-[0_0_15px_rgba(232,0,63,0.4)]' : ''}`} />
        {/* Bottom-right */}
        <div className={`absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-kiroshi-red/60 transition-all duration-300 ${isHovered ? 'border-kiroshi-red shadow-[0_0_15px_rgba(232,0,63,0.4)]' : ''}`} />

        {/* Small inner tick marks */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-3 border-l border-r border-t border-kiroshi-red/40" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-3 border-l border-r border-b border-kiroshi-red/40" />

        {/* Top HUD readout */}
        <div className="absolute -top-0.5 left-20 right-20 flex items-center gap-2">
          <div className="h-px flex-1 bg-kiroshi-red/20" />
          <span className={`font-[family-name:var(--font-display)] text-[11px] font-bold text-kiroshi-red tracking-[0.25em] neon-glow-kiroshi-red transition-all duration-300 ${isHovered ? 'text-kiroshi-yellow' : ''}`}>KIROSHI OPTICS MK.4</span>
          <div className="h-px flex-1 bg-kiroshi-red/20" />
        </div>

        {/* Bottom HUD readout */}
        <div className="absolute -bottom-0.5 left-20 right-20 flex items-center gap-2">
          <div className="h-px flex-1 bg-kiroshi-red/20" />
          <span className="font-[family-name:var(--font-mono)] text-[11px] text-kiroshi-yellow/70 tracking-[0.2em]">SIG ■■■■■■□ — 98.2%</span>
          <div className="h-px flex-1 bg-kiroshi-red/20" />
        </div>
      </div>

      {/* Left-side HUD data panel - reduced prominence */}
      <div className="absolute left-4 md:left-20 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2 font-[family-name:var(--font-mono)] text-[11px] opacity-60">
        <span className="text-kiroshi-red/60">■ SCAN ACTIVE</span>
        <span className="text-steel">ID: <span className="text-kiroshi-yellow/80">TSV-1984</span></span>
        <span className="text-steel">CLASS: <span className="text-cyan/80">ENGINEER</span></span>
        <span className="text-steel">THREAT: <span className={`transition-colors duration-300 ${threat === 'NONE' ? 'text-kiroshi-yellow/80' : threat === 'LOW' ? 'text-kiroshi-yellow' : 'text-kiroshi-red'}`}>{threat}</span></span>
        <span className="text-kiroshi-red/40 mt-1">────────</span>
        <span className="text-steel">AFFIL: <span className="text-cyan/80">CORPO</span></span>
        <span className="text-steel">NET: <span className="text-cyan/80">{process.env.GIT_COMMIT_HASH?.toUpperCase() || "LINKED"}</span></span>
        <span className="text-steel">ICE: <span className={`transition-colors duration-300 ${ice === 'CLEAN' ? 'text-kiroshi-yellow/80' : 'text-cyan'}`}>{ice}</span></span>
      </div>

      {/* Right-side HUD data panel - reduced prominence */}
      <div className="absolute right-4 md:right-20 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2 font-[family-name:var(--font-mono)] text-[11px] text-right opacity-60">
        <span className="text-kiroshi-red/60">REC ●</span>
        <span className="text-steel">LAT: <span className="text-kiroshi-yellow/80">38.7223</span></span>
        <span className="text-steel">LON: <span className="text-kiroshi-yellow/80">-9.1393</span></span>
        <span className="text-kiroshi-red/40 mt-1">────────</span>
        <span className="text-steel">STK: <span className="text-cyan/80">{stock}</span></span>
        <span className="text-steel">HP: <span className="text-cyan/80">{Array(hp).fill('█').join('')}</span><span className="text-kiroshi-red/40">{Array(8-hp).fill('░').join('')}</span></span>
      </div>

      {/* Scan status line */}
      <div className="font-[family-name:var(--font-display)] text-[11px] font-bold text-kiroshi-red mb-2 tracking-[0.3em] neon-glow-kiroshi-red">
        ◈ SCAN COMPLETE ◈
      </div>

      {/* Classification tag — yellow like the game */}
      <div className="font-[family-name:var(--font-mono)] text-[11px] text-kiroshi-yellow/80 mb-4 border border-kiroshi-yellow/30 px-4 py-1 tracking-[0.2em]">
        SUBJECT IDENTIFIED
      </div>

      {/* Avatar — Kiroshi scan target */}
      <div 
        className="relative mb-4 cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-kiroshi-red/60 shadow-[0_0_20px_rgba(232,0,63,0.3)] transition-all duration-300 ${isHovered ? 'border-kiroshi-red shadow-[0_0_30px_rgba(232,0,63,0.5)]' : ''}`}>
          <Image
            src="/avatar.webp"
            alt="Tiago Silva"
            width={144}
            height={144}
            className="w-full h-full object-cover"
            priority
          />
          {/* Scan lines overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(232,0,63,0.06) 2px, rgba(232,0,63,0.06) 4px)",
            }}
          />
          {/* Sweeping scan bar */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden will-change-transform">
            <div className={`absolute left-0 right-0 h-8 animate-[scan_3s_ease-in-out_infinite] bg-gradient-to-b from-transparent via-kiroshi-red/15 to-transparent transition-all duration-300 ${isHovered ? 'via-kiroshi-red/30' : ''}`} style={{ willChange: 'transform' }} />
          </div>
        </div>
        {/* Kiroshi scan ring */}
        <div className={`absolute inset-0 rounded-full border transition-all duration-300 ${isHovered ? 'border-kiroshi-red border-2 shadow-[0_0_20px_rgba(232,0,63,0.5)] animate-pulse' : 'border-kiroshi-red/30'}`} />
      </div>

      {/* Name — Orbitron display font for better readability */}
      <h1
        className="font-[family-name:var(--font-display)] text-[clamp(2rem,6vw,4rem)] font-bold text-cool-white leading-tight text-center neon-glow-kiroshi-red"
      >
        <GlitchText text="TIAGO SILVA" />
      </h1>

      {/* Role — cyan like secondary data in the HUD with enhanced glow */}
      <div className="flex items-center gap-3 mt-3">
        <span className="text-kiroshi-red text-base">◆</span>
        <p className="font-[family-name:var(--font-display)] text-base md:text-lg text-cyan tracking-[0.25em] uppercase neon-glow-cyan">
          Fullstack Software Engineer
        </p>
        <span className="text-kiroshi-red text-base">◆</span>
      </div>

      {/* Tagline */}
      <p className="font-[family-name:var(--font-mono)] text-[10px] md:text-xs text-kiroshi-yellow/80 mt-2 tracking-[0.15em] uppercase">
        backend + frontend + mobile + ai. idea in → product out.
      </p>

      {/* Red separator line */}
      <div className="flex items-center gap-3 mt-6 mb-8 w-48">
        <div className="h-px flex-1 bg-kiroshi-red/40" />
        <span className="text-kiroshi-red text-xs">◇</span>
        <div className="h-px flex-1 bg-kiroshi-red/40" />
      </div>

      {/* Stats — yellow numbers like Kiroshi data readouts */}
      <div className="flex gap-10 md:gap-16">
        <CountUp end={20} suffix="+" label="Years" />
        <CountUp end={60} suffix="+" label="Projects" />
        <CountUp end={100} suffix="M+" label="Users" />
      </div>

      {/* Social links */}
      <div className="flex gap-4 mt-12">
        {socialLinks.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative group text-steel hover:text-cyan transition-all duration-300 p-2 rounded-sm hover:shadow-[0_0_20px_rgba(0,230,230,0.3),0_0_40px_rgba(0,230,230,0.15)] hover:scale-110 hover:bg-cyan/5 border border-transparent hover:border-cyan/30"
            data-tooltip={link.label}
          >
            {link.icon}
            {/* Cyberpunk Tooltip */}
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-surface border border-cyan/50 text-cyan text-[11px] font-[family-name:var(--font-mono)] tracking-[0.15em] uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-[0_0_15px_rgba(0,230,230,0.4)] z-50">
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-surface border-r border-b border-cyan/50 rotate-45" />
              {link.label}
            </span>
          </a>
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center gap-1">
        <span className="font-[family-name:var(--font-mono)] text-sm text-kiroshi-red tracking-widest neon-glow-kiroshi-red">SCROLL</span>
        <span className="text-kiroshi-red text-lg neon-glow-kiroshi-red">▼</span>
      </div>
    </section>
  );
}
