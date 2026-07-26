/**
 * Main Game Controller - LocalStorage Name Sync & Dynamic Mode Setup
 */
document.addEventListener('DOMContentLoaded', () => {
    const renderer = new CanvasRenderer('ludoCanvas', 'canvas-wrapper');
    const board = new Board(renderer);
    const audio = new AudioEngine();
    const gameState = new GameState(audio);

    const nameInput = document.getElementById('player-name-input');
    const menuOverlay = document.getElementById('menu-overlay');
    const modeButtons = document.querySelectorAll('.mode-btn');

    // 1. Load saved name from LocalStorage if available
    const savedName = localStorage.getItem('ludo_player_name');
    if (savedName) {
        nameInput.value = savedName;
    }

    let tokens = [];

    function initGameTokens() {
        tokens = [];
        gameState.players.forEach((color, pIdx) => {
            for (let i = 0; i < 4; i++) {
                const token = new Token(`${color}_${i}`, color, pIdx);
                tokens.push(token);
            }
        });

        window.gameTokens = tokens;
        updateTokenPositions();
    }

    function updateTokenPositions() {
        tokens.forEach(token => {
            if (!token.isMoving) {
                if (token.step === -1) {
                    const tokenIdx = parseInt(token.id.split('_')[1]);
                    const pos = board.getHomeYardPixelCoordinates(token.colorKey, tokenIdx);
                    token.x = pos.x;
                    token.y = pos.y;
                } else {
                    const gridCoord = board.getGridCoordinates(token.colorKey, token.step);
                    const pos = board.getPixelCoordinates(gridCoord.r, gridCoord.c);
                    token.x = pos.x;
                    token.y = pos.y;
                }
            }
        });
    }

    // 2. Mode Button Click - Save Name to LocalStorage and Start Match
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const enteredName = nameInput.value.trim() || 'Govind';
            
            // Save in Browser LocalStorage
            localStorage.setItem('ludo_player_name', enteredName);

            const selectedMode = parseInt(btn.getAttribute('data-players'));
            
            gameState.setGameMode(selectedMode, enteredName);
            initGameTokens();
            
            menuOverlay.classList.add('hidden');
        });
    });

    // Initialize Dice Engine
    const dice = new Dice('dice', 'dice-container', (rollValue) => {
        dice.setEnabled(false);
        gameState.handleDiceRoll(rollValue, tokens);
    });

    window.gameDice = dice;

    // UI Buttons
    const btnSound = document.getElementById('btn-sound');
    btnSound.addEventListener('click', () => {
        const isMuted = audio.toggleMute();
        btnSound.textContent = isMuted ? '🔇' : '🔊';
    });

    const btnPause = document.getElementById('btn-pause');
    btnPause.addEventListener('click', () => {
        menuOverlay.classList.remove('hidden');
    });

    const btnRestart = document.getElementById('btn-restart');
    btnRestart.addEventListener('click', () => {
        location.reload();
    });

    // Canvas Input Dispatcher
    const canvas = document.getElementById('ludoCanvas');

    function handleCanvasClick(e) {
        if (gameState.state !== 'WAITING_FOR_MOVE') return;

        const rect = canvas.getBoundingClientRect();
        const clickX = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const clickY = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

        const scale = renderer.size / rect.width;
        const canvasX = clickX * scale;
        const canvasY = clickY * scale;

        const selectableTokens = tokens.filter(t => t.isSelectable);
        let clickedToken = null;
        let minDistance = renderer.cellSize * 0.8;

        selectableTokens.forEach(t => {
            const dx = canvasX - t.x;
            const dy = canvasY - t.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDistance) {
                minDistance = dist;
                clickedToken = t;
            }
        });

        if (clickedToken) {
            gameState.moveToken(clickedToken, board, tokens, () => {
                updateTokenPositions();
            });
        }
    }

    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleCanvasClick(e);
    }, { passive: false });

    // Render Loop (60 FPS)
    function gameLoop() {
        renderer.clear();
        board.render();

        const positionGroups = {};
        tokens.forEach(token => {
            const key = `${token.x.toFixed(1)}_${token.y.toFixed(1)}`;
            if (!positionGroups[key]) positionGroups[key] = [];
            positionGroups[key].push(token);
        });

        tokens.forEach(token => {
            const key = `${token.x.toFixed(1)}_${token.y.toFixed(1)}`;
            const group = positionGroups[key];
            const stackIdx = group.indexOf(token);
            const offset = Helpers.getStackOffset(stackIdx, group.length, renderer.cellSize);

            token.render(renderer.ctx, renderer.cellSize, offset);
        });

        requestAnimationFrame(gameLoop);
    }

    gameLoop();

    window.addEventListener('canvasResized', () => {
        updateTokenPositions();
    });
});