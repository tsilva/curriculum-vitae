import * as fs from "fs";
import * as path from "path";
import { CVData, Project } from "../web/src/types/cv";

const ROOT = path.resolve(__dirname, "..");
const DATA_PATH = path.join(ROOT, "web", "src", "data", "cv-data.json");

interface TechnologyCount {
  [key: string]: number;
}

interface TechnologyStats {
  totalProjects: number;
  totalTechnologies: number;
  uniqueTechnologies: number;
  technologyCounts: TechnologyCount;
  sortedTechnologies: [string, number][];
}

/**
 * Count technologies from CV data
 */
function countTechnologies(data: CVData): TechnologyStats {
  const technologyCounts: TechnologyCount = {};

  // Count technologies from all projects
  data.projects_db.forEach((project: Project) => {
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

  // Sort alphabetically by technology name
  const sortedTechnologies = Object.entries(technologyCounts).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return {
    totalProjects: data.projects_db.length,
    totalTechnologies: sortedTechnologies.reduce(
      (sum, [, count]) => sum + count,
      0
    ),
    uniqueTechnologies: sortedTechnologies.length,
    technologyCounts,
    sortedTechnologies,
  };
}

/**
 * Generate statistics report
 */
function generateReport(stats: TechnologyStats): string {
  const lines: string[] = [
    "=== Technology Statistics ===",
    "",
    `Total Projects: ${stats.totalProjects}`,
    `Unique Technologies: ${stats.uniqueTechnologies}`,
    `Total Technology Mentions: ${stats.totalTechnologies}`,
    "",
    "Technology Counts (alphabetically sorted):",
    "",
  ];

  stats.sortedTechnologies.forEach(([tech, count]) => {
    lines.push(`  ${tech}: ${count}`);
  });

  return lines.join("\n");
}

/**
 * Main function - can be run directly or imported
 */
export function analyzeTechnologies(): TechnologyStats {
  if (!fs.existsSync(DATA_PATH)) {
    throw new Error(
      `CV data not found at ${DATA_PATH}. Run 'npm run parse' first.`
    );
  }

  const data: CVData = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  return countTechnologies(data);
}

/**
 * CLI entry point
 */
if (require.main === module) {
  try {
    const stats = analyzeTechnologies();
    console.log(generateReport(stats));

    // Also output JSON for programmatic use
    console.log("\n=== JSON Output ===");
    console.log(JSON.stringify(stats.technologyCounts, null, 2));
  } catch (error) {
    console.error("Error analyzing technologies:", error);
    process.exit(1);
  }
}
