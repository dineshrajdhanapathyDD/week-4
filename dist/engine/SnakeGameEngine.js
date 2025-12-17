/**
 * Snake Game Engine - Main game engine implementation
 * Implements the GameEngine interface and coordinates all game systems
 */
import { GameStateManager } from './GameStateManager';
import { CollisionDetector } from './CollisionDetector';
import { InputHandler } from '../ui/InputHandler';
export class SnakeGameEngine {
    constructor() {
        this.lastUpdateTime = 0;
        this.moveInterval = 200; // milliseconds between moves
        this.accumulatedTime = 0;
        this.inputQueue = [];
        this.gameStateManager = new GameStateManager();
        this.inputHandler = new InputHandler();
        this.setupInputHandlers();
    }
    /**
     * Sets callback for AI-driven food placement
     */
    setFoodPlacementCallback(callback) {
        this.gameStateManager.onFoodConsumed = callback;
    }
    /**
     * Updates the game state by one frame
     */
    update(deltaTime) {
        this.gameStateManager.updateGameTime(deltaTime);
        // Only process game logic if playing
        if (this.gameStateManager.getGameStatus() !== 'PLAYING') {
            return;
        }
        // Accumulate time for movement timing
        this.accumulatedTime += deltaTime;
        // Calculate move interval based on current speed
        const currentSpeed = this.getGameState().speed;
        const adjustedInterval = this.moveInterval / currentSpeed;
        // Move snake when enough time has passed
        if (this.accumulatedTime >= adjustedInterval) {
            this.processGameTick();
            this.accumulatedTime = 0;
        }
    }
    /**
     * Processes one game tick (snake movement and collision detection)
     */
    processGameTick() {
        // Process input queue for AI analysis
        this.processInputQueue();
        // Move the snake
        this.gameStateManager.moveSnake();
        // Check for collisions after movement
        const collisionResult = this.checkCollisions();
        if (collisionResult.hasCollision) {
            this.handleCollision(collisionResult);
        }
    }
    /**
     * Handles collision events
     */
    handleCollision(collision) {
        console.log(`Collision detected: ${collision.type} at position`, collision.position);
        // End the game on any collision
        this.gameStateManager.endGame();
    }
    /**
     * Sets up input handler callbacks
     */
    setupInputHandlers() {
        this.inputHandler.onDirectionChange = (direction) => {
            this.handleInput(direction);
        };
        this.inputHandler.onPause = () => {
            this.togglePause();
        };
        this.inputHandler.onReset = () => {
            this.reset();
        };
        this.inputHandler.onToggleAIVisibility = () => {
            // This will be implemented when AI explanation system is added
            console.log('AI visibility toggle requested');
        };
    }
    /**
     * Handles player input for snake direction changes
     */
    handleInput(direction) {
        // Create player input with timing information
        const playerInput = this.inputHandler.createPlayerInput(direction);
        // Add to input queue for processing
        this.inputQueue.push(playerInput);
        // Process immediately for responsive controls
        const success = this.gameStateManager.changeDirection(direction);
        if (!success) {
            console.log(`Invalid direction change to ${direction}`);
            // Track invalid input for AI analysis
            this.inputHandler.recordInvalidInput();
        }
    }
    /**
     * Checks for collisions using the collision detector
     */
    checkCollisions() {
        const gameState = this.getGameState();
        return CollisionDetector.detectCollisions(gameState);
    }
    /**
     * Spawns food at specified position or AI-determined optimal position
     */
    spawnFood(position) {
        if (position) {
            const success = this.gameStateManager.spawnFoodAt(position);
            if (!success) {
                console.warn('Failed to spawn food at specified position, using AI-determined position');
                // Fallback to AI-determined position
                const currentState = this.getGameState();
                const aiPosition = this.getAIFoodPosition(currentState);
                this.gameStateManager.spawnFoodAt(aiPosition);
            }
        }
        else {
            // Use AI-determined food placement
            const currentState = this.getGameState();
            const aiPosition = this.getAIFoodPosition(currentState);
            this.gameStateManager.spawnFoodAt(aiPosition);
        }
    }
    /**
     * Gets AI-determined food position (to be called by GameController)
     */
    getAIFoodPosition(gameState) {
        // This will be called by GameController with AI input
        // For now, fallback to random valid position
        return this.generateValidFoodPosition(gameState);
    }
    /**
     * Sets AI food position (called by GameController)
     */
    setAIFoodPosition(position) {
        return this.gameStateManager.spawnFoodAt(position);
    }
    /**
     * Generates a valid random food position
     */
    generateValidFoodPosition(gameState) {
        const { width, height } = gameState.gridSize;
        let attempts = 0;
        const maxAttempts = width * height;
        while (attempts < maxAttempts) {
            const position = {
                x: Math.floor(Math.random() * width),
                y: Math.floor(Math.random() * height)
            };
            if (!CollisionDetector.wouldCollideWithSnake(position, gameState.snake)) {
                return position;
            }
            attempts++;
        }
        // Fallback: find first available position
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const position = { x, y };
                if (!CollisionDetector.wouldCollideWithSnake(position, gameState.snake)) {
                    return position;
                }
            }
        }
        // Should never reach here unless grid is completely full
        throw new Error('No valid position found for food placement');
    }
    /**
     * Resets the game to initial state
     */
    reset() {
        this.gameStateManager.resetGame();
        this.accumulatedTime = 0;
        this.lastUpdateTime = 0;
    }
    /**
     * Gets current game state (read-only)
     */
    getGameState() {
        return this.gameStateManager.getGameState();
    }
    /**
     * Sets the game speed (controlled by AI)
     */
    setSpeed(speed) {
        this.gameStateManager.setSpeed(speed);
    }
    /**
     * Pauses or unpauses the game
     */
    togglePause() {
        const currentStatus = this.gameStateManager.getGameStatus();
        if (currentStatus === 'PLAYING') {
            this.gameStateManager.pauseGame();
        }
        else if (currentStatus === 'PAUSED') {
            this.gameStateManager.resumeGame();
        }
        else if (currentStatus === 'INIT') {
            this.gameStateManager.startGame();
        }
    }
    /**
     * Starts the game
     */
    startGame() {
        return this.gameStateManager.startGame();
    }
    /**
     * Gets game statistics for AI analysis
     */
    getGameStats() {
        const gameState = this.getGameState();
        return {
            score: gameState.score,
            snakeLength: gameState.snake.length,
            gameTime: gameState.gameTime,
            dangerLevel: CollisionDetector.assessDangerLevel(gameState),
            validMoves: CollisionDetector.getValidAdjacentPositions(gameState)
        };
    }
    /**
     * Predicts collision for next move (useful for AI)
     */
    predictNextMoveCollision() {
        return CollisionDetector.predictCollision(this.getGameState());
    }
    /**
     * Gets distance from snake head to food
     */
    getDistanceToFood() {
        const gameState = this.getGameState();
        const head = gameState.snake[0];
        return CollisionDetector.calculateDistance(head.position, gameState.food);
    }
    /**
     * Checks if the game is currently running
     */
    isGameRunning() {
        return this.gameStateManager.getGameStatus() === 'PLAYING';
    }
    /**
     * Checks if the game is over
     */
    isGameOver() {
        return this.gameStateManager.getGameStatus() === 'GAME_OVER';
    }
    /**
     * Gets the current move interval in milliseconds
     */
    getMoveInterval() {
        const currentSpeed = this.getGameState().speed;
        return this.moveInterval / currentSpeed;
    }
    /**
     * Gets input handler for external access
     */
    getInputHandler() {
        return this.inputHandler;
    }
    /**
     * Gets player input analysis for AI systems
     */
    getPlayerInputAnalysis() {
        return {
            inputStats: this.inputHandler.getInputStats(),
            inputPatterns: this.inputHandler.analyzeInputPatterns(),
            recentInputs: this.inputHandler.getRecentInputs()
        };
    }
    /**
     * Processes queued inputs for AI analysis
     */
    processInputQueue() {
        // Keep only recent inputs (last 10)
        if (this.inputQueue.length > 10) {
            this.inputQueue = this.inputQueue.slice(-10);
        }
    }
    /**
     * Resets input statistics for new game session
     */
    resetInputStats() {
        this.inputHandler.resetStats();
        this.inputQueue = [];
    }
    /**
     * Cleanup method
     */
    destroy() {
        this.inputHandler.destroy();
    }
}
//# sourceMappingURL=SnakeGameEngine.js.map