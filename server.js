require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3457;

// --- Graph Loading ---
const DATA_URL = 'https://mattcmorrell.github.io/ee-graph/data';
let nodes, edges;

async function loadGraphData() {
  console.log('Loading graph data from ee-graph...');
  const [nodesRes, edgesRes] = await Promise.all([
    fetch(`${DATA_URL}/nodes.json`),
    fetch(`${DATA_URL}/edges.json`)
  ]);
  nodes = (await nodesRes.json()).nodes;
  edges = (await edgesRes.json()).edges;
  console.log(`Graph loaded: ${nodes.length} nodes, ${edges.length} edges`);
  buildIndexes();
}

// --- Indexes ---
const nodesById = {};
const edgesBySource = {};
const edgesByTarget = {};
const nodesByType = {};

function buildIndexes() {
  for (const n of nodes) {
    nodesById[n.id] = n;
    if (!nodesByType[n.type]) nodesByType[n.type] = [];
    nodesByType[n.type].push(n);
  }
  for (const e of edges) {
    if (!edgesBySource[e.source]) edgesBySource[e.source] = [];
    edgesBySource[e.source].push(e);
    if (!edgesByTarget[e.target]) edgesByTarget[e.target] = [];
    edgesByTarget[e.target].push(e);
  }
  console.log(`Node types: ${Object.keys(nodesByType).length}, indexed by source: ${Object.keys(edgesBySource).length}, by target: ${Object.keys(edgesByTarget).length}`);
}

// --- Helpers ---
function nodeSummary(n) {
  if (!n) return null;
  const p = n.properties;
  const base = { id: n.id, type: n.type, name: p.name || p.title || n.id };
  if (n.type === 'person') {
    return { ...base, role: p.role, level: p.level, status: p.status, startDate: p.startDate, location: p.location, avatarUrl: p.avatarUrl };
  }
  if (n.type === 'team') return { ...base, teamType: p.teamType, headcount: p.headcount };
  if (n.type === 'project') return { ...base, status: p.status, priority: p.priority, targetEndDate: p.targetEndDate };
  if (n.type === 'skill') return { ...base, category: p.category };
  return { ...base, ...Object.fromEntries(Object.entries(p).slice(0, 5)) };
}

function fuzzyMatch(text, query) {
  if (!text) return false;
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  return t.includes(q) || q.split(/\s+/).every(w => t.includes(w));
}

// --- Graph Query Functions ---

function search_people(query) {
  const results = (nodesByType['person'] || [])
    .filter(n => {
      const p = n.properties;
      return fuzzyMatch(p.name, query) || fuzzyMatch(p.role, query) || fuzzyMatch(p.email, query);
    })
    .slice(0, 10)
    .map(nodeSummary);
  return { count: results.length, people: results };
}

function get_person_full(person_id) {
  const n = nodesById[person_id];
  if (!n || n.type !== 'person') return { error: `Person ${person_id} not found` };

  const outEdges = edgesBySource[person_id] || [];
  const inEdges = edgesByTarget[person_id] || [];

  const connections = {};
  for (const e of [...outEdges, ...inEdges]) {
    const targetId = e.source === person_id ? e.target : e.source;
    const targetNode = nodesById[targetId];
    if (!targetNode) continue;
    if (targetNode.type === 'survey_response') continue;

    const key = e.type;
    if (!connections[key]) connections[key] = [];
    connections[key].push({
      direction: e.source === person_id ? 'outgoing' : 'incoming',
      node: nodeSummary(targetNode),
      metadata: e.metadata || {}
    });
  }

  return {
    person: { id: n.id, ...n.properties },
    connectionSummary: Object.fromEntries(
      Object.entries(connections).map(([type, conns]) => [type, { count: conns.length, items: conns.slice(0, 15) }])
    ),
    totalConnections: outEdges.length + inEdges.length
  };
}

