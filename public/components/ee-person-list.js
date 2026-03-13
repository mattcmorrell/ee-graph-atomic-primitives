/**
 * <ee-person-list> — Compact list of people (denser than grid).
 *
 * Properties: people (Array of person objects)
 * Attributes: title
 * Grid sizing: 3xN where N = ceil(people.length / 3) + 1
 */

const AVATAR_BASE_PL = 'https://mattcmorrell.github.io/ee-graph';

class EePersonList extends HTMLElement {
  static get observedAttributes() { return ['title']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._people = [];
  }

  set people(val) { this._people = val || []; this.render(); }
  get people() { return this._people; }

  get gridSize() {
    const rows = Math.ceil(this._people.length / 3) + 1;
    return { cols: 3, rows: Math.max(2, rows) };
  }

  attributeChangedCallback() { this.render(); }
  connectedCallback() { this.render(); }

  render() {
    const title = this.getAttribute('title') || '';
    const people = this._people;

    this.shadowRoot.innerHTML = `
      <style>${this.styles()}</style>
      <div class="list">
        ${title ? `<div class="header">${title}</div>` : ''}
        ${people.length === 0 ? '<div class="empty">No people</div>' : ''}
        <div class="items">
          ${people.map(p => {
            const url = p.avatarUrl ? `${AVATAR_BASE_PL}/${p.avatarUrl}` : '';
            return `
              <div class="person-row">
                <div class="avatar">
                  ${url ? `<img src="${url}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />` : ''}
                  <span class="fallback" ${url ? 'style="display:none"' : ''}>${(p.name||'?')[0]}</span>
                </div>
                <div class="info">
                  <span class="name">${p.name || 'Unknown'}</span>
                  <span class="detail">${p.role || p.level || ''}</span>
                </div>
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
      .list {
        background: var(--ee-color-surface, #fff);
        border: 1px solid var(--ee-color-border, #e2e5ea);
        border-radius: 8px;
        padding: 0.75rem;
        height: 100%;
        box-sizing: border-box;
        overflow: hidden;
      }
      .header {
        font-size: 0.875rem; font-weight: 600;
        color: var(--ee-color-text, #1a1a2e);
        margin-bottom: 0.5rem;
      }
      .empty { color: var(--ee-color-text-muted, #8b91a0); font-size: 0.8rem; }
      .items { display: flex; flex-direction: column; gap: 0.25rem; }
      .person-row {
        display: flex; align-items: center; gap: 0.5rem;
        padding: 0.3rem 0.35rem;
        border-radius: 4px;
      }
      .person-row:hover { background: var(--ee-color-surface-hover, #f0f2f5); }
      .avatar {
        width: 24px; height: 24px; flex-shrink: 0;
        border-radius: 9999px; overflow: hidden;
      }
      .avatar img { width: 100%; height: 100%; object-fit: cover; }
      .avatar .fallback {
        width: 100%; height: 100%;
        background: var(--ee-color-accent, #6c63ff);
        color: #fff; display: flex; align-items: center; justify-content: center;
        font-size: 0.65rem; font-weight: 600; border-radius: 9999px;
      }
      .info { display: flex; align-items: baseline; gap: 0.4rem; min-width: 0; }
      .name {
        font-size: 0.8rem; font-weight: 500;
        color: var(--ee-color-text, #1a1a2e);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .detail {
        font-size: 0.75rem;
        color: var(--ee-color-text-muted, #8b91a0);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
    `;
  }
}

customElements.define('ee-person-list', EePersonList);
