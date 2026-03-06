// Assembles web/src/data/cv-data.json from data/**/*.md (frontmatter) + data/misc.yaml + galleries
import * as fs from "fs";
import * as path from "path";
import { createRequire } from "module";

const webRequire = createRequire(path.join(path.resolve(__dirname, ".."), "web", "package.json"));
const matter = webRequire("gray-matter");
const jsYaml = webRequire("js-yaml");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const OUTPUT_PATH = path.join(ROOT, "web", "src", "data", "cv-data.json");
const MANIFEST_PATH = path.join(ROOT, "galleries-manifest.json");
const GITHUB_DATA_PATH = path.join(ROOT, "web", "src", "data", "github-data.json");

const GALLERY_MODE = process.env.GALLERY_MODE || "r2";
const R2_PUBLIC_URL =
  process.env.R2_PUBLIC_URL || "https://curriculum-vitae-r2.tsilva.eu";

interface GalleryMedia {
  filename: string;
  type: "image" | "video";
  path: string;
  thumbnail?: string;
}

function getGalleryBaseUrl(): string {
  return GALLERY_MODE === "r2" ? `${R2_PUBLIC_URL}/galleries` : "/galleries";
}

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
    });
}

const MONTH_MAP: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

// Parse "2023" or "2023-06" into a comparable number (year * 100 + month)
function parseStartField(start: string): number {
  if (start.includes("-")) {
    const [y, m] = start.split("-");
    return parseInt(y) * 100 + parseInt(m);
  }
  return parseInt(start) * 100;
}

// Parse start date from duration like "Sep 2016 - May 2024" or "2003 - 2006 · 3 years" or "2016 · Less than a year"
function parseDurationStart(duration: string): number {
  const startPart = duration.split(" - ")[0].split(" · ")[0].trim();
  const tokens = startPart.split(" ");
  if (tokens.length === 2 && MONTH_MAP[tokens[0]]) {
    return parseInt(tokens[1]) * 100 + MONTH_MAP[tokens[0]];
  }
  return parseInt(tokens[0]) * 100;
}

function calculateActivityScore(updatedAt: string, stars: number): number {
  const now = new Date();
  const updated = new Date(updatedAt);
  const daysSinceUpdate = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.exp(-daysSinceUpdate / 30);
  const significanceScore = Math.log1p(stars);
  return recencyScore * 10 + significanceScore;
}

function loadGithubActivityMap(): Map<string, number> {
  const map = new Map<string, number>();
  if (!fs.existsSync(GITHUB_DATA_PATH)) return map;
  const repos: { name: string; updatedAt: string; stars: number }[] =
    JSON.parse(fs.readFileSync(GITHUB_DATA_PATH, "utf-8"));
  for (const repo of repos) {
    map.set(repo.name, calculateActivityScore(repo.updatedAt, repo.stars));
  }
  return map;
}

function readYaml(filename: string): any[] {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  return jsYaml.load(fs.readFileSync(filePath, "utf-8")) || [];
}

