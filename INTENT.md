# INTENT: Atomic Primitives

## Goal

Build a library of polished, self-contained Web Components — the **component vocabulary** that an AI assembles into just-in-time UI views on the Employee Experience graph.

The insight: AI-generated UI feels delightful when it assembles from a finite set of beautifully designed, consistent building blocks rather than generating raw HTML. Like a newspaper — every edition is different, but you instantly know how to read it because the typographic system is consistent.

These primitives serve all three interaction modes described in KNOWLEDGE.md: Situation Rooms, Generated Automations, and Generated Monitors.

## Current Direction

Starting with 4 foundational components + a gallery page + a scenario demo page. The server includes the full graph query layer (ported from jit-ui-canvas) so components can be developed against real data.

**First 4 components:**
1. `ee-person-card` — the most-used primitive, shows a person
2. `ee-stat-card` — single key metric with context
3. `ee-team-grid` — group composition view
4. `ee-alert-banner` — attention/severity banner

## What's Done

- Repo created on GitHub (ee-graph-atomic-primitives)
- KNOWLEDGE.md — strategic vision document
- CLAUDE.md — technical project bible
- server.js — Express on port 3457, full graph data layer
- Component stubs (4 files)
- Gallery page (index.html) + scenario demo page (scenario.html)
- CSS custom properties theming foundation
- package.json with dependencies

## Rejected Approaches

_None yet._

## Open Questions

- **Component API design:** Attributes for simple values, JS properties for complex objects — but where's the exact line? Should components also emit custom events for interactions (click on person card → `ee-person-select` event)?
- **Theming depth:** How many CSS custom properties is the right amount? Start minimal and add as needed?
- **Scenario page data source:** Currently fetches from `/api/graph/sample`. As we build more scenarios, should each scenario be a separate HTML file or a single page with route/query params?

## Next Steps

1. Build `ee-person-card` for real — make it beautiful, production-quality
2. Build `ee-stat-card`
3. Build `ee-team-grid` (composes person cards)
4. Build `ee-alert-banner`
5. Polish the gallery and scenario pages
6. Start thinking about how the AI assembles these (layout/composition layer)
