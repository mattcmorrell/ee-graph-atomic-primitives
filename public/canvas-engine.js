// canvas-engine.js — Grid-based spatial engine for atomic primitives canvas
// 96px brick grid, pan/zoom, block management, connector lines

class CanvasEngine {
  constructor(containerEl) {
    this.BRICK = 96;
    this.MIN_SCALE = 0.3;
    this.MAX_SCALE = 2.0;
    this.GAP = 8; // padding inside grid cells

    this.container = containerEl;
    this.blocks = new Map();
    this.connectors = new Map();
    this.transform = { x: 0, y: 0, scale: 1 };
    this._isPanning = false;
    this._panStart = { x: 0, y: 0 };
    this._panOrigin = { x: 0, y: 0 };

    this._setup();
  }

  _setup() {
    this.container.style.overflow = 'hidden';
    this.container.style.position = 'relative';

    // World is the transform target
    this.world = document.createElement('div');
    this.world.className = 'canvas-world';
    this.world.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      transform-origin: 0 0;
      will-change: transform;
    `;
    this.container.appendChild(this.world);

    // Grid background layer
    this._createGrid();

    // Connector SVG layer — sits at 0,0 with overflow visible
    this.svgLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svgLayer.setAttribute('width', '1');
    this.svgLayer.setAttribute('height', '1');
    this.svgLayer.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      overflow: visible;
      pointer-events: none;
      z-index: 0;
    `;
    this.world.appendChild(this.svgLayer);

    // Events
    this.container.addEventListener('pointerdown', this._onPointerDown.bind(this));
    this.container.addEventListener('pointermove', this._onPointerMove.bind(this));
    this.container.addEventListener('pointerup', this._onPointerUp.bind(this));
    this.container.addEventListener('pointercancel', this._onPointerUp.bind(this));
    this.container.addEventListener('wheel', this._onWheel.bind(this), { passive: false });

    this._recenter();
    window.addEventListener('resize', () => this._recenter());
  }

  _createGrid() {
    this.gridLayer = document.createElement('div');
    this.gridLayer.className = 'canvas-grid';
    this.gridLayer.style.cssText = `
      position: absolute;
      top: -5000px; left: -5000px;
      width: 10000px; height: 10000px;
      pointer-events: none;
      background-size: ${this.BRICK}px ${this.BRICK}px;
      background-image:
        linear-gradient(to right, var(--ee-color-border-light, #eef0f3) 1px, transparent 1px),
        linear-gradient(to bottom, var(--ee-color-border-light, #eef0f3) 1px, transparent 1px);
      opacity: 0.6;
    `;
    this.world.appendChild(this.gridLayer);
  }

  _recenter() {
    if (!this._hasUserPanned) {
      this.transform.x = this.container.clientWidth / 2;
      this.transform.y = this.container.clientHeight * 0.1;
    }
    this._applyTransform();
  }

  _applyTransform() {
    const { x, y, scale } = this.transform;
    this.world.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }

  // --- Pan ---
  _onPointerDown(e) {
    if (e.target.closest('.canvas-block')) return;
    this._isPanning = true;
    this._hasUserPanned = true;
    this._panStart = { x: e.clientX, y: e.clientY };
    this._panOrigin = { x: this.transform.x, y: this.transform.y };
    this.container.style.cursor = 'grabbing';
    this.container.setPointerCapture(e.pointerId);
  }

  _onPointerMove(e) {
    if (!this._isPanning) return;
    this.transform.x = this._panOrigin.x + (e.clientX - this._panStart.x);
    this.transform.y = this._panOrigin.y + (e.clientY - this._panStart.y);
    this._applyTransform();
  }

  _onPointerUp() {
    this._isPanning = false;
    this.container.style.cursor = '';
  }

