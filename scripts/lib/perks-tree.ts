import { parseStartField } from "./data-utils";

interface ProjectRecord {
  id: string;
  title: string;
  start: string;
  role?: string;
  team?: string;
  platforms?: string;
  technologies?: string[];
  narrative?: string;
}

interface GithubRepoRecord {
  name: string;
  language?: string | null;
  stars?: number;
}

interface PerkMetrics {
  careerYearsSpan: number;
  projectCount: number;
  uniqueTechCount: number;
  webProjectCount: number;
  backendProjectCount: number;
  mobileProjectCount: number;
  leadershipProjectCount: number;
  aiProjectCount: number;
  ossRepoCount: number;
}

interface PerkEvidenceProject {
  id: string;
  title: string;
  start: string;
}

interface DerivedPerkNode {
  id: string;
  label: string;
  category: string;
  description: string;
  level: 0 | 1 | 2 | 3;
  currentValue: number;
  nextThreshold: number | null;
  metricLabel: string;
  evidenceProjectIds: string[];
  evidenceProjects: PerkEvidenceProject[];
  highlightTechs: string[];
  supportingSignals: string[];
  locked: boolean;
  desktopPosition: {
    x: number;
    y: number;
  };
  mobileOrder: number;
}

export interface DerivedPerksTree {
  metrics: PerkMetrics;
  nodes: DerivedPerkNode[];
}

type MetricKey = keyof PerkMetrics;

type PerkDefinition = {
  id: string;
  label: string;
  category: string;
  description: string;
  metricKey: MetricKey;
  metricLabel: string;
  thresholds: [number, number, number];
  desktopPosition: {
    x: number;
    y: number;
  };
  mobileOrder: number;
  matchesProject?: (project: ProjectRecord) => boolean;
  supportingSignals?: (
    projects: ProjectRecord[],
    githubRepos: GithubRepoRecord[]
  ) => string[];
  highlightTechs?: (
    projects: ProjectRecord[],
    githubRepos: GithubRepoRecord[]
  ) => string[];
};

const FRONTEND_TECHS = new Set([
  "react",
  "angularjs",
  "javascript",
  "typescript",
  "css",
  "html",
  "jquery",
  "redux",
  "redux saga",
]);

const BACKEND_TECHS = new Set([
  "python",
  "php",
  "mongodb",
  "mysql",
  "postgresql",
  "flask",
  "appier",
  "colony framework",
  "parse",
  "c#",
  "node.js",
  "redis",
  "java",
]);

const MOBILE_TECHS = new Set([
  "ios",
  "objective-c",
  "swift",
  "android",
  "react native",
  "xcode",
]);

const AI_KEYWORDS = [
  "openai",
  "llm",
  "gpt",
  "rag",
  "prompt",
  "pytorch",
  "tensorflow",
  "neural",
  "deep learning",
  "machine learning",
];

