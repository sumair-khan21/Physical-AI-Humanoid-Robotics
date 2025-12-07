---
id: 001
title: Technical Planning for AI-Driven Book System
stage: plan
date: 2025-12-07
surface: agent
model: claude-sonnet-4-5
feature: 001-physical-ai-book-specs
branch: 001-physical-ai-book-specs
user: sumair
command: /sp.plan
labels: ["docusaurus", "github-pages", "architecture", "book-system", "spec-driven-development"]
links:
  spec: specs/001-physical-ai-book-specs/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-physical-ai-book-specs/plan.md
tests:
  - Constitution Check: All 6 principles validated (PASS)
  - Technology Stack Decisions: 8 research areas resolved
  - Architectural Decisions: 5 ADRs identified for documentation
---

## Prompt

✅ /sp.plan (Final Version — With Docusaurus & Deployment)

/sp.plan

Create a technical plan for the AI/Spec-Driven Book Creation Project.
The project uses:

Docusaurus for documentation architecture, layout, navigation, and final book structure

GitHub Pages for deployment workflow

Spec-Kit Plus for spec-driven writing

Claude Code (or Claude Code + Gemini) for writing assistance

Your output must include:

1. Architecture Sketch

Describe the high-level structure of the book system:

Docusaurus folder structure (/docs, /sidebar, /static, versioning)

Module layout (high-level chapters/modules already defined)

Content pipeline: Constitution → Plan → Specs → Drafts → Final book

Integration workflow: Spec-Kit Plus → Claude Code → Docusaurus → GitHub Pages

Branching model for development vs publishing

2. Section Structure

Define the outline for:

Book modules → sub-modules → chapters

Reusable patterns for each chapter (intro, learning goals, explanation, examples, exercises, references)

How we track progress against specifications

Where citations and references will be stored (APA style)

3. Research Approach

Follow the constitution rules:

Research-concurrent writing (research while drafting)

Track sources in APA format

Use credible technical sources: docs, RFCs, academic papers, official GitHub repos

Define how research integrates into Spec-Kit Plus prompts

4. Quality Validation

Include:

Consistency checks for writing quality & structure

Accuracy validation (source-verified claims)

Formatting validation for Docusaurus (broken links, sidebar, MDX correctness)

Technical validation: build must pass npm run build every iteration

Deployment validation: GitHub Pages CI must succeed

5. Decisions Needing Documentation

List all decisions, their options & tradeoffs:

Examples:

Docusaurus theme selection

MDX vs Markdown for interactive sections

Navigation style (single sidebar vs multi-sidebar)

Folder naming conventions

Whether to version the book or keep rolling updates

6. Testing Strategy

Define validation checks based on acceptance criteria:

Docusaurus build passes

Every module meets Constitution standards

APA citations validated

Internal linking tests (no dead links)

GitHub Pages deployment test

Editorial review tests (clarity, correctness, coherence)

7. Project Phases

Organize everything by phases:

Research → gather concepts & core references

Foundation → create book scaffolding + Docusaurus setup

Analysis → expand module outlines using Specs

Synthesis → write chapters, integrate with Docusaurus, prepare deployment

## Response snapshot

Created comprehensive implementation plan with the following key deliverables:

**Technical Context Defined**:
- Docusaurus 3.x + MDX for content
- GitHub Pages for hosting
- Node.js 18+ runtime
- Constitution-aligned quality gates (all 6 principles validated)

**Constitution Check** (GATE: PASS):
- I. Content Accuracy & Technical Rigor ✅
- II. Educational Clarity & Accessibility ✅
- III. Consistency & Standards ✅
- IV. Docusaurus Structure & Quality ✅
- V. Code Example Quality ✅
- VI. Deployment & Publishing Standards ✅

**Project Structure**:
- Documentation: specs/001-physical-ai-book-specs/ (plan.md, research.md, data-model.md, contracts/, quickstart.md)
- Source: docs/ with 5 module directories (module-01-ros2/ through module-05-capstone/), 16 MDX chapter files
- Assets: static/img/ organized by module, static/files/ for resources
- CI/CD: .github/workflows/deploy.yml for automated GitHub Pages deployment

