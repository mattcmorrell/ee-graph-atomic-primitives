/**
 * <ee-timeline> — Events over time with flexible configuration.
 *
 * Properties:
 *   events (Array of { date, label, description?, severity?, icon? })
 *   title  (string)
 * Grid sizing: min 5x2, scales with event count
 */

class EeTimeline extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._events = [];
    this._title = '';
  }

  set events(val) { this._events = val || []; this.render(); }
  get events() { return this._events; }
  set title(val) { this._title = val; this.render(); }
  get title() { return this._title; }

  get gridSize() {
    const rows = Math.max(2, Math.ceil(this._events.length * 0.7) + 1);
    return { cols: 5, rows };
  }

  connectedCallback() { this.render(); }

  render() {
    const events = [...this._events].sort((a, b) => new Date(a.date) - new Date(b.date));
    const title = this._title;

    if (!events.length) {
      this.shadowRoot.innerHTML = `<style>${this.styles()}</style><div class="timeline empty">No events</div>`;
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>${this.styles()}</style>
      <div class="timeline">
        ${title ? `<div class="title">${title}</div>` : ''}
        <div class="events">
          ${events.map((ev, i) => {
            const sev = ev.severity || 'info';
            const isLast = i === events.length - 1;
            return `
              <div class="event">
                <div class="track">
                  <div class="dot dot-${sev}"></div>
                  ${!isLast ? '<div class="line"></div>' : ''}
                </div>
                <div class="content">
                  <div class="date">${this._formatDate(ev.date)}</div>
                  <div class="label">${ev.label}</div>
                  ${ev.description ? `<div class="desc">${ev.description}</div>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  _formatDate(d) {
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return d; }
  }

  styles() {
    return `
      :host { display: block; font-family: var(--ee-font-family, -apple-system, BlinkMacSystemFont, sans-serif); height: 100%; }
      .timeline {
        background: var(--ee-color-surface, #fff);
        border: 1px solid var(--ee-color-border, #e2e5ea);
        border-radius: 8px;
        padding: 0.75rem;
        height: 100%; box-sizing: border-box; overflow: auto;
      }
      .timeline.empty {
        display: flex; align-items: center; justify-content: center;
        color: var(--ee-color-text-muted); font-size: 0.8rem;
      }
      .title { font-size: 0.875rem; font-weight: 600; color: var(--ee-color-text); margin-bottom: 0.75rem; }
      .events { display: flex; flex-direction: column; }
      .event { display: flex; gap: 0.6rem; }
      .track { display: flex; flex-direction: column; align-items: center; width: 16px; flex-shrink: 0; }
      .dot {
        width: 10px; height: 10px; border-radius: 9999px;
        flex-shrink: 0; margin-top: 4px;
      }
      .dot-info { background: var(--ee-color-info, #4a6fa5); }
      .dot-warning { background: var(--ee-color-warning, #d4a017); }
      .dot-critical { background: var(--ee-color-critical, #c0392b); }
      .dot-success { background: var(--ee-color-success, #27ae60); }
      .line { width: 1.5px; flex: 1; background: var(--ee-color-border, #e2e5ea); min-height: 16px; }
      .content { padding-bottom: 0.75rem; min-width: 0; }
      .date { font-size: 0.7rem; color: var(--ee-color-text-muted); font-weight: 500; }
      .label { font-size: 0.8rem; font-weight: 500; color: var(--ee-color-text); }
      .desc { font-size: 0.75rem; color: var(--ee-color-text-secondary); margin-top: 0.15rem; }
    `;
  }
}

customElements.define('ee-timeline', EeTimeline);
