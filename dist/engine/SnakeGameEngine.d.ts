/**
 * Snake Game Engine - Main game engine implementation
 * Implements the GameEngine interface and coordinates all game systems
 */
import { GameEngine } from '../interfaces/GameEngine';
import { GameState, Direction, Position } from '../types/GameTypes';
import { CollisionResult } from './CollisionDetector';
import { InputHandler } from '../ui/InputHandler';
export declare class SnakeGameEngine implements GameEngine {
    private gameStateManager;
    private inputHandler;
    private lastUpdateTime;
    private moveInterval;
    private accumulatedTime;
    private inputQueue;
    constructor();
    /**
     * Sets callback for AI-driven food placement
     */
    setFoodPlacementCallback(callback: (gameState: GameState) => Position): void;
    /**
     * Updates the game state by one frame
     */
    update(deltaTime: number): void;
    /**
     * Processes one game tick (snake movement and collision detection)
     */
    private processGameTick;
    /**
     * Handles collision events
     */
    private handleCollision;
    /**
     * Sets up input handler callbacks
     */
    private setupInputHandlers;
    /**
     * Handles player input for snake direction changes
     */
    handleInput(direction: Direction): void;
    /**
     * Checks for collisions using the collision detector
     */
    checkCollisions(): CollisionResult;
    /**
     * Spawns food at specified position or AI-determined optimal position
     */
    spawnFood(position?: Position): void;
    /**
     * Gets AI-determined food position (to be called by GameController)
     */
    getAIFoodPosition(gameState: GameState): Position;
    /**
     * Sets AI food position (called by GameController)
     */
    setAIFoodPosition(position: Position): boolean;
    /**
     * Generates a valid random food position
     */
    private generateValidFoodPosition;
    /**
     * Resets the game to initial state
     */
    reset(): void;
    /**
     * Gets current game state (read-only)
     */
    getGameState(): Readonly<GameState>;
    /**
     * Sets the game speed (controlled by AI)
     */
    setSpeed(speed: number): void;
    /**
     * Pauses or unpauses the game
     */
    togglePause(): void;
    /**
     * Starts the game
     */
    startGame(): boolean;
    /**
     * Gets game statistics for AI analysis
     */
    getGameStats(): {
        score: number;
        snakeLength: number;
        gameTime: number;
        dangerLevel: number;
        validMoves: Position[];
    };
    /**
     * Predicts collision for next move (useful for AI)
     */
    predictNextMoveCollision(): CollisionResult;
    /**
     * Gets distance from snake head to food
     */
    getDistanceToFood(): number;
    /**
     * Checks if the game is currently running
     */
    isGameRunning(): boolean;
    /**
     * Checks if the game is over
     */
    isGameOver(): boolean;
    /**
     * Gets the current move interval in milliseconds
     */
    getMoveInterval(): number;
    /**
     * Gets input handler for external access
     */
    getInputHandler(): InputHandler;
    /**
     * Gets player input analysis for AI systems
     */
    getPlayerInputAnalysis(): {
        inputStats: any;
        inputPatterns: any;
        recentInputs: any[];
    };
    /**
     * Processes queued inputs for AI analysis
     */
    private processInputQueue;
    /**
     * Resets input statistics for new game session
     */
    resetInputStats(): void;
    /**
     * Cleanup method
     */
    destroy(): void;
}
//# sourceMappingURL=SnakeGameEngine.d.ts.map