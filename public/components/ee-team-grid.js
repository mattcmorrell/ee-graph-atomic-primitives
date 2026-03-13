/**
 * <ee-team-grid> — Displays a grid of people showing team composition.
 *
 * Properties:
 *   members  {Array}  — Array of person objects
 *   manager  {Object} — Optional manager person object (displayed prominently)
 *   teamName {string} — Optional team name for the header
 */

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

  connectedCallback() {
    this.render();
  }

  render() {
    const members = this._members;
    const manager = this._manager;
    const teamName = this._teamName;

    if (!members.length && !manager) {
      this.shadowRoot.innerHTML = `
        <style>${this.styles()}</style>
        <div class="grid empty">No team data</div>
      `;
      return;
    }

    const nonManagerMembers = manager
      ? members.filter(m => m.id !== manager.id)
      : members;

    this.shadowRoot.innerHTML = `
      <style>${this.styles()}</style>
      <div class="grid">
        ${teamName ? `<div class="header">${teamName}</div>` : ''}
        ${manager ? `
          <div class="manager-section">
            <div class="section-label">Manager</div>
            <ee-person-card size="md"></ee-person-card>
          </div>
        ` : ''}
        ${nonManagerMembers.length ? `
          <div class="members-section">
            <div class="section-label">Members (${nonManagerMembers.length})</div>
            <div class="members-grid">
              ${nonManagerMembers.map(() => `<ee-person-card size="sm"></ee-person-card>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // Set person data via JS properties
    if (manager) {
      const managerCard = this.shadowRoot.querySelector('.manager-section ee-person-card');
      if (managerCard) managerCard.person = manager;
    }

    const memberCards = this.shadowRoot.querySelectorAll('.members-grid ee-person-card');
    nonManagerMembers.forEach((m, i) => {
      if (memberCards[i]) memberCards[i].person = m;
    });
  }

  styles() {
    return `
      :host {
        display: block;
      }
      .grid {
        background: var(--ee-color-surface, #fff);
        border: 1px solid var(--ee-color-border, #e2e5ea);
        border-radius: var(--ee-radius-md, 8px);
        padding: var(--ee-space-lg, 1rem);
      }
      .grid.empty {
        color: var(--ee-color-text-muted, #8b91a0);
        font-size: var(--ee-font-size-sm, 0.8rem);
        text-align: center;
        padding: var(--ee-space-xl, 1.5rem);
      }
      .header {
        font-size: var(--ee-font-size-md, 1rem);
        font-weight: var(--ee-font-weight-semibold, 600);
        color: var(--ee-color-text, #1a1a2e);
        margin-bottom: var(--ee-space-lg, 1rem);
      }
      .section-label {
        font-size: var(--ee-font-size-xs, 0.75rem);
        font-weight: var(--ee-font-weight-medium, 500);
        color: var(--ee-color-text-muted, #8b91a0);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: var(--ee-space-sm, 0.5rem);
      }
      .manager-section {
        margin-bottom: var(--ee-space-lg, 1rem);
      }
      .manager-section ee-person-card {
        --ee-color-border: var(--ee-color-accent, #6c63ff);
      }
      .members-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: var(--ee-space-sm, 0.5rem);
      }
    `;
  }
}

customElements.define('ee-team-grid', EeTeamGrid);
