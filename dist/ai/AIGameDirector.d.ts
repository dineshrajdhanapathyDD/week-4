/**
 * AI Game Director - The intelligent system that adapts gameplay in real-time
 * Monitors player behavior and makes strategic adjustments to maintain optimal challenge
 */
import { GameState, PlayerInput, Position } from '../types/GameTypes';
import { AIGameDirector as IAIGameDirector, AIDecision, PlayerProfile } from '../types/AITypes';
import { PlayerProfiler } from './PlayerProfiler';
export interface AIConfiguration {
    adaptationSensitivity: number;
    maxSpeedIncrease: number;
    minSpeedDecrease: number;
    recoveryThreshold: number;
    masteryThreshold: number;
    explanationVerbosity: 'minimal' | 'detailed' | 'verbose';
}
export declare class AIGameDirector implements IAIGameDirector {
    private playerProfiler;
    private decisionHistory;
    private configuration;
    private lastAnalysisTime;
    private readonly ANALYSIS_INTERVAL;
    private readonly MAX_DECISION_HISTORY;
    private currentDifficultyLevel;
    private recoveryModeActive;
    private lastSpeedAdjustment;
    private consecutiveGoodPerformance;
    private consecutivePoorPerformance;
    constructor(playerProfiler: PlayerProfiler, config?: Partial<AIConfiguration>);
    /**
     * Analyzes player behavior and updates internal models
     */
    analyzePlayerBehavior(gameState: GameState, playerInput: PlayerInput): void;
    /**
     * Performs comprehensive behavior analysis
     */
    private performBehaviorAnalysis;
    /**
     * Calculates current game statistics
     */
    private calculateGameStats;
    /**
     * Assesses overall player performance
     */
    private assessPerformance;
    /**
     * Assesses current risk level
     */
    private assessRiskLevel;
    /**
     * Assesses performance trend over recent decisions
     */
    private assessPerformanceTrend;
    /**
     * Makes adaptation decisions based on analysis
     */
    private makeAdaptationDecisions;
    /**
     * Evaluates whether recovery mode should be activated
     */
    private evaluateRecoveryMode;
    /**
     * Evaluates speed adjustment needs
     */
    private evaluateSpeedAdjustment;
    /**
     * Updates overall difficulty level
     */
    private updateDifficultyLevel;
    /**
     * Updates performance streak counters
     */
    private updatePerformanceStreaks;
    /**
     * Calculates optimal food placement based on AI strategy
     */
    calculateOptimalFoodPlacement(gameState: GameState): Position;
    /**
     * Validates game state for AI processing
     */
    private validateGameState;
    /**
     * Validates food position
     */
    private validateFoodPosition;
    /**
     * Provides fallback food position when AI fails
     */
    private getFallbackFoodPosition;
    /**
     * Adjusts game speed based on player profile and AI strategy
     */
    adjustGameSpeed(currentSpeed: number, playerProfile: PlayerProfile): number;
    /**
     * Validates speed input parameters
     */
    private validateSpeedInput;
    /**
     * Validates and clamps speed to safe bounds
     */
    private validateAndClampSpeed;
    /**
     * Determines if recovery mechanic should be triggered
     */
    shouldTriggerRecoveryMechanic(playerProfile: PlayerProfile): boolean;
    /**
     * Logs an AI decision with comprehensive context
     */
    logDecision(decision: string, reasoning: string): void;
    /**
     * Categorizes decision type for logging
     */
    private categorizeDecision;
    /**
     * Gets decision history for analysis
     */
    getDecisionHistory(): AIDecision[];
    /**
     * Updates decision context with current game state
     */
    updateDecisionContext(gameState: GameState): void;
    /**
     * Gets current AI status for UI display
     */
    getAIStatus(): {
        mode: string;
        difficultyLevel: number;
        recoveryActive: boolean;
        recentDecisions: string[];
        performanceAssessment: string;
    };
    /**
     * Provides strategic advice for food placement
     */
    getStrategicAdvice(gameState: GameState): {
        recommendedAction: string;
        reasoning: string;
        confidence: number;
    };
    /**
     * Resets AI state for new game session
     */
    reset(): void;
    /**
     * Gets comprehensive AI analytics
     */
    getAnalytics(): any;
    /**
     * Updates AI configuration with validation
     */
    updateConfiguration(newConfig: Partial<AIConfiguration>): void;
    /**
     * Validates AI configuration parameters
     */
    private validateConfiguration;
    /**
     * Gets deterministic core validation status
     */
    validateDeterministicCore(gameState: GameState, expectedState: GameState): {
        isValid: boolean;
        differences: string[];
    };
}
//# sourceMappingURL=AIGameDirector.d.ts.map