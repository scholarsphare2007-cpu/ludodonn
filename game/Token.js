/**
 * Token Class - Vector Pawn Rendering, Selection Effects & Movement Interpolation
 */
class Token {
    constructor(id, colorKey, playerIndex) {
        this.id = id;                     // e.g. "RED_0"
        this.colorKey = colorKey;         // "RED", "GREEN", "YELLOW", "BLUE"
        this.playerIndex = playerIndex;   // 0: Red, 1: Green, 2: Yellow, 3: Blue
        
        this.step = -1;                   // -1 = Home Yard, 0..51 = Main Track, 52..56 = Home Stretch, 57 = Finish
        this.isSelectable = false;        // Active pulse highlight during turn
        
        // Render coordinates (Screen Pixels)
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.isMoving = false;
        
        // Pulse animation phase
        this.pulsePhase = 0;
    }

    /**
     * Smoothly interpolates current position (x, y) towards target position (targetX, targetY)
     */
    update() {
        if (!this.isMoving) return;

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Speed relative to distance
        const speed = Math.max(2, dist * 0.25);

        if (dist <= speed) {
            this.x = this.targetX;
            this.y = this.targetY;
            this.isMoving = false;
        } else {
            this.x += (dx / dist) * speed;
            this.y += (dy / dist) * speed;
        }
    }

    /**
     * Set target position for smooth linear transition
     */
    moveTo(targetX, targetY) {
        this.targetX = targetX;
        this.targetY = targetY;
        this.isMoving = true;
    }

    /**
     * Renders the 3D Vector Pawn on Canvas
     */
    render(ctx, cellSize, stackOffset = { x: 0, y: 0 }) {
        this.update(); // Update position step frame

        const drawX = this.x + stackOffset.x;
        const drawY = this.y + stackOffset.y;
        
        const colors = CONFIG.COLORS[this.colorKey];
        const scale = cellSize * 0.42;

        ctx.save();

        // 1. SELECTION GLOW (Pulsing halo under base when selectable)
        if (this.isSelectable) {
            this.pulsePhase += 0.08;
            const glowRadius = scale * 1.1 + Math.sin(this.pulsePhase) * 3;
            
            ctx.beginPath();
            ctx.arc(drawX, drawY + scale * 0.2, glowRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = colors.primary;
            ctx.stroke();
        }

        // 2. AMBIENT BASE DROP SHADOW
        ctx.beginPath();
        ctx.ellipse(drawX, drawY + scale * 0.45, scale * 0.85, scale * 0.35, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fill();

        // 3. PAWN BASE (Bottom Ring Foundation)
        ctx.beginPath();
        ctx.ellipse(drawX, drawY + scale * 0.3, scale * 0.75, scale * 0.3, 0, 0, Math.PI * 2);
        const baseGradient = ctx.createLinearGradient(drawX - scale, drawY, drawX + scale, drawY);
        baseGradient.addColorStop(0, colors.dark);
        baseGradient.addColorStop(0.5, colors.primary);
        baseGradient.addColorStop(1, colors.dark);
        ctx.fillStyle = baseGradient;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
        ctx.stroke();

        // 4. PAWN BODY (Tapered Waist)
        ctx.beginPath();
        ctx.moveTo(drawX - scale * 0.55, drawY + scale * 0.25);
        ctx.quadraticCurveTo(drawX - scale * 0.2, drawY - scale * 0.2, drawX - scale * 0.28, drawY - scale * 0.45);
        ctx.lineTo(drawX + scale * 0.28, drawY - scale * 0.45);
        ctx.quadraticCurveTo(drawX + scale * 0.2, drawY + scale * 0.2, drawX + scale * 0.55, drawY + scale * 0.25);
        ctx.closePath();

        const bodyGradient = ctx.createLinearGradient(drawX - scale * 0.5, drawY, drawX + scale * 0.5, drawY);
        bodyGradient.addColorStop(0, colors.dark);
        bodyGradient.addColorStop(0.35, colors.primary);
        bodyGradient.addColorStop(0.7, colors.light || '#FFFFFF');
        bodyGradient.addColorStop(1, colors.dark);
        ctx.fillStyle = bodyGradient;
        ctx.fill();
        ctx.stroke();

        // 5. NECK COLLAR RING
        ctx.beginPath();
        ctx.ellipse(drawX, drawY - scale * 0.45, scale * 0.35, scale * 0.12, 0, 0, Math.PI * 2);
        const neckGradient = ctx.createLinearGradient(drawX - scale * 0.35, drawY, drawX + scale * 0.35, drawY);
        neckGradient.addColorStop(0, colors.dark);
        neckGradient.addColorStop(0.5, '#FFFFFF');
        neckGradient.addColorStop(1, colors.dark);
        ctx.fillStyle = neckGradient;
        ctx.fill();
        ctx.stroke();

        // 6. SPHERICAL HEAD (Top Crown)
        const headRadius = scale * 0.48;
        const headCY = drawY - scale * 0.85;

        const headGradient = ctx.createRadialGradient(
            drawX - headRadius * 0.35,
            headCY - headRadius * 0.35,
            headRadius * 0.05,
            drawX,
            headCY,
            headRadius
        );
        headGradient.addColorStop(0, '#FFFFFF');
        headGradient.addColorStop(0.25, colors.primary);
        headGradient.addColorStop(0.85, colors.dark);
        headGradient.addColorStop(1, '#000000');

        ctx.beginPath();
        ctx.arc(drawX, headCY, headRadius, 0, Math.PI * 2);
        ctx.fillStyle = headGradient;
        ctx.fill();
        ctx.stroke();

        // 7. SPECULAR GLOSS HIGHLIGHT
        ctx.beginPath();
        ctx.ellipse(
            drawX - headRadius * 0.3,
            headCY - headRadius * 0.3,
            headRadius * 0.22,
            headRadius * 0.12,
            -Math.PI / 4,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fill();

        ctx.restore();
    }
}