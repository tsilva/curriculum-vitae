# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a detailed professional CV/resume rendered as a comprehensive README.md file. The CV is intentionally verbose and detailed, designed to be processed by Large Language Models rather than read linearly. It documents 20+ years of software engineering experience across 60+ projects.

## Repository Structure

```
.
├── README.md           # Main CV content (78KB+ detailed professional history)
├── scripts/            # Python utilities for CV maintenance
│   ├── validate_links.py      # Validates all HTTP links in README.md
│   ├── count_technologies.py  # Extracts and counts technology mentions
│   └── requirements.txt       # Python dependencies (bs4, markdown2, requests)
├── CNAME              # Domain configuration
└── .git/              # Git repository
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

- This is a static documentation repository with no build process
- The repository serves as the source for a GitHub Pages site (note CNAME file)
- Python scripts are utilities, not production code
- No testing framework required (scripts are simple data extractors)
