/**
 * <ee-org-chart> — Hierarchical org tree.
 *
 * Properties:
 *   people  (Array of person objects with id, name, role, avatarUrl)
 *   reports (Object map: { personId: [reportId, ...] })
 *   rootId  (string — root person ID)
 * Grid sizing: scales with depth × breadth, min 3x2
 */

const AVATAR_BASE_OC = 'https://mattcmorrell.github.io/ee-graph';

class EeOrgChart extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._people = [];
    this._reports = {};
    this._rootId = null;
  }

  set people(val) { this._people = val || []; this.render(); }
  get people() { return this._people; }
  set reports(val) { this._reports = val || {}; this.render(); }
  get reports() { return this._reports; }
  set rootId(val) { this._rootId = val; this.render(); }
  get rootId() { return this._rootId; }

  get gridSize() {
    const { depth, breadth } = this._measure(this._rootId, 0);
    return { cols: Math.max(3, breadth * 2), rows: Math.max(2, depth + 1) };
  }

  _measure(id, d) {
    const kids = this._reports[id] || [];
    if (!kids.length) return { depth: d, breadth: 1 };
    let maxDepth = d;
    let totalBreadth = 0;
    for (const kid of kids) {
      const m = this._measure(kid, d + 1);
      maxDepth = Math.max(maxDepth, m.depth);
      totalBreadth += m.breadth;
    }
    return { depth: maxDepth, breadth: Math.max(1, totalBreadth) };
  }

  connectedCallback() { this.render(); }

  _personById(id) {
    return this._people.find(p => p.id === id);
  }

  render() {
    const rootId = this._rootId;
    if (!rootId || !this._people.length) {
      this.shadowRoot.innerHTML = `<style>${this.styles()}</style><div class="chart empty">No org data</div>`;
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>${this.styles()}</style>
      <div class="chart">
        ${this._renderNode(rootId, 0)}
      </div>
    `;
  }

  _renderNode(id, depth) {
    const p = this._personById(id);
    if (!p) return '';
    const kids = this._reports[id] || [];
    const url = p.avatarUrl ? `${AVATAR_BASE_OC}/${p.avatarUrl}` : '';

    return `
      <div class="node-group">
        <div class="person-node ${depth === 0 ? 'root' : ''}">
          <div class="avatar">
            ${url ? `<img src="${url}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />` : ''}
            <span class="fallback" ${url ? 'style="display:none"' : ''}>${(p.name||'?')[0]}</span>
          </div>
          <div class="node-info">
            <div class="node-name">${p.name}</div>
            <div class="node-role">${p.role || ''}</div>
          </div>
        </div>
        ${kids.length ? `
          <div class="children">
            ${kids.map(kid => this._renderNode(kid, depth + 1)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  styles() {
    return `
      :host { display: block; font-family: var(--ee-font-family, -apple-system, BlinkMacSystemFont, sans-serif); height: 100%; }
      .chart {
        background: var(--ee-color-surface, #fff);
        border: 1px solid var(--ee-color-border, #e2e5ea);
        border-radius: 8px;
        padding: 0.75rem;
        height: 100%; box-sizing: border-box; overflow: auto;
      }
      .chart.empty {
        display: flex; align-items: center; justify-content: center;
        color: var(--ee-color-text-muted); font-size: 0.8rem;
      }
      .node-group { }
      .person-node {
        display: flex; align-items: center; gap: 0.4rem;
        padding: 0.3rem 0.4rem;
        border-radius: 4px;
        border: 1px solid var(--ee-color-border-light, #eef0f3);
        margin-bottom: 0.25rem;
        background: var(--ee-color-surface, #fff);
      }
      .person-node:hover { background: var(--ee-color-surface-hover, #f0f2f5); }
      .person-node.root { border-color: var(--ee-color-accent, #6c63ff); border-width: 2px; }
      .avatar {
        width: 24px; height: 24px; flex-shrink: 0;
        border-radius: 9999px; overflow: hidden;
      }
      .avatar img { width: 100%; height: 100%; object-fit: cover; }
      .avatar .fallback {
        width: 100%; height: 100%;
        background: var(--ee-color-accent, #6c63ff);
        color: #fff; display: flex; align-items: center; justify-content: center;
        font-size: 0.65rem; font-weight: 600; border-radius: 9999px;
      }
      .node-info { min-width: 0; }
      .node-name { font-size: 0.8rem; font-weight: 500; color: var(--ee-color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .node-role { font-size: 0.7rem; color: var(--ee-color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .children {
        margin-left: 1.25rem;
        padding-left: 0.75rem;
        border-left: 1.5px solid var(--ee-color-border-light, #eef0f3);
      }
    `;
  }
}

customElements.define('ee-org-chart', EeOrgChart);
