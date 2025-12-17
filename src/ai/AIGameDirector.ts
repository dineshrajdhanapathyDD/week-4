/**
 * AI Game Director - The intelligent system that adapts gameplay in real-time
 * Monitors player behavior and makes strategic adjustments to maintain optimal challenge
 */

import { GameState, Direction, PlayerInput, Position } from '../types/GameTypes';
import { AIGameDirector as IAIGameDirector, AIDecision, PlayerProfile } from '../types/AITypes';
import { PlayerProfiler } from './PlayerProfiler';
import { FoodManager } from '../engine/FoodManager';
import { CollisionDetector } from '../engine/CollisionDetector';

export interface AIConfiguration {
  adaptationSensitivity: number; // 0-1, how quickly AI adapts
  maxSpeedIncrease: number; // Maximum speed multiplier
  minSpeedDecrease: number; // Minimum speed multiplier
  recoveryThreshold: number; // Stress level that triggers recovery
  masteryThreshold: number; // Skill level that triggers increased difficulty
  explanationVerbosity: 'minimal' | 'detailed' | 'verbose';
}

export class AIGameDirector implements IAIGameDirector {
  private playerProfiler: PlayerProfiler;
  private decisionHistory: AIDecision[] = [];
  private configuration: AIConfiguration;
  private lastAnalysisTime: number = 0;
  private readonly ANALYSIS_INTERVAL = 1000; // Analyze every 1 second
  private readonly MAX_DECISION_HISTORY = 100;

  // AI state tracking
  private currentDifficultyLevel: number = 1.0;
  private recoveryModeActive: boolean = false;
  private lastSpeedAdjustment: number = 0;
  private consecutiveGoodPerformance: number = 0;
  private consecutivePoorPerformance: number = 0;

  constructor(playerProfiler: PlayerProfiler, config?: Partial<AIConfiguration>) {
    this.playerProfiler = playerProfiler;
    this.configuration = {
      adaptationSensitivity: 0.7,
      maxSpeedIncrease: 3.0,
      minSpeedDecrease: 0.3,
      recoveryThreshold: 0.6,
      masteryThreshold: 0.7,
      explanationVerbosity: 'detailed',
      ...config
    };
  }

  /**
   * Analyzes player behavior and updates internal models
   */
  public analyzePlayerBehavior(gameState: GameState, playerInput: PlayerInput): void {
    const currentTime = performance.now();
    
    // Only analyze at specified intervals to avoid performance impact
    if (currentTime - this.lastAnalysisTime < this.ANALYSIS_INTERVAL) {
      return;
    }

    // Record input in player profiler
    this.playerProfiler.recordInput(playerInput, gameState);

    // Perform comprehensive analysis
    const analysis = this.performBehaviorAnalysis(gameState);
    
    // Make AI decisions based on analysis
    this.makeAdaptationDecisions(gameState, analysis);
    
    this.lastAnalysisTime = currentTime;
  }

  /**
   * Performs comprehensive behavior analysis
   */
  private performBehaviorAnalysis(gameState: GameState): any {
    const profileReport = this.playerProfiler.getAnalysisReport();
    const gameStats = this.calculateGameStats(gameState);
    
    return {
      profile: profileReport.profile,
      gameStats,
      performance: this.assessPerformance(gameState, profileReport),
      risk: this.assessRiskLevel(gameState),
      trend: this.assessPerformanceTrend()
    };
  }

  /**
   * Calculates current game statistics
   */
  private calculateGameStats(gameState: GameState): any {
    const dangerLevel = CollisionDetector.assessDangerLevel(gameState);
    const foodStats = FoodManager.getFoodPlacementStats(gameState);
    
    return {
      score: gameState.score,
      snakeLength: gameState.snake.length,
      gameTime: gameState.gameTime,
      currentSpeed: gameState.speed,
      dangerLevel,
      availableSpace: foodStats.totalValidPositions,
      foodDistance: CollisionDetector.calculateDistance(
        gameState.snake[0].position, 
        gameState.food
      )
    };
  }

  /**
   * Assesses overall player performance
   */
  private assessPerformance(gameState: GameState, profileReport: any): any {
    const scorePerMinute = gameState.gameTime > 0 ? 
      (gameState.score / (gameState.gameTime / 60000)) : 0;
    
    const efficiencyScore = profileReport.profile.skillProgression;
    const consistencyScore = 1 - profileReport.profile.errorFrequency;
    
    return {
      scoreRate: scorePerMinute,
      efficiency: efficiencyScore,
      consistency: consistencyScore,
      overall: (scorePerMinute * 0.4 + efficiencyScore * 0.4 + consistencyScore * 0.2) / 100
    };
  }

