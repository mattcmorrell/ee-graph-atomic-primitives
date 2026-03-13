/**
 * <ee-stat-card> — Single metric with label and optional context.
 *
 * Attributes: label, value, context, severity (info|warning|critical|success),
 *   delta (optional change indicator, e.g. "+3", "-12%")
 * Grid sizing: 2x1 always
 */

class EeStatCard extends HTMLElement {
  static get observedAttributes() { return ['label', 'value', 'context', 'severity', 'delta']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  get gridSize() { return { cols: 2, rows: 1 }; }

  attributeChangedCallback() { this.render(); }
  connectedCallback() { this.render(); }

  render() {
    const label = this.getAttribute('label') || '';
    const value = this.getAttribute('value') || '—';
    const context = this.getAttribute('context') || '';
    const severity = this.getAttribute('severity') || '';
    const delta = this.getAttribute('delta') || '';

    // Auto-detect delta direction
    let deltaClass = '';
    if (delta) {
      const num = parseFloat(delta);
      deltaClass = num > 0 ? 'delta-up' : num < 0 ? 'delta-down' : 'delta-flat';
    }

    this.shadowRoot.innerHTML = `
      <style>${this.styles()}</style>
      <div class="card ${severity ? `severity-${severity}` : ''}">
        <div class="value-row">
          <span class="value">${value}</span>
          ${delta ? `<span class="delta ${deltaClass}">${delta}</span>` : ''}
        </div>
        <div class="label">${label}</div>
        ${context ? `<div class="context">${context}</div>` : ''}
      </div>
    `;
  }

  styles() {
    return `
      :host { display: block; font-family: var(--ee-font-family, -apple-system, BlinkMacSystemFont, sans-serif); height: 100%; }
      .card {
        padding: 0.75rem 1rem;
        background: var(--ee-color-surface, #fff);
        border: 1px solid var(--ee-color-border, #e2e5ea);
        border-radius: 8px;
        height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
        transition: box-shadow 0.15s ease;
      }
      .card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
      .value-row { display: flex; align-items: baseline; gap: 0.35rem; }
      .value {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--ee-color-text, #1a1a2e);
        line-height: 1.2;
      }
      .delta {
        font-size: 0.8rem; font-weight: 600;
        padding: 1px 5px; border-radius: 3px;
      }
      .delta-up { color: var(--ee-color-success, #27ae60); background: var(--ee-color-success-bg, #eafaf1); }
      .delta-down { color: var(--ee-color-critical, #c0392b); background: var(--ee-color-critical-bg, #fdecea); }
      .delta-flat { color: var(--ee-color-text-muted, #8b91a0); background: var(--ee-color-surface-alt, #f8f9fb); }
      .label {
        font-size: 0.8rem;
        color: var(--ee-color-text-secondary, #5a6172);
        margin-top: 0.15rem;
      }
      .context {
        font-size: 0.8rem;
        color: var(--ee-color-text-muted, #8b91a0);
        margin-top: 0.35rem;
      }
      .severity-info { border-left: 3px solid var(--ee-color-info, #4a6fa5); }
      .severity-warning { border-left: 3px solid var(--ee-color-warning, #d4a017); }
      .severity-warning .value { color: var(--ee-color-warning, #d4a017); }
      .severity-critical { border-left: 3px solid var(--ee-color-critical, #c0392b); }
      .severity-critical .value { color: var(--ee-color-critical, #c0392b); }
      .severity-success { border-left: 3px solid var(--ee-color-success, #27ae60); }
      .severity-success .value { color: var(--ee-color-success, #27ae60); }
    `;
  }
}

customElements.define('ee-stat-card', EeStatCard);
