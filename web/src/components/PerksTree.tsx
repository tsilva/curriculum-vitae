"use client";

import { useEffect, useState } from "react";
import { cvData } from "@/lib/cv-data";
import type { PerkNode, PerksTreeData } from "@/types/cv";

function getInitialNode(perksTree: PerksTreeData): PerkNode | null {
  if (!Array.isArray(perksTree.nodes) || perksTree.nodes.length === 0) {
    return null;
  }

  return [...perksTree.nodes].sort(
    (a, b) =>
      b.level - a.level ||
      b.currentValue - a.currentValue ||
      a.mobileOrder - b.mobileOrder
  )[0] ?? null;
}

function getTierLabel(level: PerkNode["level"]): string {
  if (level === 3) return "MAX";
  return `TIER ${level}`;
}

function getTierBars(level: number): string {
  return `${"█".repeat(level)}${"░".repeat(3 - level)}`;
}

function getNodeTone(level: number, selected: boolean): string {
  if (selected) {
    return "border-cyan bg-cyan/12 text-cool-white shadow-[0_0_24px_rgba(0,230,230,0.22)]";
  }

  if (level >= 3) {
    return "border-kiroshi-yellow/70 bg-kiroshi-yellow/10 text-kiroshi-yellow shadow-[0_0_18px_rgba(243,230,0,0.16)]";
  }

  if (level >= 1) {
    return "border-magenta/45 bg-magenta/8 text-cool-white hover:border-cyan/60 hover:text-cyan";
  }

  return "border-steel/25 bg-base-light/80 text-steel hover:border-cyan/40 hover:text-cool-white";
}

