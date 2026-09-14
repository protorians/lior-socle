---
name: sentient-commit
description: Gestion des Commits Conventionnels et Versionnage (Monorepo Compatible)
---

# Skill: Conventional Commits and Versioning Management (Monorepo Compatible)

## Goal
Ensure that every code modification results in a strictly standardized commit message, and that package versions (both root and local/sub-packages) are rigorously incremented according to Semantic Versioning (SemVer) rules.

---

## Golden Rules
1. **Never commit without specifying a type.**
2. **Monorepo Priority:** Always update sub-package versions *before* updating the global root package version.
3. **Breaking Changes Detection:** If a change breaks backward compatibility, the exclamation mark `!` must be appended to the type/scope, and `BREAKING CHANGE:` must be included in the footer.

---

## 1. Commit Structure and Types
Every commit message must strictly follow this syntax:
```text
type(scope): short description in present tense, lowercase, with no period at the end

[optional body paragraph providing additional context and reasoning]

[optional footer for breaking changes or issue tracking IDs]
```

### Allowed Types & SemVer Impact:
* **`feat`** -> A new feature (Increments **MINOR** version: `X.Y.0`)
* **`fix`** -> A bug fix (Increments **PATCH** version: `X.X.Y`)
* **`!` (e.g., `feat(api)!:`)** -> A breaking change (Increments **MAJOR** version: `Y.0.0`)
* **`docs`**, **`style`**, **`refactor`**, **`test`**, **`chore`**, **`ci`** -> No version impact (or PATCH depending on team workflow).

---

## 2. Versioning Workflow (Algorithm)

When a code modification is detected, follow these steps sequentially:

### STEP 1: Identify Environment
* **Case A: Standard Project (Single Package)** -> Proceed directly to **Step 3**.
* **Case B: Monorepo (Multi-Package)** -> Proceed to **Step 2**.

### STEP 2: Align Sub-Packages (Monorepo Only)
1. Precisely identify the modified sub-package or sub-packages (e.g., `packages/auth`, `packages/ui`).
2. Determine the SemVer impact (`fix`, `feat`, or `breaking change`) specifically for that sub-package.
3. **Update the configuration file of the sub-package** (e.g., `package.json`, `Cargo.toml`) by incrementing its version number.
4. If any other internal sub-package depends on the newly updated sub-package, update its dependency definition and bump its version accordingly (cascading effect).

### STEP 3: Align Root Package
1. Analyze the overall impact of the modification on the entire project.
   * *Monorepo Note: The global impact matches the highest SemVer impact found among the modified sub-packages.*
2. **Update the configuration file at the root of the project** to increment the global project version.

### STEP 4: Write and Validate Commit
1. Draft the commit message, using the sub-package name as the `scope` if applicable.
2. Commit both the source code changes and the updated configuration files (`package.json`, etc.) together in a single validation.

---

## Use Cases

### Example 1: Monorepo Context (Adding a feature to the "UI" module)
1. **Modifications:** Code changes in `packages/ui`.
2. **Sub-package increment:** `packages/ui/package.json` bumps from `1.2.1` to `1.3.0` (`feat`).
3. **Root increment:** Root `package.json` bumps from `2.4.0` to `2.5.0`.
4. **Commit message:**
   ```text
   feat(ui): add new secondary button variant to the design system
   ```

### Example 2: Monorepo Context (Critical bug fix with breaking change in the API)
1. **Modifications:** Major changes to response structures in `packages/api`.
2. **Sub-package increment:** `packages/api/package.json` bumps from `3.1.2` to `4.0.0` (`breaking change`).
3. **Root increment:** Root `package.json` bumps from `5.8.1` to `6.0.0`.
4. **Commit message:**
   ```text
   refactor(api)!: remove deprecated v1 user endpoints

   BREAKING CHANGE: The v1 endpoints are no longer supported. Use v2/users instead.
   ```

---

## Changelog Generation

