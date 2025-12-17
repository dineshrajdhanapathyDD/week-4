/**
 * Unit tests for GameStateManager
 * Tests specific scenarios and state transitions
 */

import { GameStateManager } from '../../engine/GameStateManager';
import { Direction } from '../../types/GameTypes';

describe('GameStateManager', () => {
  let gameStateManager: GameStateManager;

  beforeEach(() => {
    gameStateManager = new GameStateManager();
  });

  describe('Initial State', () => {
    it('should initialize with correct initial state', () => {
      const state = gameStateManager.getGameState();
      
      expect(state.gameStatus).toBe('INIT');
      expect(state.score).toBe(0);
      expect(state.speed).toBe(1.0);
      expect(state.snake.length).toBe(3);
      expect(state.gridSize).toEqual({ width: 20, height: 20 });
      expect(state.gameTime).toBe(0);
    });

    it('should have snake starting in center moving right', () => {
      const state = gameStateManager.getGameState();
      const head = state.snake[0];
      
      expect(head.direction).toBe(Direction.RIGHT);
      expect(head.position.x).toBe(10); // center of 20x20 grid
      expect(head.position.y).toBe(10);
    });

    it('should have food positioned away from snake', () => {
      const state = gameStateManager.getGameState();
      const snakePositions = state.snake.map(s => `${s.position.x},${s.position.y}`);
      const foodPosition = `${state.food.x},${state.food.y}`;
      
      expect(snakePositions).not.toContain(foodPosition);
    });
  });

  describe('State Transitions', () => {
    it('should allow valid state transitions', () => {
      expect(gameStateManager.startGame()).toBe(true);
      expect(gameStateManager.getGameStatus()).toBe('PLAYING');
      
      expect(gameStateManager.pauseGame()).toBe(true);
      expect(gameStateManager.getGameStatus()).toBe('PAUSED');
      
      expect(gameStateManager.resumeGame()).toBe(true);
      expect(gameStateManager.getGameStatus()).toBe('PLAYING');
      
      expect(gameStateManager.endGame()).toBe(true);
      expect(gameStateManager.getGameStatus()).toBe('GAME_OVER');
      
      expect(gameStateManager.resetGame()).toBe(true);
      expect(gameStateManager.getGameStatus()).toBe('INIT');
    });

    it('should reject invalid state transitions', () => {
      // Can't pause from INIT
      expect(gameStateManager.pauseGame()).toBe(false);
      expect(gameStateManager.getGameStatus()).toBe('INIT');
      
      // Can't resume from INIT
      expect(gameStateManager.resumeGame()).toBe(false);
      expect(gameStateManager.getGameStatus()).toBe('INIT');
    });
  });

  describe('Snake Movement', () => {
    beforeEach(() => {
      gameStateManager.startGame();
    });

    it('should move snake forward', () => {
      const initialState = gameStateManager.getGameState();
      const initialHeadX = initialState.snake[0].position.x;
      
      gameStateManager.moveSnake();
      
      const newState = gameStateManager.getGameState();
      const newHeadX = newState.snake[0].position.x;
      
      // Snake should move right (x increases)
      expect(newHeadX).toBe(initialHeadX + 1);
    });

    it('should maintain snake length when not eating food', () => {
      const initialLength = gameStateManager.getSnakeLength();
      
      // Move snake to position where it won't eat food
      gameStateManager.moveSnake();
      
      expect(gameStateManager.getSnakeLength()).toBe(initialLength);
    });

    it('should grow snake when eating food', () => {
      const state = gameStateManager.getGameState();
      const initialLength = state.snake.length;
      
      // Position food directly in front of snake
      const head = state.snake[0];
      const foodPosition = { x: head.position.x + 1, y: head.position.y };
      gameStateManager.spawnFoodAt(foodPosition);
      
      gameStateManager.moveSnake();
      
      expect(gameStateManager.getSnakeLength()).toBe(initialLength + 1);
    });

    it('should update score when eating food', () => {
      const initialScore = gameStateManager.getScore();
      
      // Position food directly in front of snake
      const state = gameStateManager.getGameState();
      const head = state.snake[0];
      const foodPosition = { x: head.position.x + 1, y: head.position.y };
      gameStateManager.spawnFoodAt(foodPosition);
      
      gameStateManager.moveSnake();
      
      expect(gameStateManager.getScore()).toBe(initialScore + 10);
    });
  });

  describe('Direction Changes', () => {
    beforeEach(() => {
      gameStateManager.startGame();
    });

    it('should allow valid direction changes', () => {
      expect(gameStateManager.changeDirection(Direction.UP)).toBe(true);
      expect(gameStateManager.changeDirection(Direction.LEFT)).toBe(true);
      expect(gameStateManager.changeDirection(Direction.DOWN)).toBe(true);
      expect(gameStateManager.changeDirection(Direction.RIGHT)).toBe(true);
    });

    it('should prevent 180-degree turns', () => {
      // Snake starts moving RIGHT
      expect(gameStateManager.changeDirection(Direction.LEFT)).toBe(false);
      
      // Change to UP first
      gameStateManager.changeDirection(Direction.UP);
      // Now DOWN should be blocked
      expect(gameStateManager.changeDirection(Direction.DOWN)).toBe(false);
    });

    it('should not allow direction changes when not playing', () => {
      gameStateManager.pauseGame();
      expect(gameStateManager.changeDirection(Direction.UP)).toBe(false);
    });
  });

  describe('Collision Detection', () => {
    beforeEach(() => {
      gameStateManager.startGame();
    });

    it('should detect wall collisions', () => {
      // Move snake to right edge
      const state = gameStateManager.getGameState();
      const movesToEdge = state.gridSize.width - state.snake[0].position.x - 1;
      
      for (let i = 0; i < movesToEdge; i++) {
        gameStateManager.moveSnake();
      }
      
      // Next move should cause wall collision
      gameStateManager.moveSnake();
      expect(gameStateManager.checkWallCollision()).toBe(true);
    });

    it('should detect self-collision', () => {
      // Create a scenario where snake will hit itself
      // This requires growing the snake first and then making it turn back
      
      // Grow snake by eating food multiple times
      for (let i = 0; i < 5; i++) {
        const state = gameStateManager.getGameState();
        const head = state.snake[0];
        const foodPos = { x: head.position.x + 1, y: head.position.y };
        gameStateManager.spawnFoodAt(foodPos);
        gameStateManager.moveSnake();
      }
      
      // Now make snake turn in a way that it will hit itself
      gameStateManager.changeDirection(Direction.UP);
      gameStateManager.moveSnake();
      gameStateManager.changeDirection(Direction.LEFT);
      gameStateManager.moveSnake();
      gameStateManager.changeDirection(Direction.DOWN);
      gameStateManager.moveSnake();
      gameStateManager.changeDirection(Direction.RIGHT);
      gameStateManager.moveSnake();
      
      // Check if self-collision is detected
      expect(gameStateManager.checkSelfCollision()).toBe(true);
    });
  });

  describe('Speed Control', () => {
    it('should set speed within valid range', () => {
      gameStateManager.setSpeed(2.5);
      expect(gameStateManager.getGameState().speed).toBe(2.5);
    });

    it('should clamp speed to minimum value', () => {
      gameStateManager.setSpeed(0.05);
      expect(gameStateManager.getGameState().speed).toBe(0.1);
    });

    it('should clamp speed to maximum value', () => {
      gameStateManager.setSpeed(10.0);
      expect(gameStateManager.getGameState().speed).toBe(5.0);
    });
  });

  describe('Food Management', () => {
    it('should spawn food at valid positions', () => {
      const validPosition = { x: 0, y: 0 };
      expect(gameStateManager.spawnFoodAt(validPosition)).toBe(true);
      expect(gameStateManager.getGameState().food).toEqual(validPosition);
    });

    it('should reject food placement on snake', () => {
      const state = gameStateManager.getGameState();
      const snakePosition = state.snake[0].position;
      
      expect(gameStateManager.spawnFoodAt(snakePosition)).toBe(false);
    });

    it('should reject food placement outside grid', () => {
      const invalidPosition = { x: -1, y: -1 };
      expect(gameStateManager.spawnFoodAt(invalidPosition)).toBe(false);
    });
  });

  describe('Game Time', () => {
    it('should update game time when playing', () => {
      gameStateManager.startGame();
      
      gameStateManager.updateGameTime(100);
      expect(gameStateManager.getGameState().gameTime).toBe(100);
      
      gameStateManager.updateGameTime(50);
      expect(gameStateManager.getGameState().gameTime).toBe(150);
    });

    it('should not update game time when paused', () => {
      gameStateManager.startGame();
      gameStateManager.pauseGame();
      
      gameStateManager.updateGameTime(100);
      expect(gameStateManager.getGameState().gameTime).toBe(0);
    });
  });
});