  // --- Zoom (Ctrl/Cmd+scroll only, bare scroll pans) ---
  _onWheel(e) {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      // Pinch-zoom or Ctrl+scroll → zoom
      const rect = this.container.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const delta = -e.deltaY * 0.003;
      const newScale = Math.max(this.MIN_SCALE, Math.min(this.MAX_SCALE, this.transform.scale * (1 + delta)));
      const ratio = newScale / this.transform.scale;

      this.transform.x = mx - (mx - this.transform.x) * ratio;
      this.transform.y = my - (my - this.transform.y) * ratio;
      this.transform.scale = newScale;
    } else {
      // Bare scroll → pan
      this.transform.x -= e.deltaX;
      this.transform.y -= e.deltaY;
      this._hasUserPanned = true;
    }
    this._applyTransform();
  }

  // --- Grid helpers ---
  gridToPixel(col, row) {
    return { x: col * this.BRICK, y: row * this.BRICK };
  }

  // --- Block Management ---
  addBlock(id, element, col, row, colSpan, rowSpan) {
    element.classList.add('canvas-block');
    element.dataset.blockId = id;

    const pos = this.gridToPixel(col, row);
    element.style.cssText += `
      position: absolute;
      left: ${pos.x}px;
      top: ${pos.y}px;
      width: ${colSpan * this.BRICK - this.GAP}px;
      height: ${rowSpan * this.BRICK - this.GAP}px;
      z-index: 1;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1);
    `;

    this.world.appendChild(element);

    const entry = { element, col, row, colSpan, rowSpan };
    this.blocks.set(id, entry);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      });
    });

    return entry;
  }

  removeBlock(id) {
    const block = this.blocks.get(id);
    if (!block) return;
    block.element.remove();
    this.blocks.delete(id);
    for (const [key, conn] of this.connectors) {
      if (key.startsWith(id + '->') || key.endsWith('->' + id)) {
        conn.el.remove();
        this.connectors.delete(key);
      }
    }
  }

  moveBlock(id, col, row, animate = true) {
    const block = this.blocks.get(id);
    if (!block) return;

    block.col = col;
    block.row = row;
    const pos = this.gridToPixel(col, row);

    if (animate) {
      block.element.style.transition = 'left 0.3s ease, top 0.3s ease';
    }
    block.element.style.left = `${pos.x}px`;
    block.element.style.top = `${pos.y}px`;

    if (animate) {
      setTimeout(() => { block.element.style.transition = ''; }, 300);
    }
    this._updateConnectors();
  }

  getBlock(id) {
    return this.blocks.get(id);
  }

  // --- Connectors (SVG paths) ---
  addConnector(parentId, childId, style = {}) {
    const key = `${parentId}->${childId}`;
    const parent = this.blocks.get(parentId);
    const child = this.blocks.get(childId);
    if (!parent || !child) return;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', style.color || '#a0a8b8');
    path.setAttribute('stroke-width', style.width || '2');
    if (style.dashed) path.setAttribute('stroke-dasharray', '4 3');
    path.style.opacity = '0';
    path.style.transition = 'opacity 0.6s ease 0.4s';

    this.svgLayer.appendChild(path);
    this.connectors.set(key, { parentId, childId, el: path, style });

    this._drawConnector(key);

    requestAnimationFrame(() => {
      path.style.opacity = '1';
    });
  }

  _drawConnector(key) {
    const conn = this.connectors.get(key);
    if (!conn) return;

    const parent = this.blocks.get(conn.parentId);
    const child = this.blocks.get(conn.childId);
    if (!parent || !child) return;

    const B = this.BRICK;
    const G = this.GAP;
    const r = 8;

    // Parent: bottom center
    const px = parent.col * B + (parent.colSpan * B - G) / 2;
    const py = parent.row * B + parent.rowSpan * B - G;

    // Child: left center
    const cx = child.col * B;
    const cy = child.row * B + (child.rowSpan * B - G) / 2;

    const midY = cy;
    let d;

    if (Math.abs(py - midY) < r * 2) {
      d = `M ${px} ${py} L ${cx} ${cy}`;
    } else if (Math.abs(px - cx) < r * 2) {
      d = `M ${px} ${py} L ${cx} ${cy}`;
    } else {
      const dir = midY > py ? 1 : -1;
      const hdir = cx > px ? 1 : -1;
      d = `M ${px} ${py} L ${px} ${midY - r * dir} Q ${px} ${midY} ${px + r * hdir} ${midY} L ${cx} ${midY}`;
    }

    conn.el.setAttribute('d', d);
  }

  _updateConnectors() {
    for (const key of this.connectors.keys()) {
      this._drawConnector(key);
    }
  }

  // --- Camera ---
  focusOn(id, animate = true) {
    const block = this.blocks.get(id);
    if (!block) return;

    const B = this.BRICK;
    const centerX = block.col * B + (block.colSpan * B) / 2;
    const centerY = block.row * B + (block.rowSpan * B) / 2;

    const vw = this.container.clientWidth;
    const vh = this.container.clientHeight;

    this.transform.x = vw / 2 - centerX * this.transform.scale;
    this.transform.y = vh / 2 - centerY * this.transform.scale;

    if (animate) {
      this.world.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
      this._applyTransform();
      setTimeout(() => { this.world.style.transition = ''; }, 500);
    } else {
      this._applyTransform();
    }
    this._hasUserPanned = true;
  }

  zoomToFit(padding = 60) {
    if (this.blocks.size === 0) return;

    const B = this.BRICK;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const block of this.blocks.values()) {
      const x1 = block.col * B;
      const y1 = block.row * B;
      const x2 = x1 + block.colSpan * B;
      const y2 = y1 + block.rowSpan * B;
      minX = Math.min(minX, x1);
      minY = Math.min(minY, y1);
      maxX = Math.max(maxX, x2);
      maxY = Math.max(maxY, y2);
    }

    const contentW = maxX - minX;
    const contentH = maxY - minY;
    const vw = this.container.clientWidth;
    const vh = this.container.clientHeight;

    // Account for input bar at bottom (~120px)
    const bottomReserve = 120;
    const scaleX = (vw - padding * 2) / contentW;
    const scaleY = (vh - padding - bottomReserve) / contentH;
    const scale = Math.max(this.MIN_SCALE, Math.min(1.0, Math.min(scaleX, scaleY)));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    this.transform.scale = scale;
    this.transform.x = vw / 2 - centerX * scale;
    this.transform.y = (vh - bottomReserve) / 2 - centerY * scale;

    this.world.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
    this._applyTransform();
    setTimeout(() => { this.world.style.transition = ''; }, 600);
    this._hasUserPanned = true;
  }
}
