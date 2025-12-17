/**
 * Core game engine interface defining the main game mechanics
 */
import { GameState, Direction, Position } from '../types/GameTypes';
export interface GameEngine {
    /**
     * Updates the game state by one frame
     * @param deltaTime Time elapsed since last update in milliseconds
     */
    update(deltaTime: number): void;
    /**
     * Handles player input for snake direction changes
     * @param direction New direction for the snake
     */
    handleInput(direction: Direction): void;
    /**
     * Checks for collisions with walls or snake body
     * @returns collision result with detailed information
     */
    checkCollisions(): {
        hasCollision: boolean;
        type: string;
        position?: Position;
    };
    /**
     * Spawns food at specified position or random valid position
     * @param position Optional specific position for food placement
     */
    spawnFood(position?: Position): void;
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
     * @param speed New game speed multiplier
     */
    setSpeed(speed: number): void;
    /**
     * Pauses or unpauses the game
     */
    togglePause(): void;
    /**
     * Starts the game from INIT state
     */
    startGame(): boolean;
}
//# sourceMappingURL=GameEngine.d.ts.map