  /**
   * Assesses current risk level
   */
  private assessRiskLevel(gameState: GameState): number {
    const dangerLevel = CollisionDetector.assessDangerLevel(gameState);
    const stressLevel = this.playerProfiler.calculateStressLevel();
    const errorFrequency = this.playerProfiler.errorFrequency;
    
    return Math.min(1, (dangerLevel * 0.5 + stressLevel * 0.3 + errorFrequency * 0.2));
  }

  /**
   * Assesses performance trend over recent decisions
   */
  private assessPerformanceTrend(): 'improving' | 'stable' | 'declining' {
    const recentDecisions = this.decisionHistory.slice(-10);
    
    if (recentDecisions.length < 3) return 'stable';
    
    const recentPerformance = recentDecisions.slice(-3).map(d => d.playerMetrics.skillLevel);
    const olderPerformance = recentDecisions.slice(-6, -3).map(d => d.playerMetrics.skillLevel);
    
    if (olderPerformance.length === 0) return 'stable';
    
    const recentAvg = recentPerformance.reduce((a, b) => a + b, 0) / recentPerformance.length;
    const olderAvg = olderPerformance.reduce((a, b) => a + b, 0) / olderPerformance.length;
    
    const improvement = (recentAvg - olderAvg) / Math.max(0.1, olderAvg);
    
    if (improvement > 0.1) return 'improving';
    if (improvement < -0.1) return 'declining';
    return 'stable';
  }

  /**
   * Makes adaptation decisions based on analysis
   */
  private makeAdaptationDecisions(gameState: GameState, analysis: any): void {
    // Check if recovery mode should be activated
    this.evaluateRecoveryMode(analysis);
    
    // Adjust game speed based on performance
    this.evaluateSpeedAdjustment(gameState, analysis);
    
    // Update difficulty level
    this.updateDifficultyLevel(analysis);
    
    // Track performance streaks
    this.updatePerformanceStreaks(analysis);
  }

  /**
   * Evaluates whether recovery mode should be activated
   */
  private evaluateRecoveryMode(analysis: any): void {
    const shouldActivateRecovery = analysis.risk > this.configuration.recoveryThreshold ||
                                  analysis.profile.stressLevel > 0.7 ||
                                  this.consecutivePoorPerformance >= 3;

    if (shouldActivateRecovery && !this.recoveryModeActive) {
      this.recoveryModeActive = true;
      this.logDecision(
        'Recovery mode activated',
        `High risk (${analysis.risk.toFixed(2)}) or stress (${analysis.profile.stressLevel.toFixed(2)}) detected`
      );
    } else if (!shouldActivateRecovery && this.recoveryModeActive) {
      this.recoveryModeActive = false;
      this.logDecision(
        'Recovery mode deactivated',
        'Player performance stabilized'
      );
    }
  }

  /**
   * Evaluates speed adjustment needs
   */
  private evaluateSpeedAdjustment(gameState: GameState, analysis: any): void {
    const currentSpeed = gameState.speed;
    let targetSpeed = currentSpeed;
    let reasoning = '';

    // Increase speed for good performance
    if (analysis.performance.overall > this.configuration.masteryThreshold && 
        analysis.trend === 'improving' &&
        !this.recoveryModeActive) {
      
      targetSpeed = Math.min(
        this.configuration.maxSpeedIncrease,
        currentSpeed + (this.configuration.adaptationSensitivity * 0.2)
      );
      reasoning = `Performance mastery detected (${analysis.performance.overall.toFixed(2)}) - increasing challenge`;
    }
    
    // Decrease speed for poor performance or recovery mode
    else if (this.recoveryModeActive || 
             analysis.performance.overall < 0.3 ||
             analysis.trend === 'declining') {
      
      targetSpeed = Math.max(
        this.configuration.minSpeedDecrease,
        currentSpeed - (this.configuration.adaptationSensitivity * 0.15)
      );
      reasoning = `Performance issues detected - reducing speed for recovery`;
    }

    // Apply speed change if significant enough
    if (Math.abs(targetSpeed - currentSpeed) > 0.1) {
      this.lastSpeedAdjustment = targetSpeed;
      this.logDecision(
        `Speed adjusted to ${targetSpeed.toFixed(2)}`,
        reasoning
      );
    }
  }

