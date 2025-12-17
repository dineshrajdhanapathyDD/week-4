/**
 * Unit tests for InputHandler
 * Tests input processing, validation, and statistics tracking
 */

import { InputHandler } from '../../ui/InputHandler';
import { Direction } from '../../types/GameTypes';

// Mock performance.now for consistent testing
const mockPerformanceNow = jest.fn();
Object.defineProperty(global, 'performance', {
  value: { now: mockPerformanceNow }
});

describe('InputHandler', () => {
  let inputHandler: InputHandler;
  let mockDirectionChange: jest.Mock;
  let mockPause: jest.Mock;
  let mockReset: jest.Mock;
  let mockToggleAI: jest.Mock;

  beforeEach(() => {
    mockPerformanceNow.mockReturnValue(1000);
    
    inputHandler = new InputHandler();
    
    // Setup mock callbacks
    mockDirectionChange = jest.fn();
    mockPause = jest.fn();
    mockReset = jest.fn();
    mockToggleAI = jest.fn();
    
    inputHandler.onDirectionChange = mockDirectionChange;
    inputHandler.onPause = mockPause;
    inputHandler.onReset = mockReset;
    inputHandler.onToggleAIVisibility = mockToggleAI;
  });

  afterEach(() => {
    inputHandler.destroy();
    jest.clearAllMocks();
  });

  describe('Direction Input Processing', () => {
    it('should process arrow key inputs correctly', () => {
      inputHandler.simulateInput('ArrowUp');
      expect(mockDirectionChange).toHaveBeenCalledWith(Direction.UP);

      inputHandler.simulateInput('ArrowDown');
      expect(mockDirectionChange).toHaveBeenCalledWith(Direction.DOWN);

      inputHandler.simulateInput('ArrowLeft');
      expect(mockDirectionChange).toHaveBeenCalledWith(Direction.LEFT);

      inputHandler.simulateInput('ArrowRight');
      expect(mockDirectionChange).toHaveBeenCalledWith(Direction.RIGHT);
    });

    it('should process WASD key inputs correctly', () => {
      inputHandler.simulateInput('w');
      expect(mockDirectionChange).toHaveBeenCalledWith(Direction.UP);

      inputHandler.simulateInput('s');
      expect(mockDirectionChange).toHaveBeenCalledWith(Direction.DOWN);

      inputHandler.simulateInput('a');
      expect(mockDirectionChange).toHaveBeenCalledWith(Direction.LEFT);

      inputHandler.simulateInput('d');
      expect(mockDirectionChange).toHaveBeenCalledWith(Direction.RIGHT);
    });

    it('should handle uppercase WASD keys', () => {
      inputHandler.simulateInput('W');
      expect(mockDirectionChange).toHaveBeenCalledWith(Direction.UP);

      inputHandler.simulateInput('S');
      expect(mockDirectionChange).toHaveBeenCalledWith(Direction.DOWN);

      inputHandler.simulateInput('A');
      expect(mockDirectionChange).toHaveBeenCalledWith(Direction.LEFT);

      inputHandler.simulateInput('D');
      expect(mockDirectionChange).toHaveBeenCalledWith(Direction.RIGHT);
    });
  });

  describe('Action Input Processing', () => {
    it('should process pause inputs correctly', () => {
      inputHandler.simulateInput(' '); // Space
      expect(mockPause).toHaveBeenCalled();

      inputHandler.simulateInput('Escape');
      expect(mockPause).toHaveBeenCalledTimes(2);
    });

    it('should process reset inputs correctly', () => {
      inputHandler.simulateInput('r');
      expect(mockReset).toHaveBeenCalled();

      inputHandler.simulateInput('R');
      expect(mockReset).toHaveBeenCalledTimes(2);
    });

    it('should process AI toggle inputs correctly', () => {
      inputHandler.simulateInput('t');
      expect(mockToggleAI).toHaveBeenCalled();

      inputHandler.simulateInput('T');
      expect(mockToggleAI).toHaveBeenCalledTimes(2);
    });
  });

  describe('Input Statistics Tracking', () => {
    it('should track total inputs correctly', () => {
      inputHandler.simulateInput('w');
      inputHandler.simulateInput('d');
      inputHandler.simulateInput(' ');

      const stats = inputHandler.getInputStats();
      expect(stats.totalInputs).toBe(3);
      expect(stats.directionChanges).toBe(2);
    });

    it('should calculate average latency', () => {
      mockPerformanceNow.mockReturnValueOnce(1000);
      inputHandler.simulateInput('w');
      
      mockPerformanceNow.mockReturnValueOnce(1100);
      inputHandler.simulateInput('d');

      const stats = inputHandler.getInputStats();
      expect(stats.averageLatency).toBeGreaterThan(0);
    });

    it('should track inputs per second', () => {
      // Simulate rapid inputs
      for (let i = 0; i < 5; i++) {
        mockPerformanceNow.mockReturnValueOnce(1000 + i * 100);
        inputHandler.simulateInput('w');
      }

      const stats = inputHandler.getInputStats();
      expect(stats.inputsPerSecond).toBeGreaterThan(0);
    });
  });

  describe('Input Buffer Management', () => {
    it('should maintain input buffer with recent inputs', () => {
      inputHandler.simulateInput('w');
      inputHandler.simulateInput('d');
      inputHandler.simulateInput('s');

      const recentInputs = inputHandler.getRecentInputs(2);
      expect(recentInputs).toHaveLength(2);
      expect(recentInputs[0].direction).toBe(Direction.RIGHT); // 'd' maps to RIGHT
      expect(recentInputs[1].direction).toBe(Direction.DOWN); // 's' maps to DOWN
    });

    it('should limit buffer size', () => {
      // Add more inputs than buffer size
      for (let i = 0; i < 15; i++) {
        inputHandler.simulateInput('w');
      }

      const recentInputs = inputHandler.getRecentInputs(15);
      expect(recentInputs.length).toBeLessThanOrEqual(10); // MAX_BUFFER_SIZE
    });
  });

  describe('Input Pattern Analysis', () => {
    it('should analyze input patterns correctly', () => {
      // Simulate a pattern of inputs
      mockPerformanceNow.mockReturnValueOnce(1000);
      inputHandler.simulateInput('w');
      
      mockPerformanceNow.mockReturnValueOnce(1200);
      inputHandler.simulateInput('d');
      
      mockPerformanceNow.mockReturnValueOnce(1400);
      inputHandler.simulateInput('s');

      const patterns = inputHandler.analyzeInputPatterns();
      
      expect(patterns.averageReactionTime).toBeGreaterThan(0);
      expect(patterns.inputFrequency).toBeGreaterThanOrEqual(0);
      expect(patterns.preferredDirections).toHaveLength(4);
      expect(patterns.inputConsistency).toBeGreaterThanOrEqual(0);
      expect(patterns.inputConsistency).toBeLessThanOrEqual(1);
    });

    it('should handle empty input history', () => {
      const patterns = inputHandler.analyzeInputPatterns();
      
      expect(patterns.averageReactionTime).toBe(0);
      expect(patterns.inputFrequency).toBe(0);
      expect(patterns.preferredDirections).toHaveLength(4);
      expect(patterns.inputConsistency).toBe(0);
    });
  });

  describe('Reaction Time Calculation', () => {
    it('should calculate reaction time between direction changes', () => {
      mockPerformanceNow.mockReturnValueOnce(1000);
      inputHandler.simulateInput('w');
      
      mockPerformanceNow.mockReturnValueOnce(1150);
      inputHandler.simulateInput('d');

      const reactionTime = inputHandler.getLastReactionTime();
      expect(reactionTime).toBe(150);
    });

    it('should return 0 for insufficient input history', () => {
      inputHandler.simulateInput('w');
      
      const reactionTime = inputHandler.getLastReactionTime();
      expect(reactionTime).toBe(0);
    });
  });

  describe('PlayerInput Creation', () => {
    it('should create PlayerInput objects with correct data', () => {
      mockPerformanceNow.mockReturnValue(2000);
      
      const playerInput = inputHandler.createPlayerInput(Direction.UP);
      
      expect(playerInput.direction).toBe(Direction.UP);
      expect(playerInput.timestamp).toBe(2000);
      expect(playerInput.inputLatency).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Statistics Reset', () => {
    it('should reset statistics correctly', () => {
      // Generate some statistics
      inputHandler.simulateInput('w');
      inputHandler.simulateInput('d');
      
      let stats = inputHandler.getInputStats();
      expect(stats.totalInputs).toBe(2);
      
      // Reset and verify
      inputHandler.resetStats();
      stats = inputHandler.getInputStats();
      
      expect(stats.totalInputs).toBe(0);
      expect(stats.directionChanges).toBe(0);
      expect(stats.averageLatency).toBe(0);
      expect(stats.inputsPerSecond).toBe(0);
      
      const recentInputs = inputHandler.getRecentInputs();
      expect(recentInputs).toHaveLength(0);
    });
  });

  describe('Non-game Key Handling', () => {
    it('should ignore non-game keys', () => {
      inputHandler.simulateInput('x');
      inputHandler.simulateInput('1');
      inputHandler.simulateInput('Enter');

      const stats = inputHandler.getInputStats();
      expect(stats.totalInputs).toBe(0);
      expect(mockDirectionChange).not.toHaveBeenCalled();
      expect(mockPause).not.toHaveBeenCalled();
    });
  });
});