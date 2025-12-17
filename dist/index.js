/**
 * Main entry point for the AI-driven Snake game
 */
import { GameController } from './GameController';
// Export main interfaces and classes for external use
export * from './interfaces';
export { SnakeGameEngine } from './engine/SnakeGameEngine';
export { RetroRenderer } from './ui/RetroRenderer';
export { GameController } from './GameController';
// Main game class that coordinates all systems
export class AISnakeGame {
    constructor(canvasId = 'gameCanvas') {
        this.gameController = new GameController(canvasId);
        console.log('AI Snake Game initialized with full rendering system');
    }
    async initialize() {
        console.log('Game ready - core mechanics and rendering implemented');
        console.log('Current game state:', this.gameController.getGameState().gameStatus);
        // Initialize the game controller to ensure proper setup
        if (!this.gameController.initialize()) {
            console.error('Failed to initialize game controller');
            return;
        }
        // Render initial state
        this.renderInitialState();
        // Setup global game functions for HTML buttons
        if (typeof window !== 'undefined') {
            window.toggleGame = () => this.toggleGame();
            window.resetGame = () => this.resetGame();
            window.toggleAIVisibility = () => this.toggleAIVisibility();
        }
    }
    renderInitialState() {
        // Force an initial render to show the game board
        try {
            const renderer = this.gameController.getRenderer();
            const gameState = this.gameController.getGameState();
            // Clear canvas and render initial state
            renderer.renderGame(gameState);
            renderer.renderUI(gameState.score);
            console.log('Initial game state rendered');
        }
        catch (error) {
            console.error('Failed to render initial state:', error);
        }
    }
    start() {
        this.gameController.start();
        console.log('Game started successfully');
    }
    stop() {
        this.gameController.stop();
        console.log('Game stopped');
    }
    toggleGame() {
        const gameState = this.gameController.getGameState();
        if (gameState.gameStatus === 'INIT' || gameState.gameStatus === 'GAME_OVER') {
            this.start();
        }
        else {
            this.gameController.togglePause();
        }
    }
    resetGame() {
        this.gameController.reset();
        console.log('Game reset');
    }
    toggleAIVisibility() {
        const aiExplanation = document.getElementById('aiExplanation');
        if (aiExplanation) {
            aiExplanation.style.display = aiExplanation.style.display === 'none' ? 'block' : 'none';
        }
    }
    getGameController() {
        return this.gameController;
    }
    getGameStats() {
        return this.gameController.getGameStats();
    }
}
// Auto-initialize game when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing game...');
        // Check if canvas exists
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error('Canvas element not found!');
            return;
        }
        console.log('Canvas found:', canvas.width, 'x', canvas.height);
        // Test canvas rendering
        const ctx = canvas.getContext('2d');
        if (ctx) {
            console.log('Canvas context obtained, testing render...');
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(10, 10, 50, 50);
            console.log('Test rectangle drawn');
        }
        const game = new AISnakeGame();
        game.initialize();
        // Make game globally accessible for debugging
        window.game = game;
    });
}
//# sourceMappingURL=index.js.map