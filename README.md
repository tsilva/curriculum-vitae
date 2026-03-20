<div align="center">
  <img src="logo.png" alt="curriculum-vitae" width="512"/>

  [![Vercel](https://img.shields.io/badge/Vercel-deployed-black?style=flat&logo=vercel)](https://www.tsilva.eu)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat)](LICENSE)

  🎮 **A cyberpunk-themed interactive CV presenting 20+ years of fullstack engineering across 60+ projects** ⚡

  [Live Site](https://www.tsilva.eu) · [CV.md](CV.md) · [Web App](web/)
</div>

---

## 🔍 Overview

This repository contains both the **source data** and the **interactive web application** for a professional CV/resume. The CV is intentionally verbose and detailed — designed to be processed by LLMs rather than read linearly.

Everything is data-driven: project, employer, and education records live as individual Markdown files with YAML frontmatter in `data/`. Two scripts consume this data to produce:

- **[CV.md](CV.md)** — A generated Markdown document optimized for LLM consumption
- **[tsilva.eu](https://www.tsilva.eu)** — A cyberpunk-themed web app for human consumption

## ✨ Features

- 🕹️ **Cyberpunk/Edgerunners aesthetic** — scanlines, CRT vignette, matrix rain, glitch text effects
- 📊 **Data-driven architecture** — single-source YAML frontmatter + Markdown files
- 🤖 **LLM-friendly CV.md** — generated Markdown covering 59 projects across 8 employers
- 🖼️ **Project galleries** — screenshots and videos served via Cloudflare R2
- ⚡ **Static export** — pre-rendered HTML/CSS/JS deployed to Vercel
- 🔍 **Technology filtering** — browse projects by tech stack
- 📱 **Responsive design** — works across desktop and mobile

## 🚀 Quick Start

```bash
git clone https://github.com/tsilva/curriculum-vitae.git
cd curriculum-vitae/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🏗️ Architecture

```
data/**/*.md + data/misc.yaml
        │
        ├─→ scripts/assemble-cv-data.ts ─→ web/src/data/cv-data.json ─→ Next.js App
        │
        └─→ scripts/generate-cv.ts ─→ CV.md
```

The `data/` directory is the **single source of truth**. Each entity (project, employer, education, OSS contribution) is a Markdown file with YAML frontmatter for metadata and prose content below. Two build scripts transform this data into outputs — one for the web app, one for the generated CV document.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, static export) |
| UI | React 19 |
| Styling | Tailwind CSS 4 |
| Language | TypeScript 5 |
| Fonts | Orbitron, Share Tech Mono, Fira Code, Press Start 2P |
| Monitoring | Sentry |
| Hosting | Vercel |
| Media | Cloudflare R2 |

## 📂 Key Commands

```bash
cd web

npm run dev            # Start dev server
npm run build          # Full build (assemble + generate CV + Next.js build)
npm run assemble       # Regenerate cv-data.json from data/
npm run generate:cv    # Regenerate CV.md from data/
npm run sync           # Fetch GitHub data + assemble + generate CV
npm run stats          # Technology mention analytics
```

## 📄 License

[MIT](LICENSE)
