/**
 * Game Controller - Main controller that coordinates all game systems
 * Integrates game engine, input handling, rendering, and AI systems
 */

import { SnakeGameEngine } from './engine/SnakeGameEngine';
import { RetroRenderer } from './ui/RetroRenderer';
import { AIGameDirector } from './ai/AIGameDirector';
import { PlayerProfiler } from './ai/PlayerProfiler';
import { SessionManager } from './ai/SessionManager';
import { GameState, PlayerInput } from './types/GameTypes';
import { VisualFeedback } from './types/UITypes';

export class GameController {
  private gameEngine: SnakeGameEngine;
  private renderer: RetroRenderer;
  private aiGameDirector: AIGameDirector;
  private playerProfiler: PlayerProfiler;
  private sessionManager: SessionManager;
  private isRunning: boolean = false;
  private animationFrameId?: number;
  private lastFrameTime: number = 0;
  private targetFPS: number = 60;
  private frameInterval: number;
  private aiExplanationsEnabled: boolean = false;
  
  // Performance monitoring
  private frameCount: number = 0;
  private lastFPSCheck: number = 0;
  private currentFPS: number = 60;
  private aiProcessingTimes: number[] = [];
  private readonly MAX_AI_PROCESSING_TIME = 16; // 16ms max for 60fps

  constructor(canvasId: string = 'gameCanvas') {
    this.gameEngine = new SnakeGameEngine();
    this.renderer = new RetroRenderer(canvasId);
    this.frameInterval = 1000 / this.targetFPS;
    
    // Initialize AI systems
    this.playerProfiler = new PlayerProfiler();
    this.sessionManager = new SessionManager(this.playerProfiler);
    this.aiGameDirector = new AIGameDirector(this.playerProfiler);
    
    this.setupGameCallbacks();
    this.setupAIIntegration();
  }

  /**
   * Sets up callbacks between game systems
   */
  private setupGameCallbacks(): void {
    const inputHandler = this.gameEngine.getInputHandler();
    
    // Override input handler callbacks to include rendering updates
    const originalOnReset = inputHandler.onReset;
    inputHandler.onReset = () => {
      originalOnReset();
      this.handleGameReset();
    };

    // Override direction change to include AI analysis
    const originalOnDirectionChange = inputHandler.onDirectionChange;
    inputHandler.onDirectionChange = (direction) => {
      // Create player input for AI analysis
      const playerInput = inputHandler.createPlayerInput(direction);
      
      // Let AI analyze the input
      this.aiGameDirector.analyzePlayerBehavior(this.gameEngine.getGameState(), playerInput);
      
      // Process the input normally
      originalOnDirectionChange(direction);
    };

    // Override AI visibility toggle
    inputHandler.onToggleAIVisibility = () => {
      this.toggleAIExplanations();
    };
  }

  /**
   * Sets up AI system integration
   */
  private setupAIIntegration(): void {
    // Start a new session
    this.sessionManager.startSession();
    
    // Configure AI for optimal performance
    this.aiGameDirector.updateConfiguration({
      adaptationSensitivity: 0.7,
      explanationVerbosity: 'detailed'
    });

    // Set up AI-driven food placement
    this.gameEngine.setFoodPlacementCallback((gameState: GameState) => {
      // Record food collection for player profiler
      this.playerProfiler.recordFoodCollection(gameState, performance.now());
      
      // Get AI-determined optimal food position
      return this.aiGameDirector.calculateOptimalFoodPlacement(gameState);
    });
  }

  /**
   * Starts the game loop
   */
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.gameEngine.startGame();
    this.lastFrameTime = performance.now();
    this.gameLoop();
    
