# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a detailed professional CV/resume rendered as a comprehensive README.md file, along with an interactive cyberpunk-themed web application that presents the CV data. The CV is intentionally verbose and detailed, designed to be processed by Large Language Models rather than read linearly. It documents 20+ years of software engineering experience across 60+ projects.

## Repository Structure

```
.
├── README.md               # Main CV content (78KB+ detailed professional history)
├── scripts/                # Utilities for CV maintenance
│   ├── validate_links.py   # Validates all HTTP links in README.md
│   ├── count_technologies.py # Extracts and counts technology mentions
│   ├── parse-readme.ts     # Parses README.md → web/src/data/cv-data.json
│   └── requirements.txt    # Python dependencies (bs4, markdown2, requests)
├── web/                    # Next.js cyberpunk-themed web application
│   ├── src/
│   │   ├── app/            # Next.js App Router (layout, page, globals.css)
│   │   ├── components/     # React components (Hero, Nav, ProjectCard, etc.)
│   │   ├── hooks/          # Custom hooks (useScrollReveal)
│   │   ├── types/          # TypeScript interfaces (Project, Employer, CVData)
│   │   ├── lib/            # Data import helpers
│   │   └── data/           # Generated cv-data.json (from parse-readme.ts)
│   ├── public/             # Static assets (avatar, logo, robots.txt, sitemap)
│   ├── package.json
│   ├── next.config.ts      # Static export config (output: export)
│   └── vercel.json         # Vercel deployment config
└── .git/                   # Git repository
```

## Key Commands

### Validate Links
```bash
cd scripts
pip install -r requirements.txt
python validate_links.py
```
Extracts all HTTP links from README.md and checks their status codes. Logs failures for investigation.

### Count Technologies
```bash
cd scripts
python count_technologies.py
```
Parses README.md for `**Technologies:**` sections and generates a sorted count of all technology mentions across projects.

### Web App Development
```bash
cd web
npm install
npm run dev          # Start Next.js dev server
npm run build        # Parse README + build static export
npm run parse        # Only regenerate cv-data.json from README.md
```

### Data Pipeline
The web app consumes CV data via a build-time pipeline:
1. `scripts/parse-readme.ts` parses README.md, extracting projects, employers, education, etc.
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

### README.md Structure
The CV follows a specific hierarchical format:

1. **TLDR Section**: Executive summary with technology stack overview
2. **Experience Section**: Reverse-chronological work history with major roles
3. **Projects Section**: Detailed project descriptions (60+ projects) with:
   - TLDR
   - Start date
   - Client
   - Role
   - Team composition
   - Technologies used
   - Detailed narrative
   - Gallery links (Google Photos)
   - Live demo links (where applicable)

### Link Management
- **Gallery Links**: Always point to Google Photos albums (`photos.app.goo.gl`)
- **External Links**: Must use `<a href="..." target="_blank">` HTML syntax for external navigation
- **Demo Links**: Point to live demos when available (e.g., Tynker IDE instances)

### Technology Mentions
Each project has a standardized `**Technologies:**` line that lists all technical tools used. This format is parsed by `count_technologies.py` for analytics.

## Important Constraints

### README.md Must Be Kept Up to Date
Per user's global instructions, the README.md is the primary artifact and must be kept synchronized with any significant changes. Use the `readme-generator` skill when authoring or updating README content.

### Content Authenticity
- Do not fabricate projects, roles, or technical details
- Do not add generic sections like "Tips for Development" or "Common Development Tasks" unless explicitly present in source materials
- All project information is historical and should be treated as immutable unless corrected for accuracy

### HTML vs Markdown
The CV uses a mix of Markdown and HTML:
- External links require `<a href="..." target="_blank">`
- Inline formatting uses HTML tags (`<br>`, emphasis)
- This is intentional for rendering control

## Maintenance Workflow

When updating project information:
1. Locate the project section in README.md (search by project name)
2. Update the relevant fields (Technologies, TLDR, narrative, etc.)
3. Run `python scripts/validate_links.py` to ensure no broken links
4. Run `python scripts/count_technologies.py` to verify technology parsing still works
5. Commit with descriptive message following existing git history style

## Development Notes

- The repository contains both a static README-based CV and an interactive Next.js web app
- The web app is statically exported and deployed to Vercel
- Python scripts are utilities, not production code
- `parse-readme.ts` bridges the README and web app — changes to README.md project structure may require updating the parser
- When modifying CV content, run `npm run parse` in `web/` to regenerate the JSON data
