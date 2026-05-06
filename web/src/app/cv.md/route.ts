import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-static";

const CV_MARKDOWN_PATH = path.resolve(process.cwd(), "..", "CV.md");

export function GET() {
  return new Response(fs.readFileSync(CV_MARKDOWN_PATH, "utf-8"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
