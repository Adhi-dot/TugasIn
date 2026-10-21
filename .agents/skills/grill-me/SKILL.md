---
name: grill-me
description: A relentless interview to sharpen a plan or design, culminating in a persistent Architecture Decision Record (ADR) or memory file in .agents/memory/.
---

# Grill-Me Skill

This skill conducts a rigorous, multi-round interview to stress-test, refine, and finalize architectural designs, system plans, or feature specifications.

## Workflow

### Step 1 — Ingest the Plan
Ask the user to outline the feature, architecture, tech stack, and expected flow.

### Step 2 — Relentless Grilling (3 Targeted Rounds)
Challenge assumptions across 3 iterative rounds:
- **Round 1**: Scalability, Rendering/Data Flow, Bottlenecks, SEO & Edge Cases.
- **Round 2**: Storage, Media Pipelines, Security, Compliance (e.g. UU PDP, GDPR), and RBAC Governance.
- **Round 3**: Disaster Recovery, Resilience, Fail-Safe Queues, Preview Modes, and Outage Tolerance.

In each round, present 2–3 sharp, scenario-based dilemmas requiring concrete decisions.

### Step 3 — Final Assessment & Verdict
Once all critical points are resolved, evaluate the outcome and certify the architecture.

### Step 4 — Persist Memory Output (ADR)
Always save the final sharpened plan and key architectural decisions into the workspace memory directory:
- **Target Path**: `.agents/memory/grill-me/<topic-slug>.md`
- **Contents**:
  - Context & Requirements Summary
  - Architecture Decision Record (ADR) Comparison Table (Before vs. After Grilling)
  - Detailed technical decisions for each pillar (Rendering, Storage, Caching, Security, Governance)
  - System Architecture Diagram (ASCII / Mermaid)
  - Implementation Next Steps
