/**
 * <ee-person-card> — Displays a person from the EE graph.
 *
 * Properties:
 *   person {Object} — { id, name, role, level, status, location, avatarUrl, startDate }
 *
 * Attributes:
 *   size — "sm" | "md" (default) | "lg"
 *
 * Grid sizing: 2x1 (sm), 3x1 (md), 4x1 (lg)
 */

const AVATAR_BASE = 'https://mattcmorrell.github.io/ee-graph';

class EePersonCard extends HTMLElement {
  static get observedAttributes() { return ['size']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._person = null;
  }

  set person(val) {
    this._person = val;
    this.render();
  }

  get person() { return this._person; }

  get gridSize() {
    const size = this.getAttribute('size') || 'md';
    if (size === 'sm') return { cols: 2, rows: 1 };
    if (size === 'lg') return { cols: 4, rows: 1 };
    return { cols: 3, rows: 1 };
  }

  attributeChangedCallback() { this.render(); }
  connectedCallback() { this.render(); }

  render() {
    const p = this._person;
    const size = this.getAttribute('size') || 'md';

    if (!p) {
      this.shadowRoot.innerHTML = `<style>${this.styles(size)}</style><div class="card empty">No person data</div>`;
      return;
    }

    const avatarUrl = p.avatarUrl ? `${AVATAR_BASE}/${p.avatarUrl}` : '';
    const statusClass = p.status === 'on_leave' ? 'status-leave' : '';

    this.shadowRoot.innerHTML = `
      <style>${this.styles(size)}</style>
      <div class="card size-${size} ${statusClass}">
        <div class="avatar">
          ${avatarUrl
            ? `<img src="${avatarUrl}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />`
            : ''}
          <div class="avatar-fallback" ${avatarUrl ? 'style="display:none"' : ''}>${(p.name || '?')[0]}</div>
        </div>
        <div class="info">
          <div class="name">${p.name || 'Unknown'}</div>
          <div class="role">${p.role || ''}</div>
          ${size !== 'sm' ? `
            <div class="meta">
              ${p.level ? `<span class="tag">${p.level}</span>` : ''}
              ${p.location ? `<span class="location">${p.location}</span>` : ''}
              ${p.status && p.status !== 'active' ? `<span class="status">${p.status.replace('_', ' ')}</span>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  styles(size) {
    return `
      :host { display: block; font-family: var(--ee-font-family, -apple-system, BlinkMacSystemFont, sans-serif); height: 100%; }
      .card {
        display: flex;
        align-items: center;
        gap: var(--ee-space-md, 0.75rem);
        padding: var(--ee-space-md, 0.75rem) var(--ee-space-lg, 1rem);
        background: var(--ee-color-surface, #fff);
        border: 1px solid var(--ee-color-border, #e2e5ea);
        border-radius: var(--ee-radius-md, 8px);
        height: 100%;
        box-sizing: border-box;
        transition: box-shadow 0.15s ease;
      }
      .card:hover { box-shadow: var(--ee-shadow-md, 0 2px 8px rgba(0,0,0,0.08)); }
      .card.empty {
        color: var(--ee-color-text-muted, #8b91a0);
        font-size: var(--ee-font-size-sm, 0.8rem);
        justify-content: center;
      }
      .card.status-leave { opacity: 0.6; }
      .avatar {
        flex-shrink: 0;
        width: ${size === 'sm' ? '32px' : size === 'lg' ? '64px' : '48px'};
        height: ${size === 'sm' ? '32px' : size === 'lg' ? '64px' : '48px'};
        position: relative;
      }
      .avatar img { width: 100%; height: 100%; border-radius: 9999px; object-fit: cover; }
      .avatar-fallback {
        width: 100%; height: 100%; border-radius: 9999px;
        background: var(--ee-color-accent, #6c63ff);
        color: #fff;
        display: flex; align-items: center; justify-content: center;
        font-weight: 600;
        font-size: ${size === 'sm' ? '0.8rem' : size === 'lg' ? '1.125rem' : '0.875rem'};
      }
      .info { min-width: 0; flex: 1; }
      .name {
        font-weight: 600;
        font-size: ${size === 'lg' ? '1rem' : '0.875rem'};
        color: var(--ee-color-text, #1a1a2e);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .role {
        font-size: 0.8rem;
        color: var(--ee-color-text-secondary, #5a6172);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .meta {
        display: flex; align-items: center; gap: 0.5rem;
        margin-top: 0.25rem; font-size: 0.8rem;
      }
      .tag {
        background: var(--ee-color-surface-alt, #f8f9fb);
        color: var(--ee-color-text-secondary, #5a6172);
        padding: 1px 6px; border-radius: 4px;
        font-size: 0.75rem; font-weight: 500;
      }
      .location { color: var(--ee-color-text-muted, #8b91a0); }
      .status {
        color: var(--ee-color-warning, #d4a017);
        font-size: 0.75rem; font-weight: 500;
        text-transform: capitalize;
      }
    `;
  }
}

customElements.define('ee-person-card', EePersonCard);
