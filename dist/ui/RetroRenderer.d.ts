/**
 * Retro Renderer - Handles pixel art rendering with CRT effects
 * Provides authentic retro visual experience with modern performance
 */
import { GameState, Position, Sprite } from '../types/GameTypes';
import { RetroRenderer as IRetroRenderer, RetroEffects, VisualFeedback } from '../types/UITypes';
import { AnimationSystem } from './AnimationSystem';
export declare class RetroRenderer implements IRetroRenderer {
    private canvas;
    private ctx;
    private retroEffects;
    private animationSystem;
    private cellSize;
    private gridWidth;
    private gridHeight;
    private lastGameState?;
    private readonly colorPalette;
    private visualFeedback;
    constructor(canvasId: string);
    /**
     * Sets up canvas properties for pixel-perfect rendering
     */
    private setupCanvas;
    /**
     * Renders the complete game state
     */
    renderGame(gameState: GameState): void;
    /**
     * Renders UI elements (score, status, AI info)
     */
    renderUI(score: number, aiExplanation?: string): void;
    /**
     * Updates HTML UI elements
     */
    private updateUIElements;
    /**
     * Gets AI status text based on current feedback
     */
    private getAIStatusText;
    /**
     * Clears the canvas
     */
    private clearCanvas;
    /**
     * Renders the background grid
     */
    private renderBackground;
    /**
     * Renders the snake
     */
    private renderSnake;
    /**
     * Renders age effects on snake segments
     */
    private renderSegmentAge;
    /**
     * Renders the food
     */
    private renderFood;
    /**
     * Renders a single cell with optional effects
     */
    private renderCell;
    /**
     * Applies CRT-style scanlines
     */
    applyCRTEffects(): void;
    /**
     * Applies scanline effect
     */
    private applyScanlines;
    /**
     * Applies CRT curvature effect (simplified)
     */
    private applyCRTCurvature;
    /**
     * Renders pixel art sprite at position
     */
    renderPixelArt(sprite: Sprite, position: Position): void;
    /**
     * Sets retro effects configuration
     */
    setRetroEffects(effects: RetroEffects): void;
    /**
     * Updates visual feedback for AI-driven changes
     */
    updateVisualFeedback(feedback: VisualFeedback): void;
    /**
     * Applies visual feedback effects
     */
    private applyVisualFeedback;
    /**
     * Applies stress-based visual effects
     */
    private applyStressEffect;
    /**
     * Applies performance-based visual effects
     */
    private applyPerformanceEffect;
    /**
     * Applies AI adjustment visual feedback
     */
    private applyAIAdjustmentEffect;
    /**
     * Gets color adjusted for current visual feedback
     */
    private getAdjustedColor;
    /**
     * Updates grid size and recalculates canvas dimensions
     */
    private updateGridSize;
    /**
     * Renders game over screen
     */
    renderGameOver(finalScore: number): void;
    /**
     * Gets canvas element for external access
     */
    getCanvas(): HTMLCanvasElement;
    /**
     * Detects changes in game state to trigger animations
     */
    private detectGameStateChanges;
    /**
     * Triggers stress indicator animation
     */
    showStressIndicator(position: Position, intensity: number): void;
    /**
     * Triggers performance boost animation
     */
    showPerformanceBoost(position: Position): void;
    /**
     * Gets animation system for external access
     */
    getAnimationSystem(): AnimationSystem;
    /**
     * Gets rendering context for external access
     */
    getContext(): CanvasRenderingContext2D;
}
//# sourceMappingURL=RetroRenderer.d.ts.map