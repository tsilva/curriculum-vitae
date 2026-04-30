// Assembles web/src/data/cv-data.json from data/**/*.md (frontmatter) + data/misc.yaml + galleries
import * as fs from "fs";
import * as path from "path";
import {
  readFrontmatterFiles,
  parseStartField,
  parseDurationStart,
  readYaml,
} from "./lib/data-utils";

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const OUTPUT_PATH = path.join(ROOT, "web", "src", "data", "cv-data.json");
const MANIFEST_PATH = path.join(ROOT, "galleries-manifest.json");
const GALLERY_ORDER_PATH = path.join(DATA_DIR, "gallery-order.yaml");

const GALLERY_MODE = process.env.GALLERY_MODE || "r2";
const R2_PUBLIC_URL =
  process.env.R2_PUBLIC_URL || "https://curriculum-vitae-r2.tsilva.eu";

const IMAGE_EXTENSIONS = [".webp", ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg"];
const VIDEO_EXTENSIONS = [".mp4", ".mov", ".mkv", ".avi", ".webm", ".m4v"];

interface GalleryMedia {
  filename: string;
  type: "image" | "video";
  path: string;
  thumbnail?: string;
}

function readGalleryOrder(): Record<string, string[]> {
  const raw = readYaml(GALLERY_ORDER_PATH);

  if (!raw || Array.isArray(raw) || typeof raw !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(raw as Record<string, unknown>)
      .filter(([, filenames]) => Array.isArray(filenames))
      .map(([projectId, filenames]) => [
        projectId,
        (filenames as unknown[]).filter((filename): filename is string => typeof filename === "string"),
      ])
  );
}

function getGalleryBaseUrl(): string {
  return GALLERY_MODE === "r2" ? `${R2_PUBLIC_URL}/galleries` : "/galleries";
}

function sortGalleryMedia(projectId: string, media: GalleryMedia[], galleryOrder: Record<string, string[]>): void {
  const orderedFilenames = galleryOrder[projectId];

  if (!orderedFilenames?.length) {
    media.sort((a, b) => a.filename.localeCompare(b.filename));
    return;
  }

  const orderIndex = new Map(orderedFilenames.map((filename, index) => [filename, index]));
  media.sort((a, b) => {
    const aIndex = orderIndex.get(a.filename);
    const bIndex = orderIndex.get(b.filename);

    if (aIndex !== undefined && bIndex !== undefined) return aIndex - bIndex;
    if (aIndex !== undefined) return -1;
    if (bIndex !== undefined) return 1;
    return a.filename.localeCompare(b.filename);
  });
}

function scanGalleries(): Map<string, GalleryMedia[]> {
  const galleriesPath = path.join(ROOT, "galleries");
  const galleryMap = new Map<string, GalleryMedia[]>();
  const galleryOrder = readGalleryOrder();
  const baseUrl = getGalleryBaseUrl();
  const hasLocal = fs.existsSync(galleriesPath);

  if (!hasLocal && GALLERY_MODE === "r2" && fs.existsSync(MANIFEST_PATH)) {
    console.log("Using galleries manifest for R2 mode");
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
    for (const [projectId, files] of Object.entries(manifest)) {
      const media: GalleryMedia[] = [];
      for (const filename of files as string[]) {
        if (filename.endsWith(".thumb.webp")) continue;
        const ext = path.extname(filename).toLowerCase();
        const isImage = IMAGE_EXTENSIONS.includes(ext);
        const isVideo = VIDEO_EXTENSIONS.includes(ext);
        if (isImage || isVideo) {
          const thumbFilename = path.basename(filename, ext) + ".thumb.webp";
          const hasThumbnail = (files as string[]).includes(thumbFilename);
          media.push({
            filename,
            type: isImage ? "image" : "video",
            path: `${baseUrl}/${projectId}/${filename}`,
            thumbnail:
              isVideo && hasThumbnail
                ? `${baseUrl}/${projectId}/${thumbFilename}`
                : undefined,
          });
        }
      }
      sortGalleryMedia(projectId, media, galleryOrder);
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
    const manifestFiles: string[] = [];

    for (const filename of files) {
      if (filename.endsWith(".thumb.webp")) {
        manifestFiles.push(filename);
        continue;
      }
      const ext = path.extname(filename).toLowerCase();
      const isImage = IMAGE_EXTENSIONS.includes(ext);
      const isVideo = VIDEO_EXTENSIONS.includes(ext);
      if (isImage || isVideo) {
        const thumbFilename = path.basename(filename, ext) + ".thumb.webp";
        const hasThumbnail = files.includes(thumbFilename);
        media.push({
          filename,
          type: isImage ? "image" : "video",
          path: `${baseUrl}/${entry.name}/${filename}`,
          thumbnail:
            isVideo && hasThumbnail
              ? `${baseUrl}/${entry.name}/${thumbFilename}`
              : undefined,
        });
        manifestFiles.push(filename);
      }
    }
    sortGalleryMedia(entry.name, media, galleryOrder);
    manifestFiles.sort();
    if (media.length > 0) {
      galleryMap.set(entry.name, media);
      manifest[entry.name] = manifestFiles;
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

  // Read misc from YAML
  const misc = readYaml(path.join(DATA_DIR, "misc.yaml"));

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
