/**
 * Session Manager - Handles game sessions and player profile lifecycle
 * Provides session isolation and cross-session analytics
 */

import { PlayerProfiler } from './PlayerProfiler';
import { GameState } from '../types/GameTypes';

export interface SessionData {
  id: string;
  startTime: number;
  endTime?: number;
  finalScore: number;
  gameTime: number;
  snakeLength: number;
  profileSnapshot: any;
  sessionStats: {
    totalInputs: number;
    averageReactionTime: number;
    errorCount: number;
    foodCollected: number;
    maxStressLevel: number;
    finalSkillLevel: number;
  };
}

export interface SessionSummary {
  totalSessions: number;
  averageScore: number;
  bestScore: number;
  totalPlayTime: number;
  skillProgression: number[];
  performanceTrend: 'improving' | 'stable' | 'declining';
  consistencyRating: number;
}

export class SessionManager {
  private currentSession?: SessionData;
  private sessionHistory: SessionData[] = [];
  private playerProfiler: PlayerProfiler;
  private sessionIdCounter: number = 0;
  private readonly MAX_HISTORY_SIZE = 50; // Keep last 50 sessions

  constructor(playerProfiler: PlayerProfiler) {
    this.playerProfiler = playerProfiler;
  }

  /**
   * Starts a new game session
   */
  public startSession(): string {
    // End current session if exists
    if (this.currentSession && !this.currentSession.endTime) {
      this.endSession({ score: 0, gameTime: 0, snakeLength: 3 });
    }

    // Reset player profiler for new session
    this.playerProfiler.reset();

    // Create new session
    const sessionId = `session_${this.sessionIdCounter++}`;
    this.currentSession = {
      id: sessionId,
      startTime: performance.now(),
      finalScore: 0,
      gameTime: 0,
      snakeLength: 3,
      profileSnapshot: null,
      sessionStats: {
        totalInputs: 0,
        averageReactionTime: 0,
        errorCount: 0,
        foodCollected: 0,
        maxStressLevel: 0,
        finalSkillLevel: 0
      }
    };

    console.log(`Started new session: ${sessionId}`);
    return sessionId;
  }

  /**
   * Ends the current session
   */
  public endSession(finalGameState: { score: number; gameTime: number; snakeLength: number }): void {
    if (!this.currentSession) {
      console.warn('No active session to end');
      return;
    }

    // Finalize session data
    this.currentSession.endTime = performance.now();
    this.currentSession.finalScore = finalGameState.score;
    this.currentSession.gameTime = finalGameState.gameTime;
    this.currentSession.snakeLength = finalGameState.snakeLength;

    // Capture final profile state
    const profileReport = this.playerProfiler.getAnalysisReport();
    this.currentSession.profileSnapshot = profileReport;

    // Calculate session statistics
    this.calculateSessionStats();

    // Add to history
    this.sessionHistory.push({ ...this.currentSession });

    // Maintain history size
    if (this.sessionHistory.length > this.MAX_HISTORY_SIZE) {
      this.sessionHistory.shift();
    }

    console.log(`Ended session: ${this.currentSession.id}`, {
      score: this.currentSession.finalScore,
      duration: this.currentSession.gameTime,
      skillLevel: this.currentSession.sessionStats.finalSkillLevel
    });

    this.currentSession = undefined;
  }

  /**
   * Calculates statistics for the current session
   */
  private calculateSessionStats(): void {
    if (!this.currentSession) return;

    const behaviorMetrics = this.playerProfiler.getBehaviorMetrics();
    const profileReport = this.playerProfiler.getAnalysisReport();

    this.currentSession.sessionStats = {
      totalInputs: behaviorMetrics.inputLatency.length,
      averageReactionTime: this.playerProfiler.averageReactionTime(),
      errorCount: Math.floor(this.playerProfiler.errorFrequency * 10), // Estimate error count
      foodCollected: Math.floor(this.currentSession.finalScore / 10), // Assuming 10 points per food
      maxStressLevel: profileReport.profile.stressLevel,
      finalSkillLevel: profileReport.profile.skillProgression
    };
  }

