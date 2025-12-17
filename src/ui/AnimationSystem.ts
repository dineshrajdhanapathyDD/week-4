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
  velocity: { x: number; y: number };
  life: number;
  maxLife: number;
  color: { r: number; g: number; b: number };
  size: number;
}

export class AnimationSystem {
  private animations: Map<string, Animation> = new Map();
  private particles: ParticleEffect[] = [];
  private animationIdCounter: number = 0;

  /**
   * Adds a new animation
   */
  public addAnimation(animation: Omit<Animation, 'id' | 'startTime'>): string {
    const id = `anim_${this.animationIdCounter++}`;
    const fullAnimation: Animation = {
      ...animation,
      id,
      startTime: performance.now()
    };
    
    this.animations.set(id, fullAnimation);
    return id;
  }

  /**
   * Removes an animation
   */
  public removeAnimation(id: string): void {
    this.animations.delete(id);
  }

  /**
   * Updates all animations
   */
  public update(currentTime: number): void {
    // Update animations
    for (const [id, animation] of this.animations) {
      const elapsed = currentTime - animation.startTime;
      
      if (elapsed >= animation.duration) {
        // Animation completed
        if (animation.onComplete) {
          animation.onComplete();
        }
        this.animations.delete(id);
      }
    }

    // Update particles
    this.particles = this.particles.filter(particle => {
      particle.life -= 16; // Assume 60fps (16ms per frame)
      particle.position.x += particle.velocity.x;
      particle.position.y += particle.velocity.y;
      particle.velocity.y += 0.1; // Gravity
      
      return particle.life > 0;
    });
  }

  /**
   * Renders all animations
   */
  public render(ctx: CanvasRenderingContext2D, cellSize: number): void {
    const currentTime = performance.now();
    
    // Render animations
    for (const animation of this.animations.values()) {
      this.renderAnimation(ctx, animation, currentTime, cellSize);
    }

    // Render particles
    for (const particle of this.particles) {
      this.renderParticle(ctx, particle, cellSize);
    }
  }

  /**
   * Renders a single animation
   */
  private renderAnimation(ctx: CanvasRenderingContext2D, animation: Animation, currentTime: number, cellSize: number): void {
    const elapsed = currentTime - animation.startTime;
    const progress = Math.min(1, elapsed / animation.duration);
    
    const x = animation.position.x * cellSize;
    const y = animation.position.y * cellSize;

    ctx.save();

    switch (animation.type) {
      case 'fade':
        this.renderFadeAnimation(ctx, animation, progress, x, y, cellSize);
        break;
      case 'pulse':
        this.renderPulseAnimation(ctx, animation, progress, x, y, cellSize);
        break;
      case 'slide':
        this.renderSlideAnimation(ctx, animation, progress, x, y, cellSize);
        break;
      case 'scale':
        this.renderScaleAnimation(ctx, animation, progress, x, y, cellSize);
        break;
    }

    ctx.restore();
  }

  /**
   * Renders fade animation
   */
  private renderFadeAnimation(ctx: CanvasRenderingContext2D, animation: Animation, progress: number, x: number, y: number, cellSize: number): void {
    const alpha = animation.properties.fadeIn ? progress : (1 - progress);
    const color = animation.properties.color || { r: 255, g: 255, b: 255 };
    
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
    ctx.fillRect(x, y, cellSize, cellSize);
  }

