/**
 * Mathematical Grid Board Engine
 * Zero Magic Numbers - 100% Derived Geometry
 */
class Board {
    constructor(renderer) {
        this.renderer = renderer;
        this.ctx = renderer.ctx;
    }

    render() {
        const u = this.renderer.cellSize; // 1 Grid Unit
        const size = this.renderer.size;

        this.ctx.save();
        
        // 1. Draw Global Base White Background
        this.ctx.fillStyle = CONFIG.COLORS.WHITE;
        this.ctx.fillRect(0, 0, size, size);

        // 2. Draw 4 Home Yards (6x6 Units)
        this.drawHomeYard(0, 0, CONFIG.COLORS.RED);                 // Top-Left: Red
        this.drawHomeYard(9 * u, 0, CONFIG.COLORS.GREEN);           // Top-Right: Green
        this.drawHomeYard(9 * u, 9 * u, CONFIG.COLORS.YELLOW);     // Bottom-Right: Yellow
        this.drawHomeYard(0, 9 * u, CONFIG.COLORS.BLUE);           // Bottom-Left: Blue

        // 3. Draw Colored Home Stretches (5 Cells Each)
        this.drawHomeStretches();

        // 4. Draw Starting Cells
        this.drawStartCells();

        // 5. Draw Universal 15x15 Cell Border Grid
        this.drawGridOverlay();

        // 6. Draw Safe Stars & Entry Arrows
        this.drawMarkers();

        // 7. Draw Center Triangle Hub (3x3 Units)
        this.drawCenterHub();

        // 8. Outer Board Perimeter Stroke
        this.ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, size, size);