  /**
   * Updates overall difficulty level
   */
  private updateDifficultyLevel(analysis: any): void {
    const performanceScore = analysis.performance.overall;
    const targetDifficulty = this.recoveryModeActive ? 
      Math.max(0.5, this.currentDifficultyLevel - 0.2) :
      Math.min(2.0, 0.5 + performanceScore * 1.5);

    if (Math.abs(targetDifficulty - this.currentDifficultyLevel) > 0.1) {
      this.currentDifficultyLevel = targetDifficulty;
      this.logDecision(
        `Difficulty level adjusted to ${targetDifficulty.toFixed(2)}`,
        `Based on performance score: ${performanceScore.toFixed(2)}`
      );
    }
  }

  /**
   * Updates performance streak counters
   */
  private updatePerformanceStreaks(analysis: any): void {
    const isGoodPerformance = analysis.performance.overall > 0.6 && analysis.risk < 0.4;
    const isPoorPerformance = analysis.performance.overall < 0.3 || analysis.risk > 0.7;

    if (isGoodPerformance) {
      this.consecutiveGoodPerformance++;
      this.consecutivePoorPerformance = 0;
    } else if (isPoorPerformance) {
      this.consecutivePoorPerformance++;
      this.consecutiveGoodPerformance = 0;
    } else {
      // Neutral performance - decay streaks
      this.consecutiveGoodPerformance = Math.max(0, this.consecutiveGoodPerformance - 1);
      this.consecutivePoorPerformance = Math.max(0, this.consecutivePoorPerformance - 1);
    }
  }

  /**
   * Calculates optimal food placement based on AI strategy
   */
  public calculateOptimalFoodPlacement(gameState: GameState): Position {
    try {
      // Validate game state
      if (!this.validateGameState(gameState)) {
        console.warn('Invalid game state, using fallback food placement');
        return this.getFallbackFoodPosition(gameState);
      }

      const suggestion = FoodManager.suggestFoodPlacement(gameState);
      
      // Apply AI modifications based on current strategy
      let finalDifficulty = suggestion.difficulty;
      let reasoning = suggestion.reasoning;

      if (this.recoveryModeActive) {
        finalDifficulty = 'easy';
        reasoning = 'Recovery mode active - providing easier food placement';
      } else if (this.consecutiveGoodPerformance >= 5) {
        finalDifficulty = 'hard';
        reasoning = `Consecutive good performance (${this.consecutiveGoodPerformance}) - increasing challenge`;
      } else if (this.currentDifficultyLevel > 1.5) {
        finalDifficulty = 'hard';
        reasoning = `High difficulty level (${this.currentDifficultyLevel.toFixed(2)}) - maintaining challenge`;
      }

      const position = FoodManager.generateOptimalFoodPosition(gameState, finalDifficulty);
      
      // Validate the generated position
      if (!this.validateFoodPosition(position, gameState)) {
        console.warn('Invalid AI food position, using fallback');
        return this.getFallbackFoodPosition(gameState);
      }
      
      this.logDecision(
        `Food placed at (${position.x}, ${position.y}) with ${finalDifficulty} difficulty`,
        reasoning
      );

      return position;
    } catch (error) {
      console.error('AI food placement error, using fallback:', error);
      return this.getFallbackFoodPosition(gameState);
    }
  }

  /**
   * Validates game state for AI processing
   */
  private validateGameState(gameState: GameState): boolean {
    return gameState &&
           gameState.snake &&
           Array.isArray(gameState.snake) &&
           gameState.snake.length > 0 &&
           gameState.gridSize &&
           typeof gameState.gridSize.width === 'number' &&
           typeof gameState.gridSize.height === 'number' &&
           gameState.gridSize.width > 0 &&
           gameState.gridSize.height > 0;
  }

  /**
   * Validates food position
   */
  private validateFoodPosition(position: Position, gameState: GameState): boolean {
    return position &&
           typeof position.x === 'number' &&
           typeof position.y === 'number' &&
           position.x >= 0 &&
           position.y >= 0 &&
           position.x < gameState.gridSize.width &&
           position.y < gameState.gridSize.height &&
           !gameState.snake.some(segment => 
             segment.position.x === position.x && segment.position.y === position.y
           );
  }

