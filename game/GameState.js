/**
 * Game State Machine - Rules, Dynamic Names, Player Modes & Collision Engine
 */
class GameState {
    constructor(audio) {
        this.audio = audio;
        this.players = ['RED', 'YELLOW'];
        this.playerNames = {}; // Color -> Display Name Mapping
        this.currentTurnIndex = 0;
        
        this.diceValue = 0;
        this.state = 'WAITING_FOR_ROLL';
        this.winners = [];
        
        this.turnBanner = document.getElementById('current-turn-indicator');
        this.turnText = document.getElementById('turn-text');
        this.victoryOverlay = document.getElementById('victory-overlay');
        this.winnerSubtitle = document.getElementById('winner-subtitle');
    }

    /**
     * Initializes players and names according to selected mode & user input
     */
    setGameMode(modeCount, primaryName) {
        const userSavedName = primaryName && primaryName.trim() ? primaryName.trim() : 'Player';

        if (modeCount === 2) {
            this.players = ['RED', 'YELLOW'];
            this.playerNames = {
                'RED': userSavedName,
                'YELLOW': 'Opposition'
            };
        } else if (modeCount === 3) {
            this.players = ['RED', 'GREEN', 'YELLOW'];
            this.playerNames = {
                'RED': userSavedName,
                'GREEN': 'Opposition-1',
                'YELLOW': 'Opposition-2'
            };
        } else {
            this.players = ['RED', 'GREEN', 'YELLOW', 'BLUE'];
            this.playerNames = {
                'RED': userSavedName,
                'GREEN': 'Opposition-1',
                'YELLOW': 'Opposition-2',
                'BLUE': 'Opposition-3'
            };
        }

        this.currentTurnIndex = 0;
        this.winners = [];
        this.state = 'WAITING_FOR_ROLL';
        
        this.updateCornerLabels();

        const firstPlayerColor = this.getCurrentPlayer();
        const firstPlayerName = this.playerNames[firstPlayerColor];
        
        this.turnBanner.className = `turn-banner ${firstPlayerColor.toLowerCase()}-turn`;
        this.updateStatus(`${firstPlayerName}'s Turn - Roll Dice!`);
    }

    /**
     * Updates visual corner labels on the board
     */
    updateCornerLabels() {
        const allColors = ['RED', 'GREEN', 'YELLOW', 'BLUE'];
        
        allColors.forEach(color => {
            const labelEl = document.getElementById(`label-${color.toLowerCase()}`);
            if (this.players.includes(color)) {
                labelEl.textContent = this.playerNames[color];
                labelEl.classList.remove('hidden');
            } else {
                labelEl.classList.add('hidden');
            }
        });
    }

    getCurrentPlayer() {
        return this.players[this.currentTurnIndex];
    }

    getCurrentPlayerName() {
        return this.playerNames[this.getCurrentPlayer()];
    }

    handleDiceRoll(value, tokens) {
        if (this.audio) this.audio.playDiceRoll();

        this.diceValue = value;
        const playerColor = this.getCurrentPlayer();
        const playerName = this.getCurrentPlayerName();

        const moveableTokens = tokens.filter(t => t.colorKey === playerColor && this.canTokenMove(t, value));

        if (moveableTokens.length === 0) {
            this.updateStatus(`${playerName} rolled ${value}. No moves!`);
            setTimeout(() => this.nextTurn(), 1200);
        } else {
            moveableTokens.forEach(t => t.isSelectable = true);
            this.state = 'WAITING_FOR_MOVE';
            this.updateStatus(`${playerName} rolled ${value}! Tap highlighted pawn.`);
        }
    }

    canTokenMove(token, rollValue) {
        if (token.step === -1) {
            return rollValue === 6;
        }
        if (token.step + rollValue > 57) {
            return false;
        }
        return true;
    }