function get_team_full(team_id) {
  const n = nodesById[team_id];
  if (!n || n.type !== 'team') return { error: `Team ${team_id} not found` };

  const memberEdges = (edgesByTarget[team_id] || []).filter(e => e.type === 'member_of');
  const members = memberEdges.map(e => {
    const person = nodesById[e.source];
    return person ? { ...nodeSummary(person), teamRole: (e.metadata || {}).role } : null;
  }).filter(Boolean);

  const manager = members.find(m => m.teamRole === 'manager');

  const projectIds = new Set();
  const projects = [];
  for (const m of memberEdges) {
    for (const e of (edgesBySource[m.source] || [])) {
      if (e.type === 'works_on' && !projectIds.has(e.target)) {
        projectIds.add(e.target);
        const proj = nodesById[e.target];
        if (proj) projects.push(nodeSummary(proj));
      }
    }
  }

  return {
    team: { id: n.id, ...n.properties },
    manager: manager || null,
    members: members.slice(0, 20),
    memberCount: members.length,
    projects: projects.slice(0, 10)
  };
}

function get_direct_reports(person_id, recursive = false) {
  const person = nodesById[person_id];
  if (!person) return { error: `Person ${person_id} not found` };

  function getReports(pid, depth) {
    if (depth > 5) return [];
    const reportEdges = (edgesByTarget[pid] || []).filter(e => e.type === 'reports_to');
    const reports = [];
    for (const e of reportEdges) {
      const p = nodesById[e.source];
      if (!p) continue;
      const report = { ...nodeSummary(p), depth };
      if (recursive) {
        const subReports = getReports(e.source, depth + 1);
        if (subReports.length > 0) report.directReports = subReports;
      }
      reports.push(report);
    }
    return reports;
  }

  const reports = getReports(person_id, 1);
  return {
    manager: nodeSummary(person),
    reports,
    totalCount: countTree(reports)
  };
}

function countTree(reports) {
  let count = reports.length;
  for (const r of reports) {
    if (r.directReports) count += countTree(r.directReports);
  }
  return count;
}

function traverse(start_id, edge_types, max_depth = 3) {
  const startNode = nodesById[start_id];
  if (!startNode) return { error: `Node ${start_id} not found` };

  const visited = new Set([start_id]);
  const discoveredNodes = [{ ...nodeSummary(startNode), depth: 0 }];
  const discoveredEdges = [];
  let frontier = [start_id];

  for (let depth = 1; depth <= Math.min(max_depth, 5); depth++) {
    const nextFrontier = [];
    for (const nodeId of frontier) {
      const outEdges = (edgesBySource[nodeId] || []).filter(e => !edge_types || edge_types.includes(e.type));
      const inEdges = (edgesByTarget[nodeId] || []).filter(e => !edge_types || edge_types.includes(e.type));

      for (const e of [...outEdges, ...inEdges]) {
        const neighborId = e.source === nodeId ? e.target : e.source;
        if (visited.has(neighborId)) continue;
        visited.add(neighborId);
        const neighbor = nodesById[neighborId];
        if (!neighbor) continue;

        discoveredNodes.push({ ...nodeSummary(neighbor), depth });
        discoveredEdges.push({ source: e.source, target: e.target, type: e.type, metadata: e.metadata });
        nextFrontier.push(neighborId);

        if (discoveredNodes.length >= 50) {
          return { nodes: discoveredNodes, edges: discoveredEdges, truncated: true, message: 'Capped at 50 nodes' };
        }
      }
    }
    frontier = nextFrontier;
  }

  return { nodes: discoveredNodes, edges: discoveredEdges, truncated: false };
}

function search_nodes(query, node_type = null) {
  const pool = node_type ? (nodesByType[node_type] || []) : nodes;
  const results = pool.filter(n => {
    const p = n.properties;
    return fuzzyMatch(p.name || '', query) || fuzzyMatch(p.title || '', query) ||
           fuzzyMatch(p.role || '', query) || fuzzyMatch(p.description || '', query);
  }).slice(0, 15).map(nodeSummary);
  return { count: results.length, results };
}