  /**
   * Provides fallback food position when AI fails
   */
  private getFallbackFoodPosition(gameState: GameState): Position {
    // Simple deterministic fallback - place food in center if possible
    const centerX = Math.floor(gameState.gridSize.width / 2);
    const centerY = Math.floor(gameState.gridSize.height / 2);
    
    const centerPos = { x: centerX, y: centerY };
    if (this.validateFoodPosition(centerPos, gameState)) {
      return centerPos;
    }
    
    // If center is occupied, find first valid position
    for (let y = 0; y < gameState.gridSize.height; y++) {
      for (let x = 0; x < gameState.gridSize.width; x++) {
        const pos = { x, y };
        if (this.validateFoodPosition(pos, gameState)) {
          return pos;
        }
      }
    }
    
    // Last resort - return a position (game will handle collision)
    return { x: 0, y: 0 };
  }

  /**
   * Adjusts game speed based on player profile and AI strategy
   */
  public adjustGameSpeed(currentSpeed: number, playerProfile: PlayerProfile): number {
    // Validate input parameters
    if (!this.validateSpeedInput(currentSpeed)) {
      console.warn('Invalid speed input, using fallback');
      return Math.max(0.5, Math.min(3.0, currentSpeed || 1.0));
    }

    // Use the last calculated speed adjustment
    if (this.lastSpeedAdjustment > 0) {
      const adjustedSpeed = this.validateAndClampSpeed(this.lastSpeedAdjustment);
      this.lastSpeedAdjustment = 0; // Reset after use
      return adjustedSpeed;
    }

    // Gradual adjustment based on reaction time
    const avgReactionTime = playerProfile.averageReactionTime();
    const stressLevel = playerProfile.calculateStressLevel();
    
    let speedMultiplier = 1.0;

    // Fast reactions = can handle higher speed
    if (avgReactionTime > 0 && avgReactionTime < 150 && stressLevel < 0.5) {
      speedMultiplier = 1.1;
    }
    // Slow reactions = need lower speed
    else if (avgReactionTime > 300 || stressLevel > 0.7) {
      speedMultiplier = 0.9;
    }

    const newSpeed = this.validateAndClampSpeed(currentSpeed * speedMultiplier);

    if (Math.abs(newSpeed - currentSpeed) > 0.05) {
      this.logDecision(
        `Speed adjusted from ${currentSpeed.toFixed(2)} to ${newSpeed.toFixed(2)}`,
        `Reaction time: ${avgReactionTime.toFixed(0)}ms, Stress: ${stressLevel.toFixed(2)}`
      );
    }

    return newSpeed;
  }

  /**
   * Validates speed input parameters
   */
  private validateSpeedInput(speed: number): boolean {
    return typeof speed === 'number' && 
           !isNaN(speed) && 
           isFinite(speed) && 
           speed > 0;
  }

  /**
   * Validates and clamps speed to safe bounds
   */
  private validateAndClampSpeed(speed: number): number {
    if (!this.validateSpeedInput(speed)) {
      return 1.0; // Safe fallback
    }

    return Math.max(
      this.configuration.minSpeedDecrease,
      Math.min(this.configuration.maxSpeedIncrease, speed)
    );
  }

  /**
   * Determines if recovery mechanic should be triggered
   */
  public shouldTriggerRecoveryMechanic(playerProfile: PlayerProfile): boolean {
    const stressLevel = playerProfile.calculateStressLevel();
    const errorFrequency = playerProfile.errorFrequency;
    const skillProgression = playerProfile.skillProgression;

    // Trigger recovery if multiple indicators suggest struggle
    const recoveryIndicators = [
      stressLevel > this.configuration.recoveryThreshold,
      errorFrequency > 0.5,
      skillProgression < 0.2 && this.decisionHistory.length > 10,
      this.consecutivePoorPerformance >= 3
    ];

    const indicatorCount = recoveryIndicators.filter(Boolean).length;
    const shouldTrigger = indicatorCount >= 2;

    if (shouldTrigger && !this.recoveryModeActive) {
      this.logDecision(
        'Recovery mechanic triggered',
        `Multiple struggle indicators: stress=${stressLevel.toFixed(2)}, errors=${errorFrequency.toFixed(2)}, poor streak=${this.consecutivePoorPerformance}`
      );
    }

    return shouldTrigger;
  }

