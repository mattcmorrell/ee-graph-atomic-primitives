/**
 * <ee-team-grid> — Grid of people showing team composition.
 *
 * Properties: members (Array), manager (Object), teamName (string)
 * Grid sizing: Cols based on member count, rows from density
 */

const AVATAR_BASE_TG = 'https://mattcmorrell.github.io/ee-graph';

class EeTeamGrid extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._members = [];
    this._manager = null;
    this._teamName = '';
  }

  set members(val) { this._members = val || []; this.render(); }
  get members() { return this._members; }
  set manager(val) { this._manager = val; this.render(); }
  get manager() { return this._manager; }
  set teamName(val) { this._teamName = val; this.render(); }
  get teamName() { return this._teamName; }

  get gridSize() {
    const count = this._members.length;
    let cols = count <= 4 ? 3 : count <= 8 ? 4 : 5;
    const membersPerRow = Math.max(2, cols - 1);
    const rows = Math.ceil(count / membersPerRow) + 1; // +1 for header
    if (this._manager) cols = Math.max(cols, 3);
    return { cols, rows: Math.max(2, rows) };
  }

  connectedCallback() { this.render(); }

  render() {
    const members = this._members;
    const manager = this._manager;
    const teamName = this._teamName;

    if (!members.length && !manager) {
      this.shadowRoot.innerHTML = `<style>${this.styles()}</style><div class="grid empty">No team data</div>`;
      return;
    }

    const nonManagerMembers = manager ? members.filter(m => m.id !== manager.id) : members;

    this.shadowRoot.innerHTML = `
      <style>${this.styles()}</style>
      <div class="grid">
        ${teamName ? `<div class="header">${teamName}</div>` : ''}
        ${manager ? `
          <div class="manager-section">
            <div class="section-label">Manager</div>
            <div class="manager-row">
              <div class="mini-person manager-person">
                <div class="mini-avatar">${this._avatarHtml(manager)}</div>
                <div class="mini-info">
                  <div class="mini-name">${manager.name}</div>
                  <div class="mini-role">${manager.role || ''}</div>
                </div>
              </div>
            </div>
          </div>
        ` : ''}
        ${nonManagerMembers.length ? `
          <div class="members-section">
            <div class="section-label">Members (${nonManagerMembers.length})</div>
            <div class="members-grid">
              ${nonManagerMembers.map(m => `
                <div class="mini-person">
                  <div class="mini-avatar">${this._avatarHtml(m)}</div>
                  <div class="mini-info">
                    <div class="mini-name">${m.name}</div>
                    <div class="mini-role">${m.role || ''}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _avatarHtml(p) {
    const url = p.avatarUrl ? `${AVATAR_BASE_TG}/${p.avatarUrl}` : '';
    if (url) {
      return `<img src="${url}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" /><span class="fallback" style="display:none">${(p.name||'?')[0]}</span>`;
    }
    return `<span class="fallback">${(p.name||'?')[0]}</span>`;
  }

  styles() {
    return `
      :host { display: block; font-family: var(--ee-font-family, -apple-system, BlinkMacSystemFont, sans-serif); height: 100%; }
      .grid {
        background: var(--ee-color-surface, #fff);
        border: 1px solid var(--ee-color-border, #e2e5ea);
        border-radius: 8px;
        padding: 0.75rem;
        height: 100%;
        box-sizing: border-box;
        overflow: hidden;
      }
      .grid.empty {
        color: var(--ee-color-text-muted, #8b91a0);
        font-size: 0.8rem;
        text-align: center;
        display: flex; align-items: center; justify-content: center;
      }
      .header {
        font-size: 0.875rem; font-weight: 600;
        color: var(--ee-color-text, #1a1a2e);
        margin-bottom: 0.5rem;
      }
      .section-label {
        font-size: 0.7rem; font-weight: 500;
        color: var(--ee-color-text-muted, #8b91a0);
        text-transform: uppercase; letter-spacing: 0.05em;
        margin-bottom: 0.35rem;
      }
      .manager-section { margin-bottom: 0.5rem; }
      .manager-person { border-left: 2px solid var(--ee-color-accent, #6c63ff); padding-left: 0.5rem; }
      .members-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 0.35rem;
      }
      .mini-person {
        display: flex; align-items: center; gap: 0.4rem;
        padding: 0.25rem 0.35rem;
        border-radius: 4px;
      }
      .mini-person:hover { background: var(--ee-color-surface-hover, #f0f2f5); }
      .mini-avatar {
        width: 28px; height: 28px; flex-shrink: 0;
        border-radius: 9999px; overflow: hidden;
      }
      .mini-avatar img { width: 100%; height: 100%; object-fit: cover; }
      .mini-avatar .fallback {
        width: 100%; height: 100%;
        background: var(--ee-color-accent, #6c63ff);
        color: #fff; display: flex; align-items: center; justify-content: center;
        font-size: 0.7rem; font-weight: 600; border-radius: 9999px;
      }
      .mini-name {
        font-size: 0.8rem; font-weight: 500;
        color: var(--ee-color-text, #1a1a2e);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .mini-role {
        font-size: 0.7rem;
        color: var(--ee-color-text-muted, #8b91a0);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
    `;
  }
}

customElements.define('ee-team-grid', EeTeamGrid);
