/**
 * <ee-bar-chart> — Simple horizontal bar chart for comparing quantities.
 *
 * Properties:
 *   bars (Array of { label, value, color?, secondaryValue?, secondaryColor? })
 *   — secondaryValue overlays a comparison bar (e.g., "before" vs "after")
 * Attributes:
 *   title, max-value (auto-detected if omitted), format ("number"|"currency"|"percent")
 *
 * Grid sizing: 3xN where N scales with bar count, min 3x2
 */

class EeBarChart extends HTMLElement {
  static get observedAttributes() { return ['title', 'max-value', 'format']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._bars = [];
  }

  set bars(val) { this._bars = val || []; this.render(); }
  get bars() { return this._bars; }

  get gridSize() {
    const rows = Math.max(2, Math.ceil(this._bars.length * 0.6) + 1);
    return { cols: 3, rows };
  }

  attributeChangedCallback() { this.render(); }
  connectedCallback() { this.render(); }

  render() {
    const title = this.getAttribute('title') || '';
    const format = this.getAttribute('format') || 'number';
    const bars = this._bars;

    if (!bars.length) {
      this.shadowRoot.innerHTML = `<style>${this.styles()}</style><div class="chart empty">No data</div>`;
      return;
    }

    // Determine max value
    let maxVal = parseFloat(this.getAttribute('max-value'));
    if (isNaN(maxVal)) {
      maxVal = Math.max(...bars.map(b => Math.max(b.value || 0, b.secondaryValue || 0)));
    }
    if (maxVal === 0) maxVal = 1;

    this.shadowRoot.innerHTML = `
      <style>${this.styles()}</style>
      <div class="chart">
        ${title ? `<div class="title">${title}</div>` : ''}
        <div class="bars">
          ${bars.map(b => {
            const pct = Math.round((b.value / maxVal) * 100);
            const secPct = b.secondaryValue != null ? Math.round((b.secondaryValue / maxVal) * 100) : null;
            const color = b.color || 'var(--ee-color-accent, #6c63ff)';
            const secColor = b.secondaryColor || 'var(--ee-color-border, #e2e5ea)';
            const fmtVal = this._format(b.value, format);
            const fmtSec = b.secondaryValue != null ? this._format(b.secondaryValue, format) : null;

            return `
              <div class="bar-row">
                <div class="bar-label">${b.label}</div>
                <div class="bar-track">
                  ${secPct != null ? `<div class="bar-fill bar-secondary" style="width: ${secPct}%; background: ${secColor};" title="${fmtSec}"></div>` : ''}
                  <div class="bar-fill bar-primary" style="width: ${pct}%; background: ${color};" title="${fmtVal}"></div>
                </div>
                <div class="bar-value">${fmtVal}${fmtSec != null ? ` <span class="sec-val">(${fmtSec})</span>` : ''}</div>
              </div>
            `;
          }).join('')}
        </div>
        ${bars.some(b => b.secondaryValue != null) ? `
          <div class="legend">
            <span class="legend-item"><span class="legend-dot" style="background: var(--ee-color-accent, #6c63ff);"></span> Current</span>
            <span class="legend-item"><span class="legend-dot" style="background: var(--ee-color-border, #e2e5ea);"></span> Previous</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  _format(val, fmt) {
    if (val == null) return '';
    if (fmt === 'currency') return `$${Number(val).toLocaleString()}`;
    if (fmt === 'percent') return `${val}%`;
    return Number(val).toLocaleString();
  }

  styles() {
    return `
      :host { display: block; font-family: var(--ee-font-family, -apple-system, BlinkMacSystemFont, sans-serif); height: 100%; }
      .chart {
        background: var(--ee-color-surface, #fff);
        border: 1px solid var(--ee-color-border, #e2e5ea);
        border-radius: 8px;
        padding: 0.75rem;
        height: 100%; box-sizing: border-box;
        display: flex; flex-direction: column;
        overflow: auto;
      }
      .chart.empty {
        align-items: center; justify-content: center;
        color: var(--ee-color-text-muted); font-size: 0.8rem;
      }
      .title { font-size: 0.875rem; font-weight: 600; color: var(--ee-color-text); margin-bottom: 0.5rem; }
      .bars { display: flex; flex-direction: column; gap: 0.4rem; flex: 1; }
      .bar-row { display: flex; align-items: center; gap: 0.5rem; }
      .bar-label {
        width: 80px; flex-shrink: 0;
        font-size: 0.75rem; font-weight: 500;
        color: var(--ee-color-text-secondary, #5a6172);
        text-align: right;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .bar-track {
        flex: 1; height: 18px;
        background: var(--ee-color-surface-alt, #f8f9fb);
        border-radius: 4px;
        position: relative;
        overflow: hidden;
      }
      .bar-fill {
        position: absolute; top: 0; left: 0;
        height: 100%;
        border-radius: 4px;
        transition: width 0.4s cubic-bezier(0.16,1,0.3,1);
        min-width: 2px;
      }
      .bar-secondary { opacity: 0.35; z-index: 0; }
      .bar-primary { z-index: 1; }
      .bar-value {
        width: 60px; flex-shrink: 0;
        font-size: 0.75rem; font-weight: 600;
        color: var(--ee-color-text, #1a1a2e);
        white-space: nowrap;
      }
      .sec-val { font-weight: 400; color: var(--ee-color-text-muted, #8b91a0); }
      .legend {
        display: flex; gap: 0.75rem;
        margin-top: 0.5rem; padding-top: 0.4rem;
        border-top: 1px solid var(--ee-color-border-light, #eef0f3);
      }
      .legend-item {
        display: flex; align-items: center; gap: 0.25rem;
        font-size: 0.7rem; color: var(--ee-color-text-muted);
      }
      .legend-dot { width: 8px; height: 8px; border-radius: 2px; }
    `;
  }
}

customElements.define('ee-bar-chart', EeBarChart);
