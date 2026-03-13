# Atomic Primitives — EE Graph Experiment

> **Before making product decisions** (component design, interaction patterns, feature scope), **read KNOWLEDGE.md** for strategic context.

## What This Is

A library of polished Web Components (`<ee-person-card>`, `<ee-stat-card>`, etc.) that an AI can assemble into just-in-time UI views on an Employee Experience graph. See KNOWLEDGE.md for the full strategic vision.

## Tech Stack

- **Server:** Node.js + Express, port 3457
- **LLM:** OpenAI SDK + dotenv for API key
- **Frontend:** Plain HTML/CSS/JS — no frameworks
- **Components:** Web Components (custom elements), each self-contained with Shadow DOM
- **Styling:** CSS custom properties for theming, each component owns its styles
- **Data:** EE graph fetched from GitHub Pages at startup

## Data Source

This project operates on the **Acme Co Employee Experience Graph** — a property graph representing a 148-employee tech company headquartered in Austin, TX.

**Hosted at GitHub Pages (fetched at server startup):**
- Nodes: `https://mattcmorrell.github.io/ee-graph/data/nodes.json`
- Edges: `https://mattcmorrell.github.io/ee-graph/data/edges.json`

**Scale:** ~648 nodes (31 types), ~3,104 edges

### Graph Schema

**Node format:**
```json
{ "id": "person-008", "type": "person", "properties": { "name": "Raj Patel", "role": "Engineering Lead", ... } }
```

**Edge format:**
```json
{ "source": "person-008", "target": "team-001", "type": "member_of", "metadata": { "role": "manager" } }
```

**Key node types:** person, team, project, skill, department, division, survey_response, performance_review, position, candidate

**Key edge types:** reports_to, member_of, works_on, has_skill, mentors, interviewed_by, has_review

**Person properties:** name, role, level, status, startDate, location, email, avatarUrl
- Avatar URLs: `data/avatars/person-XXX.jpg` at the GitHub Pages base URL

### Server Graph Layer

The server (`server.js`) loads the graph at startup and provides these query functions (also exposed as REST endpoints):

| Function | Endpoint | What it does |
|---|---|---|
| `search_people(query)` | `GET /api/graph/search-people?q=` | Fuzzy search people by name/role/email |
| `get_person_full(id)` | `GET /api/graph/person/:id` | Full profile + all connections grouped by edge type |
| `get_team_full(id)` | `GET /api/graph/team/:id` | Team members, manager, projects |
| `get_direct_reports(id, recursive)` | `GET /api/graph/reports/:id?recursive=true` | Reporting tree, optionally recursive to depth 5 |
| `get_impact_radius(id)` | `GET /api/graph/impact/:id` | Multi-hop impact analysis: reports, mentees, projects, skills, teams, pipeline |
| `get_graph_schema()` | `GET /api/graph/schema` | Node/edge type metadata |
| `get_org_stats(type)` | `GET /api/graph/stats/:type` | Aggregate stats (team_sizes, tenure_distribution, etc.) |

Sample data for the gallery: `GET /api/graph/sample`

## Component Conventions

### Naming
All components use the `ee-` prefix: `<ee-person-card>`, `<ee-stat-card>`, etc.

### Data Passing
- **Attributes** for simple scalar values (strings, numbers, booleans)
- **JS properties** for complex objects (person data, arrays of members, etc.)
- Set data via property: `document.querySelector('ee-person-card').person = personObj;`

### Styling
- Each component uses **Shadow DOM** for style encapsulation
- Theme via **CSS custom properties** defined in `styles.css`
- Components reference these properties in their shadow styles (with fallbacks)

### Structure
Each component file (`public/components/ee-*.js`) is a self-contained ES module:
```js
class EePersonCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  // ... render logic
}
customElements.define('ee-person-card', EePersonCard);
```

## Component Vocabulary

| Component | Status | Description |
|---|---|---|
| `ee-person-card` | Stub | Person: avatar, name, role, level, location |
| `ee-stat-card` | Stub | Single metric with label + context |
| `ee-team-grid` | Stub | Grid of people showing group composition |
| `ee-alert-banner` | Stub | Severity-coded attention banner |
| `ee-cascade-diagram` | Planned | Impact/ripple visualization |
| `ee-timeline` | Planned | Temporal sequence of events |
| `ee-coverage-matrix` | Planned | "Who covers what" grid |
| `ee-risk-gauge` | Planned | Single-metric severity indicator |
| `ee-checklist` | Planned | Action steps / runbook |
| `ee-comparison-table` | Planned | Side-by-side evaluation |
| `ee-relationship-line` | Planned | Connection between entities |
| `ee-graph-path` | Planned | Traversal visualization (visible-on-demand) |

## Design Principles

1. **Structure first, insight streams in** — Graph data populates component slots instantly (<500ms). AI reasoning streams in after.
2. **Every data point is grounded** — Numbers are real graph query results, never AI-estimated. Every claim is a verifiable traversal.
3. **AI interprets but never invents** — Facts and interpretations are visually distinct.
4. **Stable patterns for similar intents** — Same question type → same layout shape. Users build muscle memory.
5. **Newspaper analogy** — The primitives are the typographic system. The AI is the layout editor. Every "edition" is different but instantly readable.

## Sibling Project

The `jit-ui-canvas` project (`../jit-ui-canvas/`) is a canvas-based progressive disclosure UI on the same data. The graph layer in this project's `server.js` was ported from its implementation.