export function PerksTree() {
  const perksTree = cvData.perksTree;
  const initialNode =
    perksTree && Array.isArray(perksTree.nodes) && perksTree.nodes.length > 0
      ? getInitialNode(perksTree)
      : null;
  const [selectedId, setSelectedId] = useState<string | null>(initialNode?.id ?? null);

  useEffect(() => {
    if (!perksTree || !Array.isArray(perksTree.nodes) || perksTree.nodes.length === 0) {
      setSelectedId(null);
      return;
    }

    const nextInitialNode = getInitialNode(perksTree);
    setSelectedId((current) => {
      if (current && perksTree.nodes.some((node) => node.id === current)) {
        return current;
      }
      return nextInitialNode?.id ?? null;
    });
  }, [perksTree]);

  if (!perksTree || !Array.isArray(perksTree.nodes) || perksTree.nodes.length === 0) {
    return null;
  }

  const activeNode =
    perksTree.nodes.find((node) => node.id === selectedId) ??
    initialNode ??
    perksTree.nodes[0];

  if (!activeNode) {
    return null;
  }

  const sortedMobileNodes = [...perksTree.nodes].sort(
    (a, b) => a.mobileOrder - b.mobileOrder
  );
  const maxedNodes = perksTree.nodes.filter((node) => node.level === 3).length;
  const unlockedNodes = perksTree.nodes.filter((node) => !node.locked).length;
  const progressRatio = activeNode.nextThreshold
    ? Math.min(activeNode.currentValue / activeNode.nextThreshold, 1)
    : 1;

  return (
    <section id="perks" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-cyan md:text-4xl neon-glow-cyan">
            <span className="text-magenta">&gt;</span> PERKS_TREE
          </h2>
          <p className="mt-3 max-w-2xl font-[family-name:var(--font-body)] text-sm leading-relaxed text-steel md:text-base">
            A build-time skill graph generated from the curriculum itself. Add new work to
            the CV, rerun the data pipeline, and this tree levels up on its own.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 font-[family-name:var(--font-mono)] text-xs md:min-w-[22rem]">
          <div className="rounded-sm border border-cyan/20 bg-surface/45 px-3 py-3">
            <div className="text-steel/70">MAXED</div>
            <div className="mt-1 text-lg text-cyan">{maxedNodes}</div>
          </div>
          <div className="rounded-sm border border-cyan/20 bg-surface/45 px-3 py-3">
            <div className="text-steel/70">UNLOCKED</div>
            <div className="mt-1 text-lg text-cyan">{unlockedNodes}</div>
          </div>
          <div className="rounded-sm border border-cyan/20 bg-surface/45 px-3 py-3">
            <div className="text-steel/70">TECH</div>
            <div className="mt-1 text-lg text-cyan">{perksTree.metrics.uniqueTechCount}</div>
          </div>
        </div>
      </div>

      <div className="hidden gap-8 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(21rem,0.9fr)]">
        <div className="relative min-h-[44rem] overflow-hidden rounded-sm border border-cyan/20 bg-[radial-gradient(circle_at_center,rgba(0,230,230,0.08),transparent_44%),linear-gradient(180deg,rgba(17,24,39,0.95),rgba(10,10,18,0.98))] p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,230,230,0.06)_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
          <div className="absolute inset-x-8 top-6 flex items-center justify-between font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-steel/60">
            <span>Neural mesh online</span>
            <span className="text-kiroshi-yellow/80">9 nodes linked</span>
          </div>

          <svg
            viewBox="0 0 100 100"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="perks-line" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(0,230,230,0.18)" />
                <stop offset="100%" stopColor="rgba(255,0,170,0.28)" />
              </linearGradient>
            </defs>
            {perksTree.nodes.map((node) => {
              const isActive = node.id === activeNode.id;
              return (
                <line
                  key={node.id}
                  x1="50"
                  y1="50"
                  x2={node.desktopPosition.x}
                  y2={node.desktopPosition.y}
                  stroke={isActive ? "rgba(0,230,230,0.88)" : "url(#perks-line)"}
                  strokeWidth={isActive ? "0.55" : "0.24"}
                  strokeDasharray={node.locked ? "1.1 1.4" : undefined}
                />
              );
            })}
          </svg>

          <div className="absolute left-1/2 top-1/2 flex h-48 w-48 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-cyan/45 bg-base/90 shadow-[0_0_40px_rgba(0,230,230,0.16)]">
            <div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.28em] text-steel/70">
              Core profile
            </div>
            <div className="mt-3 font-[family-name:var(--font-display)] text-center text-2xl font-bold text-cool-white">
              TIAGO
              <br />
              SILVA
            </div>
            <div className="mt-3 text-center font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-cyan">
              {perksTree.metrics.careerYearsSpan} year span
            </div>
            <div className="mt-4 flex gap-6 font-[family-name:var(--font-mono)] text-[10px] text-steel/75">
              <span>{perksTree.metrics.projectCount} projects</span>
              <span>{perksTree.metrics.ossRepoCount} repos</span>
            </div>
          </div>

          {perksTree.nodes.map((node) => {
            const isSelected = node.id === activeNode.id;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelectedId(node.id)}
                aria-pressed={isSelected}
                className={`absolute flex w-40 -translate-x-1/2 -translate-y-1/2 flex-col gap-2 rounded-sm border px-4 py-3 text-left transition-all duration-200 ${getNodeTone(node.level, isSelected)}`}
                style={{
                  left: `${node.desktopPosition.x}%`,
                  top: `${node.desktopPosition.y}%`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-steel/70">
                      {node.category}
                    </div>
                    <div className="mt-1 font-[family-name:var(--font-display)] text-sm leading-tight">
                      {node.label}
                    </div>
                  </div>
                  <span className="font-[family-name:var(--font-mono)] text-[11px] text-cyan">
                    {getTierLabel(node.level)}
                  </span>
                </div>
                <div className="font-[family-name:var(--font-mono)] text-[11px]">
                  {getTierBars(node.level)}
                </div>
                <div className="font-[family-name:var(--font-mono)] text-[11px] text-steel/80">
                  {node.currentValue} {node.metricLabel}
                </div>
              </button>
            );
          })}
        </div>

        <aside className="rounded-sm border border-cyan/20 bg-surface/45 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-magenta">
                Selected perk
              </div>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-cool-white">
                {activeNode.label}
              </h3>
            </div>
            <div className="rounded-sm border border-cyan/25 bg-base/70 px-3 py-2 font-[family-name:var(--font-mono)] text-right text-xs">
              <div className="text-steel/60">{activeNode.category}</div>
              <div className="mt-1 text-cyan">{getTierLabel(activeNode.level)}</div>
            </div>
          </div>

          <p className="mt-4 font-[family-name:var(--font-body)] text-sm leading-relaxed text-steel">
            {activeNode.description}
          </p>

          <div className="mt-6 rounded-sm border border-cyan/15 bg-base/55 p-4">
            <div className="flex items-center justify-between font-[family-name:var(--font-mono)] text-xs">
              <span className="text-steel/70">Progress</span>
              <span className="text-cyan">
                {activeNode.currentValue} {activeNode.metricLabel}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-cyan/8">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,rgba(0,230,230,0.8),rgba(255,0,170,0.75))]"
                style={{ width: `${progressRatio * 100}%` }}
              />
            </div>
            <div className="mt-3 font-[family-name:var(--font-mono)] text-[11px] text-steel/75">
              {activeNode.nextThreshold
                ? `Next unlock at ${activeNode.nextThreshold} ${activeNode.metricLabel}`
                : "Tree branch fully maxed."}
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-steel/70">
                Evidence
              </div>
              <div className="mt-3 space-y-2">
                {activeNode.evidenceProjects.length > 0 ? (
                  activeNode.evidenceProjects.map((project) => (
                    <div
                      key={project.id}
                      className="rounded-sm border border-cyan/15 bg-base/45 px-3 py-3 font-[family-name:var(--font-body)] text-sm text-cool-white"
                    >
                      <div>{project.title}</div>
                      <div className="mt-1 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-steel/70">
                        {project.start}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-sm border border-dashed border-cyan/15 bg-base/35 px-3 py-3 font-[family-name:var(--font-body)] text-sm text-steel">
                    This branch is sourced from the GitHub inventory rather than CV project entries.
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-steel/70">
                Signature stack
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {activeNode.highlightTechs.length > 0 ? (
                  activeNode.highlightTechs.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-cyan/25 bg-cyan/8 px-3 py-1 font-[family-name:var(--font-mono)] text-[11px] text-cyan"
                    >
                      {tech}
                    </span>
                  ))
                ) : (
                  <span className="font-[family-name:var(--font-mono)] text-[11px] text-steel/70">
                    No stack highlights yet.
                  </span>
                )}
              </div>
            </div>

            {activeNode.supportingSignals.length > 0 && (
              <div>
                <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-steel/70">
                  Public signal
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeNode.supportingSignals.map((signal) => (
                    <span
                      key={signal}
                      className="rounded-full border border-magenta/25 bg-magenta/10 px-3 py-1 font-[family-name:var(--font-mono)] text-[11px] text-magenta"
                    >
                      {signal}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="space-y-4 lg:hidden">
        {sortedMobileNodes.map((node) => {
          const isSelected = node.id === activeNode.id;
          const mobileProgressRatio = node.nextThreshold
            ? Math.min(node.currentValue / node.nextThreshold, 1)
            : 1;

          return (
            <div
              key={node.id}
              className={`relative overflow-hidden rounded-sm border bg-surface/45 ${getNodeTone(node.level, isSelected)}`}
            >
              <div className="absolute bottom-0 left-4 top-0 w-px bg-cyan/15" />
              <button
                type="button"
                onClick={() => setSelectedId(node.id)}
                aria-expanded={isSelected}
                className="relative flex w-full items-start justify-between gap-4 px-6 py-5 text-left"
              >
                <div className="pl-4">
                  <div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-steel/70">
                    {node.category}
                  </div>
                  <div className="mt-2 font-[family-name:var(--font-display)] text-lg text-cool-white">
                    {node.label}
                  </div>
                  <div className="mt-2 font-[family-name:var(--font-mono)] text-[11px] text-steel/75">
                    {node.currentValue} {node.metricLabel}
                  </div>
                </div>
                <div className="shrink-0 font-[family-name:var(--font-mono)] text-xs text-cyan">
                  {getTierBars(node.level)}
                </div>
              </button>

              {isSelected && (
                <div className="border-t border-cyan/10 px-6 pb-5 pl-10">
                  <p className="pt-4 font-[family-name:var(--font-body)] text-sm leading-relaxed text-steel">
                    {node.description}
                  </p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-cyan/8">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,rgba(0,230,230,0.8),rgba(255,0,170,0.75))]"
                      style={{ width: `${mobileProgressRatio * 100}%` }}
                    />
                  </div>
                  <div className="mt-2 font-[family-name:var(--font-mono)] text-[11px] text-steel/75">
                    {node.nextThreshold
                      ? `Next unlock at ${node.nextThreshold} ${node.metricLabel}`
                      : "Tree branch fully maxed."}
                  </div>

                  {node.evidenceProjects.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {node.evidenceProjects.map((project) => (
                        <div
                          key={project.id}
                          className="rounded-sm border border-cyan/15 bg-base/45 px-3 py-2 font-[family-name:var(--font-body)] text-sm text-cool-white"
                        >
                          {project.title}
                        </div>
                      ))}
                    </div>
                  )}

                  {node.highlightTechs.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {node.highlightTechs.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-cyan/25 bg-cyan/8 px-3 py-1 font-[family-name:var(--font-mono)] text-[11px] text-cyan"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {node.supportingSignals.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {node.supportingSignals.map((signal) => (
                        <span
                          key={signal}
                          className="rounded-full border border-magenta/25 bg-magenta/10 px-3 py-1 font-[family-name:var(--font-mono)] text-[11px] text-magenta"
                        >
                          {signal}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
