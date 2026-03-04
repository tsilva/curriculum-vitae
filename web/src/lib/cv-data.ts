import cvData from "@/data/cv-data.json";
import type { CVData } from "@/types/cv";

export function getCVData(): CVData {
  return cvData as CVData;
}

export function getAllTechnologies(): { name: string; count: number }[] {
  const techMap: Record<string, number> = {};
  for (const project of cvData.projects) {
    for (const tech of project.technologies) {
      techMap[tech] = (techMap[tech] || 0) + 1;
    }
  }
  return Object.entries(techMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