  /**
   * Updates session with current game state
   */
  public updateSession(gameState: GameState): void {
    if (!this.currentSession) return;

    // Update max stress level if current is higher
    const currentStress = this.playerProfiler.calculateStressLevel();
    if (currentStress > this.currentSession.sessionStats.maxStressLevel) {
      this.currentSession.sessionStats.maxStressLevel = currentStress;
    }

    // Update skill level
    this.currentSession.sessionStats.finalSkillLevel = this.playerProfiler.skillProgression;
  }

  /**
   * Gets current session data
   */
  public getCurrentSession(): SessionData | undefined {
    return this.currentSession ? { ...this.currentSession } : undefined;
  }

  /**
   * Gets session history
   */
  public getSessionHistory(count?: number): SessionData[] {
    const history = [...this.sessionHistory];
    return count ? history.slice(-count) : history;
  }

  /**
   * Gets comprehensive session summary
   */
  public getSessionSummary(): SessionSummary {
    if (this.sessionHistory.length === 0) {
      return {
        totalSessions: 0,
        averageScore: 0,
        bestScore: 0,
        totalPlayTime: 0,
        skillProgression: [],
        performanceTrend: 'stable',
        consistencyRating: 0
      };
    }

    const scores = this.sessionHistory.map(s => s.finalScore);
    const playTimes = this.sessionHistory.map(s => s.gameTime);
    const skillLevels = this.sessionHistory.map(s => s.sessionStats.finalSkillLevel);

    return {
      totalSessions: this.sessionHistory.length,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      bestScore: Math.max(...scores),
      totalPlayTime: playTimes.reduce((a, b) => a + b, 0),
      skillProgression: skillLevels,
      performanceTrend: this.calculatePerformanceTrend(scores),
      consistencyRating: this.calculateConsistencyRating(scores)
    };
  }

  /**
   * Calculates performance trend over recent sessions
   */
  private calculatePerformanceTrend(scores: number[]): 'improving' | 'stable' | 'declining' {
    if (scores.length < 3) return 'stable';

    const recentScores = scores.slice(-5); // Last 5 sessions
    const olderScores = scores.slice(-10, -5); // Previous 5 sessions

    if (olderScores.length === 0) return 'stable';

    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;

    const improvement = (recentAvg - olderAvg) / olderAvg;

    if (improvement > 0.1) return 'improving';
    if (improvement < -0.1) return 'declining';
    return 'stable';
  }

  /**
   * Calculates consistency rating based on score variance
   */
  private calculateConsistencyRating(scores: number[]): number {
    if (scores.length < 2) return 1;

    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    // Normalize consistency (lower variance = higher consistency)
    const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 1;
    return Math.max(0, Math.min(1, 1 - coefficientOfVariation));
  }

  /**
   * Gets performance comparison with previous sessions
   */
  public getPerformanceComparison(): {
    currentVsAverage: number;
    currentVsBest: number;
    improvementRate: number;
    streakInfo: { type: 'improving' | 'declining' | 'stable'; length: number };
  } {
    if (!this.currentSession || this.sessionHistory.length === 0) {
      return {
        currentVsAverage: 0,
        currentVsBest: 0,
        improvementRate: 0,
        streakInfo: { type: 'stable', length: 0 }
      };
    }

    const scores = this.sessionHistory.map(s => s.finalScore);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const bestScore = Math.max(...scores);
    const currentScore = this.currentSession.finalScore;

    return {
      currentVsAverage: averageScore > 0 ? (currentScore - averageScore) / averageScore : 0,
      currentVsBest: bestScore > 0 ? (currentScore - bestScore) / bestScore : 0,
      improvementRate: this.calculateImprovementRate(scores),
      streakInfo: this.calculateStreakInfo(scores)
    };
  }

  /**
   * Calculates improvement rate over time
   */
  private calculateImprovementRate(scores: number[]): number {
    if (scores.length < 2) return 0;

    // Linear regression to find improvement trend
    const n = scores.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = scores;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    return slope; // Positive = improving, negative = declining
  }

