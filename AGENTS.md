# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a detailed professional CV/resume along with an interactive cyberpunk-themed web application that presents the CV data. The CV is intentionally verbose and detailed, designed to be processed by Large Language Models rather than read linearly. It documents 20+ years of software engineering experience across 60+ projects.

## Repository Structure

```
.
├── data/                   # SOURCE OF TRUTH for all CV content
│   ├── cv-data.json        # Structured metadata (employers, projects, education, oss, misc)
│   └── content/            # Long-form prose as markdown files
│       ├── tldr.md         # TLDR section
│       ├── employers/      # 8 employer description files
│       ├── education/      # 2 education description files
│       └── projects/       # 59 project narrative files
├── README.md               # GENERATED from data/ (do not hand-edit)
├── scripts/
│   ├── assemble-cv-data.ts # data/ + galleries → web/src/data/cv-data.json
│   ├── generate-readme.ts  # data/ → README.md
│   ├── fetch-github.ts     # GitHub API → web/src/data/github-data.json
│   ├── count-technologies.ts # Technology mention analytics
│   ├── validate_links.py   # Validates all HTTP links in README.md
│   └── requirements.txt    # Python dependencies
├── web/                    # Next.js cyberpunk-themed web application
│   ├── src/
│   │   ├── app/            # Next.js App Router (layout, page, globals.css)
│   │   ├── components/     # React components (Hero, Nav, ProjectCard, etc.)
│   │   ├── hooks/          # Custom hooks (useScrollReveal)
│   │   ├── types/          # TypeScript interfaces (Project, Employer, CVData)
│   │   ├── lib/            # Data import helpers
│   │   └── data/           # Generated cv-data.json + github-data.json
│   ├── public/             # Static assets (avatar, logo, robots.txt, sitemap)
│   ├── package.json
│   ├── next.config.ts      # Static export config (output: export)
│   └── vercel.json         # Vercel deployment config
└── .git/
```

## Data Architecture (Source of Truth)

The source of truth is the `data/` directory:

- **`data/cv-data.json`** — Structured metadata for all CV entries (no long-form text)
- **`data/content/*.md`** — Long-form prose (narratives, descriptions) as individual markdown files

Two scripts consume this data:
1. **`scripts/assemble-cv-data.ts`** — Combines JSON + .md files + gallery scanning → `web/src/data/cv-data.json` (for the web app)
2. **`scripts/generate-readme.ts`** — Combines JSON + .md files → `README.md` (for GitHub display)

### Editing CV Content

To update project/employer/education information:
1. Edit structured fields in `data/cv-data.json`
2. Edit prose in the corresponding `data/content/**/*.md` file
3. Run `cd web && npm run assemble && npm run generate:readme` to regenerate outputs
4. **Do NOT hand-edit README.md** — it is generated and will be overwritten

### Adding a New Project

1. Add the project entry to `data/cv-data.json` in the `projects_db` array
2. Create `data/content/projects/{id}.md` with the narrative text
3. Run assemble + generate:readme to update outputs

## Canonical Project Galleries

Project screenshots and media are stored in the `galleries/` directory as canonical optimized versions extracted from Google Photos Takeout.

### Location
```
galleries/                    # Canonical project media (gitignored)
├── help-agent/              # Each project has its own folder
├── block-ide-arcade-maker/
├── byjus-coding-cup/
└── ... (50 total folders)
```

### Naming Scheme
Folders use **kebab-case** derived from project names:
- `Help Agent` → `help-agent`
- `Block IDE - Arcade Maker` → `block-ide-arcade-maker`
- `BYJU's Coding Cup` → `byjus-coding-cup`

### File Format
- **Images**: Converted to WebP format (quality: 85, max 1920×1080px)
- **Videos**: Copied as-is (MP4, MOV, MKV, etc.)
- **Total Size**: ~4.5 GB (678 WebP images + 134 videos across 50 projects)

**Note**: The `galleries/` directory is gitignored as the source of truth remains the Google Photos Takeout backup.

## Cloudflare R2 Gallery Hosting

The galleries can be served from either local files or Cloudflare R2.

### Configuration

Set environment variables in `web/.env` or via command line:

```bash
GALLERY_MODE=r2
R2_PUBLIC_URL=https://curriculum-vitae-r2.tsilva.eu
```

### NPM Scripts

```bash
cd web
npm run build:local    # Build with local galleries
npm run build:r2       # Build with R2 galleries
npm run assemble       # Regenerate cv-data.json from data/
npm run generate:readme # Regenerate README.md from data/
```

### How It Works

The `scripts/assemble-cv-data.ts` script reads `GALLERY_MODE` and generates appropriate URLs:
- **Local mode**: `/galleries/{project}/{filename}`
- **R2 mode**: `https://curriculum-vitae-r2.tsilva.eu/galleries/{project}/{filename}`

## Key Commands

