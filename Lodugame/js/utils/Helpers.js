/**
 * Utility Functions for Ludo Engine
 */
const Helpers = {
    /**
     * Calculates sub-pixel offset when multiple tokens stack on the same cell
     * Prevents tokens from completely obscuring each other
     */
    getStackOffset(index, totalCount, cellSize) {
        if (totalCount <= 1) return { x: 0, y: 0 };

        const radius = cellSize * 0.18;
        const angle = (index * (2 * Math.PI)) / totalCount;

        return {
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle)
        };
    }
};