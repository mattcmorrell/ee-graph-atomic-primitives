# Atomic Primitives — EE Graph Experiment

## Data Source

This project operates on the **Acme Co Employee Experience Graph** — a property graph representing a 148-employee tech company headquartered in Austin, TX.

**Hosted at GitHub Pages (fetch at startup):**
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
- Avatar URLs follow the pattern `data/avatars/person-XXX.jpg` (hosted at the same GitHub Pages base URL)

### Loading pattern (from sibling project)

```js
const DATA_URL = 'https://mattcmorrell.github.io/ee-graph/data';
const [nodesRes, edgesRes] = await Promise.all([
  fetch(`${DATA_URL}/nodes.json`),
  fetch(`${DATA_URL}/edges.json`)
]);
const nodes = (await nodesRes.json()).nodes;
const edges = (await edgesRes.json()).edges;
```

### Useful indexes to build after loading

```js
const nodesById = {};      // node.id → node
const nodesByType = {};    // node.type → [nodes]
const edgesBySource = {};  // edge.source → [edges]
const edgesByTarget = {};  // edge.target → [edges]
```

### Proven query patterns (from sibling project jit-ui-canvas)

These tool functions exist in `../jit-ui-canvas/server.js` and can be adapted:

| Function | What it does |
|---|---|
| `search_people(query)` | Fuzzy search people by name/role/email |
| `get_person_full(person_id)` | Full profile + all connections grouped by edge type |
| `get_team_full(team_id)` | Team members, manager, projects |
| `get_direct_reports(person_id, recursive)` | Reporting tree, optionally recursive to depth 5 |
| `traverse(start_id, edge_types, max_depth)` | Generic BFS from any node, capped at 50 results |
| `search_nodes(query, node_type)` | Search any node type by name/title/role/description |
| `get_impact_radius(person_id)` | Multi-hop impact analysis: reports, mentees, projects, skills, teams, pipeline |
| `get_org_stats(stat_type)` | Aggregate stats: managers_by_reports, team_sizes, department_sizes, division_sizes, tenure_distribution, level_distribution, location_distribution, skill_coverage |

## Sibling Project

The `jit-ui-canvas` project (`../jit-ui-canvas/`) is a canvas-based progressive disclosure UI on the same data. Refer to its `server.js` for the full graph loading, indexing, and query implementation.

## Tech Preferences

- Plain JS/HTML/CSS for prototyping (no frameworks unless the experiment needs one)
- Express for server if needed
- OpenAI SDK for LLM calls (with `dotenv` for API key)
- Keep it simple — these are experiments