Generate or update **per-package** changelogs that summarize the set of changes introduced by the commits since the last release. Base every entry on the actual commit history (`git log` between the last tagged version and `HEAD`), never on assumptions.

### Goal
Produce changelogs that are **coherent, user-facing, and derived strictly from real commits**. Each changelog lives in the **affected package's own directory**, and only packages actually touched by the commits are updated. Each section condenses related commits into a single, meaningful bullet written in French (or English for technical/`CHANGELOG.md` under `sentient-storage`) rather than repeating commit messages verbatim.

### Workspace Package Layout
Packages of the workspace (from root `package.json` `workspaces`: `backend/*`, `frontend/*`, `packages/*`):
- `backend/sentient-api-core`, `backend/sentient-api-connect`, `backend/sentient-api-store`
- `frontend/sentient-socle`, `frontend/sentient-connect`, `frontend/sentient-console`, `frontend/sentient-store`, `frontend/sentient-auth`
- `packages/sdk`, `packages/api-resources`
- `backend/sentient-storage` (Rust, technical changelog)

### Distribution Principle
- Generate the changelog **inside the package directory** (`<package>/CHANGELOG.md`) rather than a single global changelog.
- **Only update packages that are affected** by the commits (i.e., files changed under that package's path). A package that was not touched must not receive a new changelog entry.
- A single commit may affect several packages: update each affected package's changelog accordingly.
- For monorepo-wide or infrastructure changes (scripts, CI, tooling at the root), document them in the **root `CHANGELOG.md`** when one exists; otherwise note them in the relevant affected packages only.

### Determining Affected Packages
For each commit, resolve the package(s) affected by its changed files:
1. Get the changed files of the range: `git diff --name-only <last_tag>..HEAD`.
2. Map each file path to its owning package by its top-level directory prefix (e.g., `frontend/sentient-socle/**` → `frontend/sentient-socle`, `packages/sdk/**` → `packages/sdk`).
3. Files under the workspace root (root `package.json`, CI, configs) affect the root/workspace itself.
4. Only those packages receive changelog entries.

### Format
Follow the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) convention and SemVer, using a heading per version with the following category sections (only include non-empty ones):

- **`Added`** — new features/capabilities (`feat`).
- **`Changed`** — changes to existing behavior (`refactor`, non-breaking behavior change).
- **`Fixed`** — bug fixes (`fix`).
- **`Removed`** — removed features, deprecated code.
- **`Security`** — vulnerability fixes.
- **`Docs`** / **`Technical Details`** — documentation or implementation notes (used notably by `sentient-storage`).

```markdown
# Changelog

## [Unreleased]

### Added
- **Descriptive title**: explanation of the value delivered.

### Fixed
- **Descriptive title**: explanation of the resolved issue.
```

### Workflow
1. Identify the version range to document (e.g., last tag `vX.Y.Z` → `HEAD`).
2. Determine the affected packages from the changed files (see "Determining Affected Packages").
3. Read the commits in that range and map each one to a category using its Conventional Commit type.
4. For each affected package, group the commits that touch it; collapse them into a single comprehensive bullet.
5. Write concise, user-oriented summaries — explain *what* changed and *why it matters*, not how it was implemented.
6. Lead important entries with a short **bold label** (feature/area name) followed by a colon.
7. Update only the affected packages' `CHANGELOG.md` files; leave unaffected packages untouched.

### Rules
- **Derive everything from `git log` / `git diff`**; never invent or guess changes that are not present in the commits.
- **Update a package's changelog only if that package is affected**; do not add empty or speculative entries.
- Deduplicate when several commits touch the same feature/area; write one holistic bullet per change.
- Highlight breaking changes prominently in their own bullet (or under a dedicated note), referencing the new behavior to adopt.
- Keep language consistent with the target changelog: French bullets in Sentient `CHANGELOG.md` files, English under `sentient-storage`.
- Do not duplicate the raw commit message; paraphrase and condense for readability while staying accurate.
- Keep package changelogs scoped to that package; do not describe changes belonging to other packages.