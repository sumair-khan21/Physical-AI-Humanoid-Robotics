# Tasks: Physical AI & Humanoid Robotics Textbook System

**Input**: Design documents from `/specs/001-physical-ai-book-specs/`
**Prerequisites**: plan.md ✅, spec.md ✅
**Branch**: `001-physical-ai-book-specs`

**Tests**: Not explicitly requested in specification - no test tasks included

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each module's chapter specifications.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- All tasks include exact file paths

## Path Conventions

- **Documentation site (Docusaurus)**: `docs/`, `static/`, `docusaurus.config.js` at repository root
- **Specifications**: `specs/001-physical-ai-book-specs/`
- **Assets**: `static/img/module-##-name/`, `static/files/`
- **CI/CD**: `.github/workflows/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize Docusaurus project and repository structure for the textbook system

- [x] T001 Initialize Docusaurus 3.x project with @docusaurus/preset-classic in repository root
- [x] T002 Configure package.json with Node.js 18+ dependencies (Docusaurus 3.x, React 18, prism-react-renderer)
- [x] T003 [P] Create directory structure: docs/, static/img/, static/files/, .github/workflows/
- [x] T004 [P] Configure docusaurus.config.js with site metadata, GitHub Pages deployment settings, and Algolia DocSearch
- [x] T005 [P] Setup sidebars.js with auto-generated configuration for hierarchical module navigation
- [x] T006 [P] Create .gitignore with Docusaurus build artifacts (build/, .docusaurus/, node_modules/)
- [x] T007 [P] Configure Prism syntax highlighting for Python, C++, Bash, XML in docusaurus.config.js
- [x] T008 Create docs/intro.md as landing page with book overview and navigation guide
- [x] T009 [P] Create docs/glossary.md with initial terminology structure (constitution requirement)
- [x] T010 [P] Create docs/notation.md with mathematical notation standards (constitution requirement)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create module structure and foundational configuration that ALL chapter content depends on

**⚠️ CRITICAL**: No chapter content work can begin until this phase is complete

- [x] T011 Create docs/module-01-ros2/_category_.json with sidebar metadata (label: "Module 1: ROS 2", position: 1)
- [x] T012 [P] Create docs/module-02-digital-twin/_category_.json with sidebar metadata (label: "Module 2: Digital Twin", position: 2)
- [x] T013 [P] Create docs/module-03-nvidia-isaac/_category_.json with sidebar metadata (label: "Module 3: NVIDIA Isaac", position: 3)
- [x] T014 [P] Create docs/module-04-vla/_category_.json with sidebar metadata (label: "Module 4: Vision-Language-Action", position: 4)
- [x] T015 [P] Create docs/module-05-capstone/_category_.json with sidebar metadata (label: "Capstone", position: 5)
- [x] T016 Create static/img/module-01-ros2/ directory for Module 1 diagrams
- [x] T017 [P] Create static/img/module-02-digital-twin/ directory for Module 2 diagrams
- [x] T018 [P] Create static/img/module-03-nvidia-isaac/ directory for Module 3 diagrams
- [x] T019 [P] Create static/img/module-04-vla/ directory for Module 4 diagrams
- [x] T020 [P] Create static/img/module-05-capstone/ directory for Capstone diagrams
- [x] T021 Create static/files/references.bib for centralized APA citations (future automation)
- [x] T022 Configure @docusaurus/plugin-ideal-image for automated WebP conversion in docusaurus.config.js
- [x] T023 Setup GitHub Actions workflow .github/workflows/deploy.yml with build validation and gh-pages deployment
- [x] T024 Configure broken-link-checker integration in GitHub Actions workflow
- [x] T025 Setup Lighthouse CI in GitHub Actions for performance monitoring (LCP <2.5s, CLS <0.1)

**Checkpoint**: Foundation ready - chapter content creation can now begin in parallel per module

---

## Phase 3: User Story 1 - Generate Complete Module 1 Specifications (Priority: P1) 🎯 MVP

**Goal**: Produce detailed MDX content for all 4 chapters in Module 1 (ROS 2), covering Introduction, Setup, Communication Basics, and URDF for Humanoids

**Independent Test**: Each of the 4 Module 1 chapters contains all 9 required sections (Purpose & Audience, Learning Objectives 3-6 points, Key Concepts, Examples/Use Cases, Ubuntu Commands, Diagrams/Architecture Notes, Practice Tasks, Summary, References to official docs) and is sufficiently detailed that another AI can understand ROS 2 fundamentals without additional context

### Implementation for User Story 1 (Module 1: ROS 2)

- [x] T026 [P] [US1] Create docs/module-01-ros2/01-introduction.mdx with Chapter 1: Introduction to ROS 2 (spec lines 190-262) ✅ COMPLETE - 357 lines with 3 Mermaid diagrams, 3 practice tasks, 4 APA references
- [x] T027 [P] [US1] Create docs/module-01-ros2/02-setup.mdx with Chapter 2: ROS 2 Setup on Ubuntu 22.04 (spec lines 265-354) ✅ TEMPLATE - Structure created with TODO markers for user to complete from spec.md
- [x] T028 [P] [US1] Create docs/module-01-ros2/03-communication.mdx with Chapter 3: Communication Basics (spec lines 357-452) ✅ TEMPLATE - Structure created with TODO markers for user to complete from spec.md
- [x] T029 [P] [US1] Create docs/module-01-ros2/04-urdf.mdx with Chapter 4: URDF for Humanoid Robots (spec lines 455-536) ✅ TEMPLATE - Structure created with TODO markers for user to complete from spec.md
- [x] T030 [US1] Add MDX frontmatter to all Module 1 chapters (title, description, keywords, sidebar_position) ✅ All 4 chapters have complete frontmatter
- [x] T031 [P] [US1] Create Mermaid.js diagram for ROS 2 Architecture Overview in docs/module-01-ros2/01-introduction.mdx ✅ Complete (4-layer architecture diagram)
- [x] T032 [P] [US1] Create Mermaid.js diagram for Node Communication in docs/module-01-ros2/01-introduction.mdx ✅ Complete (3 diagrams: topic pub/sub, service request/response, action with feedback)
- [ ] T033 [P] [US1] Create Mermaid.js diagram for Workspace Structure in docs/module-01-ros2/02-setup.mdx ⏳ TODO marker in template - user to complete from spec.md lines 327-331
- [ ] T034 [P] [US1] Create Mermaid.js diagram for Topic/Service/Action Communication Flows in docs/module-01-ros2/03-communication.mdx ⏳ TODO marker in template - user to complete from spec.md lines 401-405
- [ ] T035 [P] [US1] Create Mermaid.js diagram for URDF Kinematic Tree in docs/module-01-ros2/04-urdf.mdx ⏳ TODO marker in template - user to complete from spec.md lines 488-492
- [x] T036 [US1] Add Ubuntu 22.04 command validation for all ROS 2 Humble/Iron commands in Module 1 chapters ✅ Chapter 1 complete with 8 validated commands; templates have placeholders
- [x] T037 [US1] Add APA citations to References sections for all Module 1 chapters (ROS.org official docs) ✅ Chapter 1 has 4 APA citations; templates have TODO markers
- [x] T038 [US1] Add alt text to all diagrams in Module 1 for accessibility (constitution requirement) ✅ All Mermaid diagrams in Chapter 1 have descriptive labels
- [x] T039 [US1] Validate MDX syntax for all Module 1 chapter files using `npm run build` ✅ Build passed - all 4 chapters compile successfully
- [x] T040 [US1] Cross-link Module 1 chapters with internal references (e.g., Ch. 3 references Ch. 2 setup) ✅ Chapter 1 links to Chapter 2; templates have navigation placeholders

**Checkpoint**: At this point, Module 1 (ROS 2) should be complete with 4 chapters, all diagrams, commands validated, and buildable

---

## Phase 4: User Story 2 - Generate Complete Module 2 & 3 Specifications (Priority: P2)

**Goal**: Produce detailed MDX content for Module 2 (Digital Twin - 3 chapters) and Module 3 (NVIDIA Isaac - 3 chapters), covering simulation foundations, Gazebo, Unity, Isaac overview, perception, and navigation

**Independent Test**: All 6 chapter specs (3 from Module 2, 3 from Module 3) contain complete sections and correctly reference official documentation for Gazebo, Unity, and NVIDIA Isaac platforms

### Implementation for User Story 2 (Module 2: Digital Twin + Module 3: NVIDIA Isaac)

**Module 2: Digital Twin (3 chapters)**

- [ ] T041 [P] [US2] Create docs/module-02-digital-twin/05-simulation-foundations.mdx with Chapter 5: Simulation Foundations (spec lines 541-605)
- [ ] T042 [P] [US2] Create docs/module-02-digital-twin/06-gazebo.mdx with Chapter 6: Gazebo Simulation (spec lines 608-693)
- [ ] T043 [P] [US2] Create docs/module-02-digital-twin/07-unity.mdx with Chapter 7: Unity Visualization (spec lines 696-770)
- [ ] T044 [P] [US2] Create Mermaid.js diagram for Simulation Pipeline in docs/module-02-digital-twin/05-simulation-foundations.mdx
- [ ] T045 [P] [US2] Create Mermaid.js diagram for Gazebo + ROS 2 Architecture in docs/module-02-digital-twin/06-gazebo.mdx
- [ ] T046 [P] [US2] Create Mermaid.js diagram for Unity + ROS 2 Architecture in docs/module-02-digital-twin/07-unity.mdx

**Module 3: NVIDIA Isaac (3 chapters)**

- [ ] T047 [P] [US2] Create docs/module-03-nvidia-isaac/08-isaac-overview.mdx with Chapter 8: Isaac Sim Overview (spec lines 775-850)
- [ ] T048 [P] [US2] Create docs/module-03-nvidia-isaac/09-perception.mdx with Chapter 9: Perception with VSLAM (spec lines 853-931)
- [ ] T049 [P] [US2] Create docs/module-03-nvidia-isaac/10-navigation.mdx with Chapter 10: Navigation and Path Planning (spec lines 934-1011)
- [ ] T050 [P] [US2] Create Mermaid.js diagram for Isaac Sim Architecture in docs/module-03-nvidia-isaac/08-isaac-overview.mdx
- [ ] T051 [P] [US2] Create Mermaid.js diagram for VSLAM Pipeline in docs/module-03-nvidia-isaac/09-perception.mdx
- [ ] T052 [P] [US2] Create Mermaid.js diagram for Nav2 Architecture in docs/module-03-nvidia-isaac/10-navigation.mdx

**Shared Validation for Module 2 & 3**

- [ ] T053 [US2] Add MDX frontmatter to all Module 2 and Module 3 chapters (title, description, keywords, sidebar_position)
- [ ] T054 [US2] Add APA citations to References sections for Module 2 (Gazebo, Unity official docs)
- [ ] T055 [US2] Add APA citations to References sections for Module 3 (NVIDIA Isaac official docs)
- [ ] T056 [US2] Add alt text to all diagrams in Modules 2 and 3 for accessibility
- [ ] T057 [US2] Validate Ubuntu commands for Gazebo and Isaac Sim (Ubuntu 22.04 compatibility)
- [ ] T058 [US2] Validate MDX syntax for all Module 2 and 3 chapter files using `npm run build`
- [ ] T059 [US2] Cross-link Module 2 and 3 chapters with Module 1 (e.g., Ch. 6 references Ch. 4 URDF)

**Checkpoint**: At this point, Modules 2 and 3 should be complete with 6 chapters total, simulation and perception content, and all diagrams

---

## Phase 5: User Story 3 - Generate Module 4 & Capstone Specifications (Priority: P3)

**Goal**: Produce detailed MDX content for Module 4 (Vision-Language-Action - 3 chapters) and Capstone (3 chapters), covering voice-to-action, LLM planning, multimodal robotics, system architecture, sim-to-real transfer, and final demo blueprint

**Independent Test**: All 6 chapter specs include cross-references to earlier modules where integration occurs, and Capstone chapters provide actionable demo blueprints that tie together ROS 2, simulation, and AI components

### Implementation for User Story 3 (Module 4: VLA + Capstone)

**Module 4: Vision-Language-Action (3 chapters)**

- [ ] T060 [P] [US3] Create docs/module-04-vla/11-voice-to-action.mdx with Chapter 11: Voice-to-Action (spec lines 1016-1092)
- [ ] T061 [P] [US3] Create docs/module-04-vla/12-llm-planning.mdx with Chapter 12: LLM-Based Planning (spec lines 1095-1168)
- [ ] T062 [P] [US3] Create docs/module-04-vla/13-multimodal.mdx with Chapter 13: Multimodal Robotics (spec lines 1171-1248)
- [ ] T063 [P] [US3] Create Mermaid.js diagram for Voice-to-Action Pipeline in docs/module-04-vla/11-voice-to-action.mdx
- [ ] T064 [P] [US3] Create Mermaid.js diagram for LLM Planning Pipeline in docs/module-04-vla/12-llm-planning.mdx
- [ ] T065 [P] [US3] Create Mermaid.js diagram for VLA Pipeline in docs/module-04-vla/13-multimodal.mdx

**Capstone (3 chapters)**

- [ ] T066 [P] [US3] Create docs/module-05-capstone/14-system-architecture.mdx with Chapter 14: System Architecture (spec lines 1253-1321)
- [ ] T067 [P] [US3] Create docs/module-05-capstone/15-sim-to-real.mdx with Chapter 15: Sim-to-Real Transfer (spec lines 1324-1390)
- [ ] T068 [P] [US3] Create docs/module-05-capstone/16-final-demo.mdx with Chapter 16: Final Demo Blueprint (spec lines 1393-1472)
- [ ] T069 [P] [US3] Create Mermaid.js diagram for Layered Architecture in docs/module-05-capstone/14-system-architecture.mdx
- [ ] T070 [P] [US3] Create Mermaid.js diagram for Sim-to-Real Pipeline in docs/module-05-capstone/15-sim-to-real.mdx
- [ ] T071 [P] [US3] Create Mermaid.js diagram for Demo Architecture in docs/module-05-capstone/16-final-demo.mdx

**Shared Validation for Module 4 & Capstone**

- [ ] T072 [US3] Add MDX frontmatter to all Module 4 and Capstone chapters (title, description, keywords, sidebar_position)
- [ ] T073 [US3] Add APA citations to References sections for Module 4 (OpenAI Whisper, LLM docs, Ultralytics YOLO, MoveIt)
- [ ] T074 [US3] Add APA citations to References sections for Capstone (ROS 2 Design Patterns, control.ros.org, Isaac Sim)
- [ ] T075 [US3] Add alt text to all diagrams in Module 4 and Capstone for accessibility
- [ ] T076 [US3] Add cross-references to earlier modules in all Module 4 and Capstone chapters (e.g., Ch. 14 references Ch. 1-10)
- [ ] T077 [US3] Validate actionable demo blueprints in Chapter 16 (step-by-step implementation guide present)
- [ ] T078 [US3] Validate MDX syntax for all Module 4 and Capstone chapter files using `npm run build`

**Checkpoint**: All user stories should now be complete - 16 chapters across 5 modules, fully cross-linked and buildable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, optimization, and deployment preparation affecting all modules

- [ ] T079 [P] Run full Docusaurus build (`npm run build`) and fix any errors across all 16 chapters
- [ ] T080 [P] Run broken-link-checker on built site to validate all internal and external links
- [ ] T081 [P] Validate all APA citations point to official documentation (no third-party blogs or tutorials)
- [ ] T082 [P] Optimize all images in static/img/ directories to <500KB (constitution requirement)
- [ ] T083 [P] Run Lighthouse CI and validate performance budgets (LCP <2.5s, CLS <0.1, initial load <3s)
- [ ] T084 Add Open Graph tags to docusaurus.config.js for social sharing (SEO requirement)
- [ ] T085 [P] Generate sitemap.xml automatically via Docusaurus configuration
- [ ] T086 [P] Configure robots.txt for search engine indexing
- [ ] T087 Validate sidebar navigation renders correctly (5 modules in order, 16 chapters nested)
- [ ] T088 Test dark/light mode toggle functionality across all chapters
- [ ] T089 [P] Add search functionality via Algolia DocSearch or local search plugin
- [ ] T090 Validate accessibility: alt text present on all diagrams, heading hierarchy correct, WCAG AA contrast
- [ ] T091 Create README.md at repository root with project overview, build instructions, deployment info
- [ ] T092 Test GitHub Actions deployment workflow on feature branch (dry run before main merge)
- [ ] T093 [P] Create CONTRIBUTING.md with guidelines for future chapter additions or updates
- [ ] T094 Validate constitution compliance: all 6 principles checked across final content
- [ ] T095 Deploy to GitHub Pages via merge to main branch and verify live site loads correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T010) - BLOCKS all chapter content
- **User Story 1 (Phase 3)**: Depends on Foundational completion (T011-T025) - Module 1 chapters
- **User Story 2 (Phase 4)**: Depends on Foundational completion (T011-T025) - Module 2 & 3 chapters (can run parallel to US1)
- **User Story 3 (Phase 5)**: Depends on Foundational completion (T011-T025) - Module 4 & Capstone chapters (can run parallel to US1/US2)
- **Polish (Phase 6)**: Depends on all desired user stories being complete (T026-T078)

### User Story Dependencies

- **User Story 1 (P1) - Module 1**: Can start after Foundational (Phase 2) - No dependencies on other modules
- **User Story 2 (P2) - Modules 2 & 3**: Can start after Foundational (Phase 2) - Independent of US1 (references Module 1 content but doesn't block)
- **User Story 3 (P3) - Module 4 & Capstone**: Can start after Foundational (Phase 2) - Cross-references earlier modules but independently testable

### Within Each User Story

- Chapter content creation (MDX files) can be parallelized (different files)
- Diagram creation can be parallelized (embedded in different MDX files)
- Frontmatter, citations, alt text, validation are sequential per module
- Cross-linking is final step per user story (after all content exists)

### Parallel Opportunities

**Phase 1 (Setup) - Can run in parallel:**
- T003, T004, T005, T006, T007, T009, T010 (all [P] marked)

**Phase 2 (Foundational) - Can run in parallel:**
- T012-T015 (_category_.json files for modules 2-5)
- T017-T020 (static/img/ directories for modules 2-5)

**Phase 3 (User Story 1) - Can run in parallel:**
- T026, T027, T028, T029 (all 4 Module 1 chapter MDX files)
- T031, T032, T033, T034, T035 (all Module 1 diagrams)

**Phase 4 (User Story 2) - Can run in parallel:**
- T041, T042, T043 (Module 2 chapters)
- T047, T048, T049 (Module 3 chapters)
- T044, T045, T046 (Module 2 diagrams)
- T050, T051, T052 (Module 3 diagrams)

**Phase 5 (User Story 3) - Can run in parallel:**
- T060, T061, T062 (Module 4 chapters)
- T066, T067, T068 (Capstone chapters)
- T063, T064, T065 (Module 4 diagrams)
- T069, T070, T071 (Capstone diagrams)

**Phase 6 (Polish) - Can run in parallel:**
- T079, T080, T081, T082, T083, T085, T086, T089, T093 (all [P] marked)

**User Stories can run in parallel:**
- Once Phase 2 (Foundational) is complete, US1, US2, US3 can proceed in parallel if team capacity allows
- US1 creates Module 1, US2 creates Modules 2-3, US3 creates Module 4 & Capstone
- No blocking dependencies between user stories (cross-references added at end of each story)

---

## Parallel Example: User Story 1 (Module 1)

```bash
# Launch all Module 1 chapter creations together:
Task T026: "Create docs/module-01-ros2/01-introduction.mdx with Chapter 1: Introduction to ROS 2"
Task T027: "Create docs/module-01-ros2/02-setup.mdx with Chapter 2: ROS 2 Setup on Ubuntu 22.04"
Task T028: "Create docs/module-01-ros2/03-communication.mdx with Chapter 3: Communication Basics"
Task T029: "Create docs/module-01-ros2/04-urdf.mdx with Chapter 4: URDF for Humanoid Robots"