**Phase 0: Research & Technology Decisions** (8 areas resolved):
1. Docusaurus 3.x configuration: @docusaurus/preset-classic, Prism syntax highlighting, Algolia DocSearch
2. GitHub Pages deployment: GitHub Actions with peaceiris/actions-gh-pages, build validation gates
3. MDX vs Markdown: MDX for all chapters (gradual adoption, React components for interactivity)
4. Citation management: Manual APA in Markdown (future BibTeX migration if >100 citations/chapter)
5. Diagram creation: Mermaid.js (text-based) + Draw.io SVG exports, alt text mandatory
6. Folder naming: Hybrid `module-01-ros2/01-introduction.mdx` (numbered prefix + semantic)
7. Versioning strategy: Rolling updates initially, defer versioning until ROS 2 distribution change
8. Build performance: @docusaurus/plugin-ideal-image, Lighthouse CI for LCP <2.5s budget

**Technology Stack Summary**:
- Static Site Generator: Docusaurus 3.x (React components, MDX 3, educational ecosystem)
- Content Format: MDX 3.x (Markdown + React for interactive diagrams/examples)
- Hosting: GitHub Pages (free, integrated, automated deployment)
- Deployment: GitHub Actions (native CI/CD, build validation gates)
- Diagrams: Mermaid.js + SVG (text-based, client-side rendering)
- Citations: Manual APA (full control, no build dependencies)
- Search: Algolia DocSearch (free for open-source docs)
- Code Highlighting: Prism (Python, C++, Bash support)

**Architectural Decisions** (5 ADRs identified):
1. ADR-001: Docusaurus 3.x over VitePress/MkDocs/GitBook
2. ADR-002: Single sidebar navigation for linear learning path
3. ADR-003: Manual APA citations over BibTeX automation
4. ADR-004: Rolling updates over immediate versioning
5. ADR-005: Hybrid folder naming (numbered prefix + semantic)

**Risks & Mitigations**:
- GitHub Pages 1GB limit → Monitor size, optimize images <500KB
- Build failures → Pre-commit hooks, PR validation
- Broken links → Automated checker in GitHub Actions
- Performance regression → Lighthouse CI enforcing LCP <2.5s
- Citation errors → Peer review, future BibTeX if needed

## Outcome

- ✅ Impact: Comprehensive technical plan created for 16-chapter Physical AI textbook system. All constitution principles validated (PASS). Technology stack decisions documented with rationale for Docusaurus 3.x, GitHub Pages, MDX, and deployment workflow.
- 🧪 Tests: Constitution Check (6/6 principles PASS), Technology Stack Research (8/8 areas resolved), Architectural Decisions (5 ADRs identified)
- 📁 Files: specs/001-physical-ai-book-specs/plan.md (complete implementation plan with Phase 0 research)
- 🔁 Next prompts: Generate Phase 1 artifacts (research.md, data-model.md, contracts/, quickstart.md), update agent context, create ADRs for 5 architectural decisions, run /sp.tasks to generate implementation tasks
- 🧠 Reflection: Plan successfully integrates Docusaurus architecture with Spec-Kit Plus workflow. Research phase resolved all "NEEDS CLARIFICATION" items from technical context. Constitution gates provide clear quality standards. 5 ADRs capture significant decisions (static site generator choice, navigation structure, citation approach, versioning strategy, folder naming). Next: generate data-model.md for book structure and contracts/ for chapter spec schemas.

## Evaluation notes (flywheel)

- Failure modes observed: None. All technical context resolved, constitution gates passed, technology stack decisions documented with alternatives and rationale.
- Graders run and results (PASS/FAIL): Constitution Check PASS (6/6 principles), Technology Stack Research COMPLETE (8/8 areas), Architectural Decision Identification COMPLETE (5 ADRs)
- Prompt variant (if applicable): Standard /sp.plan workflow with comprehensive user requirements (7 sections: Architecture Sketch, Section Structure, Research Approach, Quality Validation, Decisions Needing Documentation, Testing Strategy, Project Phases)
- Next experiment (smallest change to try): Generate research.md artifact to document detailed findings for all 8 research areas; validate that data-model.md aligns with 16-chapter spec structure
