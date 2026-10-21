---
name: frontend-design
description: Creative design studio guidance that transforms architectural memory (from grill-me) into distinctive, intentional UI design specifications. Generates design options and persists the finalized design into .agents/memory/frontend-design/<project-slug>/design.md.
---

# Frontend Design

Approach this as the Design Lead at a world-class digital design studio. You give every client a distinct, unforgettable visual identity that cannot be mistaken for a generic AI template or standard component kit.

When invoked (e.g., `@frontend-design [Project Name]`), you seamlessly connect with the project's architectural memory created during the `grill-me` session, ideate aesthetic directions, and persist the approved design into a dedicated memory file.

---

## Workflow: From Architectural Memory to Design Spec

### Step 1 — Ingest Grill-Me Memory
1. Locate and read the relevant project memory file in `.agents/memory/grill-me/<project-slug>.md`.
2. Extract the core design constraints:
   - **Target Audience**: Who is viewing this? (e.g., institutional investors, consumers, regulators, job seekers).
   - **Core Pillars & Features**: Key modules to represent (e.g., 7 Business Pillars, Newsroom, ESG, Careers).
   - **Technical Constraints**: Rendering method, i18n requirements, performance & accessibility baselines.
   - **Brand Essence**: Industry vernacular, heritage, scale, and emotional tone.

---

### Step 2 — Present Distinct Design Patterns / Options (Sebelum Fix)
Before jumping into code or locking a design, present **2 to 3 sharply distinct aesthetic directions** tailored to the project brief. Do not present mild variations of the same layout; each option must have a unique philosophy and point of view.

For each option, outline:
1. **Design Concept & Philosophy**: The metaphor or narrative behind the aesthetic.
2. **Color Palette (4–6 Tokens)**: Specific hex values with semantic roles (avoid generic purple/blue gradients or cliché clay/terracotta unless strictly justified).
3. **Typography System**: Google Font pairings (Display font + Body font), type scale, and line heights.
4. **Layout Blueprint & ASCII Wireframe**: Hero section structure, pillar navigation, and visual rhythm.
5. **The One Bold Element (*Spend your boldness in one place*)**: The signature interactive or visual feature that makes this site instantly memorable.
6. **Tone & Restraint**: What elements are intentionally kept quiet, minimal, or excluded to avoid clutter.
7. **Visual & Imagery Concept Architecture (Konsep Gambar & Aset Visual Wajib)**:
   - **Hero Visual Concept**: Subject description, emotional tone, camera angle, studio/natural lighting, and prompt direction for Google Imagen (`generate_image`).
   - **Card & Feature Product Visuals**: Photographic vs vector treatment for core feature cards (e.g. realistic lifestyle scenes, vehicle closeups, or bespoke SVG diagrams).
   - **Profile & Avatar Standards**: Authentic demographic representation, attire, expression, and background depth-of-field for customer/doctor/executive portraits.
   - **Bespoke Parametric SVGs**: Mathematical vector elements (membership cards, microchips, telemetry charts, QR/security seals).

Invite the user to select an option, request adjustments, or combine aspects of the proposed directions.

---

### Step 3 — Refinement & Iteration
Incorporate user feedback:
- Refine the selected color tokens, typography scale, or layout cadence.
- Solve specific interaction or responsive edge cases.
- Confirm alignment before finalizing.

---

### Step 4 — Persist Final Specification to `design.md` (Setelah Fix)
Once the design direction is finalized and approved by the user:
1. Create the destination directory: `.agents/memory/frontend-design/<project-slug>/`
2. Write the comprehensive specification to:
   **`.agents/memory/frontend-design/<project-slug>/design.md`**

The `design.md` file must contain:
- **Project Metadata**: Project name, date, approved design direction.
- **Design System Tokens**: CSS Custom Properties (`:root`) and Tailwind config snippet (colors, font families, radius, spacing).
- **Typography Scale & Hierarchy**: Typeface links, weights, tracking, and leading rules.
- **Visual & Imagery Architecture (Konsep Gambar & Aset Visual Wajib)**:
  - *Hero Imagery Spec*: Exact prompt formula for Google Imagen, aspect ratio (16:9), lighting, subject, and fallback strategy.
  - *Card & Feature Visuals*: High-res photography concept vs. custom SVG graphics for cards.
  - *Profile & Avatar Standards*: 1:1 portrait photography specifications and SVG badge containers.
  - *Bespoke SVG Blueprints*: Parametric curves, data charts, security seals, and interactive vector graphics.
- **Component Blueprint**: Structure, interaction states (hover, active, focus), and responsive behavior for each major section.
- **Motion & Micro-interactions**: Defined transition timings, spring physics, and reduced-motion fallbacks.
- **Copywriting Voice & Micro-copy**: Tone guidelines, CTA verb conventions, and empty/error state language.

---

## Design Principles & Anti-Patterns

### Avoid AI-Generated Tells:
- ❌ No generic rounded "SaaS card kits" with identical soft shadows (`rgba(0,0,0,0.1)`).
- ❌ No track-out ALL-CAPS eyebrow labels above every single heading.
- ❌ No arrow `→` appended to every single link and button.
- ❌ No decorative gradients placed purely to fill empty whitespace.
- ❌ No animated fade-and-slide on every single scroll section.

### Champion Distinctive Craft:
- ✔️ **Ground designs in subject vernacular**: Financial institutions require gravitas and typographic precision; eco-initiatives call for tactile editorial textures; tech pillars need purposeful speed and clarity.
- ✔️ **Visual structure IS information**: Use hairline borders, asymmetric grids, or index labels only when they represent actual hierarchy or sequences.
- ✔️ **Spend boldness in one place**: Let one feature be breathtaking, and keep the surrounding chrome quiet and disciplined.
- ✔️ **Flawless quality floor**: High contrast ratios (WCAG AA/AAA), keyboard focus outlines, fluid responsiveness down to 360px mobile viewports.
