/**
 * Unit tests for PlayerProfiler
 * Tests player behavior tracking and analysis
 */

import { PlayerProfiler } from '../../ai/PlayerProfiler';
import { GameState, Direction, PlayerInput } from '../../types/GameTypes';

// Mock performance.now for consistent testing
const mockPerformanceNow = jest.fn();
Object.defineProperty(global, 'performance', {
  value: { now: mockPerformanceNow }
});

describe('PlayerProfiler', () => {
  let profiler: PlayerProfiler;
  let mockGameState: GameState;

  beforeEach(() => {
    mockPerformanceNow.mockReturnValue(1000);
    profiler = new PlayerProfiler();
    
    mockGameState = {
      snake: [
        { position: { x: 10, y: 10 }, direction: Direction.RIGHT, age: 0 },
        { position: { x: 9, y: 10 }, direction: Direction.RIGHT, age: 1 },
        { position: { x: 8, y: 10 }, direction: Direction.RIGHT, age: 2 }
      ],
      food: { x: 15, y: 10 },
      score: 100,
      gameStatus: 'PLAYING',
      speed: 1.5,
      gridSize: { width: 20, height: 20 },
      gameTime: 5000
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(profiler.reactionTimes).toEqual([]);
      expect(profiler.errorFrequency).toBe(0);
      expect(profiler.riskTolerance).toBe(0.5);
      expect(profiler.skillProgression).toBe(0);
      expect(profiler.sessionStartTime).toBe(1000);
    });

    it('should initialize behavior metrics', () => {
      const metrics = profiler.getBehaviorMetrics();
      
      expect(metrics.inputLatency).toEqual([]);
      expect(metrics.movementPatterns).toEqual([]);
      expect(metrics.collisionNearMisses).toBe(0);
      expect(metrics.foodCollectionEfficiency).toBe(0);
    });
  });

  describe('Input Recording', () => {
    it('should record player inputs correctly', () => {
      const playerInput: PlayerInput = {
        direction: Direction.UP,
        timestamp: 1100,
        inputLatency: 150
      };

      profiler.recordInput(playerInput, mockGameState);

      expect(profiler.reactionTimes).toContain(150);
      expect(profiler.getBehaviorMetrics().inputLatency).toContain(150);
      expect(profiler.getBehaviorMetrics().movementPatterns).toContain(Direction.UP);
    });

    it('should maintain reaction time history within limits', () => {
      // Add more reaction times than the window size
      for (let i = 0; i < 60; i++) {
        const playerInput: PlayerInput = {
          direction: Direction.RIGHT,
          timestamp: 1000 + i * 100,
          inputLatency: 100 + i
        };
        profiler.recordInput(playerInput, mockGameState);
      }

      // Should maintain only the last 50 reaction times
      expect(profiler.reactionTimes.length).toBe(50);
      expect(profiler.reactionTimes[0]).toBe(110); // First kept reaction time
      expect(profiler.reactionTimes[49]).toBe(159); // Last reaction time
    });

    it('should update skill progression based on game state', () => {
      const initialSkill = profiler.skillProgression;
      
      const playerInput: PlayerInput = {
        direction: Direction.UP,
        timestamp: 1100,
        inputLatency: 150
      };

      // Game state with higher score should improve skill
      const highScoreState = { ...mockGameState, score: 500 };
      profiler.recordInput(playerInput, highScoreState);

      expect(profiler.skillProgression).toBeGreaterThan(initialSkill);
    });
  });

  describe('Reaction Time Analysis', () => {
    it('should calculate average reaction time correctly', () => {
      const reactionTimes = [100, 150, 200, 120, 180];
      
      reactionTimes.forEach((latency, index) => {
        const playerInput: PlayerInput = {
          direction: Direction.RIGHT,
          timestamp: 1000 + index * 100,
          inputLatency: latency
        };
        profiler.recordInput(playerInput, mockGameState);
      });

      const expectedAverage = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
      expect(profiler.averageReactionTime()).toBe(expectedAverage);
    });

    it('should return 0 for empty reaction times', () => {
      expect(profiler.averageReactionTime()).toBe(0);
    });
  });

  describe('Stress Level Calculation', () => {
    it('should calculate stress level based on various factors', () => {
      // Add some reaction times to establish baseline
      for (let i = 0; i < 10; i++) {
        const playerInput: PlayerInput = {
          direction: Direction.RIGHT,
          timestamp: 1000 + i * 100,
          inputLatency: 200 // Baseline reaction time
        };
        profiler.recordInput(playerInput, mockGameState);
      }

      // Add faster reaction times (indicating stress)
      for (let i = 0; i < 5; i++) {
        const playerInput: PlayerInput = {
          direction: Direction.UP,
          timestamp: 2000 + i * 50,
          inputLatency: 100 // Much faster (stressed)
        };
        profiler.recordInput(playerInput, mockGameState);
      }

      const stressLevel = profiler.calculateStressLevel();
      expect(stressLevel).toBeGreaterThan(0);
      expect(stressLevel).toBeLessThanOrEqual(1);
    });

    it('should return low stress for consistent performance', () => {
      // Add consistent reaction times
      for (let i = 0; i < 10; i++) {
        const playerInput: PlayerInput = {
          direction: Direction.RIGHT,
          timestamp: 1000 + i * 200,
          inputLatency: 150 // Consistent timing
        };
        profiler.recordInput(playerInput, mockGameState);
      }

      const stressLevel = profiler.calculateStressLevel();
      expect(stressLevel).toBeLessThan(0.3); // Low stress
    });
  });

  describe('Movement Prediction', () => {
    it('should predict next moves based on patterns', () => {
      // Create a movement pattern
      const pattern = [Direction.RIGHT, Direction.UP, Direction.RIGHT, Direction.UP];
      
      pattern.forEach((direction, index) => {
        const playerInput: PlayerInput = {
          direction,
          timestamp: 1000 + index * 100,
          inputLatency: 150
        };
        profiler.recordInput(playerInput, mockGameState);
      });

      const predictions = profiler.predictNextMove(mockGameState);
      
      expect(predictions).toBeInstanceOf(Array);
      expect(predictions.length).toBeGreaterThan(0);
      expect(predictions.every(dir => Object.values(Direction).includes(dir))).toBe(true);
    });

    it('should return all directions for insufficient history', () => {
      const predictions = profiler.predictNextMove(mockGameState);
      
      expect(predictions).toHaveLength(4);
      expect(predictions).toEqual(expect.arrayContaining([
        Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT
      ]));
    });
  });

  describe('Collision Recording', () => {
    it('should record collision events', () => {
      profiler.recordCollision('wall', { x: 0, y: 10 }, mockGameState);
      
      expect(profiler.errorFrequency).toBeGreaterThan(0);
    });

    it('should track near misses separately', () => {
      const initialNearMisses = profiler.getBehaviorMetrics().collisionNearMisses;
      
      profiler.recordCollision('near_miss', { x: 1, y: 10 }, mockGameState);
      
      expect(profiler.getBehaviorMetrics().collisionNearMisses).toBe(initialNearMisses + 1);
    });
  });

  describe('Food Collection Analysis', () => {
    it('should record food collection efficiency', () => {
      const timeTaken = 2000; // 2 seconds
      
      profiler.recordFoodCollection(mockGameState, timeTaken);
      
      expect(profiler.getBehaviorMetrics().foodCollectionEfficiency).toBeGreaterThan(0);
    });

    it('should calculate efficiency based on optimal path', () => {
      // Food is at (15, 10), snake head at (10, 10) = 5 moves optimal
      const actualTime = 8000; // 8 seconds (much slower than optimal)
      
      profiler.recordFoodCollection(mockGameState, actualTime);
      
      const efficiency = profiler.getBehaviorMetrics().foodCollectionEfficiency;
      expect(efficiency).toBeLessThan(1); // Not perfect efficiency
      expect(efficiency).toBeGreaterThanOrEqual(0); // But non-negative
    });
  });

  describe('Risk Analysis', () => {
    it('should update risk tolerance based on player choices', () => {
      const initialRiskTolerance = profiler.riskTolerance;
      
      // Make several risky moves (towards walls)
      const riskyGameState = {
        ...mockGameState,
        snake: [{ position: { x: 1, y: 1 }, direction: Direction.LEFT, age: 0 }] // Near wall
      };

      for (let i = 0; i < 5; i++) {
        const playerInput: PlayerInput = {
          direction: Direction.LEFT, // Moving towards wall (risky)
          timestamp: 1000 + i * 100,
          inputLatency: 150
        };
        profiler.recordInput(playerInput, riskyGameState);
      }

      // Risk tolerance should increase (player likes risk)
      expect(profiler.riskTolerance).toBeGreaterThanOrEqual(initialRiskTolerance);
    });
  });

  describe('Analysis Report', () => {
    it('should generate comprehensive analysis report', () => {
      // Add some data
      for (let i = 0; i < 5; i++) {
        const playerInput: PlayerInput = {
          direction: Direction.RIGHT,
          timestamp: 1000 + i * 100,
          inputLatency: 150 + i * 10
        };
        profiler.recordInput(playerInput, mockGameState);
      }

      const report = profiler.getAnalysisReport();
      
      expect(report).toHaveProperty('profile');
      expect(report).toHaveProperty('metrics');
      expect(report).toHaveProperty('patterns');
      
      expect(report.profile).toHaveProperty('averageReactionTime');
      expect(report.profile).toHaveProperty('errorFrequency');
      expect(report.profile).toHaveProperty('riskTolerance');
      expect(report.profile).toHaveProperty('skillProgression');
      expect(report.profile).toHaveProperty('stressLevel');
      
      expect(report.patterns).toHaveProperty('preferredDirections');
      expect(report.patterns).toHaveProperty('riskPatterns');
      expect(report.patterns).toHaveProperty('efficiencyTrend');
    });
  });

  describe('Session Management', () => {
    it('should reset profile correctly', () => {
      // Add some data
      const playerInput: PlayerInput = {
        direction: Direction.UP,
        timestamp: 1100,
        inputLatency: 150
      };
      profiler.recordInput(playerInput, mockGameState);
      profiler.recordCollision('wall', { x: 0, y: 0 }, mockGameState);

      // Verify data exists
      expect(profiler.reactionTimes.length).toBeGreaterThan(0);
      expect(profiler.errorFrequency).toBeGreaterThan(0);

      // Reset
      mockPerformanceNow.mockReturnValue(2000);
      profiler.reset();

      // Verify reset
      expect(profiler.reactionTimes).toEqual([]);
      expect(profiler.errorFrequency).toBe(0);
      expect(profiler.riskTolerance).toBe(0.5);
      expect(profiler.skillProgression).toBe(0);
      expect(profiler.sessionStartTime).toBe(2000);
      
      const metrics = profiler.getBehaviorMetrics();
      expect(metrics.inputLatency).toEqual([]);
      expect(metrics.movementPatterns).toEqual([]);
      expect(metrics.collisionNearMisses).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty movement history gracefully', () => {
      const predictions = profiler.predictNextMove(mockGameState);
      expect(predictions).toHaveLength(4);
    });

    it('should handle stress calculation with no data', () => {
      const stressLevel = profiler.calculateStressLevel();
      expect(stressLevel).toBe(0);
    });

    it('should handle efficiency calculation with no history', () => {
      const metrics = profiler.getBehaviorMetrics();
      expect(metrics.foodCollectionEfficiency).toBe(0);
    });
  });
});