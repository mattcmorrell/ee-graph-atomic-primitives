/**
 * <ee-person-card> — Displays a person from the EE graph.
 *
 * Properties:
 *   person {Object} — Person data: { id, name, role, level, status, location, avatarUrl, startDate }
 *
 * Attributes:
 *   size — "sm" | "md" (default) | "lg"
 *
 * CSS custom properties:
 *   All --ee-* tokens from styles.css are available for theming.
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

  get person() {
    return this._person;
  }

  attributeChangedCallback() {
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const p = this._person;
    const size = this.getAttribute('size') || 'md';

    if (!p) {
      this.shadowRoot.innerHTML = `
        <style>${this.styles(size)}</style>
        <div class="card empty">No person data</div>
      `;
      return;
    }

    const avatarUrl = p.avatarUrl ? `${AVATAR_BASE}/${p.avatarUrl}` : '';

    this.shadowRoot.innerHTML = `
      <style>${this.styles(size)}</style>
      <div class="card size-${size}">
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
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  styles(size) {
    return `
      :host {
        display: block;
      }
      .card {
        display: flex;
        align-items: center;
        gap: var(--ee-space-md, 0.75rem);
        padding: var(--ee-space-md, 0.75rem) var(--ee-space-lg, 1rem);
        background: var(--ee-color-surface, #fff);
        border: 1px solid var(--ee-color-border, #e2e5ea);
        border-radius: var(--ee-radius-md, 8px);
        transition: box-shadow 0.15s ease;
      }
      .card:hover {
        box-shadow: var(--ee-shadow-md, 0 2px 8px rgba(0,0,0,0.08));
      }
      .card.empty {
        color: var(--ee-color-text-muted, #8b91a0);
        font-size: var(--ee-font-size-sm, 0.8rem);
        justify-content: center;
        padding: var(--ee-space-xl, 1.5rem);
      }
      .avatar {
        flex-shrink: 0;
        width: ${size === 'sm' ? 'var(--ee-avatar-size-sm, 32px)' : size === 'lg' ? 'var(--ee-avatar-size-lg, 64px)' : 'var(--ee-avatar-size-md, 48px)'};
        height: ${size === 'sm' ? 'var(--ee-avatar-size-sm, 32px)' : size === 'lg' ? 'var(--ee-avatar-size-lg, 64px)' : 'var(--ee-avatar-size-md, 48px)'};
        position: relative;
      }
      .avatar img {
        width: 100%;
        height: 100%;
        border-radius: var(--ee-radius-full, 9999px);
        object-fit: cover;
      }
      .avatar-fallback {
        width: 100%;
        height: 100%;
        border-radius: var(--ee-radius-full, 9999px);
        background: var(--ee-color-accent, #6c63ff);
        color: var(--ee-color-text-inverse, #fff);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: var(--ee-font-weight-semibold, 600);
        font-size: ${size === 'sm' ? 'var(--ee-font-size-sm, 0.8rem)' : size === 'lg' ? 'var(--ee-font-size-lg, 1.125rem)' : 'var(--ee-font-size-base, 0.875rem)'};
      }
      .info {
        min-width: 0;
      }
      .name {
        font-weight: var(--ee-font-weight-semibold, 600);
        font-size: ${size === 'lg' ? 'var(--ee-font-size-md, 1rem)' : 'var(--ee-font-size-base, 0.875rem)'};
        color: var(--ee-color-text, #1a1a2e);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .role {
        font-size: var(--ee-font-size-sm, 0.8rem);
        color: var(--ee-color-text-secondary, #5a6172);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .meta {
        display: flex;
        align-items: center;
        gap: var(--ee-space-sm, 0.5rem);
        margin-top: var(--ee-space-xs, 0.25rem);
        font-size: var(--ee-font-size-sm, 0.8rem);
      }
      .tag {
        background: var(--ee-color-surface-alt, #f8f9fb);
        color: var(--ee-color-text-secondary, #5a6172);
        padding: 1px 6px;
        border-radius: var(--ee-radius-sm, 4px);
        font-size: var(--ee-font-size-xs, 0.75rem);
        font-weight: var(--ee-font-weight-medium, 500);
      }
      .location {
        color: var(--ee-color-text-muted, #8b91a0);
      }
    `;
  }
}

customElements.define('ee-person-card', EePersonCard);
