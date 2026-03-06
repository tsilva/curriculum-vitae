"use client";

import { useMemo } from "react";
import cvData from "@/data/cv-data.json";

interface TechnologyStat {
  name: string;
  count: number;
  percentage: number;
}

export function TechnologyStats() {
  const stats = useMemo(() => {
    const technologyCounts: Record<string, number> = {};

    cvData.projects_db.forEach((project) => {
      if (project.technologies && project.technologies.length > 0) {
        project.technologies.forEach((tech: string) => {
          const normalizedTech = tech.trim();
          if (normalizedTech) {
            technologyCounts[normalizedTech] =
              (technologyCounts[normalizedTech] || 0) + 1;
          }
        });
      }
    });

    const sortedTechnologies = Object.entries(technologyCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / cvData.projects_db.length) * 100),
      }));

    const totalMentions = sortedTechnologies.reduce(
      (sum, tech) => sum + tech.count,
      0
    );

    return {
      totalProjects: cvData.projects_db.length,
      uniqueTechnologies: sortedTechnologies.length,
      totalMentions,
      technologies: sortedTechnologies,
    };
  }, []);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 cyber-gradient-text">
            Technology Statistics
          </h2>
          <p className="text-cyan-300/70 max-w-2xl mx-auto">
            Technologies used across {stats.totalProjects} projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard
            label="Total Projects"
            value={stats.totalProjects}
            icon="🚀"
          />
          <StatCard
            label="Unique Technologies"
            value={stats.uniqueTechnologies}
            icon="⚡"
          />
          <StatCard
            label="Technology Mentions"
            value={stats.totalMentions}
            icon="📊"
          />
        </div>

        <div className="cyber-card p-6">
          <h3 className="text-xl font-bold mb-6 cyber-gradient-text">
            Technology Frequency
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {stats.technologies.map((tech) => (
              <div
                key={tech.name}
                className="flex items-center gap-4 p-3 rounded bg-cyan-900/20 border border-cyan-800/30"
              >
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-cyan-100">{tech.name}</span>
                    <span className="text-sm text-cyan-400">
                      {tech.count} projects ({tech.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-cyan-900/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 transition-all duration-500"
                      style={{ width: `${tech.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="cyber-card p-6 text-center">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-3xl font-bold cyber-gradient-text mb-1">{value}</div>
      <div className="text-sm text-cyan-300/70 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