const PERK_DEFINITIONS: PerkDefinition[] = [
  {
    id: "chrome-veteran",
    label: "Chrome Veteran",
    category: "Legacy",
    description: "Survived multiple software eras and kept shipping through every stack mutation.",
    metricKey: "careerYearsSpan",
    metricLabel: "career years",
    thresholds: [5, 10, 20],
    desktopPosition: { x: 50, y: 11 },
    mobileOrder: 1,
    matchesProject: () => true,
  },
  {
    id: "shipstorm",
    label: "Shipstorm",
    category: "Delivery",
    description: "A release engine tuned by repetition, variety, and a long project wake.",
    metricKey: "projectCount",
    metricLabel: "projects shipped",
    thresholds: [10, 25, 50],
    desktopPosition: { x: 80, y: 21 },
    mobileOrder: 2,
    matchesProject: () => true,
  },
  {
    id: "polyglot-stack",
    label: "Polyglot Stack",
    category: "Breadth",
    description: "Crossed enough tools, languages, and paradigms to treat stacks as interchangeable loadouts.",
    metricKey: "uniqueTechCount",
    metricLabel: "unique technologies",
    thresholds: [10, 20, 35],
    desktopPosition: { x: 16, y: 22 },
    mobileOrder: 3,
    matchesProject: () => true,
  },
  {
    id: "web-runner",
    label: "Web Runner",
    category: "Frontend",
    description: "UI systems, browser runtime, and product surfaces tuned for fast iteration.",
    metricKey: "webProjectCount",
    metricLabel: "web-facing projects",
    thresholds: [5, 12, 20],
    desktopPosition: { x: 86, y: 49 },
    mobileOrder: 4,
    matchesProject: isWebProject,
  },
  {
    id: "backend-fortress",
    label: "Backend Fortress",
    category: "Systems",
    description: "Data flows, APIs, and platform internals hardened behind the interface layer.",
    metricKey: "backendProjectCount",
    metricLabel: "backend-heavy projects",
    thresholds: [5, 15, 30],
    desktopPosition: { x: 78, y: 78 },
    mobileOrder: 5,
    matchesProject: isBackendProject,
  },
  {
    id: "mobile-merc",
    label: "Mobile Merc",
    category: "Mobility",
    description: "Native and device-first work spanning iPhone, iOS, and adjacent mobile surfaces.",
    metricKey: "mobileProjectCount",
    metricLabel: "mobile projects",
    thresholds: [5, 12, 20],
    desktopPosition: { x: 50, y: 89 },
    mobileOrder: 6,
    matchesProject: isMobileProject,
  },
  {
    id: "crew-lead",
    label: "Crew Lead",
    category: "Leadership",
    description: "Took point on delivery, coordination, and decisions that kept teams moving.",
    metricKey: "leadershipProjectCount",
    metricLabel: "leadership projects",
    thresholds: [3, 8, 15],
    desktopPosition: { x: 22, y: 78 },
    mobileOrder: 7,
    matchesProject: isLeadershipProject,
  },
  {
    id: "ai-ghost",
    label: "AI Ghost",
    category: "Intelligence",
    description: "Machine learning and LLM work woven into the stack as the field hit production speed.",
    metricKey: "aiProjectCount",
    metricLabel: "AI-adjacent projects",
    thresholds: [1, 3, 6],
    desktopPosition: { x: 20, y: 49 },
    mobileOrder: 8,
    matchesProject: isAIProject,
  },
  {
    id: "oss-uplink",
    label: "OSS Uplink",
    category: "Network",
    description: "A public code trail that keeps growing outside client work and formal roles.",
    metricKey: "ossRepoCount",
    metricLabel: "public repositories",
    thresholds: [5, 15, 30],
    desktopPosition: { x: 50, y: 29 },
    mobileOrder: 9,
    supportingSignals: (_projects, githubRepos) =>
      [...githubRepos]
        .sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0) || a.name.localeCompare(b.name))
        .slice(0, 3)
        .map((repo) => repo.name),
    highlightTechs: (_projects, githubRepos) => {
      const languageCounts = new Map<string, number>();
      for (const repo of githubRepos) {
        if (!repo.language) continue;
        languageCounts.set(
          repo.language,
          (languageCounts.get(repo.language) ?? 0) + 1
        );
      }
      return [...languageCounts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 4)
        .map(([language]) => language);
    },
  },
];

export function derivePerksTree(
  projects: ProjectRecord[],
  githubRepos: GithubRepoRecord[]
): DerivedPerksTree {
  const sortedProjects = [...projects].sort(
    (a, b) =>
      parseStartField(b.start) - parseStartField(a.start) ||
      a.title.localeCompare(b.title)
  );

  const metrics: PerkMetrics = {
    careerYearsSpan: getCareerYearsSpan(projects),
    projectCount: projects.length,
    uniqueTechCount: getUniqueTechCount(projects),
    webProjectCount: projects.filter(isWebProject).length,
    backendProjectCount: projects.filter(isBackendProject).length,
    mobileProjectCount: projects.filter(isMobileProject).length,
    leadershipProjectCount: projects.filter(isLeadershipProject).length,
    aiProjectCount: projects.filter(isAIProject).length,
    ossRepoCount: githubRepos.length,
  };

  const nodes = PERK_DEFINITIONS.map((definition) => {
    const currentValue = metrics[definition.metricKey];
    const level = definition.thresholds.filter(
      (threshold) => currentValue >= threshold
    ).length as 0 | 1 | 2 | 3;
    const nextThreshold =
      definition.thresholds.find((threshold) => currentValue < threshold) ?? null;
    const matchedProjects = definition.matchesProject
      ? sortedProjects.filter(definition.matchesProject)
      : [];
    const evidenceProjects = matchedProjects.slice(0, 3).map((project) => ({
      id: project.id,
      title: project.title,
      start: project.start,
    }));

    return {
      id: definition.id,
      label: definition.label,
      category: definition.category,
      description: definition.description,
      level,
      currentValue,
      nextThreshold,
      metricLabel: definition.metricLabel,
      evidenceProjectIds: evidenceProjects.map((project) => project.id),
      evidenceProjects,
      highlightTechs: definition.highlightTechs
        ? definition.highlightTechs(matchedProjects, githubRepos)
        : collectTopTechnologies(matchedProjects),
      supportingSignals: definition.supportingSignals
        ? definition.supportingSignals(matchedProjects, githubRepos)
        : [],
      locked: level === 0,
      desktopPosition: definition.desktopPosition,
      mobileOrder: definition.mobileOrder,
    };
  });

  validatePerksTree(nodes, projects);

  return {
    metrics,
    nodes,
  };
}