function get_impact_radius(person_id) {
  const person = nodesById[person_id];
  if (!person || person.type !== 'person') return { error: `Person ${person_id} not found` };

  const outEdges = edgesBySource[person_id] || [];
  const inEdges = edgesByTarget[person_id] || [];

  // Direct reports
  const reportEdges = inEdges.filter(e => e.type === 'reports_to');
  const directReports = reportEdges.map(e => nodeSummary(nodesById[e.source])).filter(Boolean);

  // Mentees
  const menteeEdges = outEdges.filter(e => e.type === 'mentors');
  const mentees = menteeEdges.map(e => {
    const mentee = nodesById[e.target];
    if (!mentee) return null;
    const otherMentors = (edgesByTarget[e.target] || []).filter(me => me.type === 'mentors' && me.source !== person_id);
    return { ...nodeSummary(mentee), otherMentorCount: otherMentors.length, metadata: e.metadata };
  }).filter(Boolean);

  // Projects and co-contributors
  const projectEdges = outEdges.filter(e => e.type === 'works_on');
  const projects = projectEdges.map(e => {
    const proj = nodesById[e.target];
    if (!proj) return null;
    const contributors = (edgesByTarget[e.target] || [])
      .filter(pe => pe.type === 'works_on' && pe.source !== person_id)
      .map(pe => nodeSummary(nodesById[pe.source]))
      .filter(Boolean);
    return {
      ...nodeSummary(proj),
      personRole: (e.metadata || {}).role,
      personAllocation: (e.metadata || {}).allocation,
      otherContributors: contributors,
      contributorCount: contributors.length
    };
  }).filter(Boolean);

  // Skills and who else has them
  const skillEdges = outEdges.filter(e => e.type === 'has_skill');
  const skills = skillEdges.map(e => {
    const skill = nodesById[e.target];
    if (!skill) return null;
    const othersWithSkill = (edgesByTarget[e.target] || [])
      .filter(se => se.type === 'has_skill' && se.source !== person_id)
      .map(se => {
        const other = nodesById[se.source];
        return other && other.properties.status === 'active' ? { ...nodeSummary(other), proficiency: (se.metadata || {}).proficiency } : null;
      })
      .filter(Boolean);
    return {
      ...nodeSummary(skill),
      personProficiency: (e.metadata || {}).proficiency,
      othersWithSkill: othersWithSkill.slice(0, 5),
      totalOthersCount: othersWithSkill.length
    };
  }).filter(Boolean);

  // Team membership
  const teamEdges = outEdges.filter(e => e.type === 'member_of');
  const teams = teamEdges.map(e => {
    const team = nodesById[e.target];
    if (!team) return null;
    const memberCount = (edgesByTarget[e.target] || []).filter(te => te.type === 'member_of').length;
    return { ...nodeSummary(team), memberCount, personRole: (e.metadata || {}).role };
  }).filter(Boolean);

  // Manager
  const managerEdge = outEdges.find(e => e.type === 'reports_to');
  const manager = managerEdge ? nodeSummary(nodesById[managerEdge.target]) : null;

  // Recruiting pipeline
  const interviewEdges = inEdges.filter(e => e.type === 'interviewed_by');
  const pipeline = interviewEdges.map(e => {
    const candidate = nodesById[e.source];
    return candidate ? { ...nodeSummary(candidate), interviewMetadata: e.metadata } : null;
  }).filter(Boolean);

  // Reviews
  const reviewEdges = outEdges.filter(e => e.type === 'has_review');
  const reviews = reviewEdges.map(e => {
    const review = nodesById[e.target];
    return review ? { id: review.id, ...review.properties } : null;
  }).filter(Boolean);

  return {
    person: { id: person.id, ...person.properties },
    directReports: { count: directReports.length, people: directReports },
    mentees: { count: mentees.length, people: mentees },
    projects: { count: projects.length, items: projects },
    skills: { count: skills.length, items: skills },
    teams: { count: teams.length, items: teams },
    manager,
    pipeline: { count: pipeline.length, candidates: pipeline },
    reviews,
    summary: {
      totalDirectReports: directReports.length,
      totalProjects: projects.length,
      soloProjects: projects.filter(pr => pr.contributorCount === 0).map(pr => pr.name),
      criticalProjects: projects.filter(pr => pr.priority === 'critical' || pr.priority === 'high').map(pr => pr.name),
      uniqueSkills: skills.filter(s => s.totalOthersCount < 3).map(s => s.name),
      menteesWithNoOtherMentor: mentees.filter(m => m.otherMentorCount === 0).map(m => m.name)
    }
  };
}

