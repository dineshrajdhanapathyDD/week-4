/**
 * Game State Manager - Handles game state transitions and validation
 * Implements the state machine pattern: INIT → PLAYING → PAUSED/GAME_OVER
 */

import { GameState, Direction, Position, SnakeSegment } from '../types/GameTypes';
import { FoodManager } from './FoodManager';

export class GameStateManager {
  private gameState: GameState;
  private readonly INITIAL_SNAKE_LENGTH = 3;
  private readonly INITIAL_SPEED = 1.0;
  private readonly GRID_WIDTH = 20;
  private readonly GRID_HEIGHT = 20;
  
  // Callback for AI-driven food placement
  public onFoodConsumed?: (gameState: GameState) => Position;

  constructor() {
    this.gameState = this.createInitialState();
  }

  /**
   * Creates the initial game state
   */
  private createInitialState(): GameState {
    const centerX = Math.floor(this.GRID_WIDTH / 2);
    const centerY = Math.floor(this.GRID_HEIGHT / 2);

    // Create initial snake in the center, moving right
    const snake: SnakeSegment[] = [];
    for (let i = 0; i < this.INITIAL_SNAKE_LENGTH; i++) {
      snake.push({
        position: { x: centerX - i, y: centerY },
        direction: Direction.RIGHT,
        age: i
      });
    }

    return {
      snake,
      food: this.generateRandomFoodPosition(snake),
      score: 0,
      gameStatus: 'INIT',
      speed: this.INITIAL_SPEED,
      gridSize: { width: this.GRID_WIDTH, height: this.GRID_HEIGHT },
      gameTime: 0
    };
  }

  /**
   * Generates a random food position that doesn't overlap with snake
   */
  private generateRandomFoodPosition(snake: SnakeSegment[]): Position {
    const occupiedPositions = new Set(
      snake.map(segment => `${segment.position.x},${segment.position.y}`)
    );

    let foodPosition: Position;
    do {
      foodPosition = {
        x: Math.floor(Math.random() * this.GRID_WIDTH),
        y: Math.floor(Math.random() * this.GRID_HEIGHT)
      };
    } while (occupiedPositions.has(`${foodPosition.x},${foodPosition.y}`));

    return foodPosition;
  }

  /**
   * Validates state transitions according to the state machine
   */
  private isValidTransition(from: GameState['gameStatus'], to: GameState['gameStatus']): boolean {
    const validTransitions: Record<GameState['gameStatus'], GameState['gameStatus'][]> = {
      'INIT': ['PLAYING'],
      'PLAYING': ['PAUSED', 'GAME_OVER'],
      'PAUSED': ['PLAYING', 'GAME_OVER'],
      'GAME_OVER': ['INIT']
    };

    return validTransitions[from].includes(to);
  }

  /**
   * Transitions to a new game state with validation
   */
  public transitionTo(newStatus: GameState['gameStatus']): boolean {
    if (!this.isValidTransition(this.gameState.gameStatus, newStatus)) {
      console.warn(`Invalid state transition from ${this.gameState.gameStatus} to ${newStatus}`);
      return false;
    }

    this.gameState.gameStatus = newStatus;
    return true;
  }

  /**
   * Starts the game (INIT → PLAYING)
   */
  public startGame(): boolean {
    if (this.gameState.gameStatus !== 'INIT') {
      return false;
    }
    return this.transitionTo('PLAYING');
  }

  /**
   * Pauses the game (PLAYING → PAUSED)
   */
  public pauseGame(): boolean {
    if (this.gameState.gameStatus !== 'PLAYING') {
      return false;
    }
    return this.transitionTo('PAUSED');
  }

  /**
   * Resumes the game (PAUSED → PLAYING)
   */
  public resumeGame(): boolean {
    if (this.gameState.gameStatus !== 'PAUSED') {
      return false;
    }
    return this.transitionTo('PLAYING');
  }

  /**
   * Ends the game (any state → GAME_OVER)
   */
  public endGame(): boolean {
    return this.transitionTo('GAME_OVER');
  }

  /**
   * Resets the game (GAME_OVER → INIT)
   */
  public resetGame(): boolean {
    if (this.transitionTo('INIT')) {
      this.gameState = this.createInitialState();
      return true;
    }
    return false;
  }

  /**
   * Updates game time (called each frame)
   */
  public updateGameTime(deltaTime: number): void {
    if (this.gameState.gameStatus === 'PLAYING') {
      this.gameState.gameTime += deltaTime;
    }
  }