function collectTopTechnologies(projects: ProjectRecord[]): string[] {
  const techCounts = new Map<string, number>();
  for (const project of projects) {
    for (const technology of project.technologies ?? []) {
      techCounts.set(technology, (techCounts.get(technology) ?? 0) + 1);
    }
  }

  return [...techCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 4)
    .map(([technology]) => technology);
}

function getCareerYearsSpan(projects: ProjectRecord[]): number {
  const years = projects
    .map((project) => extractStartYear(project.start))
    .filter((year): year is number => year !== null);

  if (years.length === 0) return 0;
  return Math.max(...years) - Math.min(...years) + 1;
}

function getUniqueTechCount(projects: ProjectRecord[]): number {
  return new Set(
    projects.flatMap((project) => project.technologies ?? [])
  ).size;
}

function extractStartYear(start: string | undefined): number | null {
  if (!start) return null;
  const match = start.match(/\d{4}/);
  return match ? Number.parseInt(match[0], 10) : null;
}

function isWebProject(project: ProjectRecord): boolean {
  return hasPlatform(project.platforms, ["web"]) || hasTech(project, FRONTEND_TECHS);
}

function isBackendProject(project: ProjectRecord): boolean {
  return hasTech(project, BACKEND_TECHS) || includesKeyword(project.role, ["backend"]);
}

function isMobileProject(project: ProjectRecord): boolean {
  return (
    hasPlatform(project.platforms, ["ios", "iphone", "android", "apple watch", "ipad"]) ||
    hasTech(project, MOBILE_TECHS)
  );
}

function isLeadershipProject(project: ProjectRecord): boolean {
  return (
    includesKeyword(project.role, ["lead", "coordinator"]) ||
    Boolean(project.team && project.team.trim())
  );
}

function isAIProject(project: ProjectRecord): boolean {
  const haystack = [project.title, project.narrative, ...(project.technologies ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return AI_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

function hasPlatform(platforms: string | undefined, keywords: string[]): boolean {
  if (!platforms) return false;
  const normalized = platforms.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

function hasTech(project: ProjectRecord, techs: Set<string>): boolean {
  return (project.technologies ?? []).some((technology) =>
    techs.has(technology.toLowerCase())
  );
}

function includesKeyword(value: string | undefined, keywords: string[]): boolean {
  if (!value) return false;
  const normalized = value.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

function validatePerksTree(nodes: DerivedPerkNode[], projects: ProjectRecord[]): void {
  const seenIds = new Set<string>();
  const projectIds = new Set(projects.map((project) => project.id));

  for (const node of nodes) {
    if (seenIds.has(node.id)) {
      throw new Error(`Duplicate perk node id: ${node.id}`);
    }
    seenIds.add(node.id);

    if (node.level < 0 || node.level > 3) {
      throw new Error(`Invalid perk level for ${node.id}: ${node.level}`);
    }

    for (const projectId of node.evidenceProjectIds) {
      if (!projectIds.has(projectId)) {
        throw new Error(`Unknown evidence project id "${projectId}" for perk ${node.id}`);
      }
    }
  }
}
