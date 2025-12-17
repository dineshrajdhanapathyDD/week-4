/**
 * Player Profiler - Tracks and analyzes player behavior patterns
 * Provides comprehensive behavioral analysis for AI decision making
 */
import { GameState, Direction, PlayerInput } from '../types/GameTypes';
import { PlayerProfile, PlayerBehaviorMetrics } from '../types/AITypes';
export declare class PlayerProfiler implements PlayerProfile {
    reactionTimes: number[];
    errorFrequency: number;
    riskTolerance: number;
    skillProgression: number;
    sessionStartTime: number;
    private behaviorMetrics;
    private movementHistory;
    private collisionHistory;
    private foodCollectionHistory;
    private decisionPoints;
    private readonly MAX_HISTORY_SIZE;
    private readonly REACTION_TIME_WINDOW;
    private readonly RISK_ANALYSIS_WINDOW;
    constructor();
    /**
     * Records a player input with timing analysis
     */
    recordInput(playerInput: PlayerInput, gameState: GameState): void;
    /**
     * Records a collision event
     */
    recordCollision(collisionType: string, position: any, gameState: GameState): void;
    /**
     * Records food collection event
     */
    recordFoodCollection(gameState: GameState, timeTaken: number): void;
    /**
     * Calculates average reaction time
     */
    averageReactionTime(): number;
    /**
     * Calculates current stress level based on various factors
     */
    calculateStressLevel(): number;
    /**
     * Predicts probable next moves based on movement patterns
     */
    predictNextMove(gameState: GameState): Direction[];
    /**
     * Analyzes decision risk based on game context
     */
    private analyzeDecisionRisk;
    /**
     * Calculates risk level of a direction choice
     */
    private calculateDirectionRisk;
    /**
     * Updates risk tolerance based on player choices
     */
    private updateRiskTolerance;
    /**
     * Updates skill progression based on performance
     */
    private updateSkillProgression;
    /**
     * Calculates error frequency over recent gameplay
     */
    private calculateErrorFrequency;
    /**
     * Calculates food collection efficiency
     */
    private calculateFoodCollectionEfficiency;
    /**
     * Calculates average efficiency from history
     */
    private calculateAverageEfficiency;
    /**
     * Identifies movement patterns in recent history
     */
    private identifyMovementPatterns;
    /**
     * Analyzes contextually appropriate moves
     */
    private analyzeContextualMoves;
    /**
     * Combines pattern-based and contextual predictions
     */
    private combinePredictions;
    /**
     * Helper methods for game analysis
     */
    private getAvailableMoves;
    private getNextPosition;
    private isValidPosition;
    private getDistanceToWall;
    private getDistanceToSnakeBody;
    private countEscapeRoutes;
    /**
     * Gets comprehensive behavior metrics
     */
    getBehaviorMetrics(): PlayerBehaviorMetrics;
    /**
     * Resets profile for new session
     */
    reset(): void;
    /**
     * Gets detailed analysis report
     */
    getAnalysisReport(): any;
    private getPreferredDirections;
    private getRiskPatterns;
    private calculateRiskConsistency;
    private getEfficiencyTrend;
}
//# sourceMappingURL=PlayerProfiler.d.ts.map