---
name: fr-spec
description: Transforms architectural memory from grill-me into detailed Functional Requirements (FR) where each FR strictly maps 1-to-1 to a UI Screen/Page. Persists output to .agents/memory/fr-spec/<project-slug>/fr-spec.md and screen-matrix.json.
allowed-tools:
  - "Read"
  - "Write"
---

# FR-Spec Skill (Functional Requirements & UI Screen Mapper)

You are the **Lead Product Architect & Systems Analyst**. Your task is to ingest architectural decisions from `@grill-me`, decompose the project scope into rigorous **Functional Requirements (FR)**, and establish a strict **1:1 mapping between each Functional Requirement and a dedicated UI Screen/Page**.

---

## Core Philosophy
1. **Strict Determinism**: If there are $N$ Functional Requirements defined in scope, there MUST be exactly $N$ distinct UI Screens planned for generation in Stitch.
2. **No Orphan Screens**: Every UI page must directly serve a specific, documented FR.
3. **Contract for Downstream Skills**: The output of this skill (`fr-spec.md` and `screen-matrix.json`) serves as the official input contract for `@frontend-design`, Stitch MCP screen generation, and final React conversion.

---

## Workflow Steps

### Step 1 — Ingest Requirements (Grill-Me atau Direct User Brief)
1. Periksa apakah terdapat file memori arsitektur di `.agents/memory/grill-me/<project-slug>.md`.
   - **Jika ada:** Baca keputusan arsitektur, pilar sistem, dan ADR dari grill-me.
   - **Jika tidak ada (Grill-Me dilewati):** Ekstrak langsung dari prompt/brief pengguna atau dokumen spesifikasi yang diberikan.
2. Identifikasi batasan inti:
   - Target Pengguna & Problem Statement.
   - Fitur utama & operasi data (CRUD, analitik, workflows).
   - Batasan teknis & aturan bisnis.

---

### Step 2 — Formulate Functional Requirements (FR)
Decompose the system into atomic, unambiguous Functional Requirements:
- Use standardized identifiers: `FR-01`, `FR-02`, ..., `FR-N`.
- For each FR, specify:
  1. **Title & Objective**: What the user or system achieves.
  2. **Actor / Role**: Who performs this action (e.g., Admin, Trader, Public User).
  3. **User Action & Flow**: Step-by-step trigger and interaction.
  4. **Data Input / Output**: Payload, parameters, and expected response.
  5. **Edge Cases & Validation**: Empty states, error conditions, role restrictions.

---

### Step 3 — Enforce 1:1 UI Screen Mapping
For every `FR-xx`, define a dedicated UI Screen:
- **Screen ID**: `screen-01-<slug>`, `screen-02-<slug>`, etc.
- **Screen Title & Route**: e.g., `FR-01: Asset Allocation Management` $\rightarrow$ `screen-01-asset-allocation` (`/portfolio/allocation`).
- **Primary Hero / Focus Component**: The centerpiece element solving this FR (e.g., Interactive Rebalancing Matrix).
- **Secondary Widgets & Controls**: Supporting filters, summaries, logs, or secondary actions.
- **Stitch Generation Intent**: Clear 2–3 sentence visual summary that will be passed to `@enhance-prompt` and Stitch MCP.

> [!IMPORTANT]
> If a feature seems to require multiple sub-pages (e.g., List view vs. Detail/Create view), either group them into a single modal/drawer within the screen or explicitly split them into distinct FRs (`FR-01a`, `FR-01b`) so the count of screens always matches the FR count.

---

### Step 4 — Persist to Memory

Save the deliverables into `.agents/memory/fr-spec/<project-slug>/`:

#### 1. `fr-spec.md` (Human-Readable Master Spec)
Contains:
- Executive Summary & Scope Certification.
- Functional Requirements Table.
- Detailed FR Specifications.
- UI Screen Blueprint (with component breakdowns and layout hierarchy).

#### 2. `screen-matrix.json` (Machine-Readable Contract for Stitch MCP)
Structured JSON used by automated scripts and Stitch tools:
```json
{
  "projectSlug": "<project-slug>",
  "totalFRs": 5,
  "totalScreens": 5,
  "screens": [
    {
      "frId": "FR-01",
      "screenId": "screen-01-dashboard",
      "title": "Executive Overview Dashboard",
      "route": "/dashboard",
      "purpose": "Provide real-time telemetry and KPI oversight",
      "primaryComponent": "MetricsTelemetryGrid",
      "stitchPromptBrief": "A dark-mode executive telemetry dashboard featuring high-contrast KPI counters, streaming line charts, and status indicators..."
    }
  ]
}
```

---

## Output Template (`fr-spec.md`)

```markdown
# Functional Requirements Specification (FR-Spec)
**Project:** [Project Name]  
**Source Memory:** `.agents/memory/grill-me/<project-slug>.md`  
**Total FRs:** N  
**Total Target UI Screens:** N (1:1 Ratio Guaranteed)  

---

## 1. Traceability Matrix

| FR ID | Feature Name | Target Screen ID | Route / View | Primary UI Component |
| :--- | :--- | :--- | :--- | :--- |
| FR-01 | [Name] | screen-01-[slug] | /[route] | [Component] |
| FR-02 | [Name] | screen-02-[slug] | /[route] | [Component] |

---

## 2. Detailed Functional Requirements & Screen Specs

### FR-01: [Feature Title]
- **Target Screen:** `screen-01-[slug]`
- **User Role:** [Role]
- **Objective:** [Clear description]
- **Workflow:**
  1. User navigates to ...
  2. System fetches ...
  3. User interacts with ...
- **UI Blueprint:**
  - **Zone A (Top):** [Header / Filters]
  - **Zone B (Main):** [Core Data Visualizer / Table]
  - **Zone C (Side/Bottom):** [Audit / Contextual Actions]
- **Stitch MCP Generation Brief:**
  > "[Evocative visual description injected with layout and specific controls for Stitch generation]"

---
*(Repeat for FR-02 through FR-N)*
```
