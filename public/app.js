// app.js — Hardcoded Raj Patel departure scenario on the canvas engine

(async function () {
  const viewport = document.getElementById('canvas-viewport');
  const loading = document.getElementById('loading');
  const engine = new CanvasEngine(viewport);

  // Fetch data
  let data;
  try {
    const res = await fetch('/api/graph/sample');
    data = await res.json();
  } catch (err) {
    loading.querySelector('.loading-text').textContent = 'Failed to load data';
    console.error(err);
    return;
  }

  const impact = data.impactRadius;
  const team = data.sampleTeam;

  if (!impact || impact.error) {
    loading.querySelector('.loading-text').textContent = 'No impact data available';
    return;
  }

  const person = impact.person;
  const summary = impact.summary;

  // --- Create primitives ---

  // 1. Hero person card (Raj)
  const heroCard = document.createElement('ee-person-card');
  heroCard.setAttribute('size', 'lg');
  heroCard.person = person;
  engine.addBlock('raj-hero', heroCard, 0, 0, 4, 1);

  // 2. Stat cards — key impact metrics
  const stats = [
    { label: 'Direct Reports', value: String(impact.directReports.count), context: 'Need new manager', severity: impact.directReports.count > 3 ? 'warning' : 'info' },
    { label: 'Solo Projects', value: String(summary.soloProjects.length), context: summary.soloProjects.join(', ') || 'None', severity: summary.soloProjects.length > 0 ? 'critical' : 'success' },
    { label: 'Unique Skills', value: String(summary.uniqueSkills.length), context: '< 3 others have these', severity: summary.uniqueSkills.length > 2 ? 'critical' : 'warning' },
    { label: 'Mentees at Risk', value: String(summary.menteesWithNoOtherMentor.length), context: summary.menteesWithNoOtherMentor.join(', ') || 'All have backup', severity: summary.menteesWithNoOtherMentor.length > 0 ? 'warning' : 'success' }
  ];

  stats.forEach((s, i) => {
    const el = document.createElement('ee-stat-card');
    el.setAttribute('label', s.label);
    el.setAttribute('value', s.value);
    el.setAttribute('context', s.context);
    if (s.severity) el.setAttribute('severity', s.severity);
    engine.addBlock(`stat-${i}`, el, 5 + i * 2, 0, 2, 1);
  });

  // 3. Alert banners — key risks
  const alerts = [];

  if (summary.soloProjects.length > 0) {
    alerts.push({ severity: 'critical', message: `${person.name} is the sole contributor on ${summary.soloProjects.length} project(s): ${summary.soloProjects.join(', ')}`, action: 'View Projects' });
  }

  if (summary.menteesWithNoOtherMentor.length > 0) {
    alerts.push({ severity: 'warning', message: `${summary.menteesWithNoOtherMentor.length} mentee(s) have no other mentor: ${summary.menteesWithNoOtherMentor.join(', ')}`, action: 'See Mentees' });
  }

  if (summary.uniqueSkills.length > 0) {
    alerts.push({ severity: 'critical', message: `${summary.uniqueSkills.length} rare skill(s) at risk: ${summary.uniqueSkills.join(', ')}. Fewer than 3 others hold these.` });
  }

  if (alerts.length === 0) {
    alerts.push({ severity: 'info', message: `${person.name}'s departure has moderate impact. No critical single-points-of-failure found.` });
  }

  alerts.forEach((a, i) => {
    const el = document.createElement('ee-alert-banner');
    el.setAttribute('severity', a.severity);
    el.setAttribute('message', a.message);
    if (a.action) el.setAttribute('action', a.action);
    engine.addBlock(`alert-${i}`, el, 1, 2 + i, 6, 1);
  });

  // 4. Insight block — AI analysis (hardcoded)
  const insightEl = document.createElement('ee-insight-block');
  insightEl.setAttribute('label', 'Impact Analysis');
  insightEl.content = `
    <p><strong>${person.name}</strong> (${person.role}) represents a <strong>high-impact departure</strong> for ${impact.teams.items[0]?.name || 'the team'}.</p>
    <p>Key concerns: <strong>${impact.directReports.count} direct reports</strong> need a new reporting line. ${summary.soloProjects.length > 0 ? `<strong>${summary.soloProjects.length} project(s)</strong> have no other contributor and will stall without immediate reassignment.` : 'All projects have contributor coverage.'}</p>
    <p>${summary.uniqueSkills.length > 0 ? `<strong>${summary.uniqueSkills.length} skill(s)</strong> (${summary.uniqueSkills.join(', ')}) have limited coverage in the org — these are the hardest gaps to fill.` : 'No critical skill gaps identified.'}</p>
    <p>Recommended: Begin knowledge transfer for solo projects within 2 weeks. Reassign direct reports to ${impact.manager ? impact.manager.name : 'skip-level manager'} as interim measure.</p>
  `;
  engine.addBlock('insight', insightEl, 8, 2, 5, 3);

  // 5. Team grid — the affected team
  let teamGridRows = 0;
  if (team && !team.error) {
    const teamGrid = document.createElement('ee-team-grid');
    teamGrid.teamName = team.team?.name || 'Team';
    teamGrid.manager = team.manager;
    teamGrid.members = team.members || [];
    const memberCount = (team.members || []).length;
    const gridCols = memberCount <= 4 ? 3 : memberCount <= 8 ? 4 : 5;
    teamGridRows = Math.max(3, Math.ceil(memberCount / (gridCols - 1)) + 1);
    engine.addBlock('team-grid', teamGrid, 1, 2 + alerts.length + 1, gridCols, teamGridRows);
  }

  // 6. Checklist — recommended actions
  const checklistEl = document.createElement('ee-checklist');
  checklistEl.setAttribute('title', 'Recommended Actions');
  checklistEl.items = [
    { text: `Reassign ${impact.directReports.count} direct reports`, owner: impact.manager ? impact.manager.name : 'VP Engineering', status: 'pending', priority: 'high' },
    { text: 'Begin knowledge transfer for solo projects', owner: person.name, status: 'pending', priority: 'critical' },
    { text: `Find mentor replacements for ${summary.menteesWithNoOtherMentor.length} mentees`, owner: 'HR Partner', status: 'pending', priority: 'medium' },
    { text: 'Identify skill replacement candidates', owner: 'Talent Acquisition', status: 'pending', priority: 'high' },
    { text: 'Schedule skip-level 1:1s with direct reports', owner: impact.manager ? impact.manager.name : 'VP Engineering', status: 'pending' },
    { text: 'Update project staffing plans', owner: 'Project Leads', status: 'pending' }
  ];
  engine.addBlock('checklist', checklistEl, 6, 2 + alerts.length + 1, 4, 4);

  // 7. Person list — skill replacement candidates
  // Gather people who share rare skills
  const candidates = new Map();
  for (const skill of impact.skills.items) {
    if (skill.totalOthersCount < 5) {
      for (const other of skill.othersWithSkill || []) {
        if (!candidates.has(other.id)) {
          candidates.set(other.id, { ...other, skills: [] });
        }
        candidates.get(other.id).skills.push(skill.name);
      }
    }
  }
  const candidateList = [...candidates.values()]
    .sort((a, b) => b.skills.length - a.skills.length)
    .slice(0, 8);

  if (candidateList.length > 0) {
    const personList = document.createElement('ee-person-list');
    personList.setAttribute('title', 'Skill Replacement Candidates');
    personList.people = candidateList.map(c => ({
      ...c,
      role: `${c.skills.length} matching skill(s): ${c.skills.join(', ')}`
    }));
    const listRows = Math.max(2, Math.ceil(candidateList.length / 3) + 1);
    engine.addBlock('skill-candidates', personList, 11, 2 + alerts.length + 1, 3, listRows);
  }

  // 8. Org chart — reporting tree (if reports exist)
  if (impact.directReports.count > 0) {
    const orgChart = document.createElement('ee-org-chart');
    // Limit to first 6 reports to keep chart readable
    const visibleReports = impact.directReports.people.slice(0, 6);
    const allPeople = [person, ...visibleReports];
    orgChart.people = allPeople;
    const reportsMap = {};
    reportsMap[person.id] = visibleReports.map(r => r.id);
    orgChart.reports = reportsMap;
    orgChart.rootId = person.id;
    const chartRows = Math.min(5, Math.max(3, Math.ceil(visibleReports.length / 2) + 1));
    const teamEndRow = 2 + alerts.length + 1 + teamGridRows;
    engine.addBlock('org-chart', orgChart, 1, teamEndRow + 1, 4, chartRows);
  }

  // --- Connectors ---
  engine.addConnector('raj-hero', 'alert-0');
  engine.addConnector('raj-hero', 'stat-0', { color: 'var(--ee-color-border, #e2e5ea)' });

  if (team && !team.error) {
    engine.addConnector('alert-0', 'team-grid');
  }
  engine.addConnector('alert-0', 'checklist');

  if (summary.soloProjects.length > 0) {
    engine.addConnector('stat-1', 'insight');
  }

  // --- Camera ---
  setTimeout(() => {
    engine.zoomToFit(40);
  }, 100);

  // Hide loading
  loading.classList.add('hidden');
  setTimeout(() => loading.remove(), 500);

  // --- Zoom controls ---
  document.getElementById('zoom-in').addEventListener('click', () => {
    engine.transform.scale = Math.min(engine.MAX_SCALE, engine.transform.scale * 1.2);
    engine._applyTransform();
  });

  document.getElementById('zoom-out').addEventListener('click', () => {
    engine.transform.scale = Math.max(engine.MIN_SCALE, engine.transform.scale / 1.2);
    engine._applyTransform();
  });

  document.getElementById('zoom-fit').addEventListener('click', () => {
    engine.zoomToFit(40);
  });
})();