  /**
   * Renders pulse animation
   */
  private renderPulseAnimation(ctx: CanvasRenderingContext2D, animation: Animation, progress: number, x: number, y: number, cellSize: number): void {
    const pulseValue = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5;
    const scale = 1 + (pulseValue * animation.properties.intensity || 0.2);
    const color = animation.properties.color || { r: 255, g: 255, b: 0 };
    
    const scaledSize = cellSize * scale;
    const offset = (cellSize - scaledSize) / 2;
    
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${1 - progress * 0.5})`;
    ctx.fillRect(x + offset, y + offset, scaledSize, scaledSize);
  }

  /**
   * Renders slide animation
   */
  private renderSlideAnimation(ctx: CanvasRenderingContext2D, animation: Animation, progress: number, x: number, y: number, cellSize: number): void {
    const startPos = animation.properties.startPosition || { x: 0, y: 0 };
    const endPos = animation.properties.endPosition || { x: 0, y: 0 };
    
    const currentX = startPos.x + (endPos.x - startPos.x) * this.easeInOutQuad(progress);
    const currentY = startPos.y + (endPos.y - startPos.y) * this.easeInOutQuad(progress);
    
    const color = animation.properties.color || { r: 255, g: 255, b: 255 };
    
    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    ctx.fillRect(currentX * cellSize, currentY * cellSize, cellSize, cellSize);
  }

  /**
   * Renders scale animation
   */
  private renderScaleAnimation(ctx: CanvasRenderingContext2D, animation: Animation, progress: number, x: number, y: number, cellSize: number): void {
    const startScale = animation.properties.startScale || 0;
    const endScale = animation.properties.endScale || 1;
    
    const currentScale = startScale + (endScale - startScale) * this.easeInOutQuad(progress);
    const scaledSize = cellSize * currentScale;
    const offset = (cellSize - scaledSize) / 2;
    
    const color = animation.properties.color || { r: 255, g: 255, b: 255 };
    
    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    ctx.fillRect(x + offset, y + offset, scaledSize, scaledSize);
  }

  /**
   * Renders a particle
   */
  private renderParticle(ctx: CanvasRenderingContext2D, particle: ParticleEffect, cellSize: number): void {
    const alpha = particle.life / particle.maxLife;
    const size = particle.size * alpha;
    
    ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${alpha})`;
    ctx.fillRect(
      particle.position.x * cellSize - size / 2,
      particle.position.y * cellSize - size / 2,
      size,
      size
    );
  }

  /**
   * Creates food consumption animation
   */
  public createFoodConsumptionEffect(position: Position): void {
    // Scale animation for the food being consumed
    this.addAnimation({
      type: 'scale',
      position,
      duration: 200,
      properties: {
        startScale: 1,
        endScale: 0,
        color: { r: 255, g: 255, b: 0 }
      }
    });

    // Particle explosion
    this.createParticleExplosion(position, { r: 255, g: 255, b: 0 }, 8);
  }

  /**
   * Creates snake growth animation
   */
  public createSnakeGrowthEffect(position: Position): void {
    this.addAnimation({
      type: 'pulse',
      position,
      duration: 300,
      properties: {
        intensity: 0.3,
        color: { r: 0, g: 255, b: 0 }
      }
    });
  }

  /**
   * Creates collision animation
   */
  public createCollisionEffect(position: Position): void {
    // Flash effect
    this.addAnimation({
      type: 'pulse',
      position,
      duration: 500,
      properties: {
        intensity: 0.5,
        color: { r: 255, g: 0, b: 0 }
      }
    });

    // Particle explosion
    this.createParticleExplosion(position, { r: 255, g: 0, b: 0 }, 12);
  }

  /**
   * Creates stress indicator animation
   */
  public createStressIndicator(position: Position, intensity: number): void {
    this.addAnimation({
      type: 'fade',
      position,
      duration: 1000,
      properties: {
        fadeIn: false,
        color: { r: 255, g: Math.floor(255 * (1 - intensity)), b: 0 }
      }
    });
  }

  /**
   * Creates performance boost animation
   */
  public createPerformanceBoost(position: Position): void {
    this.addAnimation({
      type: 'pulse',
      position,
      duration: 800,
      properties: {
        intensity: 0.4,
        color: { r: 0, g: 100, b: 255 }
      }
    });
  }

  /**
   * Creates particle explosion effect
   */
  private createParticleExplosion(center: Position, color: { r: number; g: number; b: number }, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 0.02 + Math.random() * 0.03;
      
      this.particles.push({
        position: { x: center.x, y: center.y },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        life: 500 + Math.random() * 300,
        maxLife: 800,
        color,
        size: 3 + Math.random() * 3
      });
    }
  }

  /**
   * Easing function for smooth animations
   */
  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  /**
   * Creates screen shake effect
   */
  public createScreenShake(intensity: number, duration: number): void {
    // This would be implemented by the renderer
    // For now, we'll just log it
    console.log(`Screen shake: intensity=${intensity}, duration=${duration}`);
  }

  /**
   * Clears all animations
   */
  public clearAll(): void {
    this.animations.clear();
    this.particles = [];
  }

  /**
   * Gets active animation count
   */
  public getActiveAnimationCount(): number {
    return this.animations.size + this.particles.length;
  }

  /**
   * Gets all active animations (for debugging)
   */
  public getActiveAnimations(): Animation[] {
    return Array.from(this.animations.values());
  }
}