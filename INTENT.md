# INTENT: Atomic Primitives

## Goal

Build a library of polished, self-contained Web Components — the **component vocabulary** that an AI assembles into just-in-time UI views on the Employee Experience graph.

The insight: AI-generated UI feels delightful when it assembles from a finite set of beautifully designed, consistent building blocks rather than generating raw HTML. Like a newspaper — every edition is different, but you instantly know how to read it because the typographic system is consistent.

These primitives serve all three interaction modes described in KNOWLEDGE.md: Situation Rooms, Generated Automations, and Generated Monitors.

## Current Direction

All 13 Tier 1 primitives are built and working on a canvas engine with a hardcoded Raj Patel departure scenario. The foundation is complete — ready for AI integration.

**Composition model: Grid Canvas.** Primitives are placed on a 96px grid canvas, sized NxM blocks. The AI arranges them using gestalt principles:
- **Horizontal alignment** = alternatives, parallel concerns, peer metrics
- **Vertical alignment + indent** = drill-down, progressive disclosure, parent→child
- **Subtle connector lines** (SVG paths, 2px, rounded corners) show hierarchy between parent and child primitives
- **Follow-ups** from the user spawn new primitive clusters on the canvas, connected to their source
- Floating input bar at the bottom for conversation

This was chosen over page-based layouts (4 explored, all rejected) because the spatial arrangement itself carries meaning — position, proximity, and grouping are additional information channels that a linear page can't express.

**Primitive architecture** (see KNOWLEDGE.md for full rationale):
- **Tier 1:** 13 polished, flexible Web Components. AI configures them richly, they own rendering quality.
- **Tier 2:** AI composes Tier 1 primitives into novel layouts. This is the 80% case.
- **Tier 3:** `ee-canvas-block` — generic container for AI-generated bespoke HTML/SVG when no Tier 1 primitive fits. Best ones get promoted to Tier 1 over time.

**Answered questions from Phase 1:**
- **Grid size API:** Each primitive exposes a `get gridSize()` getter returning `{cols, rows}` computed from current data. The engine reads this when placing blocks.
- **Connector attachment:** Engine calculates from block grid position — parent bottom center to child left center, L-shaped paths with rounded corners.
- **Pan/zoom:** Full infinite canvas with pointer drag pan and scroll wheel zoom (0.3–2.0 range). `zoomToFit()` and `focusOn(id)` camera methods.
- **Tier 3 rendering:** `ee-canvas-block` accepts raw HTML via `content` property, rendered inside Shadow DOM for isolation.

## What's Done

- Repo created on GitHub (ee-graph-atomic-primitives)
- KNOWLEDGE.md — strategic vision document
- CLAUDE.md — technical project bible
- server.js — Express on port 3457, full graph data layer with REST endpoints
- CSS custom properties theming foundation
- Design exploration: 5 mockups in `mockups/designs.html` with feedback panel
- **Decision: Grid Canvas** chosen as composition model (page layouts rejected)
- **Decision: Engine-first** build order (canvas before primitive polish)
- **Decision: Three-tier** primitive architecture (polished + composed + bespoke)
- **Canvas engine** (`public/canvas-engine.js`) — 96px grid, block placement with `addBlock()`, SVG connector lines with `addConnector()`, pan/zoom, `zoomToFit()`, `focusOn()`, animated block entrance
- **All 13 primitives built** — each with Shadow DOM, CSS custom property theming, `get gridSize()` getter:
  1. `ee-person-card` — avatar, name, role, level, location; sm/md/lg sizes
  2. `ee-stat-card` — metric value, label, context, severity color
  3. `ee-alert-banner` — severity-coded banner with icon, message, action button
  4. `ee-team-grid` — mini person avatars in grid with manager highlight
  5. `ee-person-list` — compact vertical list of people
  6. `ee-comparison-table` — side-by-side entity comparison table
  7. `ee-coverage-matrix` — skill/cert × team coverage with status icons
  8. `ee-timeline` — vertical timeline with colored severity dots
  9. `ee-insight-block` — AI analysis with "AI" badge, visually distinct from facts
  10. `ee-checklist` — action items with status icons, owners, priority badges
  11. `ee-relationship-map` — SVG node-link diagram with focus node
  12. `ee-org-chart` — hierarchical tree with indented reports
  13. `ee-canvas-block` — generic Tier 3 container for bespoke AI content
- **Gallery page** (`public/index.html`) — shows all 13 components with real graph data
- **Canvas demo** (`public/canvas.html` + `public/app.js`) — hardcoded Raj Patel departure scenario on grid canvas with 8 primitives, connector lines, floating input bar, suggestion chips, zoom controls

## Rejected Approaches

- **Page-based layouts** (Command Center, Conversation Canvas, Spotlight, Workspace Tabs) — all explored as mockups in `mockups/designs.html`. They work but look like every other AI dashboard. The canvas is where primitives become more than just cards on a page — the arrangement IS the analysis.

## Open Questions

- **AI layout spec format:** What does the AI output to describe a canvas layout? JSON with primitive type, grid position, size, data, parent ID?
- **Progressive streaming:** How do we stream AI reasoning into insight blocks while keeping structure stable?
- **Follow-up mechanics:** When a user asks a follow-up, where do new primitives appear? Right of existing? Below? New cluster connected to source?

## Next Steps

1. **Add OpenAI** — AI generates layout specs from user questions + graph traversals
2. **Run 3-4 scenario types** — each new scenario type uses different primitive combinations (coverage check, person lookup, comparison, runbook)
3. **Polish primitives** based on what the canvas actually demands (sizing, transitions, hover states)
4. **Follow-up flow** — user asks follow-up, new primitives spawn connected to source
5. **Save/share lifecycle** — persist canvas layouts, shareable links