    moveToken(token, board, tokens, onComplete) {
        this.state = 'ANIMATING_MOVE';
        tokens.forEach(t => t.isSelectable = false);

        const stepsToMove = (token.step === -1) ? 1 : this.diceValue;
        let stepsTaken = 0;

        const stepInterval = setInterval(() => {
            if (this.audio) this.audio.playMove();

            if (token.step === -1) {
                token.step = 0;
            } else {
                token.step += 1;
            }

            let targetPos;
            if (token.step === -1) {
                const tokenIdx = parseInt(token.id.split('_')[1]);
                targetPos = board.getHomeYardPixelCoordinates(token.colorKey, tokenIdx);
            } else {
                const gridCoord = board.getGridCoordinates(token.colorKey, token.step);
                targetPos = board.getPixelCoordinates(gridCoord.r, gridCoord.c);
            }

            token.moveTo(targetPos.x, targetPos.y);
            stepsTaken++;

            if (stepsTaken >= stepsToMove || token.step === 57) {
                clearInterval(stepInterval);
                
                setTimeout(() => {
                    this.handlePostMove(token, board, tokens, onComplete);
                }, 180);
            }
        }, 220);
    }

    handlePostMove(token, board, tokens, onComplete) {
        let earnedExtraTurn = (this.diceValue === 6);
        const playerName = this.playerNames[token.colorKey];

        if (token.step === 57) {
            this.updateStatus(`${playerName}'s token reached Home!`);
            earnedExtraTurn = true;

            const finishedTokens = tokens.filter(t => t.colorKey === token.colorKey && t.step === 57);
            if (finishedTokens.length === 4 && !this.winners.includes(token.colorKey)) {
                this.winners.push(token.colorKey);
                if (this.audio) this.audio.playVictory();
                this.showVictoryModal(playerName);
                return;
            }
        } 
        else if (token.step >= 0 && token.step <= 51) {
            const currentGrid = board.getGridCoordinates(token.colorKey, token.step);
            const isSafeZone = CONFIG.SAFE_SPOTS.some(s => s.r === currentGrid.r && s.c === currentGrid.c);

            if (!isSafeZone) {
                const opponentsOnCell = tokens.filter(t => {
                    if (t.colorKey === token.colorKey || t.step < 0 || t.step > 51) return false;
                    const oppGrid = board.getGridCoordinates(t.colorKey, t.step);
                    return oppGrid.r === currentGrid.r && oppGrid.c === currentGrid.c;
                });

                if (opponentsOnCell.length > 0) {
                    if (this.audio) this.audio.playCut();

                    opponentsOnCell.forEach(oppToken => {
                        oppToken.step = -1;
                        const tokenIdx = parseInt(oppToken.id.split('_')[1]);
                        const yardPos = board.getHomeYardPixelCoordinates(oppToken.colorKey, tokenIdx);
                        oppToken.moveTo(yardPos.x, yardPos.y);
                    });

                    earnedExtraTurn = true;
                    this.updateStatus(`BOOM! ${playerName} cut opponent token!`);
                }
            }
        }

        if (onComplete) onComplete();

        if (earnedExtraTurn) {
            this.nextTurn(true);
        } else {
            this.nextTurn(false);
        }
    }

    showVictoryModal(winnerName) {
        if (this.winnerSubtitle) {
            this.winnerSubtitle.textContent = `🎉 ${winnerName} Won The Match! 🎉`;
        }
        if (this.victoryOverlay) {
            this.victoryOverlay.classList.remove('hidden');
        }
    }

    nextTurn(extraTurn = false) {
        window.gameTokens.forEach(t => t.isSelectable = false);

        if (!extraTurn) {
            this.currentTurnIndex = (this.currentTurnIndex + 1) % this.players.length;
        }

        const nextPlayerColor = this.getCurrentPlayer();
        const nextPlayerName = this.getCurrentPlayerName();
        this.state = 'WAITING_FOR_ROLL';

        this.turnBanner.className = `turn-banner ${nextPlayerColor.toLowerCase()}-turn`;
        
        if (extraTurn) {
            this.updateStatus(`Extra Turn for ${nextPlayerName}! Roll Dice!`);
        } else {
            this.updateStatus(`${nextPlayerName}'s Turn - Roll Dice!`);
        }

        if (window.gameDice) {
            window.gameDice.setEnabled(true);
        }
    }

    updateStatus(msg) {
        if (this.turnText) this.turnText.textContent = msg;
    }
}