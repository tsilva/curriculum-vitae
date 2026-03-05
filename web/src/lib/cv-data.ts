import type { CVData } from '@/types/cv';
import * as fs from 'fs';
import * as path from 'path';

// Try multiple possible paths for the JSON file
const possiblePaths = [
  path.join(process.cwd(), 'src', 'data', 'cv-data.json'),
  path.join(process.cwd(), 'data', 'cv-data.json'),
  path.join(__dirname, '..', 'data', 'cv-data.json'),
  path.join(__dirname, '..', '..', 'data', 'cv-data.json'),
];

let jsonContent: string | null = null;
let usedPath: string | null = null;

for (const jsonPath of possiblePaths) {
  if (fs.existsSync(jsonPath)) {
    jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    usedPath = jsonPath;
    break;
  }
}

if (!jsonContent) {
  throw new Error(`Could not find cv-data.json. Tried: ${possiblePaths.join(', ')}. CWD: ${process.cwd()}, __dirname: ${__dirname}`);
}

const cvDataJson = JSON.parse(jsonContent);

export const cvData: CVData = cvDataJson as CVData;

export function getCVData(): CVData {
  return cvData;
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
