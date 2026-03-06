import type { CVData } from '@/types/cv';

// Import JSON directly as a module - resolved at build time
import cvDataJson from '@/data/cv-data.json';

export const cvData: CVData = cvDataJson as CVData;

export function getCVData(): CVData {
  return cvData;
}

export function getAllTechnologies(): { name: string; count: number }[] {
  const techMap: Record<string, number> = {};
  for (const project of cvData.projects_db) {
    for (const tech of project.technologies) {
      techMap[tech] = (techMap[tech] || 0) + 1;
    }
  }
  return Object.entries(techMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