  /**
   * Moves the snake in the current direction
   */
  public moveSnake(): void {
    if (this.gameState.gameStatus !== 'PLAYING') {
      return;
    }

    const snake = this.gameState.snake;
    const head = snake[0];
    
    // Calculate new head position
    const newHead: SnakeSegment = {
      position: this.getNextPosition(head.position, head.direction),
      direction: head.direction,
      age: 0
    };

    // Add new head
    snake.unshift(newHead);

    // Check if food was consumed using FoodManager
    const consumptionResult = FoodManager.checkFoodConsumption(this.gameState);
    
    if (consumptionResult.consumed) {
      // Grow snake (don't remove tail) and update score
      this.gameState.score += consumptionResult.scoreIncrease;
      
      // Use AI-driven food placement if callback is available
      if (this.onFoodConsumed) {
        this.gameState.food = this.onFoodConsumed(this.gameState);
      } else if (consumptionResult.newFoodPosition) {
        this.gameState.food = consumptionResult.newFoodPosition;
      }
    } else {
      // Remove tail (normal movement)
      snake.pop();
    }

    // Update segment ages for visual effects
    snake.forEach((segment, index) => {
      segment.age = index;
    });
  }

  /**
   * Calculates the next position based on current position and direction
   */
  private getNextPosition(position: Position, direction: Direction): Position {
    const newPos = { ...position };
    
    switch (direction) {
      case Direction.UP:
        newPos.y -= 1;
        break;
      case Direction.DOWN:
        newPos.y += 1;
        break;
      case Direction.LEFT:
        newPos.x -= 1;
        break;
      case Direction.RIGHT:
        newPos.x += 1;
        break;
    }
    
    return newPos;
  }

  /**
   * Checks if the snake head is at the food position
   */
  private isFoodConsumed(): boolean {
    const head = this.gameState.snake[0];
    return head.position.x === this.gameState.food.x && 
           head.position.y === this.gameState.food.y;
  }

  /**
   * Changes snake direction with validation (no 180-degree turns)
   */
  public changeDirection(newDirection: Direction): boolean {
    if (this.gameState.gameStatus !== 'PLAYING') {
      return false;
    }

    const currentDirection = this.gameState.snake[0].direction;
    
    // Prevent 180-degree turns
    const oppositeDirections: Record<Direction, Direction> = {
      [Direction.UP]: Direction.DOWN,
      [Direction.DOWN]: Direction.UP,
      [Direction.LEFT]: Direction.RIGHT,
      [Direction.RIGHT]: Direction.LEFT
    };

    if (oppositeDirections[currentDirection] === newDirection) {
      return false;
    }

    // Update snake head direction
    this.gameState.snake[0].direction = newDirection;
    return true;
  }

  /**
   * Checks for wall collisions
   */
  public checkWallCollision(): boolean {
    const head = this.gameState.snake[0];
    return head.position.x < 0 || 
           head.position.x >= this.GRID_WIDTH ||
           head.position.y < 0 || 
           head.position.y >= this.GRID_HEIGHT;
  }

  /**
   * Checks for self-collision (snake hitting its own body)
   */
  public checkSelfCollision(): boolean {
    const head = this.gameState.snake[0];
    const body = this.gameState.snake.slice(1);
    
    return body.some(segment => 
      segment.position.x === head.position.x && 
      segment.position.y === head.position.y
    );
  }

  /**
   * Sets the game speed (controlled by AI)
   */
  public setSpeed(speed: number): void {
    this.gameState.speed = Math.max(0.1, Math.min(5.0, speed));
  }

  /**
   * Spawns food at a specific position (for AI control)
   */
  public spawnFoodAt(position: Position): boolean {
    // Validate position is not occupied by snake
    const isOccupied = this.gameState.snake.some(segment =>
      segment.position.x === position.x && segment.position.y === position.y
    );

    if (isOccupied || position.x < 0 || position.x >= this.GRID_WIDTH ||
        position.y < 0 || position.y >= this.GRID_HEIGHT) {
      return false;
    }

    this.gameState.food = position;
    return true;
  }

  /**
   * Gets a read-only copy of the current game state
   */
  public getGameState(): Readonly<GameState> {
    return { ...this.gameState };
  }

  /**
   * Gets current snake length
   */
  public getSnakeLength(): number {
    return this.gameState.snake.length;
  }

  /**
   * Gets current score
   */
  public getScore(): number {
    return this.gameState.score;
  }

  /**
   * Gets current game status
   */
  public getGameStatus(): GameState['gameStatus'] {
    return this.gameState.gameStatus;
  }
}