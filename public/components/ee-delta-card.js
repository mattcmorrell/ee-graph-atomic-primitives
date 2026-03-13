/**
 * <ee-delta-card> — Shows before→after with change emphasis.
 *
 * Attributes:
 *   label    — Metric name (e.g., "Headcount")
 *   before   — Previous value
 *   after    — New value
 *   delta    — Change amount (e.g., "-2", "+15%") — auto-computed if numeric before/after
 *   context  — Optional explanation
 *   severity — "positive" | "negative" | "neutral" (auto-detected from delta if omitted)
 *   format   — "number" (default) | "currency" | "percent"
 *
 * Grid sizing: 2x1 always
 */

class EeDeltaCard extends HTMLElement {
  static get observedAttributes() { return ['label', 'before', 'after', 'delta', 'context', 'severity', 'format']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  get gridSize() { return { cols: 2, rows: 1 }; }

  attributeChangedCallback() { this.render(); }
  connectedCallback() { this.render(); }

  render() {
    const label = this.getAttribute('label') || '';
    const before = this.getAttribute('before') || '';
    const after = this.getAttribute('after') || '';
    const format = this.getAttribute('format') || 'number';
    const context = this.getAttribute('context') || '';

    // Compute delta
    let delta = this.getAttribute('delta');
    const beforeNum = parseFloat(before);
    const afterNum = parseFloat(after);
    if (!delta && !isNaN(beforeNum) && !isNaN(afterNum)) {
      const diff = afterNum - beforeNum;
      delta = diff > 0 ? `+${diff}` : `${diff}`;
    }

    // Determine severity
    let severity = this.getAttribute('severity');
    if (!severity && delta) {
      const num = parseFloat(delta);
      if (!isNaN(num)) {
        severity = num > 0 ? 'positive' : num < 0 ? 'negative' : 'neutral';
      }
    }
    severity = severity || 'neutral';

    // Format values
    const fmtBefore = this._format(before, format);
    const fmtAfter = this._format(after, format);

    // Arrow
    const arrow = severity === 'positive' ? '&#9650;' : severity === 'negative' ? '&#9660;' : '&#8596;';

    this.shadowRoot.innerHTML = `
      <style>${this.styles()}</style>
      <div class="card sev-${severity}">
        <div class="label">${label}</div>
        <div class="values">
          <span class="before">${fmtBefore}</span>
          <span class="arrow">&rarr;</span>
          <span class="after">${fmtAfter}</span>
        </div>
        <div class="delta">
          <span class="delta-icon">${arrow}</span>
          <span class="delta-value">${delta || '0'}</span>
        </div>
        ${context ? `<div class="context">${context}</div>` : ''}
      </div>
    `;
  }

  _format(val, fmt) {
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    if (fmt === 'currency') return `$${num.toLocaleString()}`;
    if (fmt === 'percent') return `${num}%`;
    return num.toLocaleString();
  }

  styles() {
    return `
      :host { display: block; font-family: var(--ee-font-family, -apple-system, BlinkMacSystemFont, sans-serif); height: 100%; }
      .card {
        padding: 0.6rem 0.75rem;
        background: var(--ee-color-surface, #fff);
        border: 1px solid var(--ee-color-border, #e2e5ea);
        border-radius: 8px;
        height: 100%; box-sizing: border-box;
        display: flex; flex-direction: column; justify-content: center;
        transition: box-shadow 0.15s ease;
      }
      .card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
      .label {
        font-size: 0.75rem; font-weight: 500;
        color: var(--ee-color-text-muted, #8b91a0);
        text-transform: uppercase; letter-spacing: 0.03em;
        margin-bottom: 0.2rem;
      }
      .values {
        display: flex; align-items: baseline; gap: 0.35rem;
        font-size: 1.1rem; font-weight: 600;
      }
      .before {
        color: var(--ee-color-text-muted, #8b91a0);
        text-decoration: line-through;
        font-weight: 400;
        font-size: 0.95rem;
      }
      .arrow {
        color: var(--ee-color-text-muted, #8b91a0);
        font-size: 0.8rem;
      }
      .after { color: var(--ee-color-text, #1a1a2e); }
      .delta {
        display: flex; align-items: center; gap: 0.25rem;
        margin-top: 0.15rem;
        font-size: 0.8rem; font-weight: 600;
      }
      .delta-icon { font-size: 0.65rem; }
      .context {
        font-size: 0.75rem;
        color: var(--ee-color-text-muted, #8b91a0);
        margin-top: 0.2rem;
      }
      /* Severity */
      .sev-positive { border-left: 3px solid var(--ee-color-success, #27ae60); }
      .sev-positive .delta { color: var(--ee-color-success, #27ae60); }
      .sev-positive .after { color: var(--ee-color-success, #27ae60); }
      .sev-negative { border-left: 3px solid var(--ee-color-critical, #c0392b); }
      .sev-negative .delta { color: var(--ee-color-critical, #c0392b); }
      .sev-negative .after { color: var(--ee-color-critical, #c0392b); }
      .sev-neutral { border-left: 3px solid var(--ee-color-info, #4a6fa5); }
      .sev-neutral .delta { color: var(--ee-color-info, #4a6fa5); }
    `;
  }
}

customElements.define('ee-delta-card', EeDeltaCard);
