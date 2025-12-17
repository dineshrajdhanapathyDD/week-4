/**
 * Animation System - Handles smooth animations and visual effects
 * Provides frame-based animations for enhanced visual feedback
 */
import { Position } from '../types/GameTypes';
export interface Animation {
    id: string;
    startTime: number;
    duration: number;
    type: 'fade' | 'pulse' | 'slide' | 'scale' | 'particle';
    position: Position;
    properties: Record<string, any>;
    onComplete?: () => void;
}
export interface ParticleEffect {
    position: Position;
    velocity: {
        x: number;
        y: number;
    };
    life: number;
    maxLife: number;
    color: {
        r: number;
        g: number;
        b: number;
    };
    size: number;
}
export declare class AnimationSystem {
    private animations;
    private particles;
    private animationIdCounter;
    /**
     * Adds a new animation
     */
    addAnimation(animation: Omit<Animation, 'id' | 'startTime'>): string;
    /**
     * Removes an animation
     */
    removeAnimation(id: string): void;
    /**
     * Updates all animations
     */
    update(currentTime: number): void;
    /**
     * Renders all animations
     */
    render(ctx: CanvasRenderingContext2D, cellSize: number): void;
    /**
     * Renders a single animation
     */
    private renderAnimation;
    /**
     * Renders fade animation
     */
    private renderFadeAnimation;
    /**
     * Renders pulse animation
     */
    private renderPulseAnimation;
    /**
     * Renders slide animation
     */
    private renderSlideAnimation;
    /**
     * Renders scale animation
     */
    private renderScaleAnimation;
    /**
     * Renders a particle
     */
    private renderParticle;
    /**
     * Creates food consumption animation
     */
    createFoodConsumptionEffect(position: Position): void;
    /**
     * Creates snake growth animation
     */
    createSnakeGrowthEffect(position: Position): void;
    /**
     * Creates collision animation
     */
    createCollisionEffect(position: Position): void;
    /**
     * Creates stress indicator animation
     */
    createStressIndicator(position: Position, intensity: number): void;
    /**
     * Creates performance boost animation
     */
    createPerformanceBoost(position: Position): void;
    /**
     * Creates particle explosion effect
     */
    private createParticleExplosion;
    /**
     * Easing function for smooth animations
     */
    private easeInOutQuad;
    /**
     * Creates screen shake effect
     */
    createScreenShake(intensity: number, duration: number): void;
    /**
     * Clears all animations
     */
    clearAll(): void;
    /**
     * Gets active animation count
     */
    getActiveAnimationCount(): number;
    /**
     * Gets all active animations (for debugging)
     */
    getActiveAnimations(): Animation[];
}
//# sourceMappingURL=AnimationSystem.d.ts.map