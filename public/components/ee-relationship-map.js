/**
 * <ee-relationship-map> — Small node-link diagram of entity connections.
 *
 * Properties:
 *   nodes   (Array of { id, label, type?, avatar? })
 *   edges   (Array of { source, target, label? })
 *   focusId (string — ID of the focused node)
 * Grid sizing: ≤6 nodes → 4x3, ≤12 → 5x4, >12 → 6x5
 */

class EeRelationshipMap extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._nodes = [];
    this._edges = [];
    this._focusId = null;
  }

  set nodes(val) { this._nodes = val || []; this.render(); }
  get nodes() { return this._nodes; }
  set edges(val) { this._edges = val || []; this.render(); }
  get edges() { return this._edges; }
  set focusId(val) { this._focusId = val; this.render(); }
  get focusId() { return this._focusId; }

  get gridSize() {
    const n = this._nodes.length;
    if (n <= 6) return { cols: 4, rows: 3 };
    if (n <= 12) return { cols: 5, rows: 4 };
    return { cols: 6, rows: 5 };
  }

  connectedCallback() { this.render(); }

  render() {
    const nodes = this._nodes;
    const edges = this._edges;
    const focusId = this._focusId;

    if (!nodes.length) {
      this.shadowRoot.innerHTML = `<style>${this.styles()}</style><div class="map empty">No relationship data</div>`;
      return;
    }

    // Simple force-free layout: focus node center, others in a ring
    const W = 300;
    const H = 220;
    const cx = W / 2;
    const cy = H / 2;

    const positions = {};
    const focusNode = nodes.find(n => n.id === focusId);
    const others = focusNode ? nodes.filter(n => n.id !== focusId) : nodes;

    if (focusNode) {
      positions[focusNode.id] = { x: cx, y: cy };
    }

    const count = others.length || 1;
    others.forEach((n, i) => {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;
      const rx = (W / 2) - 40;
      const ry = (H / 2) - 30;
      positions[n.id] = {
        x: cx + rx * Math.cos(angle),
        y: cy + ry * Math.sin(angle)
      };
    });

    // Build SVG
    const edgeLines = edges.map(e => {
      const s = positions[e.source];
      const t = positions[e.target];
      if (!s || !t) return '';
      return `<line x1="${s.x}" y1="${s.y}" x2="${t.x}" y2="${t.y}" class="edge-line"/>`;
    }).join('');

    const nodeCircles = nodes.map(n => {
      const p = positions[n.id];
      if (!p) return '';
      const isFocus = n.id === focusId;
      const r = isFocus ? 18 : 14;
      const cls = isFocus ? 'node-focus' : 'node-normal';
      return `
        <g class="${cls}" transform="translate(${p.x},${p.y})">
          <circle r="${r}" />
          <text y="${r + 12}" text-anchor="middle" class="node-label">${this._truncate(n.label || n.id, 12)}</text>
          <text dy="0.35em" text-anchor="middle" class="node-initial">${(n.label || '?')[0]}</text>
        </g>
      `;
    }).join('');

    this.shadowRoot.innerHTML = `
      <style>${this.styles()}</style>
      <div class="map">
        <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
          ${edgeLines}
          ${nodeCircles}
        </svg>
      </div>
    `;
  }

  _truncate(s, max) {
    return s.length > max ? s.slice(0, max - 1) + '\u2026' : s;
  }

  styles() {
    return `
      :host { display: block; font-family: var(--ee-font-family, -apple-system, BlinkMacSystemFont, sans-serif); height: 100%; }
      .map {
        background: var(--ee-color-surface, #fff);
        border: 1px solid var(--ee-color-border, #e2e5ea);
        border-radius: 8px;
        height: 100%; box-sizing: border-box;
        display: flex; align-items: center; justify-content: center;
        padding: 0.5rem;
      }
      .map.empty {
        color: var(--ee-color-text-muted); font-size: 0.8rem;
      }
      svg { width: 100%; height: 100%; }
      .edge-line { stroke: var(--ee-color-border, #e2e5ea); stroke-width: 1.5; }
      .node-focus circle { fill: var(--ee-color-accent, #6c63ff); }
      .node-focus .node-initial { fill: #fff; font-size: 11px; font-weight: 600; }
      .node-normal circle { fill: var(--ee-color-surface-alt, #f8f9fb); stroke: var(--ee-color-border, #e2e5ea); stroke-width: 1; }
      .node-normal .node-initial { fill: var(--ee-color-text-secondary); font-size: 9px; font-weight: 600; }
      .node-label { fill: var(--ee-color-text-secondary); font-size: 8px; }
    `;
  }
}

customElements.define('ee-relationship-map', EeRelationshipMap);
