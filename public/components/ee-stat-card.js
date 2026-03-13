/**
 * <ee-stat-card> — Displays a single key metric with label and optional context.
 *
 * Attributes:
 *   label    — The metric label (e.g., "Direct Reports")
 *   value    — The metric value (e.g., "7")
 *   context  — Optional context line (e.g., "3 with no backup")
 *   severity — Optional: "info" | "warning" | "critical" | "success"
 */

class EeStatCard extends HTMLElement {
  static get observedAttributes() { return ['label', 'value', 'context', 'severity']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  attributeChangedCallback() {
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const label = this.getAttribute('label') || '';
    const value = this.getAttribute('value') || '—';
    const context = this.getAttribute('context') || '';
    const severity = this.getAttribute('severity') || '';

    this.shadowRoot.innerHTML = `
      <style>${this.styles()}</style>
      <div class="card ${severity ? `severity-${severity}` : ''}">
        <div class="value">${value}</div>
        <div class="label">${label}</div>
        ${context ? `<div class="context">${context}</div>` : ''}
      </div>
    `;
  }

  styles() {
    return `
      :host {
        display: block;
      }
      .card {
        padding: var(--ee-space-lg, 1rem) var(--ee-space-xl, 1.5rem);
        background: var(--ee-color-surface, #fff);
        border: 1px solid var(--ee-color-border, #e2e5ea);
        border-radius: var(--ee-radius-md, 8px);
        min-width: 140px;
        transition: box-shadow 0.15s ease;
      }
      .card:hover {
        box-shadow: var(--ee-shadow-md, 0 2px 8px rgba(0,0,0,0.08));
      }
      .value {
        font-size: var(--ee-font-size-2xl, 2rem);
        font-weight: var(--ee-font-weight-bold, 700);
        color: var(--ee-color-text, #1a1a2e);
        line-height: var(--ee-line-height-tight, 1.25);
      }
      .label {
        font-size: var(--ee-font-size-sm, 0.8rem);
        color: var(--ee-color-text-secondary, #5a6172);
        margin-top: var(--ee-space-xs, 0.25rem);
      }
      .context {
        font-size: var(--ee-font-size-sm, 0.8rem);
        color: var(--ee-color-text-muted, #8b91a0);
        margin-top: var(--ee-space-sm, 0.5rem);
      }
      /* Severity variants */
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
