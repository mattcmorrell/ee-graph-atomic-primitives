/**
 * <ee-checklist> — Action steps with owners and status.
 *
 * Properties:
 *   items (Array of { text, owner?, status?, priority? })
 *     status: "pending" | "in_progress" | "done" | "blocked"
 *     priority: "low" | "medium" | "high" | "critical"
 * Attributes: title
 * Grid sizing: 3xN where N scales with item count, min 3x1
 */

class EeChecklist extends HTMLElement {
  static get observedAttributes() { return ['title']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._items = [];
  }

  set items(val) { this._items = val || []; this.render(); }
  get items() { return this._items; }

  get gridSize() {
    const rows = Math.max(1, Math.ceil(this._items.length * 0.5) + 1);
    return { cols: 3, rows };
  }

  attributeChangedCallback() { this.render(); }
  connectedCallback() { this.render(); }

  render() {
    const title = this.getAttribute('title') || '';
    const items = this._items;

    this.shadowRoot.innerHTML = `
      <style>${this.styles()}</style>
      <div class="checklist">
        ${title ? `<div class="title">${title}</div>` : ''}
        ${items.length === 0 ? '<div class="empty">No items</div>' : ''}
        <div class="items">
          ${items.map(item => {
            const status = item.status || 'pending';
            const priority = item.priority || '';
            const icon = status === 'done' ? '&#10003;' : status === 'in_progress' ? '&#9654;' : status === 'blocked' ? '&#10007;' : '&#9675;';
            return `
              <div class="item item-${status}">
                <span class="check">${icon}</span>
                <div class="item-content">
                  <span class="text">${item.text}</span>
                  ${item.owner ? `<span class="owner">${item.owner}</span>` : ''}
                </div>
                ${priority === 'high' || priority === 'critical' ? `<span class="priority priority-${priority}">${priority}</span>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  styles() {
    return `
      :host { display: block; font-family: var(--ee-font-family, -apple-system, BlinkMacSystemFont, sans-serif); height: 100%; }
      .checklist {
        background: var(--ee-color-surface, #fff);
        border: 1px solid var(--ee-color-border, #e2e5ea);
        border-radius: 8px;
        padding: 0.75rem;
        height: 100%; box-sizing: border-box; overflow: auto;
      }
      .title { font-size: 0.875rem; font-weight: 600; color: var(--ee-color-text); margin-bottom: 0.5rem; }
      .empty { color: var(--ee-color-text-muted); font-size: 0.8rem; }
      .items { display: flex; flex-direction: column; gap: 0.3rem; }
      .item {
        display: flex; align-items: flex-start; gap: 0.5rem;
        padding: 0.35rem 0.4rem;
        border-radius: 4px;
        font-size: 0.8rem;
      }
      .item:hover { background: var(--ee-color-surface-hover, #f0f2f5); }
      .check { flex-shrink: 0; width: 16px; text-align: center; margin-top: 1px; }
      .item-pending .check { color: var(--ee-color-text-muted); }
      .item-in_progress .check { color: var(--ee-color-info, #4a6fa5); }
      .item-done .check { color: var(--ee-color-success, #27ae60); }
      .item-done .text { text-decoration: line-through; color: var(--ee-color-text-muted); }
      .item-blocked .check { color: var(--ee-color-critical, #c0392b); }
      .item-content { flex: 1; min-width: 0; }
      .text { color: var(--ee-color-text, #1a1a2e); }
      .owner {
        display: block; font-size: 0.7rem;
        color: var(--ee-color-text-muted, #8b91a0); margin-top: 0.1rem;
      }
      .priority {
        font-size: 0.65rem; font-weight: 600; padding: 1px 4px;
        border-radius: 3px; text-transform: uppercase; flex-shrink: 0;
      }
      .priority-high { background: var(--ee-color-warning-bg); color: var(--ee-color-warning); }
      .priority-critical { background: var(--ee-color-critical-bg); color: var(--ee-color-critical); }
    `;
  }
}

customElements.define('ee-checklist', EeChecklist);
