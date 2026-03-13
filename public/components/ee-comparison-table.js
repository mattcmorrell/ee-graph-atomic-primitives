/**
 * <ee-comparison-table> — Side-by-side comparison of 2+ entities.
 *
 * Properties:
 *   items  (Array of objects to compare)
 *   fields (Array of { key, label, changed? } defining comparison dimensions)
 *     changed: boolean — if true, row is highlighted as changed between scenarios
 * Grid sizing: (items.length+1) x (fields.length+1), min 4x2
 */

class EeComparisonTable extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._items = [];
    this._fields = [];
  }

  set items(val) { this._items = val || []; this.render(); }
  get items() { return this._items; }
  set fields(val) { this._fields = val || []; this.render(); }
  get fields() { return this._fields; }

  get gridSize() {
    const cols = Math.max(4, this._items.length + 1);
    const rows = Math.max(2, Math.ceil((this._fields.length + 1) * 0.5));
    return { cols, rows };
  }

  connectedCallback() { this.render(); }

  render() {
    const items = this._items;
    const fields = this._fields;

    if (!items.length || !fields.length) {
      this.shadowRoot.innerHTML = `<style>${this.styles()}</style><div class="table empty">No comparison data</div>`;
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>${this.styles()}</style>
      <div class="table">
        <table>
          <thead>
            <tr>
              <th class="field-col"></th>
              ${items.map(item => `<th class="item-col">${item.name || item.id || '—'}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${fields.map(f => {
              const rowChanged = f.changed ? 'row-changed' : '';
              return `
              <tr class="${rowChanged}">
                <td class="field-label">${f.label || f.key}${f.changed ? ' <span class="changed-dot">&#9679;</span>' : ''}</td>
                ${items.map(item => {
                  const val = item[f.key];
                  const cls = f.highlight && f.highlight(val, item) ? 'highlight' : '';
                  return `<td class="${cls}">${val != null ? val : '—'}</td>`;
                }).join('')}
              </tr>
            `;}).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  styles() {
    return `
      :host { display: block; font-family: var(--ee-font-family, -apple-system, BlinkMacSystemFont, sans-serif); height: 100%; }
      .table {
        background: var(--ee-color-surface, #fff);
        border: 1px solid var(--ee-color-border, #e2e5ea);
        border-radius: 8px;
        height: 100%;
        box-sizing: border-box;
        overflow: auto;
      }
      .table.empty {
        display: flex; align-items: center; justify-content: center;
        color: var(--ee-color-text-muted, #8b91a0); font-size: 0.8rem;
      }
      table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
      th, td { padding: 0.5rem 0.6rem; text-align: left; border-bottom: 1px solid var(--ee-color-border-light, #eef0f3); }
      th { font-weight: 600; font-size: 0.8rem; color: var(--ee-color-text, #1a1a2e); background: var(--ee-color-surface-alt, #f8f9fb); }
      .field-label { font-weight: 500; color: var(--ee-color-text-secondary, #5a6172); white-space: nowrap; }
      td { color: var(--ee-color-text, #1a1a2e); }
      .highlight { background: var(--ee-color-warning-bg, #fef9e7); font-weight: 600; }
      .row-changed td { background: var(--ee-color-info-bg, #eef3fa); }
      .row-changed .field-label { color: var(--ee-color-info, #4a6fa5); font-weight: 600; }
      .changed-dot { color: var(--ee-color-info, #4a6fa5); font-size: 0.5rem; vertical-align: middle; margin-left: 0.2rem; }
    `;
  }
}

customElements.define('ee-comparison-table', EeComparisonTable);
