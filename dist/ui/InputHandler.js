/**
 * Input Handler - Manages keyboard input and player interactions
 * Provides responsive input processing with validation and timing analysis
 */
import { Direction } from '../types/GameTypes';
export class InputHandler {
    constructor() {
        this.lastInputTime = 0;
        this.inputBuffer = [];
        this.MAX_BUFFER_SIZE = 10;
        // Callback functions
        this.onDirectionChange = () => { };
        this.onPause = () => { };
        this.onReset = () => { };
        this.onToggleAIVisibility = () => { };
        this.inputStats = {
            totalInputs: 0,
            averageLatency: 0,
            inputsPerSecond: 0,
            lastInputTime: 0,
            directionChanges: 0,
            invalidInputs: 0
        };
        this.setupEventListeners();
    }
    /**
     * Sets up keyboard event listeners
     */
    setupEventListeners() {
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', this.handleKeyDown.bind(this));
            window.addEventListener('keyup', this.handleKeyUp.bind(this));
        }
    }
    /**
     * Handles keydown events
     */
    handleKeyDown(event) {
        const timestamp = performance.now();
        const inputLatency = timestamp - this.lastInputTime;
        // Prevent default behavior for game keys
        if (this.isGameKey(event.key)) {
            event.preventDefault();
        }
        const inputEvent = this.processKeyInput(event.key, timestamp, inputLatency);
        if (inputEvent) {
            this.addToBuffer(inputEvent);
            this.updateInputStats(inputEvent);
            this.executeInputAction(inputEvent);
        }
        this.lastInputTime = timestamp;
    }
    /**
     * Handles keyup events (for future use with hold-to-move mechanics)
     */
    handleKeyUp(event) {
        // Currently not used, but available for future enhancements
    }
    /**
     * Checks if a key is a game control key
     */
    isGameKey(key) {
        const gameKeys = [
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'w', 'a', 's', 'd', 'W', 'A', 'S', 'D',
            ' ', 'Escape', 'r', 'R', 't', 'T'
        ];
        return gameKeys.includes(key);
    }
    /**
     * Processes keyboard input and creates input event
     */
    processKeyInput(key, timestamp, inputLatency) {
        const direction = this.keyToDirection(key);
        const action = this.keyToAction(key);
        if (!direction && !action) {
            return null; // Not a recognized game input
        }
        return {
            direction,
            action,
            timestamp,
            inputLatency
        };
    }
    /**
     * Converts key to direction
     */
    keyToDirection(key) {
        const keyMap = {
            'ArrowUp': Direction.UP,
            'w': Direction.UP,
            'W': Direction.UP,
            'ArrowDown': Direction.DOWN,
            's': Direction.DOWN,
            'S': Direction.DOWN,
            'ArrowLeft': Direction.LEFT,
            'a': Direction.LEFT,
            'A': Direction.LEFT,
            'ArrowRight': Direction.RIGHT,
            'd': Direction.RIGHT,
            'D': Direction.RIGHT
        };
        return keyMap[key];
    }
    /**
     * Converts key to action
     */
    keyToAction(key) {
        const actionMap = {
            ' ': 'pause',
            'Escape': 'pause',
            'r': 'reset',
            'R': 'reset',
            't': 'toggleAI',
            'T': 'toggleAI'
        };
        return actionMap[key];
    }
    /**
     * Adds input event to buffer
     */
    addToBuffer(inputEvent) {
        this.inputBuffer.push(inputEvent);
        // Keep buffer size manageable
        if (this.inputBuffer.length > this.MAX_BUFFER_SIZE) {
            this.inputBuffer.shift();
        }
    }
    /**
     * Updates input statistics
     */
    updateInputStats(inputEvent) {
        this.inputStats.totalInputs++;
        this.inputStats.lastInputTime = inputEvent.timestamp;
        if (inputEvent.direction) {
            this.inputStats.directionChanges++;
        }
        // Update average latency
        const totalLatency = this.inputStats.averageLatency * (this.inputStats.totalInputs - 1) + inputEvent.inputLatency;
        this.inputStats.averageLatency = totalLatency / this.inputStats.totalInputs;
        // Calculate inputs per second (over last 10 inputs)
        const recentInputs = this.inputBuffer.slice(-10);
        if (recentInputs.length > 1) {
            const timeSpan = recentInputs[recentInputs.length - 1].timestamp - recentInputs[0].timestamp;
            this.inputStats.inputsPerSecond = (recentInputs.length - 1) / (timeSpan / 1000);
        }
    }
    /**
     * Executes the appropriate action for the input event
     */
    executeInputAction(inputEvent) {
        if (inputEvent.direction) {
            this.onDirectionChange(inputEvent.direction);
        }
        if (inputEvent.action) {
            switch (inputEvent.action) {
                case 'pause':
                    this.onPause();
                    break;
                case 'reset':
                    this.onReset();
                    break;
                case 'toggleAI':
                    this.onToggleAIVisibility();
                    break;
            }
        }
    }
    /**
     * Gets current input statistics for AI analysis
     */
    getInputStats() {
        return { ...this.inputStats };
    }
    /**
     * Gets recent input buffer for pattern analysis
     */
    getRecentInputs(count = 5) {
        return this.inputBuffer.slice(-count);
    }
    /**
     * Calculates reaction time for the last direction change
     */
    getLastReactionTime() {
        const directionInputs = this.inputBuffer.filter(input => input.direction);
        if (directionInputs.length < 2) {
            return 0;
        }
        const lastTwo = directionInputs.slice(-2);
        return lastTwo[1].timestamp - lastTwo[0].timestamp;
    }
    /**
     * Analyzes input patterns for AI decision making
     */
    analyzeInputPatterns() {
        const directionInputs = this.inputBuffer.filter(input => input.direction);
        // Calculate average reaction time
        let totalReactionTime = 0;
        let reactionCount = 0;
        for (let i = 1; i < directionInputs.length; i++) {
            totalReactionTime += directionInputs[i].timestamp - directionInputs[i - 1].timestamp;
            reactionCount++;
        }
        const averageReactionTime = reactionCount > 0 ? totalReactionTime / reactionCount : 0;
        // Calculate input frequency
        const inputFrequency = this.inputStats.inputsPerSecond;
        // Find preferred directions
        const directionCounts = {
            [Direction.UP]: 0,
            [Direction.DOWN]: 0,
            [Direction.LEFT]: 0,
            [Direction.RIGHT]: 0
        };
        directionInputs.forEach(input => {
            if (input.direction) {
                directionCounts[input.direction]++;
            }
        });
        const preferredDirections = Object.entries(directionCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([direction]) => direction);
        // Calculate input consistency (lower variance in timing = higher consistency)
        const latencies = this.inputBuffer.map(input => input.inputLatency);
        const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
        const variance = latencies.reduce((sum, lat) => sum + Math.pow(lat - avgLatency, 2), 0) / latencies.length;
        const inputConsistency = Math.max(0, 1 - (Math.sqrt(variance) / avgLatency));
        return {
            averageReactionTime,
            inputFrequency,
            preferredDirections,
            inputConsistency: isNaN(inputConsistency) ? 0 : inputConsistency
        };
    }
    /**
     * Increments invalid input counter
     */
    recordInvalidInput() {
        this.inputStats.invalidInputs++;
    }
    /**
     * Resets input statistics (for new game sessions)
     */
    resetStats() {
        this.inputStats = {
            totalInputs: 0,
            averageLatency: 0,
            inputsPerSecond: 0,
            lastInputTime: 0,
            directionChanges: 0,
            invalidInputs: 0
        };
        this.inputBuffer = [];
        this.lastInputTime = 0;
    }
    /**
     * Creates a PlayerInput object for the game engine
     */
    createPlayerInput(direction) {
        const timestamp = performance.now();
        const inputLatency = timestamp - this.lastInputTime;
        return {
            direction,
            timestamp,
            inputLatency
        };
    }
    /**
     * Removes event listeners (cleanup)
     */
    destroy() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('keydown', this.handleKeyDown.bind(this));
            window.removeEventListener('keyup', this.handleKeyUp.bind(this));
        }
    }
    /**
     * Simulates input for testing purposes
     */
    simulateInput(key) {
        const timestamp = performance.now();
        const inputLatency = timestamp - this.lastInputTime;
        const inputEvent = this.processKeyInput(key, timestamp, inputLatency);
        if (inputEvent) {
            this.addToBuffer(inputEvent);
            this.updateInputStats(inputEvent);
            this.executeInputAction(inputEvent);
        }
        this.lastInputTime = timestamp;
    }
}
//# sourceMappingURL=InputHandler.js.map