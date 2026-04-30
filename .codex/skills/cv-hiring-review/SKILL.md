---
name: cv-hiring-review
description: Use when reviewing this curriculum-vitae repository from multiple hiring perspectives to produce a private prioritized action report that improves hire probability, seniority perception, and compensation positioning. Optimized for high-rate AI/product engineering, fractional engineering lead, and premium contractor positioning while still surfacing staff/principal full-time risks.
metadata:
  short-description: Multi-perspective CV hiring audit
---

# CV Hiring Review

Run a repeatable internal hiring audit for this repository. The output is a private Markdown report, not public site changes.

## Trigger

Use this skill when reviewing the CV/site from multiple hiring perspectives to produce a prioritized action report that improves hire probability, seniority perception, and compensation positioning.

Optimize first for high-rate AI/product engineering: senior AI product engineer, fractional engineering lead, production AI systems builder, and premium contractor positioning. Also flag issues that could block staff/principal full-time roles.

## Inputs to Inspect

- `git status --short`
- `data/**/*.md`, `data/misc.yaml`, and `data/tldr.md`
- `CV.md`
- `web/src/**`, especially `app/`, `components/`, metadata, generated data, and navigation
- README and repo scripts when they affect positioning or verification

Do not edit generated CV/site data during the review. If future content changes are recommended, point to the source file under `data/`.

## Reviewer Hats

Use subagents when available. Keep each reviewer read-only and ask for risks, strongest proof, missing evidence, and highest-leverage improvements.

- Senior recruiter / talent acquisition partner screening high-comp senior/staff candidates.
- VP Engineering or engineering hiring manager at a 100-500 person product company.
- Startup founder/CTO or small-company buyer considering a high hourly-rate contractor or fractional engineering lead.
- AI/LLM platform hiring manager evaluating current relevance, technical depth, evaluation rigor, and differentiation.
- Optional compensation negotiator reviewing positioning, offer leverage, buyer objections, and rate/salary justification.

If subagents are unavailable, perform the same passes sequentially and label the perspective for each finding.

## Output

By default, create one private report at `.hiring-review/YYYY-MM-DD.md`. The directory is gitignored.

If the user explicitly asks for read-only, dry-run, or report-to-chat behavior, do not write files; return the same buckets in the response instead.

Use this stable structure:

```markdown
# Hiring Review - YYYY-MM-DD

## Executive Summary

## P0 Credibility Fixes

## P1 Site/Content Conversion Fixes

## P2 Evidence To Gather

## Career/Skill Investments

## Do Not Change / Preserve

## Reviewer Notes
```

Prefer ranked, concrete actions over broad advice. Each action should say why it matters for hiring/compensation and cite source files when possible.

## Recurring Checks

Always include these known risk areas unless already resolved:

- Senior/AI/business-value proof is buried below origin story and personality.
- VaultHaus/current AI work is vague and outcome-light.
- Conversion path is unclear: availability, preferred engagement, contact CTA, and buyer offer are not explicit.
- Staff/principal leverage proof is underspecified: org influence, mentoring, architecture authority, roadmap ownership, and decision impact.
- `data/projects/tynker-php-mongodb-odm.md` appears to duplicate Minecraft Editor prose.
- `data/projects/minecraft-editor.md` lists `OpenAI` and `Pinecone` for a 2016 project, which may be historically inconsistent.
- Risky phrasing such as jokes about company collapse, "every possible shortcut", or "heavy-duty hacks" can weaken premium trust.
- `content-visibility-auto` may cause section overlap in the static export and should be visually verified before public use.

## Browser Validation

Use the official OpenAI Browser Use plugin for browser testing. Do not use fallback browser tooling that writes snapshots unless the user explicitly approves it.

## Verification

After producing a report:

- Confirm only intended files changed with `git status --short`.
- Keep `.hiring-review/` ignored.
- Do not run generators or formatters unless separately implementing report recommendations.
- For later public site changes, verify with `pnpm --dir web lint`, `pnpm --dir web build`, `pnpm run smoke`, and Browser Use visual inspection.
