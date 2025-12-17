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
export declare class SessionManager {
    private currentSession?;
    private sessionHistory;
    private playerProfiler;
    private sessionIdCounter;
    private readonly MAX_HISTORY_SIZE;
    constructor(playerProfiler: PlayerProfiler);
    /**
     * Starts a new game session
     */
    startSession(): string;
    /**
     * Ends the current session
     */
    endSession(finalGameState: {
        score: number;
        gameTime: number;
        snakeLength: number;
    }): void;
    /**
     * Calculates statistics for the current session
     */
    private calculateSessionStats;
    /**
     * Updates session with current game state
     */
    updateSession(gameState: GameState): void;
    /**
     * Gets current session data
     */
    getCurrentSession(): SessionData | undefined;
    /**
     * Gets session history
     */
    getSessionHistory(count?: number): SessionData[];
    /**
     * Gets comprehensive session summary
     */
    getSessionSummary(): SessionSummary;
    /**
     * Calculates performance trend over recent sessions
     */
    private calculatePerformanceTrend;
    /**
     * Calculates consistency rating based on score variance
     */
    private calculateConsistencyRating;
    /**
     * Gets performance comparison with previous sessions
     */
    getPerformanceComparison(): {
        currentVsAverage: number;
        currentVsBest: number;
        improvementRate: number;
        streakInfo: {
            type: 'improving' | 'declining' | 'stable';
            length: number;
        };
    };
    /**
     * Calculates improvement rate over time
     */
    private calculateImprovementRate;
    /**
     * Calculates current performance streak
     */
    private calculateStreakInfo;
    /**
     * Exports session data for external analysis
     */
    exportSessionData(): {
        summary: SessionSummary;
        sessions: SessionData[];
        currentSession?: SessionData;
    };
    /**
     * Imports session data (for loading saved progress)
     */
    importSessionData(data: {
        sessions: SessionData[];
    }): void;
    /**
     * Clears all session history
     */
    clearHistory(): void;
    /**
     * Gets detailed analytics for the last N sessions
     */
    getDetailedAnalytics(sessionCount?: number): any;
    private calculateMedian;
    private calculateStandardDeviation;
}
//# sourceMappingURL=SessionManager.d.ts.map