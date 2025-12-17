/**
 * Unit tests for AIGameDirector
 * Tests core AI decision engine functionality
 */

import { AIGameDirector } from '../../ai/AIGameDirector';
import { PlayerProfiler } from '../../ai/PlayerProfiler';
import { GameState, Direction, PlayerInput } from '../../types/GameTypes';

describe('AIGameDirector', () => {
  let aiDirector: AIGameDirector;
  let playerProfiler: PlayerProfiler;
  let mockGameState: GameState;

  beforeEach(() => {
    playerProfiler = new PlayerProfiler();
    aiDirector = new AIGameDirector(playerProfiler);
    
    mockGameState = {
      snake: [
        { position: { x: 10, y: 10 }, direction: Direction.RIGHT, age: 0 },
        { position: { x: 9, y: 10 }, direction: Direction.RIGHT, age: 1 },
        { position: { x: 8, y: 10 }, direction: Direction.RIGHT, age: 2 }
      ],
      food: { x: 15, y: 10 },
      score: 0,
      gameStatus: 'PLAYING',
      speed: 1.0,
      gridSize: { width: 20, height: 20 },
      gameTime: 0
    };
  });

  describe('Core AI Decision Engine', () => {
    it('should analyze player behavior without errors', () => {
      const playerInput: PlayerInput = {
        direction: Direction.RIGHT,
        timestamp: performance.now(),
        inputLatency: 150
      };

      expect(() => {
        aiDirector.analyzePlayerBehavior(mockGameState, playerInput);
      }).not.toThrow();
    });

    it('should log decisions with human-readable explanations', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      aiDirector.logDecision('Test decision', 'This is a test reasoning');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[AI Director] Test decision: This is a test reasoning')
      );
      
      consoleSpy.mockRestore();
    });

    it('should maintain decision history', () => {
      aiDirector.logDecision('Decision 1', 'Reason 1');
      aiDirector.logDecision('Decision 2', 'Reason 2');
      
      const history = aiDirector.getDecisionHistory();
      expect(history).toHaveLength(2);
      expect(history[0].reasoning).toBe('Reason 1');
      expect(history[1].reasoning).toBe('Reason 2');
    });

    it('should calculate optimal food placement', () => {
      const position = aiDirector.calculateOptimalFoodPlacement(mockGameState);
      
      expect(position).toHaveProperty('x');
      expect(position).toHaveProperty('y');
      expect(position.x).toBeGreaterThanOrEqual(0);
      expect(position.x).toBeLessThan(mockGameState.gridSize.width);
      expect(position.y).toBeGreaterThanOrEqual(0);
      expect(position.y).toBeLessThan(mockGameState.gridSize.height);
    });

    it('should adjust game speed based on player profile', () => {
      // Simulate good performance
      playerProfiler.skillProgression = 0.8;
      
      const currentSpeed = 1.0;
      const adjustedSpeed = aiDirector.adjustGameSpeed(currentSpeed, playerProfiler);
      
      expect(typeof adjustedSpeed).toBe('number');
      expect(adjustedSpeed).toBeGreaterThan(0);
    });

    it('should determine when recovery mechanic should trigger', () => {
      // Simulate struggling player
      playerProfiler.errorFrequency = 0.8;
      
      const shouldTrigger = aiDirector.shouldTriggerRecoveryMechanic(playerProfiler);
      
      expect(typeof shouldTrigger).toBe('boolean');
    });

    it('should provide AI status information', () => {
      const status = aiDirector.getAIStatus();
      
      expect(status).toHaveProperty('mode');
      expect(status).toHaveProperty('difficultyLevel');
      expect(status).toHaveProperty('recoveryActive');
      expect(status).toHaveProperty('recentDecisions');
      expect(status).toHaveProperty('performanceAssessment');
    });

    it('should provide strategic advice', () => {
      const advice = aiDirector.getStrategicAdvice(mockGameState);
      
      expect(advice).toHaveProperty('recommendedAction');
      expect(advice).toHaveProperty('reasoning');
      expect(advice).toHaveProperty('confidence');
      expect(advice.confidence).toBeGreaterThanOrEqual(0);
      expect(advice.confidence).toBeLessThanOrEqual(1);
    });

    it('should reset properly for new sessions', () => {
      // Add some history
      aiDirector.logDecision('Test', 'Test');
      expect(aiDirector.getDecisionHistory()).toHaveLength(1);
      
      // Reset
      aiDirector.reset();
      
      const status = aiDirector.getAIStatus();
      expect(status.difficultyLevel).toBe(1.0);
      expect(status.recoveryActive).toBe(false);
      expect(aiDirector.getDecisionHistory()).toHaveLength(1); // Reset decision logged
    });

    it('should update configuration correctly', () => {
      const newConfig = {
        adaptationSensitivity: 0.5,
        explanationVerbosity: 'minimal' as const
      };
      
      expect(() => {
        aiDirector.updateConfiguration(newConfig);
      }).not.toThrow();
      
      const analytics = aiDirector.getAnalytics();
      expect(analytics.configuration.adaptationSensitivity).toBe(0.5);
      expect(analytics.configuration.explanationVerbosity).toBe('minimal');
    });
  });

  describe('Performance Monitoring', () => {
    it('should track performance metrics over time', () => {
      // Simulate multiple inputs
      for (let i = 0; i < 5; i++) {
        const playerInput: PlayerInput = {
          direction: Direction.RIGHT,
          timestamp: performance.now(),
          inputLatency: 100 + i * 10
        };
        
        aiDirector.analyzePlayerBehavior(mockGameState, playerInput);
      }
      
      const analytics = aiDirector.getAnalytics();
      expect(analytics.totalDecisions).toBeGreaterThan(0);
    });

    it('should provide comprehensive analytics', () => {
      const analytics = aiDirector.getAnalytics();
      
      expect(analytics).toHaveProperty('totalDecisions');
      expect(analytics).toHaveProperty('decisionTypes');
      expect(analytics).toHaveProperty('currentDifficulty');
      expect(analytics).toHaveProperty('performanceStreaks');
      expect(analytics).toHaveProperty('playerMetrics');
      expect(analytics).toHaveProperty('configuration');
    });
  });

  describe('Skill Level Assessment', () => {
    it('should assess skill level based on game performance', () => {
      // Simulate high-performance game state
      const highPerformanceState = {
        ...mockGameState,
        score: 500,
        snake: Array(10).fill(null).map((_, i) => ({
          position: { x: 10 - i, y: 10 },
          direction: Direction.RIGHT,
          age: i
        })),
        gameTime: 60000 // 1 minute
      };
      
      const playerInput: PlayerInput = {
        direction: Direction.RIGHT,
        timestamp: performance.now(),
        inputLatency: 80 // Fast reaction
      };
      
      aiDirector.analyzePlayerBehavior(highPerformanceState, playerInput);
      
      // The AI should recognize good performance
      const status = aiDirector.getAIStatus();
      expect(status.performanceAssessment).toBeDefined();
    });
  });
});