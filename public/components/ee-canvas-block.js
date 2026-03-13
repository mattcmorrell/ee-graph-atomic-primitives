/**
 * <ee-canvas-block> — Generic Tier 3 container for AI-generated bespoke content.
 *
 * Properties: content (raw HTML string)
 * Attributes: cols, rows (grid size declaration), label
 * Grid sizing: declared by creator via cols/rows attrs
 */

class EeCanvasBlock extends HTMLElement {
  static get observedAttributes() { return ['cols', 'rows', 'label']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._content = '';
  }

  set content(val) { this._content = val || ''; this.render(); }
  get content() { return this._content; }

  get gridSize() {
    return {
      cols: parseInt(this.getAttribute('cols')) || 3,
      rows: parseInt(this.getAttribute('rows')) || 2
    };
  }

  attributeChangedCallback() { this.render(); }
  connectedCallback() { this.render(); }

  render() {
    const label = this.getAttribute('label') || '';
    const content = this._content;

    this.shadowRoot.innerHTML = `
      <style>${this.styles()}</style>
      <div class="block">
        ${label ? `<div class="label">${label}</div>` : ''}
        <div class="content">${content || '<em>Empty block</em>'}</div>
      </div>
    `;
  }

  styles() {
    return `
      :host { display: block; font-family: var(--ee-font-family, -apple-system, BlinkMacSystemFont, sans-serif); height: 100%; }
      .block {
        background: var(--ee-color-surface, #fff);
        border: 1px dashed var(--ee-color-border, #e2e5ea);
        border-radius: 8px;
        padding: 0.75rem;
        height: 100%; box-sizing: border-box; overflow: auto;
      }
      .label {
        font-size: 0.7rem; font-weight: 600;
        color: var(--ee-color-text-muted, #8b91a0);
        text-transform: uppercase; letter-spacing: 0.05em;
        margin-bottom: 0.4rem;
      }
      .content {
        font-size: 0.85rem; color: var(--ee-color-text); line-height: 1.5;
      }
      .content em { color: var(--ee-color-text-muted); }
    `;
  }
}

customElements.define('ee-canvas-block', EeCanvasBlock);