        this.ctx.restore();
    }

    drawHomeYard(x, y, colorScheme) {
        const u = this.renderer.cellSize;
        const yardSize = 6 * u;

        // Outer colored block
        this.ctx.fillStyle = colorScheme.primary;
        this.ctx.fillRect(x, y, yardSize, yardSize);
        this.ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeRect(x, y, yardSize, yardSize);

        // Inner white square (4x4 units centered)
        const innerX = x + 1 * u;
        const innerY = y + 1 * u;
        const innerSize = 4 * u;

        this.ctx.fillStyle = CONFIG.COLORS.WHITE;
        this.ctx.fillRect(innerX, innerY, innerSize, innerSize);
        this.ctx.strokeRect(innerX, innerY, innerSize, innerSize);

        // 4 Token circles inside white square
        const circleCenters = [
            { cx: x + 2 * u, cy: y + 2 * u },
            { cx: x + 4 * u, cy: y + 2 * u },
            { cx: x + 2 * u, cy: y + 4 * u },
            { cx: x + 4 * u, cy: y + 4 * u }
        ];

        circleCenters.forEach(pos => {
            this.ctx.beginPath();
            this.ctx.arc(pos.cx, pos.cy, u * 0.6, 0, Math.PI * 2);
            this.ctx.fillStyle = colorScheme.primary;
            this.ctx.fill();
            this.ctx.lineWidth = 1.5;
            this.ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
            this.ctx.stroke();
        });
    }

    drawHomeStretches() {
        // Red Home Stretch (Left Arm, Row 7): Columns 1 to 5
        for (let c = 1; c <= 5; c++) {
            this.fillCell(7, c, CONFIG.COLORS.RED.primary);
        }

        // Green Home Stretch (Top Arm, Column 7): Rows 1 to 5
        for (let r = 1; r <= 5; r++) {
            this.fillCell(r, 7, CONFIG.COLORS.GREEN.primary);
        }

        // Yellow Home Stretch (Right Arm, Row 7): Columns 9 to 13
        for (let c = 9; c <= 13; c++) {
            this.fillCell(7, c, CONFIG.COLORS.YELLOW.primary);
        }

        // Blue Home Stretch (Bottom Arm, Column 7): Rows 9 to 13
        for (let r = 9; r <= 13; r++) {
            this.fillCell(r, 7, CONFIG.COLORS.BLUE.primary);
        }
    }

    drawStartCells() {
        // Red Start: Row 6, Col 1
        this.fillCell(6, 1, CONFIG.COLORS.RED.primary);

        // Green Start: Row 1, Col 8
        this.fillCell(1, 8, CONFIG.COLORS.GREEN.primary);

        // Yellow Start: Row 8, Col 13
        this.fillCell(8, 13, CONFIG.COLORS.YELLOW.primary);

        // Blue Start: Row 13, Col 6
        this.fillCell(13, 6, CONFIG.COLORS.BLUE.primary);
    }

    fillCell(r, c, color) {
        const u = this.renderer.cellSize;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(c * u, r * u, u, u);
    }

    drawGridOverlay() {
        const u = this.renderer.cellSize;
        this.ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
        this.ctx.lineWidth = 1;

        // Draw track grid lines for non-yard & non-center areas
        for (let r = 0; r < 15; r++) {
            for (let c = 0; c < 15; c++) {
                const isYard = (r < 6 && c < 6) || (r < 6 && c > 8) || 
                               (r > 8 && c > 8) || (r > 8 && c < 6);
                const isCenter = (r >= 6 && r <= 8) && (c >= 6 && c <= 8);

                if (!isYard && !isCenter) {
                    this.ctx.strokeRect(c * u, r * u, u, u);
                }
            }
        }
    }

    drawMarkers() {
        CONFIG.SAFE_SPOTS.forEach(spot => {
            if (spot.type === 'STAR') {
                this.drawStar(spot.r, spot.c);
            }
        });

        CONFIG.ENTRY_ARROWS.forEach(arrow => {
            this.drawArrow(arrow.r, arrow.c, arrow.dir, arrow.color);
        });
    }

    drawStar(r, c) {
        const u = this.renderer.cellSize;
        const cx = c * u + u / 2;
        const cy = r * u + u / 2;
        const outerR = u * 0.32;
        const innerR = u * 0.14;

        this.ctx.save();
        this.ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            const rad = i % 2 === 0 ? outerR : innerR;
            const angle = (i * Math.PI) / 5 - Math.PI / 2;
            const x = cx + rad * Math.cos(angle);
            const y = cy + rad * Math.sin(angle);
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fillStyle = CONFIG.COLORS.WHITE;
        this.ctx.fill();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = CONFIG.COLORS.STAR_OUTLINE;
        this.ctx.stroke();
        this.ctx.restore();
    }

    drawArrow(r, c, direction, color) {
        const u = this.renderer.cellSize;
        const cx = c * u + u / 2;
        const cy = r * u + u / 2;
        const size = u * 0.22;

        this.ctx.save();
        this.ctx.translate(cx, cy);

        if (direction === 'RIGHT') this.ctx.rotate(0);
        if (direction === 'DOWN') this.ctx.rotate(Math.PI / 2);
        if (direction === 'LEFT') this.ctx.rotate(Math.PI);
        if (direction === 'UP') this.ctx.rotate(-Math.PI / 2);

        this.ctx.beginPath();
        this.ctx.moveTo(-size, -size);
        this.ctx.lineTo(size, 0);
        this.ctx.lineTo(-size, size);
        this.ctx.lineTo(-size * 0.4, 0);
        this.ctx.closePath();

        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawCenterHub() {
        const u = this.renderer.cellSize;
        const x = 6 * u;
        const y = 6 * u;
        const hubSize = 3 * u;
        const cx = x + hubSize / 2;
        const cy = y + hubSize / 2;

        const triangles = [
            { color: CONFIG.COLORS.RED.primary, p1: [x, y], p2: [x, y + hubSize] },
            { color: CONFIG.COLORS.GREEN.primary, p1: [x, y], p2: [x + hubSize, y] },
            { color: CONFIG.COLORS.YELLOW.primary, p1: [x + hubSize, y], p2: [x + hubSize, y + hubSize] },
            { color: CONFIG.COLORS.BLUE.primary, p1: [x, y + hubSize], p2: [x + hubSize, y + hubSize] }
        ];

        triangles.forEach(t => {
            this.ctx.beginPath();
            this.ctx.moveTo(cx, cy);
            this.ctx.lineTo(t.p1[0], t.p1[1]);
            this.ctx.lineTo(t.p2[0], t.p2[1]);
            this.ctx.closePath();
            this.ctx.fillStyle = t.color;
            this.ctx.fill();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
            this.ctx.stroke();
        });

        this.ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeRect(x, y, hubSize, hubSize);
    }

    /**
     * Converts a player's step number (0 to 56) to exact [row, col] grid coordinate
     * @param {string} player - 'RED', 'GREEN', 'YELLOW', 'BLUE'
     * @param {number} step - Step index (-1 = Home Yard, 0 = Start Spot, 51 = Turn into Home Lane, 52-56 = Home Lane, 57 = Finish)
     */
    getGridCoordinates(player, step) {
        if (step === -1) return null; // In Home Yard

        // Final Finish Destination
        if (step === 57) {
            const dest = CONFIG.HOME_DESTINATION[player];
            return { r: dest[0], c: dest[1] };
        }

        // Home Stretch (Steps 52..56)
        if (step >= 52 && step <= 56) {
            const stretchIndex = step - 52;
            const coord = CONFIG.HOME_STRETCH[player][stretchIndex];
            return { r: coord[0], c: coord[1] };
        }

        // Outer Main Track (Steps 0..51)
        const startIndex = CONFIG.START_INDEX[player];
        const pathIndex = (startIndex + step) % 52;
        const coord = CONFIG.MAIN_PATH[pathIndex];
        return { r: coord[0], c: coord[1] };
    }

    /**
     * Converts [row, col] grid coordinate to exact screen pixel Center Point {x, y}
     */
    getPixelCoordinates(r, c) {
        const u = this.renderer.cellSize;
        return {
            x: c * u + u / 2,
            y: r * u + u / 2
        };
    }

    /**
     * Calculates pixel position for tokens sitting inside their Home Yard
     */
    getHomeYardPixelCoordinates(colorKey, tokenIndex) {
        const u = this.renderer.cellSize;
        const baseOffsets = {
            RED: { x: 0, y: 0 },
            GREEN: { x: 9 * u, y: 0 },
            YELLOW: { x: 9 * u, y: 9 * u },
            BLUE: { x: 0, y: 9 * u }
        };

        const circlePositions = [
            { rx: 2 * u, ry: 2 * u },
            { rx: 4 * u, ry: 2 * u },
            { rx: 2 * u, ry: 4 * u },
            { rx: 4 * u, ry: 4 * u }
        ];

        const base = baseOffsets[colorKey];
        const pos = circlePositions[tokenIndex];

        return {
            x: base.x + pos.rx,
            y: base.y + pos.ry
        };
    }
}