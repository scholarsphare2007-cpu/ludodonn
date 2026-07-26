/**
 * Ludo Game Configuration - Pure Mathematical Grid & Path Data
 */
const CONFIG = {
    GRID_SIZE: 15,
    
    COLORS: {
        RED: { primary: '#D32F2F', dark: '#B71C1C', light: '#FFCDD2' },
        GREEN: { primary: '#2E7D32', dark: '#1B5E20', light: '#C8E6C9' },
        YELLOW: { primary: '#FBC02D', dark: '#F57F17', light: '#FFF9C4' },
        BLUE: { primary: '#1976D2', dark: '#0D47A1', light: '#BBDEFB' },
        
        WHITE: '#FFFFFF',
        GRID_LINE: '#000000',
        STAR_OUTLINE: '#000000'
    },

    // Master 52-Cell Outer Main Track (Clockwise Loop)
    // Coords given in [Row, Column]
    MAIN_PATH: [
        [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],                  // 0..4 (Red Arm Top)
        [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],          // 5..10 (Green Arm Left)
        [0, 7], [0, 8],                                         // 11..12 (Top Bridge)
        [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],                  // 13..17 (Green Arm Right)
        [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],     // 18..23 (Yellow Arm Top)
        [7, 14], [8, 14],                                       // 24..25 (Right Bridge)
        [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],              // 26..30 (Yellow Arm Bottom)
        [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],     // 31..36 (Blue Arm Right)
        [14, 7], [14, 6],                                       // 37..38 (Bottom Bridge)
        [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],              // 39..43 (Blue Arm Left)
        [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],          // 44..49 (Red Arm Bottom)
        [7, 0]                                                  // 50..51 (Left Bridge & Loop Close)
    ],

    // Entry Index on MAIN_PATH for each player
    START_INDEX: {
        RED: 0,       // [6, 1]
        GREEN: 13,    // [1, 8]
        YELLOW: 26,   // [8, 13]
        BLUE: 39      // [13, 6]
    },

    // 5 Home Stretch Cells per color
    HOME_STRETCH: {
        RED: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
        GREEN: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
        YELLOW: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
        BLUE: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]]
    },

    // Final Victory Center Cell
    HOME_DESTINATION: {
        RED: [7, 6],
        GREEN: [6, 7],
        YELLOW: [7, 8],
        BLUE: [8, 7]
    },

    // 8 Safe Spots
    SAFE_SPOTS: [
        { r: 6, c: 1, type: 'START', color: 'RED' },
        { r: 2, c: 6, type: 'STAR' },
        { r: 1, c: 8, type: 'START', color: 'GREEN' },
        { r: 6, c: 12, type: 'STAR' },
        { r: 8, c: 13, type: 'START', color: 'YELLOW' },
        { r: 12, c: 8, type: 'STAR' },
        { r: 13, c: 6, type: 'START', color: 'BLUE' },
        { r: 8, c: 2, type: 'STAR' }
    ],

    ENTRY_ARROWS: [
        { r: 7, c: 0, dir: 'RIGHT', color: '#D32F2F' },
        { r: 0, c: 7, dir: 'DOWN', color: '#2E7D32' },
        { r: 7, c: 14, dir: 'LEFT', color: '#FBC02D' },
        { r: 14, c: 7, dir: 'UP', color: '#1976D2' }
    ]
};