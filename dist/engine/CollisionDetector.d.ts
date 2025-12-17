/**
 * Collision Detection System - Handles all collision logic for the Snake game
 * Provides comprehensive collision detection with detailed collision information
 */
import { GameState, Position, SnakeSegment } from '../types/GameTypes';
export interface CollisionResult {
    hasCollision: boolean;
    type: 'wall' | 'self' | 'none';
    position?: Position;
    segmentIndex?: number;
}
export declare class CollisionDetector {
    /**
     * Performs comprehensive collision detection
     */
    static detectCollisions(gameState: GameState): CollisionResult;
    /**
     * Checks for wall collisions
     */
    static checkWallCollision(position: Position, gridSize: {
        width: number;
        height: number;
    }): CollisionResult;
    /**
     * Checks for self-collision (snake hitting its own body)
     */
    static checkSelfCollision(snake: SnakeSegment[]): CollisionResult;
    /**
     * Checks if a position would cause collision with snake body
     * Useful for AI food placement validation
     */
    static wouldCollideWithSnake(position: Position, snake: SnakeSegment[]): boolean;
    /**
     * Checks if a position is within grid bounds
     */
    static isPositionValid(position: Position, gridSize: {
        width: number;
        height: number;
    }): boolean;
    /**
     * Predicts collision for next move without actually moving
     * Useful for AI decision making
     */
    static predictCollision(gameState: GameState): CollisionResult;
    /**
     * Calculates the next position based on current position and direction
     */
    private static getNextPosition;
    /**
     * Gets all valid positions around the snake head
     * Useful for AI pathfinding and food placement
     */
    static getValidAdjacentPositions(gameState: GameState, position?: Position): Position[];
    /**
     * Calculates distance between two positions (Manhattan distance)
     */
    static calculateDistance(pos1: Position, pos2: Position): number;
    /**
     * Checks if snake is in a dangerous position (near walls or self)
     * Returns danger level from 0 (safe) to 1 (immediate danger)
     */
    static assessDangerLevel(gameState: GameState): number;
}
//# sourceMappingURL=CollisionDetector.d.ts.map