  /**
   * Logs an AI decision with comprehensive context
   */
  public logDecision(decision: string, reasoning: string): void {
    const aiDecision: AIDecision = {
      timestamp: performance.now(),
      type: this.categorizeDecision(decision),
      reasoning,
      playerMetrics: {
        reactionTime: this.playerProfiler.averageReactionTime(),
        stressLevel: this.playerProfiler.calculateStressLevel(),
        skillLevel: this.playerProfiler.skillProgression
      },
      gameContext: {
        score: 0, // Will be updated by caller
        snakeLength: 0, // Will be updated by caller
        gameTime: 0 // Will be updated by caller
      }
    };

    this.decisionHistory.push(aiDecision);

    // Maintain decision history size
    if (this.decisionHistory.length > this.MAX_DECISION_HISTORY) {
      this.decisionHistory.shift();
    }

    // Log to console based on verbosity
    if (this.configuration.explanationVerbosity !== 'minimal') {
      console.log(`[AI Director] ${decision}: ${reasoning}`);
    }
  }

  /**
   * Categorizes decision type for logging
   */
  private categorizeDecision(decision: string): AIDecision['type'] {
    if (decision.toLowerCase().includes('speed')) {
      return 'SPEED_ADJUSTMENT';
    } else if (decision.toLowerCase().includes('food') || decision.toLowerCase().includes('placement')) {
      return 'FOOD_PLACEMENT';
    } else if (decision.toLowerCase().includes('recovery')) {
      return 'RECOVERY_TRIGGER';
    }
    return 'SPEED_ADJUSTMENT'; // Default
  }

  /**
   * Gets decision history for analysis
   */
  public getDecisionHistory(): AIDecision[] {
    return [...this.decisionHistory];
  }

  /**
   * Updates decision context with current game state
   */
  public updateDecisionContext(gameState: GameState): void {
    // Update the most recent decision with current game context
    if (this.decisionHistory.length > 0) {
      const lastDecision = this.decisionHistory[this.decisionHistory.length - 1];
      lastDecision.gameContext = {
        score: gameState.score,
        snakeLength: gameState.snake.length,
        gameTime: gameState.gameTime
      };
    }
  }

  /**
   * Gets current AI status for UI display
   */
  public getAIStatus(): {
    mode: string;
    difficultyLevel: number;
    recoveryActive: boolean;
    recentDecisions: string[];
    performanceAssessment: string;
  } {
    const recentDecisions = this.decisionHistory
      .slice(-3)
      .map(d => `${d.type}: ${d.reasoning.substring(0, 50)}...`);

    let performanceAssessment = 'Monitoring';
    if (this.consecutiveGoodPerformance >= 3) {
      performanceAssessment = 'Player showing mastery';
    } else if (this.consecutivePoorPerformance >= 3) {
      performanceAssessment = 'Player needs support';
    }

    return {
      mode: this.recoveryModeActive ? 'Recovery' : 'Adaptive',
      difficultyLevel: this.currentDifficultyLevel,
      recoveryActive: this.recoveryModeActive,
      recentDecisions,
      performanceAssessment
    };
  }

  /**
   * Provides strategic advice for food placement
   */
  public getStrategicAdvice(gameState: GameState): {
    recommendedAction: string;
    reasoning: string;
    confidence: number;
  } {
    const analysis = this.performBehaviorAnalysis(gameState);
    const dangerLevel = analysis.risk;
    const performance = analysis.performance.overall;

    let recommendedAction: string;
    let reasoning: string;
    let confidence: number;

    if (dangerLevel > 0.8) {
      recommendedAction = 'Immediate recovery assistance';
      reasoning = 'Player in critical danger - provide easy food and reduce speed';
      confidence = 0.9;
    } else if (performance > 0.8 && this.consecutiveGoodPerformance >= 5) {
      recommendedAction = 'Increase challenge significantly';
      reasoning = 'Player demonstrating consistent mastery - time for harder challenge';
      confidence = 0.85;
    } else if (analysis.trend === 'improving' && performance > 0.6) {
      recommendedAction = 'Gradual challenge increase';
      reasoning = 'Player improving steadily - gentle difficulty ramp';
      confidence = 0.7;
    } else if (analysis.trend === 'declining') {
      recommendedAction = 'Provide support';
      reasoning = 'Performance declining - offer easier gameplay';
      confidence = 0.75;
    } else {
      recommendedAction = 'Maintain current difficulty';
      reasoning = 'Player performance stable - no adjustment needed';
      confidence = 0.6;
    }

    return { recommendedAction, reasoning, confidence };
  }

  /**
   * Resets AI state for new game session
   */
  public reset(): void {
    this.decisionHistory = [];
    this.currentDifficultyLevel = 1.0;
    this.recoveryModeActive = false;
    this.lastSpeedAdjustment = 0;
    this.consecutiveGoodPerformance = 0;
    this.consecutivePoorPerformance = 0;
    this.lastAnalysisTime = 0;
    
    this.logDecision('AI Director reset', 'New game session started');
  }