### Validate Links
```bash
cd scripts
pip install -r requirements.txt
python validate_links.py
```

### Count Technologies
```bash
cd web
npm run stats
```

### Web App Development
```bash
cd web
npm install
npm run dev              # Start Next.js dev server
npm run build            # Assemble + generate README + build static export
npm run assemble         # Only regenerate cv-data.json from data/
npm run generate:readme  # Only regenerate README.md from data/
```

### Visual Inspection
Use the `visual-inspection` skill to capture and analyze screenshots of the CV web app:

```bash
# Quick mode (default) - 2 devices for feature development
./.opencode/skills/visual-inspection/screenshot-fullpage.sh

# Full mode - 6 devices for final audits
./.opencode/skills/visual-inspection/screenshot-fullpage.sh --full
```

**Two Modes:**
- **Quick Mode (default)**: Tests 1 desktop (1920x1080) + 1 mobile (390x844)
- **Full Mode (`--full`)**: Tests all 6 device layouts

**When to use:**
- **Quick mode**: After making visual/design changes during development
- **Full mode**: Before committing major changes or releasing

**Important:** Always capture the **full page** to see all sections including Experience, Projects, and Education.

### Data Pipeline
The web app consumes CV data via a build-time pipeline:
1. `scripts/assemble-cv-data.ts` reads `data/cv-data.json` + `data/content/**/*.md` + gallery scanning
2. Outputs structured JSON to `web/src/data/cv-data.json`
3. The Next.js app imports this JSON at build time for static generation

## Web App Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router, static export)
- **UI**: React 19 with client-side interactivity
- **Styling**: Tailwind CSS 4 with custom cyberpunk theme
- **Language**: TypeScript 5
- **Fonts**: Orbitron (display), Share Tech Mono (body), Fira Code (mono), Press Start 2P (pixel)
- **Deployment**: Vercel (static HTML/CSS/JS)

### Cyberpunk Theme
The web app uses a distinct cyberpunk/Edgerunners aesthetic:
- **Colors**: Cyan (#00FFF0), Magenta (#FF00AA), Neon Green (#00FF41), Kiroshi accents
- **Effects**: Scanlines, CRT vignette, dot grid background, glitch text animations
- **Components**: ASCII corner brackets on cards, matrix rain background, boot sequence loader
- **Typography**: Retro futuristic monospace fonts

### Key Components
- `Hero.tsx` — Intro section with social links and avatar
- `ProjectCard.tsx` / `ProjectModal.tsx` — Project display with filtering
- `MatrixRain.tsx` — Animated background effect
- `BootSequence.tsx` — Loading animation
- `GlitchText.tsx` — Glitch text effect
- `FilterBar.tsx` — Technology-based project filtering

## Content Architecture

### data/cv-data.json Schema

The structured data includes:
- `employers[]` — Work history with id, name, url, duration, role, location, projectIds, links
- `education[]` — Academic history with id, institution, url, duration, degree, grade, location, links
- `projects_db[]` — Project metadata with id, emoji, title, headingUrl, tldr, start, client, location, role, team, platforms, technologies, links
- `oss[]` — Open source projects with name, url, description, archived flag
- `misc[]` — Miscellaneous grouped links with label and sub-links

Long-form text (narratives, descriptions) lives in `data/content/**/*.md` files, NOT in the JSON.

### Link Types
Links support three formats:
- **Simple**: `{ "label": "...", "url": "..." }`
- **With suffix**: `{ "label": "...", "url": "...", "suffix": "(extra text)" }`
- **Grouped**: `{ "group": "Parent label:", "links": [{ "label": "...", "url": "..." }] }`

## Important Constraints

### README.md is Generated
README.md is generated by `scripts/generate-readme.ts` from `data/`. Do not hand-edit it. Edit `data/cv-data.json` and `data/content/**/*.md` instead.

### Content Authenticity
- Do not fabricate projects, roles, or technical details
- All project information is historical and should be treated as immutable unless corrected for accuracy

### HTML vs Markdown
The CV uses a mix of Markdown and HTML:
- External links require `<a href="..." target="_blank">`
- Inline formatting uses HTML tags (`<br>`, emphasis)
- This is intentional for rendering control

## Maintenance Workflow

When updating project information:
1. Edit the relevant fields in `data/cv-data.json` and/or `data/content/projects/{id}.md`
2. Run `cd web && npm run assemble && npm run generate:readme`
3. Run `python scripts/validate_links.py` to ensure no broken links
4. Commit with descriptive message following existing git history style

## Skills

### readme-generator
Use this skill when authoring or updating README content. Edit `data/cv-data.json` and `data/content/**/*.md`, then run generate:readme.

### visual-inspection
**Use this skill to verify visual changes before committing.** Capture screenshots of the CV web app to check layout, styling, and content. Always capture the **full page** to verify all sections render correctly.
