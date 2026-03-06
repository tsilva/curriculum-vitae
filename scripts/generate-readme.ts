// Generates README.md from data/**/*.md (frontmatter) + data/misc.yaml
import * as fs from "fs";
import * as path from "path";
import { createRequire } from "module";

const webRequire = createRequire(path.join(path.resolve(__dirname, ".."), "web", "package.json"));
const matter = webRequire("gray-matter");
const jsYaml = webRequire("js-yaml");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const OUTPUT_PATH = path.join(ROOT, "README.md");

function readFrontmatterFiles(dir: string): { id: string; data: any; content: string }[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf-8");
      const parsed = matter(raw);
      return {
        id: path.basename(f, ".md"),
        data: parsed.data,
        content: parsed.content.trim(),
      };
    })
    .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
}

function readYaml(filename: string): any[] {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  return jsYaml.load(fs.readFileSync(filePath, "utf-8")) || [];
}

function formatHeading(emoji: string, title: string, url?: string): string {
  const titlePart = url
    ? `<a href="${url}" target="_blank">${title}</a>`
    : title;
  return `## ${emoji} ${titlePart}`;
}

function formatLinkEntry(entry: any): string {
  if (entry.group) {
    const subLinks = entry.links
      .map((l: any) => `  - <a href="${l.url}" target="_blank">${l.label}</a>`)
      .join("\n");
    return `- ${entry.group}\n${subLinks}`;
  }
  const suffix = entry.suffix ? ` ${entry.suffix}` : "";
  return `- <a href="${entry.url}" target="_blank">${entry.label}</a>${suffix}`;
}

function formatLinks(links: any[]): string {
  return links.map(formatLinkEntry).join("\n");
}

function generateTLDR(): string {
  const tldrPath = path.join(DATA_DIR, "tldr.md");
  const content = fs.existsSync(tldrPath) ? fs.readFileSync(tldrPath, "utf-8").trimEnd() : "";
  return `# TLDR\n\n${content}`;
}

function generateExperience(): string {
  const employers = readFrontmatterFiles(path.join(DATA_DIR, "employers"));
  const sections = employers.map(({ data, content }) => {
    const heading = formatHeading(data.emoji, data.name, data.url);
    const meta = [
      `- **Duration:** ${data.duration}`,
      `- **Role:** ${data.role}`,
      `- **Location:** ${data.location}`,
    ].join("\n");
    const links = data.links && data.links.length > 0 ? formatLinks(data.links) : "";

    const parts = [heading, "", meta, "", content];
    if (links) parts.push("", links);
    return parts.join("\n");
  });

  return `# 🧑‍💻 Experience\n\n${sections.join("\n\n")}`;
}

function generateEducation(): string {
  const education = readFrontmatterFiles(path.join(DATA_DIR, "education"));
  const sections = education.map(({ data, content }) => {
    const heading = formatHeading(data.emoji, data.institution, data.url);
    const meta = [
      `- **Duration:** ${data.duration}`,
      `- **Degree:** ${data.degree}`,
      `- **Grade:** ${data.grade}`,
      `- **Location:** ${data.location}`,
    ].join("\n");
    const links = data.links && data.links.length > 0 ? formatLinks(data.links) : "";

    const parts = [heading, "", meta, "", content];
    if (links) parts.push("", links);
    return parts.join("\n");
  });

  return `# 🎓 Education\n\n${sections.join("\n\n")}`;
}

function generateProjects(): string {
  const projects = readFrontmatterFiles(path.join(DATA_DIR, "projects"));
  const sections = projects.map(({ data, content }) => {
    const heading = formatHeading(data.emoji, data.title, data.headingUrl);

    const metaLines: string[] = [];
    metaLines.push(`- **TLDR:** ${data.tldr}`);
    metaLines.push(`- **Start:** ${data.start}`);
    metaLines.push(`- **Client:** ${data.client}`);
    if (data.location) metaLines.push(`- **Location:** ${data.location}`);
    if (data.role) metaLines.push(`- **Role:** ${data.role}`);
    if (data.team) metaLines.push(`- **Team:** ${data.team}`);
    if (data.platforms) metaLines.push(`- **Platforms:** ${data.platforms}`);
    if (data.technologies && data.technologies.length > 0) {
      metaLines.push(`- **Technologies:** ${data.technologies.join(", ")}`);
    }

    const links = data.links && data.links.length > 0 ? formatLinks(data.links) : "";

    const parts = [heading, "", metaLines.join("\n")];
    if (content) parts.push("", content);
    if (links) parts.push("", links);
    return parts.join("\n");
  });

  return `# 🚀 Projects\n\n${sections.join("\n\n---\n\n")}`;
}

function generateOSS(): string {
  const oss = readFrontmatterFiles(path.join(DATA_DIR, "oss"));
  const lines = oss.map(({ data }) => {
    const archived = data.archived ? " **[Archived]**" : "";
    return `- [${data.name}](${data.url}) - ${data.description}${archived}`;
  });

  return `---\n\n## 🔓 OSS\n\nOpen source projects and contributions.\n\n${lines.join("\n")}`;
}

function generateMisc(): string {
  const misc = readYaml("misc.yaml");
  const sections = misc.map((entry: any) => {
    const links = entry.links
      .map(
        (l: any) => `  - <a href="${l.url}" target="_blank">${l.label}</a>`
      )
      .join("\n");
    return `- **${entry.label}**:\n${links}`;
  });

  return `## 🔗 Misc\n\n${sections.join("\n\n")}`;
}

function main() {
  const parts = [
    generateTLDR(),
    generateExperience(),
    generateEducation(),
    generateProjects(),
    generateOSS(),
    generateMisc(),
    "## License\n\nMIT",
  ];

  const readme = parts.join("\n\n") + "\n";
  fs.writeFileSync(OUTPUT_PATH, readme);

  console.log(`Generated README.md (${readme.split("\n").length} lines)`);
}

main();
