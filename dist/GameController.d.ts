/**
 * Game Controller - Main controller that coordinates all game systems
 * Integrates game engine, input handling, rendering, and AI systems
 */
import { SnakeGameEngine } from './engine/SnakeGameEngine';
import { RetroRenderer } from './ui/RetroRenderer';
import { GameState } from './types/GameTypes';
export declare class GameController {
    private gameEngine;
    private renderer;
    private aiGameDirector;
    private playerProfiler;
    private sessionManager;
    private isRunning;
    private animationFrameId?;
    private lastFrameTime;
    private targetFPS;
    private frameInterval;
    private aiExplanationsEnabled;
    private frameCount;
    private lastFPSCheck;
    private currentFPS;
    private aiProcessingTimes;
    private readonly MAX_AI_PROCESSING_TIME;
    constructor(canvasId?: string);
    /**
     * Sets up callbacks between game systems
     */
    private setupGameCallbacks;
    /**
     * Sets up AI system integration
     */
    private setupAIIntegration;
    /**
     * Starts the game loop
     */
    start(): void;
    /**
     * Stops the game loop
     */
    stop(): void;
    /**
     * Pauses or resumes the game
     */
    togglePause(): void;
    /**
     * Resets the game to initial state
     */
    reset(): void;
    /**
     * Main game loop
     */
    private gameLoop;
    /**
     * Monitors frame rate and adjusts performance if needed
     */
    private monitorFrameRate;
    /**
     * Updates game state
     */
    private update;
    /**
     * Applies AI-driven adjustments to game parameters
     */
    private applyAIAdjustments;
    /**
     * Tracks AI processing performance and applies optimizations
     */
    private trackAIPerformance;
    /**
     * Reduces AI complexity under performance pressure
     */
    private reduceAIComplexity;
    /**
     * Renders the current frame
     */
    private render;
    /**
     * Calculates visual feedback based on current game state and AI analysis
     */
    private calculateVisualFeedback;
    /**
     * Handles game over state
     */
    private handleGameOver;
    /**
     * Handles game reset
     */
    private handleGameReset;
    /**
     * Gets current game state
     */
    getGameState(): Readonly<GameState>;
    /**
     * Gets game statistics for external analysis
     */
    getGameStats(): any;
    /**
     * Sets target FPS
     */
    setTargetFPS(fps: number): void;
    /**
     * Gets current FPS
     */
    getCurrentFPS(): number;
    /**
     * Gets performance metrics
     */
    getPerformanceMetrics(): {
        currentFPS: number;
        targetFPS: number;
        avgAIProcessingTime: number;
        maxAIProcessingTime: number;
    };
    /**
     * Enables or disables retro effects
     */
    setRetroEffects(enabled: boolean): void;
    /**
     * Gets the game engine for external access
     */
    getGameEngine(): SnakeGameEngine;
    /**
     * Gets the renderer for external access
     */
    getRenderer(): RetroRenderer;
    /**
     * Toggles AI explanation display
     */
    toggleAIExplanations(): void;
    /**
     * Gets AI status for external monitoring
     */
    getAIStatus(): any;
    /**
     * Gets AI analytics for debugging
     */
    getAIAnalytics(): any;
    /**
     * Updates AI configuration
     */
    updateAIConfiguration(config: any): void;
    /**
     * Gets strategic advice from AI
     */
    getStrategicAdvice(): any;
    /**
     * Initializes all game systems
     */
    initialize(): boolean;
    /**
     * Handles system errors gracefully
     */
    private handleSystemError;
    /**
     * Cleanup method
     */
    destroy(): void;
}
//# sourceMappingURL=GameController.d.ts.map