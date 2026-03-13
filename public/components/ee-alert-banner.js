/**
 * <ee-alert-banner> — Severity-coded attention banner.
 *
 * Attributes: severity (info|warning|critical|success), message, action
 * Grid sizing: Wx1 where W scales with message length (min 4, max 7)
 */

class EeAlertBanner extends HTMLElement {
  static get observedAttributes() { return ['severity', 'message', 'action']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  get gridSize() {
    const msg = this.getAttribute('message') || '';
    const w = Math.max(4, Math.min(7, Math.ceil(msg.length / 20) + 3));
    return { cols: w, rows: 1 };
  }

  attributeChangedCallback() { this.render(); }
  connectedCallback() { this.render(); }

  render() {
    const severity = this.getAttribute('severity') || 'info';
    const message = this.getAttribute('message') || '';
    const action = this.getAttribute('action') || '';

    const icons = {
      info: '<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 7v4M8 5h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
      warning: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 2L1.5 13.5h13L8 2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 6.5v3M8 11.5h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
      critical: '<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10 6L6 10M6 6l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
      success: '<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 8l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };

    this.shadowRoot.innerHTML = `
      <style>${this.styles()}</style>
      <div class="banner severity-${severity}" role="alert">
        <span class="icon">${icons[severity] || icons.info}</span>
        <span class="message">${message}</span>
        ${action ? `<button class="action">${action}</button>` : ''}
      </div>
    `;

    if (action) {
      this.shadowRoot.querySelector('.action').addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('ee-alert-action', {
          bubbles: true, composed: true,
          detail: { severity, message, action }
        }));
      });
    }
  }

  styles() {
    return `
      :host { display: block; font-family: var(--ee-font-family, -apple-system, BlinkMacSystemFont, sans-serif); height: 100%; }
      .banner {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        font-size: 0.875rem;
        height: 100%;
        box-sizing: border-box;
      }
      .severity-info { background: var(--ee-color-info-bg, #eef3fa); color: var(--ee-color-info, #4a6fa5); }
      .severity-warning { background: var(--ee-color-warning-bg, #fef9e7); color: var(--ee-color-warning, #d4a017); }
      .severity-critical { background: var(--ee-color-critical-bg, #fdecea); color: var(--ee-color-critical, #c0392b); }
      .severity-success { background: var(--ee-color-success-bg, #eafaf1); color: var(--ee-color-success, #27ae60); }
      .icon { flex-shrink: 0; display: flex; align-items: center; }
      .message { flex: 1; color: var(--ee-color-text, #1a1a2e); }
      .action {
        flex-shrink: 0; background: none;
        border: 1px solid currentColor;
        border-radius: 4px; color: inherit;
        padding: 0.25rem 0.75rem;
        font-size: 0.8rem; font-weight: 500;
        cursor: pointer; transition: opacity 0.15s;
      }
      .action:hover { opacity: 0.8; }
    `;
  }
}

customElements.define('ee-alert-banner', EeAlertBanner);
