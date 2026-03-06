import * as fs from "fs";
import * as path from "path";

interface Link {
  label: string;
  url: string;
}

interface GalleryMedia {
  filename: string;
  type: 'image' | 'video';
  path: string;
  thumbnail?: string;
}

interface Project {
  id: string;
  emoji: string;
  title: string;
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

interface Employer {
  id: string;
  emoji: string;
  name: string;
  url?: string;
  duration: string;
  role: string;
  location: string;
  description: string;
  projectIds: string[];
  links: Link[];
}

interface Education {
  id: string;
  emoji: string;
  institution: string;
  url?: string;
  duration: string;
  degree: string;
  grade: string;
  location: string;
  description: string;
  links: Link[];
}

interface CVData {
  tldr: string;
  employers: Employer[];
  education: Education[];
  projects_db: Project[];
  misc: Link[];
}

const ROOT = path.resolve(__dirname, "..");
const README_PATH = path.join(ROOT, "README.md");
const OUTPUT_PATH = path.join(ROOT, "web", "src", "data", "cv-data.json");
const MANIFEST_PATH = path.join(ROOT, "galleries-manifest.json");

// Gallery configuration
const GALLERY_MODE = process.env.GALLERY_MODE || 'r2';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://curriculum-vitae-r2.tsilva.eu';

function getGalleryBaseUrl(): string {
  if (GALLERY_MODE === 'r2') {
    return `${R2_PUBLIC_URL}/galleries`;
  }
  return '/galleries';
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')  // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '')  // Remove combining marks
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function extractHref(html: string): string | undefined {
  const match = html.match(/href="([^"]+)"/);
  return match ? match[1] : undefined;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

function extractEmoji(text: string): string {
  // Match emoji at the start, including compound emojis
  const emojiRegex =
    /^([\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{200D}\u{FE0F}\u{FE0E}\u{20E3}\u{E0020}-\u{E007F}\u{E0100}-\u{E01EF}♣⚡]+)/u;
  const match = text.match(emojiRegex);
  return match ? match[1].trim() : "";
}

function parseH2Heading(
  line: string
): { emoji: string; title: string; url?: string } | null {
  if (!line.startsWith("## ")) return null;
  const content = line.slice(3).trim();

  // Extract emoji
  const emoji = extractEmoji(content);
  const afterEmoji = content.slice(emoji.length).trim();

  // Check if there's a link
  const linkMatch = afterEmoji.match(
    /<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/
  );
  if (linkMatch) {
    return { emoji, title: stripHtml(linkMatch[2]).trim(), url: linkMatch[1] };
  }

  return { emoji, title: afterEmoji, url: undefined };
}

function extractMetadataField(
  lines: string[],
  startIdx: number,
  field: string
): string | undefined {
  for (let i = startIdx; i < Math.min(startIdx + 20, lines.length); i++) {
    const line = lines[i];
    // Match both "**Field:**" and "**Field**:" formats (colon inside or outside bold)
    const patternInside = `**${field}:**`;
    const patternOutside = `**${field}**:`;
    if (line.includes(patternInside)) {
      return line.split(patternInside)[1].trim();
    }
    if (line.includes(patternOutside)) {
      return line.split(patternOutside)[1].trim();
    }
  }
  return undefined;
}

function extractLinks(lines: string[], startIdx: number, endIdx: number): Link[] {
  const links: Link[] = [];
  let inCommentBlock = false;
  for (let i = startIdx; i < endIdx; i++) {
    const line = lines[i].trim();
    if (line.includes("<!--")) {
      inCommentBlock = true;
      continue;
    }
    if (line.includes("-->")) {
      inCommentBlock = false;
      continue;
    }
    if (inCommentBlock) continue;

    // Match markdown links: - [label](url) or - <a href="url">label</a>
    const mdLink = line.match(/^-\s+\[([^\]]+)\]\(([^)]+)\)/);
    if (mdLink) {
      links.push({ label: mdLink[1], url: mdLink[2] });
      continue;
    }
    const htmlLink = line.match(
      /^-\s+<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/
    );
    if (htmlLink) {
      links.push({ label: stripHtml(htmlLink[2]), url: htmlLink[1] });
      continue;
    }
    // Also match links with text before the anchor
    const inlineLink = line.match(
      /^-\s+(.+?):\s*(?:\n\s*)?$/
    );
    // Match sub-items like "  - <a href=..."
    const subLink = line.match(
      /^\s+-\s+<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/
    );
    if (subLink) {
      links.push({ label: stripHtml(subLink[2]), url: subLink[1] });
    }
  }
  return links;
}