  /**
   * Gets comprehensive AI analytics
   */
  public getAnalytics(): any {
    const decisionTypes = this.decisionHistory.reduce((acc, decision) => {
      acc[decision.type] = (acc[decision.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgPlayerMetrics = this.decisionHistory.length > 0 ? {
      avgReactionTime: this.decisionHistory.reduce((sum, d) => sum + d.playerMetrics.reactionTime, 0) / this.decisionHistory.length,
      avgStressLevel: this.decisionHistory.reduce((sum, d) => sum + d.playerMetrics.stressLevel, 0) / this.decisionHistory.length,
      avgSkillLevel: this.decisionHistory.reduce((sum, d) => sum + d.playerMetrics.skillLevel, 0) / this.decisionHistory.length
    } : { avgReactionTime: 0, avgStressLevel: 0, avgSkillLevel: 0 };

    return {
      totalDecisions: this.decisionHistory.length,
      decisionTypes,
      currentDifficulty: this.currentDifficultyLevel,
      recoveryModeActive: this.recoveryModeActive,
      performanceStreaks: {
        good: this.consecutiveGoodPerformance,
        poor: this.consecutivePoorPerformance
      },
      playerMetrics: avgPlayerMetrics,
      configuration: this.configuration
    };
  }

  /**
   * Updates AI configuration with validation
   */
  public updateConfiguration(newConfig: Partial<AIConfiguration>): void {
    const validatedConfig = this.validateConfiguration(newConfig);
    this.configuration = { ...this.configuration, ...validatedConfig };
    this.logDecision(
      'Configuration updated',
      `New settings: ${JSON.stringify(validatedConfig)}`
    );
  }

  /**
   * Validates AI configuration parameters
   */
  private validateConfiguration(config: Partial<AIConfiguration>): Partial<AIConfiguration> {
    const validated: Partial<AIConfiguration> = {};

    if (config.adaptationSensitivity !== undefined) {
      validated.adaptationSensitivity = Math.max(0, Math.min(1, config.adaptationSensitivity));
    }

    if (config.maxSpeedIncrease !== undefined) {
      validated.maxSpeedIncrease = Math.max(1, Math.min(5, config.maxSpeedIncrease));
    }

    if (config.minSpeedDecrease !== undefined) {
      validated.minSpeedDecrease = Math.max(0.1, Math.min(1, config.minSpeedDecrease));
    }

    if (config.recoveryThreshold !== undefined) {
      validated.recoveryThreshold = Math.max(0, Math.min(1, config.recoveryThreshold));
    }

    if (config.masteryThreshold !== undefined) {
      validated.masteryThreshold = Math.max(0, Math.min(1, config.masteryThreshold));
    }

    if (config.explanationVerbosity !== undefined) {
      const validVerbosities = ['minimal', 'detailed', 'verbose'];
      if (validVerbosities.includes(config.explanationVerbosity)) {
        validated.explanationVerbosity = config.explanationVerbosity;
      }
    }

    return validated;
  }

  /**
   * Gets deterministic core validation status
   */
  public validateDeterministicCore(gameState: GameState, expectedState: GameState): {
    isValid: boolean;
    differences: string[];
  } {
    const differences: string[] = [];

    // Check core game state consistency
    if (gameState.score !== expectedState.score) {
      differences.push(`Score mismatch: ${gameState.score} vs ${expectedState.score}`);
    }

    if (gameState.snake.length !== expectedState.snake.length) {
      differences.push(`Snake length mismatch: ${gameState.snake.length} vs ${expectedState.snake.length}`);
    }

    if (gameState.gameStatus !== expectedState.gameStatus) {
      differences.push(`Game status mismatch: ${gameState.gameStatus} vs ${expectedState.gameStatus}`);
    }

    // Snake position validation
    for (let i = 0; i < Math.min(gameState.snake.length, expectedState.snake.length); i++) {
      const actual = gameState.snake[i].position;
      const expected = expectedState.snake[i].position;
      if (actual.x !== expected.x || actual.y !== expected.y) {
        differences.push(`Snake segment ${i} position mismatch: (${actual.x},${actual.y}) vs (${expected.x},${expected.y})`);
      }
    }

    return {
      isValid: differences.length === 0,
      differences
    };
  }
}