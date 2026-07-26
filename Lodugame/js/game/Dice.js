/**
 * Interactive Dice Module
 */
class Dice {
    constructor(elementId, containerId, onRollCallback) {
        this.element = document.getElementById(elementId);
        this.container = document.getElementById(containerId);
        this.onRoll = onRollCallback;
        
        this.value = 1;
        this.isRolling = false;
        this.enabled = true;

        this.init();
    }

    init() {
        this.container.addEventListener('click', () => {
            if (this.enabled && !this.isRolling) {
                this.roll();
            }
        });
    }

    roll() {
        this.isRolling = true;
        this.element.classList.add('rolling');

        // Tumbling animation timer (600ms)
        setTimeout(() => {
            this.value = Math.floor(Math.random() * 6) + 1;
            this.renderValue(this.value);
            this.element.classList.remove('rolling');
            this.isRolling = false;

            if (this.onRoll) {
                this.onRoll(this.value);
            }
        }, 600);
    }

    renderValue(val) {
        // Remove all previous show-X classes
        this.element.className = 'dice-face';
        this.element.classList.add(`show-${val}`);
    }

    setEnabled(status) {
        this.enabled = status;
        this.container.style.opacity = status ? '1' : '0.5';
        this.container.style.pointerEvents = status ? 'auto' : 'none';
    }
}