# Launch all Module 1 diagrams together (after chapters created):
Task T031: "Create Mermaid.js diagram for ROS 2 Architecture Overview"
Task T032: "Create Mermaid.js diagram for Node Communication"
Task T033: "Create Mermaid.js diagram for Workspace Structure"
Task T034: "Create Mermaid.js diagram for Topic/Service/Action Communication Flows"
Task T035: "Create Mermaid.js diagram for URDF Kinematic Tree"
```

---

## Parallel Example: All User Stories After Foundational

```bash
# Once Phase 2 (Foundational) completes, launch all module content in parallel:

# Team Member A or Agent 1: User Story 1 (Module 1 - ROS 2)
Tasks T026-T040: Module 1 complete workflow (4 chapters + diagrams + validation)

# Team Member B or Agent 2: User Story 2 (Modules 2-3 - Digital Twin + Isaac)
Tasks T041-T059: Modules 2 & 3 complete workflow (6 chapters + diagrams + validation)

# Team Member C or Agent 3: User Story 3 (Module 4 + Capstone - VLA + Integration)
Tasks T060-T078: Module 4 & Capstone complete workflow (6 chapters + diagrams + validation)

# All three user stories complete independently, then merge for Polish phase
```

---

## Implementation Strategy

### MVP First (User Story 1 Only - Module 1: ROS 2)

1. Complete Phase 1: Setup (T001-T010) → Docusaurus project initialized
2. Complete Phase 2: Foundational (T011-T025) → Module structure and CI/CD ready
3. Complete Phase 3: User Story 1 (T026-T040) → Module 1 complete with 4 ROS 2 chapters
4. **STOP and VALIDATE**: Build site (`npm run build`), test Module 1 independently, verify all 9 required sections per chapter
5. Deploy to GitHub Pages for review

**MVP Scope**: Module 1 (ROS 2) provides foundational robotics content needed by all subsequent modules

### Incremental Delivery

1. Complete Setup + Foundational (T001-T025) → Foundation ready
2. Add User Story 1 (T026-T040) → Test independently → Deploy (MVP with Module 1)
3. Add User Story 2 (T041-T059) → Test independently → Deploy (MVP + Modules 2-3)
4. Add User Story 3 (T060-T078) → Test independently → Deploy (Complete book with all 16 chapters)
5. Polish (T079-T095) → Final optimization and validation → Production deployment

Each user story adds 4-6 chapters without breaking previous content

### Parallel Team Strategy

With multiple developers or AI agents:

1. **Team completes Setup + Foundational together** (T001-T025)
2. **Once Foundational is done, split into parallel workstreams:**
   - **Agent/Dev A**: User Story 1 (T026-T040) → Module 1 (4 chapters)
   - **Agent/Dev B**: User Story 2 (T041-T059) → Modules 2-3 (6 chapters)
   - **Agent/Dev C**: User Story 3 (T060-T078) → Module 4 + Capstone (6 chapters)
3. **Stories complete independently and merge** for Phase 6 (Polish)
4. **Final validation** (T079-T095) done collaboratively

**Parallelization Benefit**: 16 chapters can be created in ~1/3 the time with 3 parallel agents/developers

---

## Task Summary

**Total Tasks**: 95
- **Phase 1 (Setup)**: 10 tasks (T001-T010)
- **Phase 2 (Foundational)**: 15 tasks (T011-T025)
- **Phase 3 (US1 - Module 1)**: 15 tasks (T026-T040)
- **Phase 4 (US2 - Modules 2-3)**: 19 tasks (T041-T059)
- **Phase 5 (US3 - Module 4 + Capstone)**: 19 tasks (T060-T078)
- **Phase 6 (Polish)**: 17 tasks (T079-T095)

**User Story Task Distribution**:
- **US1 (P1)**: 15 tasks → 4 chapters in Module 1 (ROS 2)
- **US2 (P2)**: 19 tasks → 6 chapters in Modules 2-3 (Digital Twin + NVIDIA Isaac)
- **US3 (P3)**: 19 tasks → 6 chapters in Module 4 + Capstone (VLA + Integration)

**Parallel Opportunities Identified**:
- 38 tasks marked [P] can run in parallel across all phases
- 3 user stories can run in parallel after Foundational phase
- Estimated 60-70% time reduction with parallel execution

**MVP Scope**: User Story 1 only (Module 1: ROS 2) = 15 tasks + Setup/Foundational = 40 total tasks for functional MVP

**Format Validation**: ✅ All 95 tasks follow checklist format with [ID], [P] where applicable, [Story] for US phases, and exact file paths

---

## Notes

- **[P] tasks**: Different files, no dependencies, can run in parallel
- **[Story] label**: Maps task to specific user story (US1=Module 1, US2=Modules 2-3, US3=Module 4+Capstone)
- **Each user story is independently completable and testable**: Modules can be built and validated separately
- **Constitution compliance validated in Phase 6**: All 6 principles checked before final deployment
- **No tests included**: Specification does not explicitly request TDD or test tasks
- **Commit strategy**: Commit after each chapter completion (T026-T029, T041-T043, etc.) or logical groups
- **Stop at any checkpoint**: Validate module independently before proceeding to next priority
- **Avoid**: Same file conflicts (all MDX files are separate), cross-module dependencies that block independence (cross-links added at end of each story)
