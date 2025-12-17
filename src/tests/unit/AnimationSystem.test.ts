/**
 * Unit tests for AnimationSystem
 * Tests animation creation, updates, and rendering
 */

import { AnimationSystem } from '../../ui/AnimationSystem';

// Mock performance.now for consistent testing
const mockPerformanceNow = jest.fn();
Object.defineProperty(global, 'performance', {
  value: { now: mockPerformanceNow }
});

// Mock canvas context
const mockContext = {
  save: jest.fn(),
  restore: jest.fn(),
  fillRect: jest.fn(),
  fillStyle: '',
} as any;

describe('AnimationSystem', () => {
  let animationSystem: AnimationSystem;

  beforeEach(() => {
    animationSystem = new AnimationSystem();
    mockPerformanceNow.mockReturnValue(1000);
    jest.clearAllMocks();
  });

  describe('Animation Management', () => {
    it('should add animations correctly', () => {
      const animationId = animationSystem.addAnimation({
        type: 'fade',
        position: { x: 5, y: 5 },
        duration: 500,
        properties: { fadeIn: true, color: { r: 255, g: 0, b: 0 } }
      });

      expect(animationId).toBeDefined();
      expect(animationId).toMatch(/^anim_\d+$/);
      expect(animationSystem.getActiveAnimationCount()).toBe(1);
    });

    it('should remove animations correctly', () => {
      const animationId = animationSystem.addAnimation({
        type: 'pulse',
        position: { x: 3, y: 3 },
        duration: 300,
        properties: { intensity: 0.5 }
      });

      animationSystem.removeAnimation(animationId);
      expect(animationSystem.getActiveAnimationCount()).toBe(0);
    });

    it('should auto-remove completed animations', () => {
      mockPerformanceNow.mockReturnValue(1000);
      
      animationSystem.addAnimation({
        type: 'fade',
        position: { x: 1, y: 1 },
        duration: 200,
        properties: {}
      });

      expect(animationSystem.getActiveAnimationCount()).toBe(1);

      // Simulate time passing beyond animation duration
      mockPerformanceNow.mockReturnValue(1300);
      animationSystem.update(1300);

      expect(animationSystem.getActiveAnimationCount()).toBe(0);
    });

    it('should call onComplete callback when animation finishes', () => {
      const onComplete = jest.fn();
      
      mockPerformanceNow.mockReturnValue(1000);
      
      animationSystem.addAnimation({
        type: 'scale',
        position: { x: 2, y: 2 },
        duration: 100,
        properties: {},
        onComplete
      });

      // Animation should still be active
      mockPerformanceNow.mockReturnValue(1050);
      animationSystem.update(1050);
      expect(onComplete).not.toHaveBeenCalled();

      // Animation should complete
      mockPerformanceNow.mockReturnValue(1150);
      animationSystem.update(1150);
      expect(onComplete).toHaveBeenCalled();
    });
  });

  describe('Particle System', () => {
    it('should create particle explosions', () => {
      animationSystem.createFoodConsumptionEffect({ x: 5, y: 5 });
      
      // Should have created scale animation + particles
      expect(animationSystem.getActiveAnimationCount()).toBeGreaterThan(1);
    });

    it('should update particle positions and life', () => {
      animationSystem.createFoodConsumptionEffect({ x: 5, y: 5 });
      
      const initialCount = animationSystem.getActiveAnimationCount();
      
      // Update particles multiple times
      for (let i = 0; i < 50; i++) {
        animationSystem.update(1000 + i * 16);
      }
      
      // Some particles should have died
      expect(animationSystem.getActiveAnimationCount()).toBeLessThan(initialCount);
    });
  });

  describe('Predefined Effects', () => {
    it('should create food consumption effect', () => {
      animationSystem.createFoodConsumptionEffect({ x: 3, y: 3 });
      expect(animationSystem.getActiveAnimationCount()).toBeGreaterThan(0);
    });

    it('should create snake growth effect', () => {
      animationSystem.createSnakeGrowthEffect({ x: 4, y: 4 });
      expect(animationSystem.getActiveAnimationCount()).toBe(1);
    });

    it('should create collision effect', () => {
      animationSystem.createCollisionEffect({ x: 2, y: 2 });
      expect(animationSystem.getActiveAnimationCount()).toBeGreaterThan(0);
    });

    it('should create stress indicator', () => {
      animationSystem.createStressIndicator({ x: 1, y: 1 }, 0.8);
      expect(animationSystem.getActiveAnimationCount()).toBe(1);
    });

    it('should create performance boost effect', () => {
      animationSystem.createPerformanceBoost({ x: 6, y: 6 });
      expect(animationSystem.getActiveAnimationCount()).toBe(1);
    });
  });

  describe('Rendering', () => {
    it('should render animations without errors', () => {
      animationSystem.addAnimation({
        type: 'fade',
        position: { x: 2, y: 2 },
        duration: 500,
        properties: { fadeIn: true, color: { r: 0, g: 255, b: 0 } }
      });

      expect(() => {
        animationSystem.render(mockContext, 20);
      }).not.toThrow();

      expect(mockContext.save).toHaveBeenCalled();
      expect(mockContext.restore).toHaveBeenCalled();
    });

    it('should render different animation types', () => {
      const animationTypes = ['fade', 'pulse', 'slide', 'scale'] as const;
      
      animationTypes.forEach(type => {
        animationSystem.addAnimation({
          type,
          position: { x: 1, y: 1 },
          duration: 300,
          properties: {}
        });
      });

      expect(() => {
        animationSystem.render(mockContext, 20);
      }).not.toThrow();
    });

    it('should render particles', () => {
      animationSystem.createFoodConsumptionEffect({ x: 3, y: 3 });
      
      expect(() => {
        animationSystem.render(mockContext, 20);
      }).not.toThrow();
      
      expect(mockContext.fillRect).toHaveBeenCalled();
    });
  });

  describe('Utility Functions', () => {
    it('should clear all animations and particles', () => {
      animationSystem.addAnimation({
        type: 'fade',
        position: { x: 1, y: 1 },
        duration: 500,
        properties: {}
      });
      
      animationSystem.createFoodConsumptionEffect({ x: 2, y: 2 });
      
      expect(animationSystem.getActiveAnimationCount()).toBeGreaterThan(0);
      
      animationSystem.clearAll();
      
      expect(animationSystem.getActiveAnimationCount()).toBe(0);
    });

    it('should return active animations for debugging', () => {
      animationSystem.addAnimation({
        type: 'pulse',
        position: { x: 1, y: 1 },
        duration: 300,
        properties: {}
      });

      const activeAnimations = animationSystem.getActiveAnimations();
      expect(activeAnimations).toHaveLength(1);
      expect(activeAnimations[0].type).toBe('pulse');
    });
  });

  describe('Animation Progress', () => {
    it('should calculate animation progress correctly', () => {
      mockPerformanceNow.mockReturnValue(1000);
      
      animationSystem.addAnimation({
        type: 'fade',
        position: { x: 1, y: 1 },
        duration: 400,
        properties: { fadeIn: true, color: { r: 255, g: 0, b: 0 } }
      });

      // At 50% progress
      mockPerformanceNow.mockReturnValue(1200);
      
      expect(() => {
        animationSystem.render(mockContext, 20);
      }).not.toThrow();
      
      // Animation should still be active
      expect(animationSystem.getActiveAnimationCount()).toBe(1);
    });
  });
});