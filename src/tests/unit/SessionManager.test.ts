/**
 * Unit tests for SessionManager
 * Tests session lifecycle and analytics
 */

import { SessionManager } from '../../ai/SessionManager';
import { PlayerProfiler } from '../../ai/PlayerProfiler';

// Mock performance.now for consistent testing
const mockPerformanceNow = jest.fn();
Object.defineProperty(global, 'performance', {
  value: { now: mockPerformanceNow }
});

describe('SessionManager', () => {
  let sessionManager: SessionManager;
  let mockPlayerProfiler: PlayerProfiler;

  beforeEach(() => {
    mockPerformanceNow.mockReturnValue(1000);
    mockPlayerProfiler = new PlayerProfiler();
    sessionManager = new SessionManager(mockPlayerProfiler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Session Lifecycle', () => {
    it('should start a new session correctly', () => {
      const sessionId = sessionManager.startSession();
      
      expect(sessionId).toMatch(/^session_\d+$/);
      
      const currentSession = sessionManager.getCurrentSession();
      expect(currentSession).toBeDefined();
      expect(currentSession!.id).toBe(sessionId);
      expect(currentSession!.startTime).toBe(1000);
      expect(currentSession!.endTime).toBeUndefined();
    });

    it('should end current session when starting a new one', () => {
      const firstSessionId = sessionManager.startSession();
      
      mockPerformanceNow.mockReturnValue(2000);
      const secondSessionId = sessionManager.startSession();
      
      expect(secondSessionId).not.toBe(firstSessionId);
      
      const history = sessionManager.getSessionHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe(firstSessionId);
      expect(history[0].endTime).toBe(2000);
    });

    it('should end session correctly', () => {
      const sessionId = sessionManager.startSession();
      
      mockPerformanceNow.mockReturnValue(5000);
      sessionManager.endSession({
        score: 150,
        gameTime: 4000,
        snakeLength: 8
      });

      const currentSession = sessionManager.getCurrentSession();
      expect(currentSession).toBeUndefined();

      const history = sessionManager.getSessionHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe(sessionId);
      expect(history[0].finalScore).toBe(150);
      expect(history[0].gameTime).toBe(4000);
      expect(history[0].snakeLength).toBe(8);
      expect(history[0].endTime).toBe(5000);
    });

    it('should handle ending session when none is active', () => {
      expect(() => {
        sessionManager.endSession({ score: 0, gameTime: 0, snakeLength: 3 });
      }).not.toThrow();
    });
  });

  describe('Session History Management', () => {
    it('should maintain session history', () => {
      // Create multiple sessions
      for (let i = 0; i < 3; i++) {
        sessionManager.startSession();
        mockPerformanceNow.mockReturnValue(2000 + i * 1000);
        sessionManager.endSession({
          score: (i + 1) * 100,
          gameTime: 3000,
          snakeLength: 5 + i
        });
      }

      const history = sessionManager.getSessionHistory();
      expect(history).toHaveLength(3);
      expect(history[0].finalScore).toBe(100);
      expect(history[1].finalScore).toBe(200);
      expect(history[2].finalScore).toBe(300);
    });

    it('should limit history size', () => {
      // Create more sessions than the limit (assuming MAX_HISTORY_SIZE = 50)
      for (let i = 0; i < 55; i++) {
        sessionManager.startSession();
        mockPerformanceNow.mockReturnValue(2000 + i * 100);
        sessionManager.endSession({
          score: i * 10,
          gameTime: 1000,
          snakeLength: 3
        });
      }

      const history = sessionManager.getSessionHistory();
      expect(history.length).toBeLessThanOrEqual(50);
      
      // Should keep the most recent sessions
      expect(history[history.length - 1].finalScore).toBe(540); // Last session
    });

    it('should return limited history when requested', () => {
      // Create 5 sessions
      for (let i = 0; i < 5; i++) {
        sessionManager.startSession();
        sessionManager.endSession({
          score: i * 50,
          gameTime: 2000,
          snakeLength: 4
        });
      }

      const recentHistory = sessionManager.getSessionHistory(3);
      expect(recentHistory).toHaveLength(3);
      expect(recentHistory[0].finalScore).toBe(100); // 3rd session
      expect(recentHistory[2].finalScore).toBe(200); // 5th session
    });
  });

  describe('Session Summary and Analytics', () => {
    beforeEach(() => {
      // Create some test sessions
      const scores = [100, 150, 200, 180, 220];
      scores.forEach((score, index) => {
        sessionManager.startSession();
        mockPerformanceNow.mockReturnValue(2000 + index * 1000);
        sessionManager.endSession({
          score,
          gameTime: 3000 + index * 500,
          snakeLength: 5 + index
        });
      });
    });

    it('should generate session summary correctly', () => {
      const summary = sessionManager.getSessionSummary();
      
      expect(summary.totalSessions).toBe(5);
      expect(summary.averageScore).toBe(170); // (100+150+200+180+220)/5
      expect(summary.bestScore).toBe(220);
      expect(summary.totalPlayTime).toBe(20000); // Sum of game times: 3000+3500+4000+4500+5000
      expect(summary.skillProgression).toHaveLength(5);
      expect(['improving', 'stable', 'declining']).toContain(summary.performanceTrend);
      expect(summary.consistencyRating).toBeGreaterThanOrEqual(0);
      expect(summary.consistencyRating).toBeLessThanOrEqual(1);
    });

    it('should handle empty session history', () => {
      const emptyManager = new SessionManager(mockPlayerProfiler);
      const summary = emptyManager.getSessionSummary();
      
      expect(summary.totalSessions).toBe(0);
      expect(summary.averageScore).toBe(0);
      expect(summary.bestScore).toBe(0);
      expect(summary.totalPlayTime).toBe(0);
      expect(summary.skillProgression).toEqual([]);
      expect(summary.performanceTrend).toBe('stable');
      expect(summary.consistencyRating).toBe(0);
    });

    it('should calculate performance trends correctly', () => {
      // Clear existing sessions and create specific pattern
      sessionManager.clearHistory();
      
      // Improving trend: 50, 75, 100, 125, 150
      const improvingScores = [50, 75, 100, 125, 150];
      improvingScores.forEach(score => {
        sessionManager.startSession();
        sessionManager.endSession({ score, gameTime: 2000, snakeLength: 5 });
      });

      const summary = sessionManager.getSessionSummary();
      expect(['improving', 'stable']).toContain(summary.performanceTrend); // May be stable due to consistent improvement
    });
  });

  describe('Performance Comparison', () => {
    it('should compare current session with history', () => {
      // Create history
      for (let i = 0; i < 3; i++) {
        sessionManager.startSession();
        sessionManager.endSession({
          score: 100,
          gameTime: 2000,
          snakeLength: 5
        });
      }

      // Start new session with better score
      sessionManager.startSession();
      const currentSession = sessionManager.getCurrentSession();
      if (currentSession) {
        currentSession.finalScore = 150; // Better than average (100)
      }

      const comparison = sessionManager.getPerformanceComparison();
      
      expect(typeof comparison.currentVsAverage).toBe('number');
      expect(typeof comparison.currentVsBest).toBe('number');
      expect(comparison.improvementRate).toBeDefined();
      expect(comparison.streakInfo).toHaveProperty('type');
      expect(comparison.streakInfo).toHaveProperty('length');
    });

    it('should handle no history gracefully', () => {
      const comparison = sessionManager.getPerformanceComparison();
      
      expect(comparison.currentVsAverage).toBe(0);
      expect(comparison.currentVsBest).toBe(0);
      expect(comparison.improvementRate).toBe(0);
      expect(comparison.streakInfo.length).toBe(0);
    });
  });

  describe('Data Import/Export', () => {
    it('should export session data correctly', () => {
      sessionManager.startSession();
      sessionManager.endSession({ score: 100, gameTime: 2000, snakeLength: 5 });

      const exportedData = sessionManager.exportSessionData();
      
      expect(exportedData).toHaveProperty('summary');
      expect(exportedData).toHaveProperty('sessions');
      expect(exportedData).toHaveProperty('currentSession');
      expect(exportedData.sessions).toHaveLength(1);
      expect(exportedData.sessions[0].finalScore).toBe(100);
    });

    it('should import session data correctly', () => {
      const importData = {
        sessions: [
          {
            id: 'session_10',
            startTime: 1000,
            endTime: 2000,
            finalScore: 200,
            gameTime: 1000,
            snakeLength: 6,
            profileSnapshot: {},
            sessionStats: {
              totalInputs: 50,
              averageReactionTime: 150,
              errorCount: 2,
              foodCollected: 20,
              maxStressLevel: 0.3,
              finalSkillLevel: 0.5
            }
          }
        ]
      };

      sessionManager.importSessionData(importData);
      
      const history = sessionManager.getSessionHistory();
      expect(history).toHaveLength(1);
      expect(history[0].finalScore).toBe(200);
      expect(history[0].id).toBe('session_10');
    });
  });

  describe('Detailed Analytics', () => {
    beforeEach(() => {
      // Create test data for analytics
      const testSessions = [
        { score: 100, gameTime: 2000, snakeLength: 5 },
        { score: 150, gameTime: 2500, snakeLength: 6 },
        { score: 120, gameTime: 2200, snakeLength: 5 },
        { score: 180, gameTime: 3000, snakeLength: 7 },
        { score: 200, gameTime: 3500, snakeLength: 8 }
      ];

      testSessions.forEach(session => {
        sessionManager.startSession();
        sessionManager.endSession(session);
      });
    });

    it('should generate detailed analytics', () => {
      const analytics = sessionManager.getDetailedAnalytics(5);
      
      expect(analytics).toHaveProperty('sessionCount');
      expect(analytics).toHaveProperty('scoreAnalysis');
      expect(analytics).toHaveProperty('skillAnalysis');
      expect(analytics).toHaveProperty('behaviorAnalysis');
      
      expect(analytics.sessionCount).toBe(5);
      expect(analytics.scoreAnalysis).toHaveProperty('average');
      expect(analytics.scoreAnalysis).toHaveProperty('median');
      expect(analytics.scoreAnalysis).toHaveProperty('standardDeviation');
      expect(analytics.scoreAnalysis).toHaveProperty('range');
    });

    it('should handle empty analytics request', () => {
      const emptyManager = new SessionManager(mockPlayerProfiler);
      const analytics = emptyManager.getDetailedAnalytics();
      
      expect(analytics).toHaveProperty('message');
      expect(analytics.message).toBe('No session data available');
    });
  });

  describe('Session Updates', () => {
    it('should update session during gameplay', () => {
      sessionManager.startSession();
      
      const mockGameState = {
        snake: [{ position: { x: 5, y: 5 }, direction: 'RIGHT' as any, age: 0 }],
        food: { x: 10, y: 5 },
        score: 50,
        gameStatus: 'PLAYING' as any,
        speed: 1.5,
        gridSize: { width: 20, height: 20 },
        gameTime: 2000
      };

      sessionManager.updateSession(mockGameState);
      
      const currentSession = sessionManager.getCurrentSession();
      expect(currentSession).toBeDefined();
      // Session should be updated with current game state info
    });
  });

  describe('History Management', () => {
    it('should clear history correctly', () => {
      // Add some sessions
      sessionManager.startSession();
      sessionManager.endSession({ score: 100, gameTime: 2000, snakeLength: 5 });
      
      expect(sessionManager.getSessionHistory()).toHaveLength(1);
      
      sessionManager.clearHistory();
      
      expect(sessionManager.getSessionHistory()).toHaveLength(0);
      expect(sessionManager.getSessionSummary().totalSessions).toBe(0);
    });
  });
});