function extractNarrative(
  lines: string[],
  startIdx: number,
  endIdx: number
): string {
  const narrativeLines: string[] = [];
  let pastMetadata = false;
  let inCommentBlock = false;

  for (let i = startIdx; i < endIdx; i++) {
    const line = lines[i];

    if (line.trim().includes("<!--")) {
      inCommentBlock = true;
      continue;
    }
    if (line.trim().includes("-->")) {
      inCommentBlock = false;
      continue;
    }
    if (inCommentBlock) continue;

    // Skip metadata lines (both "**Field:**" and "**Field**:" formats)
    if (
      line.startsWith("- **TLDR:**") ||
      line.startsWith("- **TLDR**:") ||
      line.startsWith("- **Start:**") ||
      line.startsWith("- **Start**:") ||
      line.startsWith("- **Client:**") ||
      line.startsWith("- **Client**:") ||
      line.startsWith("- **Location:**") ||
      line.startsWith("- **Location**:") ||
      line.startsWith("- **Role:**") ||
      line.startsWith("- **Role**:") ||
      line.startsWith("- **Team:**") ||
      line.startsWith("- **Team**:") ||
      line.startsWith("- **Platform") ||
      line.startsWith("- **Technologies:**") ||
      line.startsWith("- **Technologies**:")
    ) {
      continue;
    }

    // Skip heading line
    if (line.startsWith("## ")) continue;

    // Skip link lines at the end (- <a href or - [)
    if (
      line.trim().match(/^-\s+<a\s+href=/) ||
      line.trim().match(/^-\s+\[/) ||
      line.trim().match(/^\s+-\s+<a\s+href=/)
    ) {
      continue;
    }

    // Skip separators
    if (line.trim() === "---") continue;

    // Once we see a non-empty non-metadata line, we're in narrative territory
    if (line.trim() !== "" && !pastMetadata) {
      pastMetadata = true;
    }

    if (pastMetadata) {
      narrativeLines.push(line);
    }
  }

  // Trim trailing empty lines
  while (
    narrativeLines.length > 0 &&
    narrativeLines[narrativeLines.length - 1].trim() === ""
  ) {
    narrativeLines.pop();
  }

  return narrativeLines.join("\n").trim();
}

function findProjectIds(description: string, projectTitles: string[]): string[] {
  const ids: string[] = [];
  for (const title of projectTitles) {
    const slug = slugify(title);
    // Check if the description references this project via anchor link
    const anchorPattern = `#-${slug}`;
    const simplePattern = `[${title}]`;
    if (
      description.toLowerCase().includes(anchorPattern) ||
      description.includes(simplePattern)
    ) {
      ids.push(slug);
    }
  }
  return ids;
}

function scanGalleries(): Map<string, GalleryMedia[]> {
  const galleriesPath = path.join(ROOT, "galleries");
  const galleryMap = new Map<string, GalleryMedia[]>();
  const baseUrl = getGalleryBaseUrl();
  
  // Check if we should use manifest file (R2 mode without local galleries)
  const hasLocalGalleries = fs.existsSync(galleriesPath);
  
  if (!hasLocalGalleries && GALLERY_MODE === 'r2' && fs.existsSync(MANIFEST_PATH)) {
    // Use manifest file for R2 mode when galleries folder doesn't exist
    console.log("Using galleries manifest for R2 mode (no local galleries folder)");
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    
    for (const [projectId, files] of Object.entries(manifest)) {
      const media: GalleryMedia[] = [];
      for (const filename of files as string[]) {
        const ext = path.extname(filename).toLowerCase();
        const isImage = ['.webp', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'].includes(ext);
        const isVideo = ['.mp4', '.mov', '.mkv', '.avi', '.webm'].includes(ext);
        
        if (isImage || isVideo) {
          // For videos, check if there's a corresponding thumbnail
          const thumbFilename = path.basename(filename, ext) + '.thumb.webp';
          const hasThumbnail = (files as string[]).includes(thumbFilename);
          
          media.push({
            filename,
            type: isImage ? 'image' : 'video',
            path: `${baseUrl}/${projectId}/${filename}`,
            thumbnail: isVideo && hasThumbnail ? `${baseUrl}/${projectId}/${thumbFilename}` : undefined
          });
        }
      }
      
      // Sort by filename for consistent ordering
      media.sort((a, b) => a.filename.localeCompare(b.filename));
      
      if (media.length > 0) {
        galleryMap.set(projectId, media);
      }
    }
    
    console.log(`Loaded ${galleryMap.size} galleries from manifest (mode: ${GALLERY_MODE})`);
    return galleryMap;
  }
  
  if (!hasLocalGalleries) {
    console.log("Galleries folder not found, skipping gallery data");
    return galleryMap;
  }
  
  const entries = fs.readdirSync(galleriesPath, { withFileTypes: true });
  const manifest: Record<string, string[]> = {};
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("_")) continue; // Skip metadata folders
    
    const projectFolder = path.join(galleriesPath, entry.name);
    const files = fs.readdirSync(projectFolder);
    const media: GalleryMedia[] = [];
    const mediaFiles: string[] = [];
    
    for (const filename of files) {
      const ext = path.extname(filename).toLowerCase();
      const isImage = ['.webp', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'].includes(ext);
      const isVideo = ['.mp4', '.mov', '.mkv', '.avi', '.webm'].includes(ext);
      
      // Skip thumbnail files (they are associated with videos)
      if (filename.endsWith('.thumb.webp')) continue;
      
      if (isImage || isVideo) {
        // For videos, check if there's a corresponding thumbnail
        const thumbFilename = path.basename(filename, ext) + '.thumb.webp';
        const hasThumbnail = files.includes(thumbFilename);
        
        media.push({
          filename,
          type: isImage ? 'image' : 'video',
          path: `${baseUrl}/${entry.name}/${filename}`,
          thumbnail: isVideo && hasThumbnail ? `${baseUrl}/${entry.name}/${thumbFilename}` : undefined
        });
        mediaFiles.push(filename);
      }
    }
    
    // Sort by filename for consistent ordering
    media.sort((a, b) => a.filename.localeCompare(b.filename));
    mediaFiles.sort();
    
    if (media.length > 0) {
      galleryMap.set(entry.name, media);
      manifest[entry.name] = mediaFiles;
    }
  }
  
  // Update manifest file if running locally
  if (GALLERY_MODE === 'r2' && Object.keys(manifest).length > 0) {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log(`Updated galleries-manifest.json with ${Object.keys(manifest).length} projects`);
  }
  
  console.log(`Scanned ${galleryMap.size} galleries with media (mode: ${GALLERY_MODE})`);
  return galleryMap;
}

function parse(): CVData {
  const content = fs.readFileSync(README_PATH, "utf-8");
  const lines = content.split("\n");
  
  // Scan galleries folder for media
  const galleryMap = scanGalleries();

  // Find section boundaries
  let tldrEnd = 0;
  let experienceStart = 0;
  let educationStart = 0;
  let projectsStart = 0;
  let miscStart = 0;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("# 🧑‍💻 Experience")) experienceStart = i;
    if (lines[i].startsWith("# 🎓 Education")) educationStart = i;
    if (lines[i].startsWith("# 🚀 Projects")) projectsStart = i;
    if (lines[i].startsWith("## 🔗 Misc")) miscStart = i;
  }

  // Extract TLDR (everything from start to Experience section)
  const tldrLines: string[] = [];
  for (let i = 0; i < experienceStart; i++) {
    if (lines[i].startsWith("# TLDR")) continue;
    tldrLines.push(lines[i]);
  }
  const tldr = tldrLines.join("\n").trim();

  // Find all H2 boundaries
  const h2Indices: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) {
      h2Indices.push(i);
    }
  }

  function getNextH2OrEnd(idx: number): number {
    for (const h2 of h2Indices) {
      if (h2 > idx) return h2;
    }
    return lines.length;
  }

  // Parse Employers
  const employers: Employer[] = [];
  for (let i = experienceStart + 1; i < educationStart; i++) {
    const heading = parseH2Heading(lines[i]);
    if (!heading) continue;

    const endIdx = getNextH2OrEnd(i);
    const duration = extractMetadataField(lines, i, "Duration") || "";
    const role = extractMetadataField(lines, i, "Role") || "";
    const location = extractMetadataField(lines, i, "Location") || "";

    // Get description (non-metadata, non-link text)
    const descLines: string[] = [];
    let pastMeta = false;
    for (let j = i + 1; j < endIdx; j++) {
      const line = lines[j].trim();
      if (line.startsWith("- **")) continue;
      if (line === "") {
        if (pastMeta) descLines.push("");
        continue;
      }
      pastMeta = true;
      // Stop at link lists or project lists starting with "- **["
      if (
        line.match(/^-\s+<a\s+href=/) ||
        line.match(/^-\s+\[/) ||
        line.match(/^\s+-\s+<a\s+href=/)
      ) {
        continue;
      }
      // Stop at sub-lists that reference projects (- **[Project Name]...)
      if (line.match(/^-\s+\*\*\[/)) {
        continue;
      }
      descLines.push(lines[j]);
    }

    // Trim trailing empty
    while (descLines.length && descLines[descLines.length - 1].trim() === "")
      descLines.pop();

    const links = extractLinks(lines, i, endIdx);

    employers.push({
      id: slugify(heading.title),
      emoji: heading.emoji,
      name: heading.title,
      url: heading.url,
      duration,
      role,
      location,
      description: descLines.join("\n").trim(),
      projectIds: [], // Will be filled after projects are parsed
      links,
    });
  }

  // Parse Education
  const education: Education[] = [];
  for (let i = educationStart + 1; i < projectsStart; i++) {
    const heading = parseH2Heading(lines[i]);
    if (!heading) continue;

    const endIdx = getNextH2OrEnd(i);
    const duration = extractMetadataField(lines, i, "Duration") || "";
    const degree = extractMetadataField(lines, i, "Degree") || "";
    const grade = extractMetadataField(lines, i, "Grade") || "";
    const location = extractMetadataField(lines, i, "Location") || "";

    const descLines: string[] = [];
    let pastMeta = false;
    for (let j = i + 1; j < endIdx; j++) {
      const line = lines[j].trim();
      if (line.startsWith("- **")) continue;
      if (line === "") {
        if (pastMeta) descLines.push("");
        continue;
      }
      if (
        line.match(/^-\s+<a\s+href=/) ||
        line.match(/^-\s+\[/) ||
        line.match(/^\s+-\s+<a\s+href=/)
      ) {
        continue;
      }
      pastMeta = true;
      descLines.push(lines[j]);
    }
    while (descLines.length && descLines[descLines.length - 1].trim() === "")
      descLines.pop();

    const links = extractLinks(lines, i, endIdx);

    education.push({
      id: slugify(heading.title),
      emoji: heading.emoji,
      institution: heading.title,
      url: heading.url,
      duration,
      degree,
      grade,
      location,
      description: descLines.join("\n").trim(),
      links,
    });
  }

  // Parse Projects
  const projects_db: Project[] = [];
  const endSection = miscStart > 0 ? miscStart : lines.length;
  for (let i = projectsStart + 1; i < endSection; i++) {
    const heading = parseH2Heading(lines[i]);
    if (!heading) continue;

    const endIdx = getNextH2OrEnd(i);
    const tldrField = extractMetadataField(lines, i, "TLDR") || "";
    const start = extractMetadataField(lines, i, "Start") || "";
    const client = extractMetadataField(lines, i, "Client") || "";
    const location = extractMetadataField(lines, i, "Location");
    const role = extractMetadataField(lines, i, "Role");
    const team = extractMetadataField(lines, i, "Team");
    const platforms =
      extractMetadataField(lines, i, "Platforms") ||
      extractMetadataField(lines, i, "Platform");

    // Technologies
    let technologies: string[] = [];
    const techLine =
      extractMetadataField(lines, i, "Technologies");
    if (techLine) {
      technologies = techLine.split(",").map((t) => t.trim()).filter(Boolean);
    }

    const narrative = extractNarrative(lines, i, endIdx);
    const links = extractLinks(lines, i, endIdx);
    const projectId = slugify(heading.title);
    const gallery = galleryMap.get(projectId);

    projects_db.push({
      id: projectId,
      emoji: heading.emoji,
      title: heading.title,
      tldr: tldrField,
      start,
      client,
      location,
      role,
      team,
      platforms,
      technologies,
      narrative,
      links,
      gallery,
    });
  }

  // Map employer to project IDs based on client matching
  for (const employer of employers) {
    const relatedProjects = projects_db.filter((p) => {
      const clientLower = p.client.toLowerCase();
      const employerLower = employer.name.toLowerCase();
      return (
        clientLower.includes(employerLower) ||
        clientLower === employerLower ||
        // Handle "through" relationships
        clientLower.includes(`through ${employerLower}`)
      );
    });
    employer.projectIds = relatedProjects.map((p) => p.id);
  }

  // Parse Misc
  const misc: Link[] = [];
  if (miscStart > 0) {
    const miscEnd = getNextH2OrEnd(miscStart);
    for (let i = miscStart + 1; i < miscEnd; i++) {
      const line = lines[i].trim();
      const htmlLink = line.match(/<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/);
      if (htmlLink) {
        misc.push({ label: stripHtml(htmlLink[2]), url: htmlLink[1] });
      }
    }
  }

  return { tldr, employers, education, projects_db, misc };
}

const data = parse();

// Generate content hash for cache busting
const crypto = require('crypto');
const contentHash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex').slice(0, 12);

// Write static file to src/data (used for build-time imports)
const dataDir = path.join(ROOT, "web", "src", "data");
fs.mkdirSync(dataDir, { recursive: true });
const staticPath = path.join(dataDir, "cv-data.json");
fs.writeFileSync(staticPath, JSON.stringify(data, null, 2));

console.log(
  `Parsed: ${data.employers.length} employers, ${data.education.length} education entries, ${data.projects_db.length} projects`
);
console.log(`Projects with galleries: ${data.projects_db.filter(p => p.gallery && p.gallery.length > 0).length}`);
console.log(`Generated: cv-data.json`);
