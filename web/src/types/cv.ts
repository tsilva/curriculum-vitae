export interface Link {
  label: string;
  url: string;
  suffix?: string;
}

export interface LinkGroup {
  group: string;
  links: Link[];
}

export type LinkEntry = Link | LinkGroup;

export interface GalleryMedia {
  filename: string;
  type: 'image' | 'video';
  path: string;
  thumbnail?: string;
  projectId?: string;
  projectTitle?: string;
  projectEmoji?: string;
}

export interface GitHubRepo {
  id: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string | null;
  updatedAt: string;
  createdAt: string;
  url: string;
  homepageUrl?: string | null;
}

export interface Project {
  id: string;
  emoji: string;
  title: string;
  headingUrl?: string;
  tldr: string;
  start: string;
  client: string;
  location?: string;
  role?: string;
  team?: string;
  platforms?: string;
  technologies: string[];
  narrative: string;
  links: Link[];
  gallery?: GalleryMedia[];
}

export interface Employer {
  id: string;
  emoji: string;
  name: string;
  url?: string;
  duration: string;
  role: string;
  location: string;
  description: string;
  projectIds: string[];
  links: LinkEntry[];
}

export interface Education {
  id: string;
  emoji: string;
  institution: string;
  url?: string;
  duration: string;
  degree: string;
  grade: string;
  location: string;
  description: string;
  links: LinkEntry[];
}

export interface OSSEntry {
  name: string;
  url: string;
  description: string;
  archived?: boolean;
}

export interface MiscEntry {
  label: string;
  links: Link[];
}

export interface CVData {
  tldr: string;
  employers: Employer[];
  education: Education[];
  projects_db: Project[];
  oss?: OSSEntry[];
  misc: MiscEntry[];
}