function get_graph_schema() {
  const nodeTypes = {};
  for (const [type, list] of Object.entries(nodesByType)) {
    const sample = list[0];
    const propKeys = sample ? Object.keys(sample.properties) : [];
    nodeTypes[type] = { count: list.length, properties: propKeys };
  }

  const edgeTypeCounts = {};
  const edgeTypeMeta = {};
  for (const e of edges) {
    edgeTypeCounts[e.type] = (edgeTypeCounts[e.type] || 0) + 1;
    if (!edgeTypeMeta[e.type] && e.metadata) {
      edgeTypeMeta[e.type] = Object.keys(e.metadata);
    }
  }
  const edgeTypes = {};
  for (const [type, count] of Object.entries(edgeTypeCounts)) {
    edgeTypes[type] = { count, metadataKeys: edgeTypeMeta[type] || [] };
  }

  return { totalNodes: nodes.length, totalEdges: edges.length, nodeTypes, edgeTypes };
}

function get_org_stats(stat_type) {
  const people = nodesByType['person'] || [];

  switch (stat_type) {
    case 'managers_by_reports': {
      const managers = [];
      for (const p of people) {
        const reportEdges = (edgesByTarget[p.id] || []).filter(e => e.type === 'reports_to');
        if (reportEdges.length > 0) {
          const teamEdge = (edgesBySource[p.id] || []).find(e => e.type === 'member_of');
          const team = teamEdge ? nodesById[teamEdge.target] : null;
          managers.push({
            ...nodeSummary(p),
            directReportCount: reportEdges.length,
            teamName: team ? team.properties.name || team.properties.title : null
          });
        }
      }
      managers.sort((a, b) => b.directReportCount - a.directReportCount);
      return { stat: 'managers_by_reports', managers: managers.slice(0, 15), totalManagers: managers.length };
    }

    case 'team_sizes': {
      const teams = nodesByType['team'] || [];
      const result = teams.map(t => {
        const memberEdges = (edgesByTarget[t.id] || []).filter(e => e.type === 'member_of');
        return { ...nodeSummary(t), memberCount: memberEdges.length };
      }).sort((a, b) => b.memberCount - a.memberCount);
      return { stat: 'team_sizes', teams: result.slice(0, 20), totalTeams: result.length };
    }

    case 'tenure_distribution': {
      const now = new Date();
      const buckets = { '<1yr': 0, '1-2yr': 0, '2-3yr': 0, '3-5yr': 0, '5+yr': 0 };
      for (const p of people) {
        if (!p.properties.startDate) continue;
        const years = (now - new Date(p.properties.startDate)) / (365.25 * 24 * 60 * 60 * 1000);
        if (years < 1) buckets['<1yr']++;
        else if (years < 2) buckets['1-2yr']++;
        else if (years < 3) buckets['2-3yr']++;
        else if (years < 5) buckets['3-5yr']++;
        else buckets['5+yr']++;
      }
      return { stat: 'tenure_distribution', buckets, totalPeople: people.length };
    }

    case 'level_distribution': {
      const levels = {};
      for (const p of people) {
        const level = p.properties.level || 'unknown';
        levels[level] = (levels[level] || 0) + 1;
      }
      return { stat: 'level_distribution', levels, totalPeople: people.length };
    }

    case 'location_distribution': {
      const locations = {};
      for (const p of people) {
        const loc = p.properties.location || 'unknown';
        locations[loc] = (locations[loc] || 0) + 1;
      }
      const sorted = Object.entries(locations).sort((a, b) => b[1] - a[1]).map(([location, count]) => ({ location, count }));
      return { stat: 'location_distribution', locations: sorted, totalPeople: people.length };
    }

    case 'skill_coverage': {
      const skills = nodesByType['skill'] || [];
      const result = skills.map(s => {
        const holders = (edgesByTarget[s.id] || []).filter(e => e.type === 'has_skill');
        return { ...nodeSummary(s), holderCount: holders.length };
      }).sort((a, b) => a.holderCount - b.holderCount);
      return { stat: 'skill_coverage', skills: result.slice(0, 20), rareSkills: result.filter(s => s.holderCount <= 2), totalSkills: result.length };
    }

    case 'department_sizes': {
      const depts = nodesByType['department'] || [];
      const result = depts.map(d => {
        const memberEdges = (edgesByTarget[d.id] || []).filter(e => e.type === 'in_department');
        return { ...nodeSummary(d), headcount: memberEdges.length };
      }).sort((a, b) => b.headcount - a.headcount);
      return { stat: 'department_sizes', departments: result, totalDepartments: result.length };
    }

    case 'division_sizes': {
      const divs = nodesByType['division'] || [];
      const result = divs.map(d => {
        const memberEdges = (edgesByTarget[d.id] || []).filter(e => e.type === 'in_division');
        return { ...nodeSummary(d), headcount: memberEdges.length };
      }).sort((a, b) => b.headcount - a.headcount);
      return { stat: 'division_sizes', divisions: result, totalDivisions: result.length };
    }

    default:
      return { error: `Unknown stat_type: ${stat_type}. Available: managers_by_reports, team_sizes, department_sizes, division_sizes, tenure_distribution, level_distribution, location_distribution, skill_coverage` };
  }
}

