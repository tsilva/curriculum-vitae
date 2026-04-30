<div align="center">
  <img src="readme-logo.png" alt="curriculum-vitae markdown logo" width="512"/>

  **A software engineer CV and interactive web experience covering 20+ years of work across 60+ shipped projects**

  [Live Site](https://www.tsilva.eu)
</div>

curriculum-vitae is the source repository for Tiago Silva's CV. It keeps the long-form professional history in structured Markdown files and publishes it as both a generated `CV.md` and a static Next.js website.

The web app is a cyberpunk-themed CV browser with project filtering, generated data files, remote project galleries, Sentry wiring, and Vercel static export.

## Install

```bash
git clone https://github.com/tsilva/curriculum-vitae.git
cd curriculum-vitae
pnpm install
pnpm --dir web install
pnpm --dir web dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
pnpm --dir web dev             # start the Next.js dev server
pnpm --dir web build           # assemble data, generate CV.md, and static-export the site
pnpm --dir web build:local     # build with local gallery URLs
pnpm --dir web assemble        # regenerate web/src/data/cv-data.json for R2 galleries
pnpm --dir web assemble:local  # regenerate web data with local gallery URLs
pnpm --dir web generate:cv     # regenerate CV.md from data/
pnpm --dir web sync            # fetch GitHub data, assemble web data, and regenerate CV.md
pnpm --dir web lint            # run ESLint
pnpm --dir web stats           # count technology mentions
pnpm run smoke                 # run Playwright smoke tests
pnpm run verify                # lint, build, and run smoke tests
```

## Notes

- `data/` is the source of truth for CV content. Edit the relevant file under `data/projects/`, `data/employers/`, `data/education/`, `data/oss/`, `data/tldr.md`, or `data/misc.yaml`.
- `CV.md`, `web/src/data/cv-data.json`, and `web/src/data/github-data.json` are generated outputs. Regenerate them instead of hand-editing them.
- Gallery URLs are controlled by `GALLERY_MODE` and `R2_PUBLIC_URL` in `web/.env`; production defaults to Cloudflare R2.
- Browser metadata uses `NEXT_PUBLIC_SITE_URL`; analytics and Sentry use the variables documented in `web/.env.example`.
- Root Sentry issue tooling reads `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_BASE_URL` from `.env`.
- The Next.js app is configured for static export with unoptimized images. `vercel.json` sets security headers, redirects `tsilva.eu` to `www.tsilva.eu`, and proxies `/galleries/*` to the R2 gallery host.
- Local development is documented with `pnpm@10.27.0`. The current Vercel configuration still uses `npm install` and `npm run build`.

## Architecture

![curriculum-vitae architecture diagram](./architecture.png)

## License

[MIT](LICENSE)
