/**
 * High-DPI Canvas Rendering Engine
 * Handles automatic responsive resizing and high-resolution scaling.
 */
class CanvasRenderer {
    constructor(canvasId, wrapperId) {
        this.canvas = document.getElementById(canvasId);
        this.wrapper = document.getElementById(wrapperId);
        this.ctx = this.canvas.getContext('2d');

        this.size = 0;       // Canvas square dimensions (px)
        this.cellSize = 0;   // Size of 1 grid unit (size / 15)
        this.dpr = window.devicePixelRatio || 1;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.wrapper.getBoundingClientRect();
        // Keep canvas perfectly square while fitting within container
        const availableSize = Math.min(rect.width, rect.height) - 16;
        
        this.size = Math.max(280, availableSize);
        this.cellSize = this.size / CONFIG.GRID_SIZE;

        // High DPI canvas buffer scaling
        this.canvas.width = this.size * this.dpr;
        this.canvas.height = this.size * this.dpr;

        this.canvas.style.width = `${this.size}px`;
        this.canvas.style.height = `${this.size}px`;

        this.ctx.scale(this.dpr, this.dpr);

        // Dispatch event so Board knows to redraw
        window.dispatchEvent(new CustomEvent('canvasResized'));
    }

    clear() {
        this.ctx.clearRect(0, 0, this.size, this.size);
    }
}