  /**
   * Calculates current performance streak
   */
  private calculateStreakInfo(scores: number[]): { type: 'improving' | 'declining' | 'stable'; length: number } {
    if (scores.length < 2) {
      return { type: 'stable', length: 0 };
    }

    let streakLength = 1;
    let streakType: 'improving' | 'declining' | 'stable' = 'stable';

    // Determine initial trend
    const lastScore = scores[scores.length - 1];
    const secondLastScore = scores[scores.length - 2];

    if (lastScore > secondLastScore * 1.05) { // 5% improvement threshold
      streakType = 'improving';
    } else if (lastScore < secondLastScore * 0.95) { // 5% decline threshold
      streakType = 'declining';
    }

    // Count streak length
    for (let i = scores.length - 2; i > 0; i--) {
      const current = scores[i];
      const previous = scores[i - 1];

      let currentTrend: 'improving' | 'declining' | 'stable' = 'stable';
      if (current > previous * 1.05) {
        currentTrend = 'improving';
      } else if (current < previous * 0.95) {
        currentTrend = 'declining';
      }

      if (currentTrend === streakType) {
        streakLength++;
      } else {
        break;
      }
    }

    return { type: streakType, length: streakLength };
  }

  /**
   * Exports session data for external analysis
   */
  public exportSessionData(): {
    summary: SessionSummary;
    sessions: SessionData[];
    currentSession?: SessionData;
  } {
    return {
      summary: this.getSessionSummary(),
      sessions: this.getSessionHistory(),
      currentSession: this.getCurrentSession()
    };
  }

  /**
   * Imports session data (for loading saved progress)
   */
  public importSessionData(data: { sessions: SessionData[] }): void {
    this.sessionHistory = data.sessions.slice(-this.MAX_HISTORY_SIZE);
    this.sessionIdCounter = Math.max(0, ...this.sessionHistory.map(s => 
      parseInt(s.id.replace('session_', '')) || 0
    )) + 1;
    
    console.log(`Imported ${this.sessionHistory.length} sessions`);
  }

  /**
   * Clears all session history
   */
  public clearHistory(): void {
    this.sessionHistory = [];
    this.sessionIdCounter = 0;
    console.log('Session history cleared');
  }

  /**
   * Gets detailed analytics for the last N sessions
   */
  public getDetailedAnalytics(sessionCount: number = 10): any {
    const recentSessions = this.getSessionHistory(sessionCount);
    
    if (recentSessions.length === 0) {
      return { message: 'No session data available' };
    }

    return {
      sessionCount: recentSessions.length,
      scoreAnalysis: {
        average: recentSessions.reduce((sum, s) => sum + s.finalScore, 0) / recentSessions.length,
        median: this.calculateMedian(recentSessions.map(s => s.finalScore)),
        standardDeviation: this.calculateStandardDeviation(recentSessions.map(s => s.finalScore)),
        range: {
          min: Math.min(...recentSessions.map(s => s.finalScore)),
          max: Math.max(...recentSessions.map(s => s.finalScore))
        }
      },
      skillAnalysis: {
        progression: recentSessions.map(s => s.sessionStats.finalSkillLevel),
        averageImprovement: this.calculateImprovementRate(recentSessions.map(s => s.sessionStats.finalSkillLevel)),
        consistency: this.calculateConsistencyRating(recentSessions.map(s => s.sessionStats.finalSkillLevel))
      },
      behaviorAnalysis: {
        averageReactionTime: recentSessions.reduce((sum, s) => sum + s.sessionStats.averageReactionTime, 0) / recentSessions.length,
        stressLevels: recentSessions.map(s => s.sessionStats.maxStressLevel),
        inputFrequency: recentSessions.map(s => s.sessionStats.totalInputs / (s.gameTime / 1000))
      }
    };
  }

  private calculateMedian(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  private calculateStandardDeviation(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
    return Math.sqrt(variance);
  }
}