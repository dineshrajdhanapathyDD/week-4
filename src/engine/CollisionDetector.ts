/**
 * Collision Detection System - Handles all collision logic for the Snake game
 * Provides comprehensive collision detection with detailed collision information
 */

import { GameState, Position, SnakeSegment } from '../types/GameTypes';

export interface CollisionResult {
  hasCollision: boolean;
  type: 'wall' | 'self' | 'none';
  position?: Position;
  segmentIndex?: number; // For self-collision, which segment was hit
}

export class CollisionDetector {
  /**
   * Performs comprehensive collision detection
   */
  public static detectCollisions(gameState: GameState): CollisionResult {
    const head = gameState.snake[0];
    
    // Check wall collision first
    const wallCollision = this.checkWallCollision(head.position, gameState.gridSize);
    if (wallCollision.hasCollision) {
      return wallCollision;
    }

    // Check self-collision
    const selfCollision = this.checkSelfCollision(gameState.snake);
    if (selfCollision.hasCollision) {
      return selfCollision;
    }

    return { hasCollision: false, type: 'none' };
  }

  /**
   * Checks for wall collisions
   */
  public static checkWallCollision(
    position: Position, 
    gridSize: { width: number; height: number }
  ): CollisionResult {
    const isOutOfBounds = position.x < 0 || 
                         position.x >= gridSize.width ||
                         position.y < 0 || 
                         position.y >= gridSize.height;

    return {
      hasCollision: isOutOfBounds,
      type: isOutOfBounds ? 'wall' : 'none',
      position: isOutOfBounds ? position : undefined
    };
  }

  /**
   * Checks for self-collision (snake hitting its own body)
   */
  public static checkSelfCollision(snake: SnakeSegment[]): CollisionResult {
    if (snake.length <= 1) {
      return { hasCollision: false, type: 'none' };
    }

    const head = snake[0];
    
    // Check collision with body segments (skip head at index 0)
    for (let i = 1; i < snake.length; i++) {
      const segment = snake[i];
      if (head.position.x === segment.position.x && 
          head.position.y === segment.position.y) {
        return {
          hasCollision: true,
          type: 'self',
          position: head.position,
          segmentIndex: i
        };
      }
    }

    return { hasCollision: false, type: 'none' };
  }

  /**
   * Checks if a position would cause collision with snake body
   * Useful for AI food placement validation
   */
  public static wouldCollideWithSnake(position: Position, snake: SnakeSegment[]): boolean {
    return snake.some(segment =>
      segment.position.x === position.x && segment.position.y === position.y
    );
  }

  /**
   * Checks if a position is within grid bounds
   */
  public static isPositionValid(
    position: Position, 
    gridSize: { width: number; height: number }
  ): boolean {
    return position.x >= 0 && 
           position.x < gridSize.width &&
           position.y >= 0 && 
           position.y < gridSize.height;
  }

  /**
   * Predicts collision for next move without actually moving
   * Useful for AI decision making
   */
  public static predictCollision(gameState: GameState): CollisionResult {
    const head = gameState.snake[0];
    const nextPosition = this.getNextPosition(head.position, head.direction);
    
    // Create temporary game state for prediction
    const tempSnake = [...gameState.snake];
    tempSnake[0] = { ...head, position: nextPosition };
    
    const tempGameState: GameState = {
      ...gameState,
      snake: tempSnake
    };

    return this.detectCollisions(tempGameState);
  }

  /**
   * Calculates the next position based on current position and direction
   */
  private static getNextPosition(position: Position, direction: string): Position {
    const newPos = { ...position };
    
    switch (direction) {
      case 'UP':
        newPos.y -= 1;
        break;
      case 'DOWN':
        newPos.y += 1;
        break;
      case 'LEFT':
        newPos.x -= 1;
        break;
      case 'RIGHT':
        newPos.x += 1;
        break;
    }
    
    return newPos;
  }

  /**
   * Gets all valid positions around the snake head
   * Useful for AI pathfinding and food placement
   */
  public static getValidAdjacentPositions(
    gameState: GameState, 
    position?: Position
  ): Position[] {
    const checkPosition = position || gameState.snake[0].position;
    const validPositions: Position[] = [];
    
    const directions = [
      { x: 0, y: -1 }, // UP
      { x: 0, y: 1 },  // DOWN
      { x: -1, y: 0 }, // LEFT
      { x: 1, y: 0 }   // RIGHT
    ];

    for (const dir of directions) {
      const newPos: Position = {
        x: checkPosition.x + dir.x,
        y: checkPosition.y + dir.y
      };

      if (this.isPositionValid(newPos, gameState.gridSize) &&
          !this.wouldCollideWithSnake(newPos, gameState.snake)) {
        validPositions.push(newPos);
      }
    }

    return validPositions;
  }

  /**
   * Calculates distance between two positions (Manhattan distance)
   */
  public static calculateDistance(pos1: Position, pos2: Position): number {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }

  /**
   * Checks if snake is in a dangerous position (near walls or self)
   * Returns danger level from 0 (safe) to 1 (immediate danger)
   */
  public static assessDangerLevel(gameState: GameState): number {
    const head = gameState.snake[0];
    const validMoves = this.getValidAdjacentPositions(gameState);
    
    // Base danger on number of available moves
    const maxMoves = 4;
    const availableMoves = validMoves.length;
    const movementDanger = 1 - (availableMoves / maxMoves);

    // Additional danger from proximity to walls
    const { width, height } = gameState.gridSize;
    const wallProximity = Math.min(
      head.position.x,
      head.position.y,
      width - 1 - head.position.x,
      height - 1 - head.position.y
    );
    const wallDanger = wallProximity <= 1 ? 0.3 : 0;

    // Combine danger factors
    return Math.min(1, movementDanger + wallDanger);
  }
}