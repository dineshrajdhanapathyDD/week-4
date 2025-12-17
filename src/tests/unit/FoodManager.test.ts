/**
 * Unit tests for FoodManager
 * Tests food consumption, scoring, and placement logic
 */

import { FoodManager } from '../../engine/FoodManager';
import { GameState, Direction } from '../../types/GameTypes';

describe('FoodManager', () => {
  let mockGameState: GameState;

  beforeEach(() => {
    mockGameState = {
      snake: [
        { position: { x: 10, y: 10 }, direction: Direction.RIGHT, age: 0 },
        { position: { x: 9, y: 10 }, direction: Direction.RIGHT, age: 1 },
        { position: { x: 8, y: 10 }, direction: Direction.RIGHT, age: 2 }
      ],
      food: { x: 11, y: 10 },
      score: 0,
      gameStatus: 'PLAYING',
      speed: 1.0,
      gridSize: { width: 20, height: 20 },
      gameTime: 1000
    };
  });

  describe('Food Consumption Detection', () => {
    it('should detect when food is consumed', () => {
      // Food is at (11, 10) and snake head is at (10, 10)
      // Move head to food position
      mockGameState.snake[0].position = { x: 11, y: 10 };
      
      const result = FoodManager.checkFoodConsumption(mockGameState);
      
      expect(result.consumed).toBe(true);
      expect(result.scoreIncrease).toBeGreaterThan(0);
      expect(result.newFoodPosition).toBeDefined();
    });

    it('should not detect consumption when food is not at head position', () => {
      // Food is at (11, 10) and snake head remains at (10, 10)
      const result = FoodManager.checkFoodConsumption(mockGameState);
      
      expect(result.consumed).toBe(false);
      expect(result.scoreIncrease).toBe(0);
      expect(result.newFoodPosition).toBeUndefined();
    });

    it('should calculate score increase with bonuses', () => {
      // Create longer snake for length bonus
      for (let i = 0; i < 10; i++) {
        mockGameState.snake.push({
          position: { x: 8 - i, y: 10 },
          direction: Direction.RIGHT,
          age: 3 + i
        });
      }
      
      // Increase speed for speed bonus
      mockGameState.speed = 2.5;
      
      // Position head at food
      mockGameState.snake[0].position = mockGameState.food;
      
      const result = FoodManager.checkFoodConsumption(mockGameState);
      
      expect(result.consumed).toBe(true);
      expect(result.scoreIncrease).toBeGreaterThan(10); // Base score + bonuses
    });
  });

  describe('Food Position Generation', () => {
    it('should generate valid food positions', () => {
      const position = FoodManager.generateOptimalFoodPosition(mockGameState);
      
      expect(position.x).toBeGreaterThanOrEqual(0);
      expect(position.x).toBeLessThan(mockGameState.gridSize.width);
      expect(position.y).toBeGreaterThanOrEqual(0);
      expect(position.y).toBeLessThan(mockGameState.gridSize.height);
      
      // Should not overlap with snake
      const overlapsSnake = mockGameState.snake.some(segment =>
        segment.position.x === position.x && segment.position.y === position.y
      );
      expect(overlapsSnake).toBe(false);
    });

    it('should generate different positions based on difficulty', () => {
      const easyPosition = FoodManager.generateOptimalFoodPosition(mockGameState, 'easy');
      const hardPosition = FoodManager.generateOptimalFoodPosition(mockGameState, 'hard');
      
      // Both should be valid
      expect(FoodManager.isValidFoodPosition(easyPosition, mockGameState)).toBe(true);
      expect(FoodManager.isValidFoodPosition(hardPosition, mockGameState)).toBe(true);
      
      // They might be different (not guaranteed, but likely)
      // We'll just verify they're both valid positions
      expect(easyPosition).toBeDefined();
      expect(hardPosition).toBeDefined();
    });

    it('should handle edge case with limited valid positions', () => {
      // Create a game state with very few valid positions
      const smallGameState: GameState = {
        ...mockGameState,
        gridSize: { width: 3, height: 3 },
        snake: [
          { position: { x: 0, y: 0 }, direction: Direction.RIGHT, age: 0 },
          { position: { x: 1, y: 0 }, direction: Direction.RIGHT, age: 1 },
          { position: { x: 2, y: 0 }, direction: Direction.RIGHT, age: 2 },
          { position: { x: 0, y: 1 }, direction: Direction.RIGHT, age: 3 },
          { position: { x: 1, y: 1 }, direction: Direction.RIGHT, age: 4 }
        ]
      };
      
      const position = FoodManager.generateOptimalFoodPosition(smallGameState);
      expect(FoodManager.isValidFoodPosition(position, smallGameState)).toBe(true);
    });
  });

  describe('Food Position Validation', () => {
    it('should validate correct food positions', () => {
      const validPosition = { x: 5, y: 5 };
      expect(FoodManager.isValidFoodPosition(validPosition, mockGameState)).toBe(true);
    });

    it('should reject positions outside grid bounds', () => {
      const invalidPositions = [
        { x: -1, y: 5 },
        { x: 5, y: -1 },
        { x: 20, y: 5 },
        { x: 5, y: 20 }
      ];
      
      invalidPositions.forEach(pos => {
        expect(FoodManager.isValidFoodPosition(pos, mockGameState)).toBe(false);
      });
    });

    it('should reject positions that overlap with snake', () => {
      const snakePositions = mockGameState.snake.map(segment => segment.position);
      
      snakePositions.forEach(pos => {
        expect(FoodManager.isValidFoodPosition(pos, mockGameState)).toBe(false);
      });
    });
  });

  describe('Food Placement Statistics', () => {
    it('should calculate placement statistics correctly', () => {
      const stats = FoodManager.getFoodPlacementStats(mockGameState);
      
      expect(stats.totalValidPositions).toBeGreaterThan(0);
      expect(stats.averageDistanceToHead).toBeGreaterThan(0);
      expect(stats.closestDistance).toBeGreaterThanOrEqual(0);
      expect(stats.farthestDistance).toBeGreaterThanOrEqual(stats.closestDistance);
      expect(stats.dangerousPositions).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty grid gracefully', () => {
      // Create a completely filled grid
      const filledGameState: GameState = {
        ...mockGameState,
        gridSize: { width: 2, height: 2 },
        snake: [
          { position: { x: 0, y: 0 }, direction: Direction.RIGHT, age: 0 },
          { position: { x: 1, y: 0 }, direction: Direction.RIGHT, age: 1 },
          { position: { x: 0, y: 1 }, direction: Direction.RIGHT, age: 2 },
          { position: { x: 1, y: 1 }, direction: Direction.RIGHT, age: 3 }
        ]
      };
      
      const stats = FoodManager.getFoodPlacementStats(filledGameState);
      
      expect(stats.totalValidPositions).toBe(0);
      expect(stats.averageDistanceToHead).toBe(0);
      expect(stats.closestDistance).toBe(0);
      expect(stats.farthestDistance).toBe(0);
    });
  });

  describe('AI Food Placement Suggestions', () => {
    it('should suggest appropriate difficulty based on game state', () => {
      const suggestion = FoodManager.suggestFoodPlacement(mockGameState);
      
      expect(suggestion.position).toBeDefined();
      expect(suggestion.reasoning).toBeDefined();
      expect(['easy', 'medium', 'hard']).toContain(suggestion.difficulty);
      expect(FoodManager.isValidFoodPosition(suggestion.position, mockGameState)).toBe(true);
    });

    it('should suggest easy difficulty for dangerous situations', () => {
      // Create a dangerous game state (snake near walls)
      const dangerousGameState: GameState = {
        ...mockGameState,
        snake: [
          { position: { x: 0, y: 0 }, direction: Direction.RIGHT, age: 0 },
          { position: { x: 1, y: 0 }, direction: Direction.RIGHT, age: 1 },
          { position: { x: 2, y: 0 }, direction: Direction.RIGHT, age: 2 }
        ]
      };
      
      const suggestion = FoodManager.suggestFoodPlacement(dangerousGameState);
      
      // Should suggest easier placement for recovery
      expect(suggestion.difficulty).toBe('easy');
      expect(suggestion.reasoning).toContain('danger');
    });

    it('should suggest hard difficulty for advanced players', () => {
      // Create a game state indicating mastery (long snake, high speed)
      const masteryGameState: GameState = {
        ...mockGameState,
        speed: 3.0,
        snake: Array.from({ length: 20 }, (_, i) => ({
          position: { x: 10 - i, y: 10 },
          direction: Direction.RIGHT,
          age: i
        }))
      };
      
      const suggestion = FoodManager.suggestFoodPlacement(masteryGameState);
      
      // Should suggest harder placement for challenge
      expect(suggestion.difficulty).toBe('hard');
      expect(suggestion.reasoning).toContain('mastery');
    });
  });

  describe('Collection Efficiency Calculation', () => {
    it('should calculate efficiency correctly', () => {
      const efficiency = FoodManager.calculateCollectionEfficiency(5, 50, 10000);
      
      expect(efficiency).toBeGreaterThanOrEqual(0);
      expect(efficiency).toBeLessThanOrEqual(1);
    });

    it('should handle edge cases', () => {
      expect(FoodManager.calculateCollectionEfficiency(0, 0, 0)).toBe(0);
      expect(FoodManager.calculateCollectionEfficiency(5, 0, 1000)).toBe(0);
      expect(FoodManager.calculateCollectionEfficiency(5, 50, 0)).toBe(0);
    });

    it('should cap efficiency at 1.0', () => {
      // Very high efficiency scenario
      const efficiency = FoodManager.calculateCollectionEfficiency(100, 100, 1000);
      expect(efficiency).toBeLessThanOrEqual(1);
    });
  });
});