    console.log('Game started');
  }

  /**
   * Stops the game loop
   */
  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    console.log('Game stopped');
  }

  /**
   * Pauses or resumes the game
   */
  public togglePause(): void {
    this.gameEngine.togglePause();
  }

  /**
   * Resets the game to initial state
   */
  public reset(): void {
    this.gameEngine.reset();
    this.handleGameReset();
  }

  /**
   * Main game loop
   */
  private gameLoop = (currentTime: number = performance.now()): void => {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastFrameTime;
    
    // Maintain target FPS
    if (deltaTime >= this.frameInterval) {
      this.update(deltaTime);
      this.render();
      this.lastFrameTime = currentTime;
      
      // Monitor FPS
      this.monitorFrameRate(currentTime);
    }

    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  /**
   * Monitors frame rate and adjusts performance if needed
   */
  private monitorFrameRate(currentTime: number): void {
    this.frameCount++;
    
    // Check FPS every second
    if (currentTime - this.lastFPSCheck >= 1000) {
      this.currentFPS = this.frameCount;
      this.frameCount = 0;
      this.lastFPSCheck = currentTime;
      
      // If FPS drops below 80% of target, reduce complexity
      if (this.currentFPS < this.targetFPS * 0.8) {
        console.warn(`Low FPS detected: ${this.currentFPS}, reducing complexity`);
        this.reduceAIComplexity();
        
        // Also reduce visual effects if FPS is very low
        if (this.currentFPS < this.targetFPS * 0.6) {
          this.renderer.setRetroEffects({
            scanlines: false,
            pixelPerfect: true,
            colorPalette: [],
            crtCurvature: 0
          });
        }
      }
    }
  }

  /**
   * Updates game state
   */
  private update(deltaTime: number): void {
    try {
      // Update game engine
      this.gameEngine.update(deltaTime);
      
      // Apply AI-driven adjustments if game is running
      if (this.gameEngine.isGameRunning()) {
        this.applyAIAdjustments();
      }
      
      // Check for game over
      if (this.gameEngine.isGameOver()) {
        this.handleGameOver();
      }
    } catch (error) {
      this.handleSystemError(error as Error, 'GameEngine');
    }
  }

  /**
   * Applies AI-driven adjustments to game parameters
   */
  private applyAIAdjustments(): void {
    const aiStartTime = performance.now();
    
    try {
      const gameState = this.gameEngine.getGameState();
      const playerProfile = this.playerProfiler;

      // Update AI decision context
      this.aiGameDirector.updateDecisionContext(gameState);

      // Check if recovery mechanic should be triggered
      if (this.aiGameDirector.shouldTriggerRecoveryMechanic(playerProfile)) {
        // AI will handle recovery through speed and food placement adjustments
        console.log('AI: Recovery mechanic activated');
      }

      // Adjust game speed based on AI analysis
      const currentSpeed = gameState.speed;
      const adjustedSpeed = this.aiGameDirector.adjustGameSpeed(currentSpeed, playerProfile);
      
      if (Math.abs(adjustedSpeed - currentSpeed) > 0.05) {
        this.gameEngine.setSpeed(adjustedSpeed);
      }

      // AI-driven food placement will be handled when food is consumed
      // (in the game engine's food spawning logic)
    } catch (error) {
      console.warn('AI processing error, using fallback behavior:', error);
      // Fallback: continue with current game state
    }
    
    // Track AI processing time
    const aiProcessingTime = performance.now() - aiStartTime;
    this.trackAIPerformance(aiProcessingTime);
  }

  /**
   * Tracks AI processing performance and applies optimizations
   */
  private trackAIPerformance(processingTime: number): void {
    this.aiProcessingTimes.push(processingTime);
    
    // Keep only last 60 measurements (1 second at 60fps)
    if (this.aiProcessingTimes.length > 60) {
      this.aiProcessingTimes.shift();
    }
    
    // Check if AI processing is taking too long
    if (processingTime > this.MAX_AI_PROCESSING_TIME) {
      console.warn(`AI processing took ${processingTime.toFixed(2)}ms, reducing complexity`);
      this.reduceAIComplexity();
    }
    
    // Check average processing time
    const avgProcessingTime = this.aiProcessingTimes.reduce((a, b) => a + b, 0) / this.aiProcessingTimes.length;
    if (avgProcessingTime > this.MAX_AI_PROCESSING_TIME * 0.8) {
      this.reduceAIComplexity();
    }
  }

  /**
   * Reduces AI complexity under performance pressure
   */
  private reduceAIComplexity(): void {
    // Reduce AI analysis frequency
    this.aiGameDirector.updateConfiguration({
      adaptationSensitivity: Math.max(0.3, this.aiGameDirector.getAnalytics().configuration.adaptationSensitivity * 0.9),
      explanationVerbosity: 'minimal'
    });
  }

  /**
   * Renders the current frame
   */
  private render(): void {
    try {
      const gameState = this.gameEngine.getGameState();
      
      // Update visual feedback based on game state
      const visualFeedback = this.calculateVisualFeedback(gameState);
      this.renderer.updateVisualFeedback(visualFeedback);
      
      // Render game
      this.renderer.renderGame(gameState);
      
      // Get AI explanation if enabled
      let aiExplanation: string | undefined;
      if (this.aiExplanationsEnabled) {
        try {
          const recentDecisions = this.aiGameDirector.getDecisionHistory().slice(-1);
          if (recentDecisions.length > 0) {
            const decision = recentDecisions[0];
            aiExplanation = `${decision.type}: ${decision.reasoning}`;
          }
        } catch (error) {
          console.warn('Failed to get AI explanation:', error);
        }
      }
      
      // Render UI with AI explanation
      this.renderer.renderUI(gameState.score, aiExplanation);
      
      // Apply retro effects
      this.renderer.applyCRTEffects();
    } catch (error) {
      this.handleSystemError(error as Error, 'Renderer');
    }
  }

  /**
   * Calculates visual feedback based on current game state and AI analysis
   */
  private calculateVisualFeedback(gameState: GameState): VisualFeedback {
    const gameStats = this.gameEngine.getGameStats();
    
    // Get AI-calculated stress and performance levels
    const stressLevel = this.playerProfiler.calculateStressLevel();
    const performanceLevel = this.playerProfiler.skillProgression;
    
    // Get AI status for adjustment type
    const aiStatus = this.aiGameDirector.getAIStatus();
    let aiAdjustmentType: VisualFeedback['aiAdjustmentType'] = 'NONE';
    
    if (aiStatus.recoveryActive) {
      aiAdjustmentType = 'RECOVERY';
    } else if (aiStatus.difficultyLevel > 1.2) {
      aiAdjustmentType = 'DIFFICULTY';
    } else if (gameState.speed !== 1.0) {
      aiAdjustmentType = 'SPEED';
    }

    return {
      stressLevel: Math.min(1, stressLevel),
      performanceLevel: Math.min(1, performanceLevel),
      aiAdjustmentType
    };
  }

  /**
   * Handles game over state
   */
  private handleGameOver(): void {
    const gameState = this.gameEngine.getGameState();
    this.renderer.renderGameOver(gameState.score);
    
    // End the current session and get analytics
    const sessionData = this.sessionManager.endSession({
      score: gameState.score,
      gameTime: gameState.gameTime,
      snakeLength: gameState.snake.length
    });
    const aiAnalytics = this.aiGameDirector.getAnalytics();
    const playerReport = this.playerProfiler.getAnalysisReport();
    
    // Log comprehensive game statistics including AI analysis
    console.log('Game Over - Comprehensive Analysis:', {
      gameStats: {
        finalScore: gameState.score,
        gameTime: gameState.gameTime,
        snakeLength: gameState.snake.length
      },
      sessionData,
      aiAnalytics,
      playerProfile: playerReport.profile,
      aiDecisions: this.aiGameDirector.getDecisionHistory().length
    });
  }

  /**
   * Handles game reset
   */
  private handleGameReset(): void {
    this.gameEngine.resetInputStats();
    
    // Reset AI systems for new session
    this.playerProfiler.reset();
    this.aiGameDirector.reset();
    this.sessionManager.startSession();
    
    console.log('Game reset - AI systems reinitialized');
  }

  /**
   * Gets current game state
   */
  public getGameState(): Readonly<GameState> {
    return this.gameEngine.getGameState();
  }

  /**
   * Gets game statistics for external analysis
   */
  public getGameStats(): any {
    return {
      gameStats: this.gameEngine.getGameStats(),
      inputAnalysis: this.gameEngine.getPlayerInputAnalysis()
    };
  }

  /**
   * Sets target FPS
   */
  public setTargetFPS(fps: number): void {
    this.targetFPS = Math.max(30, Math.min(120, fps));
    this.frameInterval = 1000 / this.targetFPS;
  }

  /**
   * Gets current FPS
   */
  public getCurrentFPS(): number {
    return this.currentFPS;
  }

  /**
   * Gets performance metrics
   */
  public getPerformanceMetrics(): {
    currentFPS: number;
    targetFPS: number;
    avgAIProcessingTime: number;
    maxAIProcessingTime: number;
  } {
    const avgAITime = this.aiProcessingTimes.length > 0 
      ? this.aiProcessingTimes.reduce((a, b) => a + b, 0) / this.aiProcessingTimes.length 
      : 0;
    const maxAITime = this.aiProcessingTimes.length > 0 
      ? Math.max(...this.aiProcessingTimes) 
      : 0;

    return {
      currentFPS: this.currentFPS,
      targetFPS: this.targetFPS,
      avgAIProcessingTime: avgAITime,
      maxAIProcessingTime: maxAITime
    };
  }

  /**
   * Enables or disables retro effects
   */
  public setRetroEffects(enabled: boolean): void {
    this.renderer.setRetroEffects({
      scanlines: enabled,
      pixelPerfect: enabled,
      colorPalette: [],
      crtCurvature: enabled ? 0.1 : 0
    });
  }

  /**
   * Gets the game engine for external access
   */
  public getGameEngine(): SnakeGameEngine {
    return this.gameEngine;
  }

  /**
   * Gets the renderer for external access
   */
  public getRenderer(): RetroRenderer {
    return this.renderer;
  }

  /**
   * Toggles AI explanation display
   */
  public toggleAIExplanations(): void {
    this.aiExplanationsEnabled = !this.aiExplanationsEnabled;
    console.log(`AI explanations ${this.aiExplanationsEnabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Gets AI status for external monitoring
   */
  public getAIStatus(): any {
    return {
      aiStatus: this.aiGameDirector.getAIStatus(),
      playerProfile: this.playerProfiler.getAnalysisReport(),
      sessionActive: this.sessionManager.getCurrentSession() !== undefined
    };
  }

  /**
   * Gets AI analytics for debugging
   */
  public getAIAnalytics(): any {
    return {
      aiAnalytics: this.aiGameDirector.getAnalytics(),
      decisionHistory: this.aiGameDirector.getDecisionHistory(),
      playerMetrics: this.playerProfiler.getBehaviorMetrics()
    };
  }

  /**
   * Updates AI configuration
   */
  public updateAIConfiguration(config: any): void {
    this.aiGameDirector.updateConfiguration(config);
  }

  /**
   * Gets strategic advice from AI
   */
  public getStrategicAdvice(): any {
    return this.aiGameDirector.getStrategicAdvice(this.gameEngine.getGameState());
  }

  /**
   * Initializes all game systems
   */
  public initialize(): boolean {
    try {
      // Initialize game engine
      if (!this.gameEngine) {
        console.error('Game engine not initialized');
        return false;
      }

      // Initialize renderer
      if (!this.renderer) {
        console.error('Renderer not initialized');
        return false;
      }

      // Initialize AI systems
      if (!this.aiGameDirector || !this.playerProfiler || !this.sessionManager) {
        console.error('AI systems not initialized');
        return false;
      }

      console.log('All game systems initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize game systems:', error);
      return false;
    }
  }

  /**
   * Handles system errors gracefully
   */
  private handleSystemError(error: Error, system: string): void {
    console.error(`${system} error:`, error);
    
    // Try to continue with reduced functionality
    if (system === 'AI') {
      // Disable AI features temporarily
      this.aiExplanationsEnabled = false;
      console.warn('AI features disabled due to error');
    } else if (system === 'Renderer') {
      // Try to continue without visual effects
      console.warn('Continuing with basic rendering');
    } else {
      // Critical system error - stop the game
      this.stop();
      console.error('Critical system error - game stopped');
    }
  }

  /**
   * Cleanup method
   */
  public destroy(): void {
    try {
      this.stop();
      
      // Cleanup game engine
      if (this.gameEngine) {
        this.gameEngine.destroy();
      }
      
      // End session if active
      if (this.sessionManager && this.sessionManager.getCurrentSession()) {
        const gameState = this.gameEngine.getGameState();
        this.sessionManager.endSession({
          score: gameState.score,
          gameTime: gameState.gameTime,
          snakeLength: gameState.snake.length
        });
      }

      console.log('Game controller destroyed successfully');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}