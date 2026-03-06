// Assembles web/src/data/cv-data.json from data/cv-data.json + data/content/*.md + galleries
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const CONTENT_DIR = path.join(DATA_DIR, "content");
const OUTPUT_PATH = path.join(ROOT, "web", "src", "data", "cv-data.json");
const MANIFEST_PATH = path.join(ROOT, "galleries-manifest.json");

const GALLERY_MODE = process.env.GALLERY_MODE || "r2";
const R2_PUBLIC_URL =
  process.env.R2_PUBLIC_URL || "https://curriculum-vitae-r2.tsilva.eu";

interface Link {
  label: string;
  url: string;
}
interface GalleryMedia {
  filename: string;
  type: "image" | "video";
  path: string;
  thumbnail?: string;
}

function getGalleryBaseUrl(): string {
  return GALLERY_MODE === "r2" ? `${R2_PUBLIC_URL}/galleries` : "/galleries";
}

function readContent(subdir: string, id: string): string {
  const filePath = path.join(CONTENT_DIR, subdir, `${id}.md`);
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf-8").trimEnd();
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
  const sourceData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "cv-data.json"), "utf-8"));
  const galleryMap = scanGalleries();

  // Read TLDR content
  const tldr = readContent("", "tldr");

  // Assemble employers with descriptions
  const employers = sourceData.employers.map((emp: any) => ({
    ...emp,
    description: readContent("employers", emp.id),
  }));

  // Assemble education with descriptions
  const education = sourceData.education.map((edu: any) => ({
    ...edu,
    description: readContent("education", edu.id),
  }));

  // Assemble projects with narratives and galleries
  const projects_db = sourceData.projects_db.map((proj: any) => {
    const gallery = galleryMap.get(proj.id);
    return {
      ...proj,
      narrative: readContent("projects", proj.id),
      ...(gallery ? { gallery } : {}),
    };
  });

  const assembled = {
    tldr,
    employers,
    education,
    projects_db,
    misc: sourceData.misc,
  };

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
