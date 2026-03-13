/**
 * <ee-insight-block> — AI-generated analysis, visually distinct from facts.
 *
 * Properties: content (string, supports HTML)
 * Attributes: label (e.g. "AI Analysis")
 * Grid sizing: 4xN where N = ceil(text length / 200), min 4x1
 */

class EeInsightBlock extends HTMLElement {
  static get observedAttributes() { return ['label']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._content = '';
  }

  set content(val) { this._content = val || ''; this.render(); }
  get content() { return this._content; }

  get gridSize() {
    const textLen = (this._content || '').length;
    const rows = Math.max(1, Math.ceil(textLen / 200));
    return { cols: 4, rows };
  }

  attributeChangedCallback() { this.render(); }
  connectedCallback() { this.render(); }

  render() {
    const label = this.getAttribute('label') || 'AI Analysis';
    const content = this._content;

    this.shadowRoot.innerHTML = `
      <style>${this.styles()}</style>
      <div class="insight">
        <div class="header">
          <span class="ai-badge">AI</span>
          <span class="label">${label}</span>
        </div>
        <div class="body">${content || '<em>No analysis yet</em>'}</div>
      </div>
    `;
  }

  styles() {
    return `
      :host { display: block; font-family: var(--ee-font-family, -apple-system, BlinkMacSystemFont, sans-serif); height: 100%; }
      .insight {
        background: var(--ee-color-surface, #fff);
        border: 1px solid var(--ee-color-border, #e2e5ea);
        border-left: 3px solid var(--ee-color-accent, #6c63ff);
        border-radius: 8px;
        padding: 0.75rem;
        height: 100%; box-sizing: border-box;
        overflow: auto;
      }
      .header {
        display: flex; align-items: center; gap: 0.4rem;
        margin-bottom: 0.5rem;
      }
      .ai-badge {
        background: var(--ee-color-accent, #6c63ff);
        color: #fff;
        font-size: 0.65rem; font-weight: 700;
        padding: 1px 5px; border-radius: 3px;
        text-transform: uppercase; letter-spacing: 0.05em;
      }
      .label {
        font-size: 0.8rem; font-weight: 600;
        color: var(--ee-color-text-secondary, #5a6172);
      }
      .body {
        font-size: 0.85rem;
        line-height: 1.5;
        color: var(--ee-color-text-secondary, #5a6172);
      }
      .body em { color: var(--ee-color-text-muted, #8b91a0); }
      .body strong { color: var(--ee-color-text, #1a1a2e); font-weight: 600; }
      .body p { margin: 0 0 0.4rem 0; }
      .body p:last-child { margin-bottom: 0; }
    `;
  }
}

customElements.define('ee-insight-block', EeInsightBlock);
