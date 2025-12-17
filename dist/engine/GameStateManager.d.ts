/**
 * Game State Manager - Handles game state transitions and validation
 * Implements the state machine pattern: INIT → PLAYING → PAUSED/GAME_OVER
 */
import { GameState, Direction, Position } from '../types/GameTypes';
export declare class GameStateManager {
    private gameState;
    private readonly INITIAL_SNAKE_LENGTH;
    private readonly INITIAL_SPEED;
    private readonly GRID_WIDTH;
    private readonly GRID_HEIGHT;
    onFoodConsumed?: (gameState: GameState) => Position;
    constructor();
    /**
     * Creates the initial game state
     */
    private createInitialState;
    /**
     * Generates a random food position that doesn't overlap with snake
     */
    private generateRandomFoodPosition;
    /**
     * Validates state transitions according to the state machine
     */
    private isValidTransition;
    /**
     * Transitions to a new game state with validation
     */
    transitionTo(newStatus: GameState['gameStatus']): boolean;
    /**
     * Starts the game (INIT → PLAYING)
     */
    startGame(): boolean;
    /**
     * Pauses the game (PLAYING → PAUSED)
     */
    pauseGame(): boolean;
    /**
     * Resumes the game (PAUSED → PLAYING)
     */
    resumeGame(): boolean;
    /**
     * Ends the game (any state → GAME_OVER)
     */
    endGame(): boolean;
    /**
     * Resets the game (GAME_OVER → INIT)
     */
    resetGame(): boolean;
    /**
     * Updates game time (called each frame)
     */
    updateGameTime(deltaTime: number): void;
    /**
     * Moves the snake in the current direction
     */
    moveSnake(): void;
    /**
     * Calculates the next position based on current position and direction
     */
    private getNextPosition;
    /**
     * Checks if the snake head is at the food position
     */
    private isFoodConsumed;
    /**
     * Changes snake direction with validation (no 180-degree turns)
     */
    changeDirection(newDirection: Direction): boolean;
    /**
     * Checks for wall collisions
     */
    checkWallCollision(): boolean;
    /**
     * Checks for self-collision (snake hitting its own body)
     */
    checkSelfCollision(): boolean;
    /**
     * Sets the game speed (controlled by AI)
     */
    setSpeed(speed: number): void;
    /**
     * Spawns food at a specific position (for AI control)
     */
    spawnFoodAt(position: Position): boolean;
    /**
     * Gets a read-only copy of the current game state
     */
    getGameState(): Readonly<GameState>;
    /**
     * Gets current snake length
     */
    getSnakeLength(): number;
    /**
     * Gets current score
     */
    getScore(): number;
    /**
     * Gets current game status
     */
    getGameStatus(): GameState['gameStatus'];
}
//# sourceMappingURL=GameStateManager.d.ts.map