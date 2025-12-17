/**
 * Snake Game Engine - Main game engine implementation
 * Implements the GameEngine interface and coordinates all game systems
 */

import { GameEngine } from '../interfaces/GameEngine';
import { GameState, Direction, Position, PlayerInput } from '../types/GameTypes';
import { GameStateManager } from './GameStateManager';
import { CollisionDetector, CollisionResult } from './CollisionDetector';
import { InputHandler } from '../ui/InputHandler';

export class SnakeGameEngine implements GameEngine {
  private gameStateManager: GameStateManager;
  private inputHandler: InputHandler;
  private lastUpdateTime: number = 0;
  private moveInterval: number = 200; // milliseconds between moves
  private accumulatedTime: number = 0;
  private inputQueue: PlayerInput[] = [];

  constructor() {
    this.gameStateManager = new GameStateManager();
    this.inputHandler = new InputHandler();
    this.setupInputHandlers();
  }

  /**
   * Sets callback for AI-driven food placement
   */
  public setFoodPlacementCallback(callback: (gameState: GameState) => Position): void {
    this.gameStateManager.onFoodConsumed = callback;
  }

  /**
   * Updates the game state by one frame
   */
  public update(deltaTime: number): void {
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
  private processGameTick(): void {
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
  private handleCollision(collision: CollisionResult): void {
    console.log(`Collision detected: ${collision.type} at position`, collision.position);
    
    // End the game on any collision
    this.gameStateManager.endGame();
  }

  /**
   * Sets up input handler callbacks
   */
  private setupInputHandlers(): void {
    this.inputHandler.onDirectionChange = (direction: Direction) => {
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
  public handleInput(direction: Direction): void {
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
  public checkCollisions(): CollisionResult {
    const gameState = this.getGameState();
    return CollisionDetector.detectCollisions(gameState);
  }

  /**
   * Spawns food at specified position or AI-determined optimal position
   */
  public spawnFood(position?: Position): void {
    if (position) {
      const success = this.gameStateManager.spawnFoodAt(position);
      if (!success) {
        console.warn('Failed to spawn food at specified position, using AI-determined position');
        // Fallback to AI-determined position
        const currentState = this.getGameState();
        const aiPosition = this.getAIFoodPosition(currentState);
        this.gameStateManager.spawnFoodAt(aiPosition);
      }
    } else {
      // Use AI-determined food placement
      const currentState = this.getGameState();
      const aiPosition = this.getAIFoodPosition(currentState);
      this.gameStateManager.spawnFoodAt(aiPosition);
    }
  }

  /**
   * Gets AI-determined food position (to be called by GameController)
   */
  public getAIFoodPosition(gameState: GameState): Position {
    // This will be called by GameController with AI input
    // For now, fallback to random valid position
    return this.generateValidFoodPosition(gameState);
  }

  /**
   * Sets AI food position (called by GameController)
   */
  public setAIFoodPosition(position: Position): boolean {
    return this.gameStateManager.spawnFoodAt(position);
  }

  /**
   * Generates a valid random food position
   */
  private generateValidFoodPosition(gameState: GameState): Position {
    const { width, height } = gameState.gridSize;
    let attempts = 0;
    const maxAttempts = width * height;

    while (attempts < maxAttempts) {
      const position: Position = {
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
        const position: Position = { x, y };
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
  public reset(): void {
    this.gameStateManager.resetGame();
    this.accumulatedTime = 0;
    this.lastUpdateTime = 0;
  }

  /**
   * Gets current game state (read-only)
   */
  public getGameState(): Readonly<GameState> {
    return this.gameStateManager.getGameState();
  }

  /**
   * Sets the game speed (controlled by AI)
   */
  public setSpeed(speed: number): void {
    this.gameStateManager.setSpeed(speed);
  }

  /**
   * Pauses or unpauses the game
   */
  public togglePause(): void {
    const currentStatus = this.gameStateManager.getGameStatus();
    
    if (currentStatus === 'PLAYING') {
      this.gameStateManager.pauseGame();
    } else if (currentStatus === 'PAUSED') {
      this.gameStateManager.resumeGame();
    } else if (currentStatus === 'INIT') {
      this.gameStateManager.startGame();
    }
  }

  /**
   * Starts the game
   */
  public startGame(): boolean {
    return this.gameStateManager.startGame();
  }

  /**
   * Gets game statistics for AI analysis
   */
  public getGameStats(): {
    score: number;
    snakeLength: number;
    gameTime: number;
    dangerLevel: number;
    validMoves: Position[];
  } {
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
  public predictNextMoveCollision(): CollisionResult {
    return CollisionDetector.predictCollision(this.getGameState());
  }

  /**
   * Gets distance from snake head to food
   */
  public getDistanceToFood(): number {
    const gameState = this.getGameState();
    const head = gameState.snake[0];
    return CollisionDetector.calculateDistance(head.position, gameState.food);
  }

  /**
   * Checks if the game is currently running
   */
  public isGameRunning(): boolean {
    return this.gameStateManager.getGameStatus() === 'PLAYING';
  }

  /**
   * Checks if the game is over
   */
  public isGameOver(): boolean {
    return this.gameStateManager.getGameStatus() === 'GAME_OVER';
  }

  /**
   * Gets the current move interval in milliseconds
   */
  public getMoveInterval(): number {
    const currentSpeed = this.getGameState().speed;
    return this.moveInterval / currentSpeed;
  }

  /**
   * Gets input handler for external access
   */
  public getInputHandler(): InputHandler {
    return this.inputHandler;
  }

  /**
   * Gets player input analysis for AI systems
   */
  public getPlayerInputAnalysis(): {
    inputStats: any;
    inputPatterns: any;
    recentInputs: any[];
  } {
    return {
      inputStats: this.inputHandler.getInputStats(),
      inputPatterns: this.inputHandler.analyzeInputPatterns(),
      recentInputs: this.inputHandler.getRecentInputs()
    };
  }

  /**
   * Processes queued inputs for AI analysis
   */
  private processInputQueue(): void {
    // Keep only recent inputs (last 10)
    if (this.inputQueue.length > 10) {
      this.inputQueue = this.inputQueue.slice(-10);
    }
  }

  /**
   * Resets input statistics for new game session
   */
  public resetInputStats(): void {
    this.inputHandler.resetStats();
    this.inputQueue = [];
  }

  /**
   * Cleanup method
   */
  public destroy(): void {
    this.inputHandler.destroy();
  }
}