function scanGalleries(): Map<string, GalleryMedia[]> {
  const galleriesPath = path.join(ROOT, "galleries");
  const galleryMap = new Map<string, GalleryMedia[]>();
  const baseUrl = getGalleryBaseUrl();
  const hasLocal = fs.existsSync(galleriesPath);

  if (!hasLocal && GALLERY_MODE === "r2" && fs.existsSync(MANIFEST_PATH)) {
    console.log("Using galleries manifest for R2 mode");
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
    for (const [projectId, files] of Object.entries(manifest)) {
      const media: GalleryMedia[] = [];
      for (const filename of files as string[]) {
        const ext = path.extname(filename).toLowerCase();
        const isImage = [".webp", ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg"].includes(ext);
        const isVideo = [".mp4", ".mov", ".mkv", ".avi", ".webm"].includes(ext);
        if (isImage || isVideo) {
          const thumbFilename = path.basename(filename, ext) + ".thumb.webp";
          const hasThumbnail = (files as string[]).includes(thumbFilename);
          media.push({
            filename,
            type: isImage ? "image" : "video",
            path: `${baseUrl}/${projectId}/${filename}`,
            thumbnail: isVideo && hasThumbnail ? `${baseUrl}/${projectId}/${thumbFilename}` : undefined,
          });
        }
      }
      media.sort((a, b) => a.filename.localeCompare(b.filename));
      if (media.length > 0) galleryMap.set(projectId, media);
    }
    console.log(`Loaded ${galleryMap.size} galleries from manifest`);
    return galleryMap;
  }

  if (!hasLocal) {
    console.log("Galleries folder not found, skipping gallery data");
    return galleryMap;
  }

  const entries = fs.readdirSync(galleriesPath, { withFileTypes: true });
  const manifest: Record<string, string[]> = {};

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
    const projectFolder = path.join(galleriesPath, entry.name);
    const files = fs.readdirSync(projectFolder);
    const media: GalleryMedia[] = [];
    const mediaFiles: string[] = [];

    for (const filename of files) {
      const ext = path.extname(filename).toLowerCase();
      const isImage = [".webp", ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg"].includes(ext);
      const isVideo = [".mp4", ".mov", ".mkv", ".avi", ".webm"].includes(ext);
      if (filename.endsWith(".thumb.webp")) continue;
      if (isImage || isVideo) {
        const thumbFilename = path.basename(filename, ext) + ".thumb.webp";
        const hasThumbnail = files.includes(thumbFilename);
        media.push({
          filename,
          type: isImage ? "image" : "video",
          path: `${baseUrl}/${entry.name}/${filename}`,
          thumbnail: isVideo && hasThumbnail ? `${baseUrl}/${entry.name}/${thumbFilename}` : undefined,
        });
        mediaFiles.push(filename);
      }
    }
    media.sort((a, b) => a.filename.localeCompare(b.filename));
    mediaFiles.sort();
    if (media.length > 0) {
      galleryMap.set(entry.name, media);
      manifest[entry.name] = mediaFiles;
    }
  }

  if (GALLERY_MODE === "r2" && Object.keys(manifest).length > 0) {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log(`Updated galleries-manifest.json with ${Object.keys(manifest).length} projects`);
  }
  console.log(`Scanned ${galleryMap.size} galleries (mode: ${GALLERY_MODE})`);
  return galleryMap;
}

function main() {
  const galleryMap = scanGalleries();

  // Read TLDR content
  const tldrPath = path.join(DATA_DIR, "tldr.md");
  const tldr = fs.existsSync(tldrPath) ? fs.readFileSync(tldrPath, "utf-8").trimEnd() : "";

  // Read employers — sorted by start date descending (newest first)
  const employers = readFrontmatterFiles(path.join(DATA_DIR, "employers"))
    .sort((a, b) => parseDurationStart(b.data.duration) - parseDurationStart(a.data.duration))
    .map(({ id, data, content }) => ({ id, ...data, description: content }));

  // Read education — sorted by start year descending, tie-break by institution
  const education = readFrontmatterFiles(path.join(DATA_DIR, "education"))
    .sort((a, b) => {
      const diff = parseDurationStart(b.data.duration) - parseDurationStart(a.data.duration);
      return diff !== 0 ? diff : a.data.institution.localeCompare(b.data.institution);
    })
    .map(({ id, data, content }) => ({ id, ...data, description: content }));

  // Read projects — sorted by start descending, tie-break by title
  const projects_db = readFrontmatterFiles(path.join(DATA_DIR, "projects"))
    .sort((a, b) => {
      const diff = parseStartField(b.data.start) - parseStartField(a.data.start);
      return diff !== 0 ? diff : a.data.title.localeCompare(b.data.title);
    })
    .map(({ id, data, content }) => {
      const gallery = galleryMap.get(id);
      return {
        id,
        ...data,
        narrative: content,
        ...(gallery ? { gallery } : {}),
      };
    });

  // Read OSS — sorted by GitHub activity score descending, tie-break by name
  const activityMap = loadGithubActivityMap();
  const oss = readFrontmatterFiles(path.join(DATA_DIR, "oss"))
    .sort((a, b) => {
      const scoreA = activityMap.get(a.data.name) ?? -1;
      const scoreB = activityMap.get(b.data.name) ?? -1;
      const diff = scoreB - scoreA;
      return diff !== 0 ? diff : a.data.name.localeCompare(b.data.name);
    })
    .map(({ data, content }) => ({ ...data, ...(content ? { narrative: content } : {}) }));

  // Read misc from YAML
  const misc = readYaml("misc.yaml");

  const assembled = { tldr, employers, education, projects_db, misc };

  const dataDir = path.dirname(OUTPUT_PATH);
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(assembled, null, 2));

  console.log(
    `Assembled: ${employers.length} employers, ${education.length} education, ${projects_db.length} projects`
  );
  console.log(
    `Projects with galleries: ${projects_db.filter((p: any) => p.gallery && p.gallery.length > 0).length}`
  );
  console.log(`Generated: cv-data.json`);
}

main();