// --- API Endpoints ---

// Sample data for the component gallery
app.get('/api/graph/sample', (req, res) => {
  const people = (nodesByType['person'] || []).slice(0, 6).map(nodeSummary);
  const teams = (nodesByType['team'] || []).slice(0, 3).map(nodeSummary);
  const projects = (nodesByType['project'] || []).slice(0, 4).map(nodeSummary);

  // Get a person with rich connections for the scenario demo
  const rajId = 'person-008';
  const impact = get_impact_radius(rajId);

  res.json({
    people,
    teams,
    projects,
    samplePerson: people[0],
    sampleTeam: get_team_full(teams[0]?.id),
    impactRadius: impact
  });
});

// Individual query endpoints
app.get('/api/graph/search-people', (req, res) => {
  res.json(search_people(req.query.q || ''));
});

app.get('/api/graph/person/:id', (req, res) => {
  res.json(get_person_full(req.params.id));
});

app.get('/api/graph/team/:id', (req, res) => {
  res.json(get_team_full(req.params.id));
});

app.get('/api/graph/reports/:id', (req, res) => {
  res.json(get_direct_reports(req.params.id, req.query.recursive === 'true'));
});

app.get('/api/graph/impact/:id', (req, res) => {
  res.json(get_impact_radius(req.params.id));
});

app.get('/api/graph/schema', (req, res) => {
  res.json(get_graph_schema());
});

app.get('/api/graph/stats/:type', (req, res) => {
  res.json(get_org_stats(req.params.type));
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// --- Start ---
loadGraphData().then(() => {
  app.listen(PORT, () => {
    console.log(`Atomic Primitives server running at http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to load graph data:', err);
  process.exit(1);
});
