// Generates README.md from data/cv-data.json + data/content/*.md
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const CONTENT_DIR = path.join(DATA_DIR, "content");
const OUTPUT_PATH = path.join(ROOT, "README.md");

function readContent(subdir: string, id: string): string {
  const filePath = path.join(CONTENT_DIR, subdir, `${id}.md`);
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf-8").trimEnd();
}

function formatHeading(emoji: string, title: string, url?: string): string {
  const titlePart = url
    ? `<a href="${url}" target="_blank">${title}</a>`
    : title;
  return `## ${emoji} ${titlePart}`;
}

function formatLinkEntry(entry: any): string {
  if (entry.group) {
    // Grouped links: parent label with indented sub-links
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
  const content = readContent("", "tldr");
  return `# TLDR\n\n${content}`;
}

function generateExperience(employers: any[]): string {
  const sections = employers.map((emp) => {
    const heading = formatHeading(emp.emoji, emp.name, emp.url);
    const meta = [
      `- **Duration:** ${emp.duration}`,
      `- **Role:** ${emp.role}`,
      `- **Location:** ${emp.location}`,
    ].join("\n");
    const description = readContent("employers", emp.id);
    const links = emp.links.length > 0 ? formatLinks(emp.links) : "";

    const parts = [heading, "", meta, "", description];
    if (links) parts.push("", links);
    return parts.join("\n");
  });

  return `# 🧑‍💻 Experience\n\n${sections.join("\n\n")}`;
}

function generateEducation(education: any[]): string {
  const sections = education.map((edu) => {
    const heading = formatHeading(edu.emoji, edu.institution, edu.url);
    const meta = [
      `- **Duration:** ${edu.duration}`,
      `- **Degree:** ${edu.degree}`,
      `- **Grade:** ${edu.grade}`,
      `- **Location:** ${edu.location}`,
    ].join("\n");
    const description = readContent("education", edu.id);
    const links = edu.links.length > 0 ? formatLinks(edu.links) : "";

    const parts = [heading, "", meta, "", description];
    if (links) parts.push("", links);
    return parts.join("\n");
  });

  return `# 🎓 Education\n\n${sections.join("\n\n")}`;
}

function generateProjects(projects: any[]): string {
  const sections = projects.map((proj) => {
    const heading = formatHeading(proj.emoji, proj.title, proj.headingUrl);

    const metaLines: string[] = [];
    metaLines.push(`- **TLDR:** ${proj.tldr}`);
    metaLines.push(`- **Start:** ${proj.start}`);
    metaLines.push(`- **Client:** ${proj.client}`);
    if (proj.location) metaLines.push(`- **Location:** ${proj.location}`);
    if (proj.role) metaLines.push(`- **Role:** ${proj.role}`);
    if (proj.team) metaLines.push(`- **Team:** ${proj.team}`);
    if (proj.platforms) metaLines.push(`- **Platforms:** ${proj.platforms}`);
    if (proj.technologies.length > 0) {
      metaLines.push(`- **Technologies:** ${proj.technologies.join(", ")}`);
    }

    const narrative = readContent("projects", proj.id);
    const links = proj.links.length > 0 ? formatLinks(proj.links) : "";

    const parts = [heading, "", metaLines.join("\n")];
    if (narrative) parts.push("", narrative);
    if (links) parts.push("", links);
    return parts.join("\n");
  });

  return `# 🚀 Projects\n\n${sections.join("\n\n---\n\n")}`;
}

function generateOSS(oss: any[]): string {
  const lines = oss.map((entry: any) => {
    const archived = entry.archived ? " **[Archived]**" : "";
    return `- [${entry.name}](${entry.url}) - ${entry.description}${archived}`;
  });

  return `---\n\n## 🔓 OSS\n\nOpen source projects and contributions.\n\n${lines.join("\n")}`;
}

function generateMisc(misc: any[]): string {
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
  const data = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, "cv-data.json"), "utf-8")
  );

  const parts = [
    generateTLDR(),
    generateExperience(data.employers),
    generateEducation(data.education),
    generateProjects(data.projects_db),
    generateOSS(data.oss),
    generateMisc(data.misc),
    "## License\n\nMIT",
  ];

  const readme = parts.join("\n\n") + "\n";
  fs.writeFileSync(OUTPUT_PATH, readme);

  console.log(`Generated README.md (${readme.split("\n").length} lines)`);
}

main();
