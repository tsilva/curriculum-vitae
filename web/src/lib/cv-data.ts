import type { CVData } from '@/types/cv';

// Import JSON directly as a module - resolved at build time
import cvDataJson from '@/data/cv-data.json';

export const cvData: CVData = cvDataJson as CVData;
