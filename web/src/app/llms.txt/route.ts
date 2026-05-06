import { siteUrl } from "@/lib/site-config";
import { SITE_DESCRIPTION, SITE_TITLE } from "../../../web-seo-metadata";

export const dynamic = "force-static";

function absoluteUrl(path: string): string {
  return `${siteUrl}${path}`;
}

const content = `# ${SITE_TITLE}

> ${SITE_DESCRIPTION}

This site is Tiago Silva's canonical public curriculum vitae. It is a static Next.js site generated from structured Markdown data in the source repository, with a visual interface optimized for human browsing. For LLM and agent workflows, prefer the generated Markdown CV and structured source data over inferring details from visual styling or client-side interactions.

Use this file as the discovery index for agent-readable sources. Treat project, employer, education, and open-source entries as historical records; do not invent responsibilities, dates, clients, metrics, or technologies that are not present in the linked sources.

## Primary Sources

- [Website](${absoluteUrl("/")}): Public CV site with experience, projects, open-source work, education, and links.
- [Generated Markdown CV](${absoluteUrl("/cv.md")}): Full long-form CV generated from repository data.
- [Structured CV Data](${absoluteUrl("/cv.json")}): Structured site data for CV sections, project galleries, public GitHub repositories, and related sites.
- [Source Data Directory](https://github.com/tsilva/curriculum-vitae/tree/main/data): Canonical Markdown and YAML sources for employers, projects, education, OSS, TLDR, and miscellaneous links.
- [Source Repository](https://github.com/tsilva/curriculum-vitae): Repository for the CV data pipeline and static website.

## Public Profiles

- [GitHub](https://github.com/tsilva): Open-source projects and code.
- [LinkedIn](https://www.linkedin.com/in/engtiagosilva/): Professional profile.
- [Hugging Face](https://huggingface.co/tsilva): AI and machine-learning profile.
- [X](https://x.com/tiagosilva): Public social profile.

## Key Topics

- [AI Agents and LLM Work](${absoluteUrl("/#projects")}): Projects involving AI agents, large language models, RAG systems, and applied deep learning.
- [Full-Stack Engineering](${absoluteUrl("/#experience")}): Professional experience across frontend, backend, infrastructure, mobile, and cloud systems.
- [Education Technology](${absoluteUrl("/#projects")}): Work on Tynker products used by students and schools.
- [Open Source](${absoluteUrl("/#opensource")}): Public repositories and related tools.

## Optional

- [Sitemap](${absoluteUrl("/sitemap.xml")}): Search-engine sitemap for indexable site routes.
- [Robots](${absoluteUrl("/robots.txt")}): Crawl policy for the site.
`;

export function GET() {
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
