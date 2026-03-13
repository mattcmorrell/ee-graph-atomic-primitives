/**
 * <ee-alert-banner> — Attention banner with severity level.
 *
 * Attributes:
 *   severity — "info" (default) | "warning" | "critical" | "success"
 *   message  — The alert message text
 *   action   — Optional action button text
 */

class EeAlertBanner extends HTMLElement {
  static get observedAttributes() { return ['severity', 'message', 'action']; }

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
    const severity = this.getAttribute('severity') || 'info';
    const message = this.getAttribute('message') || '';
    const action = this.getAttribute('action') || '';

    const icons = {
      info: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 7v4M8 5h.01"/></svg>',
      warning: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1L1 14h14L8 1z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 6v4M8 12h.01"/></svg>',
      critical: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10 6L6 10M6 6l4 4"/></svg>',
      success: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 8l2 2 4-4"/></svg>'
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
      :host {
        display: block;
      }
      .banner {
        display: flex;
        align-items: center;
        gap: var(--ee-space-md, 0.75rem);
        padding: var(--ee-space-md, 0.75rem) var(--ee-space-lg, 1rem);
        border-radius: var(--ee-radius-md, 8px);
        font-size: var(--ee-font-size-base, 0.875rem);
      }
      .severity-info {
        background: var(--ee-color-info-bg, #eef3fa);
        color: var(--ee-color-info, #4a6fa5);
      }
      .severity-warning {
        background: var(--ee-color-warning-bg, #fef9e7);
        color: var(--ee-color-warning, #d4a017);
      }
      .severity-critical {
        background: var(--ee-color-critical-bg, #fdecea);
        color: var(--ee-color-critical, #c0392b);
      }
      .severity-success {
        background: var(--ee-color-success-bg, #eafaf1);
        color: var(--ee-color-success, #27ae60);
      }
      .icon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
      }
      .message {
        flex: 1;
        color: var(--ee-color-text, #1a1a2e);
      }
      .action {
        flex-shrink: 0;
        background: none;
        border: 1px solid currentColor;
        border-radius: var(--ee-radius-sm, 4px);
        color: inherit;
        padding: var(--ee-space-xs, 0.25rem) var(--ee-space-md, 0.75rem);
        font-size: var(--ee-font-size-sm, 0.8rem);
        font-weight: var(--ee-font-weight-medium, 500);
        cursor: pointer;
        transition: opacity 0.15s;
      }
      .action:hover {
        opacity: 0.8;
      }
    `;
  }
}

customElements.define('ee-alert-banner', EeAlertBanner);
