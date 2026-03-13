/**
 * <ee-coverage-matrix> — Who covers what (skills × people, certs × teams).
 *
 * Properties:
 *   rows    (Array of { id, label })
 *   columns (Array of { id, label })
 *   data    (Array of { rowId, colId, value, status? })
 *     status: "covered" | "gap" | "partial" | "expiring"
 * Grid sizing: scales with rows × columns, min 4x3
 */

class EeCoverageMatrix extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._rows = [];
    this._columns = [];
    this._data = [];
  }

  set rows(val) { this._rows = val || []; this.render(); }
  get rows() { return this._rows; }
  set columns(val) { this._columns = val || []; this.render(); }
  get columns() { return this._columns; }
  set data(val) { this._data = val || []; this.render(); }
  get data() { return this._data; }

  get gridSize() {
    const cols = Math.max(4, this._columns.length + 1);
    const rows = Math.max(3, Math.ceil((this._rows.length + 1) * 0.6));
    return { cols, rows };
  }

  connectedCallback() { this.render(); }

  _lookup(rowId, colId) {
    return this._data.find(d => d.rowId === rowId && d.colId === colId);
  }

  render() {
    if (!this._rows.length || !this._columns.length) {
      this.shadowRoot.innerHTML = `<style>${this.styles()}</style><div class="matrix empty">No coverage data</div>`;
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>${this.styles()}</style>
      <div class="matrix">
        <table>
          <thead>
            <tr>
              <th></th>
              ${this._columns.map(c => `<th>${c.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${this._rows.map(r => `
              <tr>
                <td class="row-label">${r.label}</td>
                ${this._columns.map(c => {
                  const cell = this._lookup(r.id, c.id);
                  const status = cell ? (cell.status || 'covered') : 'gap';
                  const val = cell ? (cell.value || '') : '';
                  const icon = status === 'covered' ? '&#10003;' : status === 'gap' ? '&mdash;' : status === 'partial' ? '&#189;' : '&#9888;';
                  return `<td class="cell cell-${status}" title="${val}">${icon}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  styles() {
    return `
      :host { display: block; font-family: var(--ee-font-family, -apple-system, BlinkMacSystemFont, sans-serif); height: 100%; }
      .matrix {
        background: var(--ee-color-surface, #fff);
        border: 1px solid var(--ee-color-border, #e2e5ea);
        border-radius: 8px;
        height: 100%; box-sizing: border-box; overflow: auto;
      }
      .matrix.empty {
        display: flex; align-items: center; justify-content: center;
        color: var(--ee-color-text-muted); font-size: 0.8rem;
      }
      table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
      th, td { padding: 0.4rem 0.5rem; text-align: center; border-bottom: 1px solid var(--ee-color-border-light, #eef0f3); }
      th { font-weight: 600; font-size: 0.75rem; color: var(--ee-color-text-secondary); background: var(--ee-color-surface-alt, #f8f9fb); }
      .row-label { text-align: left; font-weight: 500; color: var(--ee-color-text-secondary); white-space: nowrap; }
      .cell { width: 36px; font-size: 0.85rem; }
      .cell-covered { color: var(--ee-color-success, #27ae60); background: var(--ee-color-success-bg, #eafaf1); }
      .cell-gap { color: var(--ee-color-text-muted, #8b91a0); }
      .cell-partial { color: var(--ee-color-warning, #d4a017); background: var(--ee-color-warning-bg, #fef9e7); }
      .cell-expiring { color: var(--ee-color-critical, #c0392b); background: var(--ee-color-critical-bg, #fdecea); }
    `;
  }
}

customElements.define('ee-coverage-matrix', EeCoverageMatrix);
