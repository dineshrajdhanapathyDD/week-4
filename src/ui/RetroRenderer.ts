/**
 * Retro Renderer - Handles pixel art rendering with CRT effects
 * Provides authentic retro visual experience with modern performance
 */

import { GameState, Position, Sprite, Color } from '../types/GameTypes';
import { RetroRenderer as IRetroRenderer, RetroEffects, VisualFeedback } from '../types/UITypes';
import { AnimationSystem } from './AnimationSystem';

export class RetroRenderer implements IRetroRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private retroEffects: RetroEffects;
  private animationSystem: AnimationSystem;
  private cellSize: number = 20;
  private gridWidth: number = 20;
  private gridHeight: number = 20;
  private lastGameState?: GameState;
  
  // Retro color palette (classic green terminal style)
  private readonly colorPalette: Record<string, Color> = {
    background: { r: 0, g: 17, b: 0 },
    snake: { r: 0, g: 255, b: 0 },
    snakeHead: { r: 0, g: 200, b: 0 },
    food: { r: 255, g: 255, b: 0 },
    wall: { r: 0, g: 128, b: 0 },
    ui: { r: 0, g: 255, b: 0 },
    danger: { r: 255, g: 100, b: 0 },
    safe: { r: 0, g: 255, b: 100 }
  };

  private visualFeedback: VisualFeedback = {
    stressLevel: 0,
    performanceLevel: 0,
    aiAdjustmentType: 'NONE'
  };

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error(`Canvas element with id '${canvasId}' not found`);
    }

    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D rendering context');
    }
    this.ctx = context;

    // Initialize animation system
    this.animationSystem = new AnimationSystem();

    // Initialize retro effects
    this.retroEffects = {
      scanlines: true,
      pixelPerfect: true,
      colorPalette: Object.values(this.colorPalette),
      crtCurvature: 0.1
    };

    this.setupCanvas();
  }

  /**
   * Sets up canvas properties for pixel-perfect rendering
   */
  private setupCanvas(): void {
    // Disable image smoothing for pixel-perfect rendering
    this.ctx.imageSmoothingEnabled = false;
    
    // Set canvas size based on grid
    this.canvas.width = this.gridWidth * this.cellSize;
    this.canvas.height = this.gridHeight * this.cellSize;
    
    // Apply CSS for crisp pixel rendering
    this.canvas.style.imageRendering = 'pixelated';
    this.canvas.style.imageRendering = '-moz-crisp-edges';
    this.canvas.style.imageRendering = 'crisp-edges';
  }

  /**
   * Renders the complete game state
   */
  public renderGame(gameState: GameState): void {
    // Detect game state changes for animations
    this.detectGameStateChanges(gameState);
    
    // Clear canvas with background
    this.clearCanvas();
    
    // Update grid size if changed
    if (gameState.gridSize.width !== this.gridWidth || gameState.gridSize.height !== this.gridHeight) {
      this.updateGridSize(gameState.gridSize.width, gameState.gridSize.height);
    }

    // Update animations
    this.animationSystem.update(performance.now());

    // Render game elements
    this.renderBackground();
    this.renderFood(gameState.food);
    this.renderSnake(gameState.snake);
    
    // Render animations
    this.animationSystem.render(this.ctx, this.cellSize);
    
    // Apply visual feedback effects
    this.applyVisualFeedback();
    
    // Apply retro effects
    if (this.retroEffects.scanlines) {
      this.applyScanlines();
    }
    
    // Store current state for next frame comparison
    this.lastGameState = { ...gameState };
  }

  /**
   * Renders UI elements (score, status, AI info)
   */
  public renderUI(score: number, aiExplanation?: string): void {
    // This will be rendered outside the main canvas in HTML elements
    // Update DOM elements with current values
    this.updateUIElements(score, aiExplanation);
  }

  /**
   * Updates HTML UI elements
   */
  private updateUIElements(score: number, aiExplanation?: string): void {
    const scoreElement = document.getElementById('score');
    const aiStatusElement = document.getElementById('aiStatus');
    const aiDecisionElement = document.getElementById('aiDecision');

    if (scoreElement) {
      scoreElement.textContent = score.toString();
    }

    if (aiStatusElement) {
      const statusText = this.getAIStatusText();
      aiStatusElement.textContent = statusText;
    }

    if (aiDecisionElement && aiExplanation) {
      aiDecisionElement.textContent = aiExplanation;
    }
  }

  /**
   * Gets AI status text based on current feedback
   */
  private getAIStatusText(): string {
    switch (this.visualFeedback.aiAdjustmentType) {
      case 'SPEED':
        return 'Adjusting Speed';
      case 'DIFFICULTY':
        return 'Adapting Difficulty';
      case 'RECOVERY':
        return 'Recovery Mode';
      default:
        return 'Monitoring';
    }
  }

  /**
   * Clears the canvas
   */
  private clearCanvas(): void {
    const bgColor = this.getAdjustedColor('background');
    this.ctx.fillStyle = `rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Renders the background grid
   */
  private renderBackground(): void {
    const gridColor = this.getAdjustedColor('wall');
    this.ctx.strokeStyle = `rgba(${gridColor.r}, ${gridColor.g}, ${gridColor.b}, 0.1)`;
    this.ctx.lineWidth = 1;

    // Draw grid lines
    for (let x = 0; x <= this.gridWidth; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.cellSize, 0);
      this.ctx.lineTo(x * this.cellSize, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y <= this.gridHeight; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * this.cellSize);
      this.ctx.lineTo(this.canvas.width, y * this.cellSize);
      this.ctx.stroke();
    }
  }

  /**
   * Renders the snake
   */
  private renderSnake(snake: any[]): void {
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      const colorKey = isHead ? 'snakeHead' : 'snake';
      const color = this.getAdjustedColor(colorKey);
      
      this.renderCell(segment.position, color, isHead);
      
      // Add age-based visual effects for body segments
      if (!isHead && segment.age > 0) {
        this.renderSegmentAge(segment.position, segment.age);
      }
    });
  }

  /**
   * Renders age effects on snake segments
   */
  private renderSegmentAge(position: Position, age: number): void {
    const alpha = Math.max(0.3, 1 - (age * 0.1));
    const x = position.x * this.cellSize;
    const y = position.y * this.cellSize;
    
    this.ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
    this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
  }

  /**
   * Renders the food
   */
  private renderFood(foodPosition: Position): void {
    const color = this.getAdjustedColor('food');
    this.renderCell(foodPosition, color, false, true);
  }

  /**
   * Renders a single cell with optional effects
   */
  private renderCell(position: Position, color: Color, isHead: boolean = false, isFood: boolean = false): void {
    const x = position.x * this.cellSize;
    const y = position.y * this.cellSize;
    
    this.ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    
    if (isFood) {
      // Render food with pulsing effect
      const pulseSize = Math.sin(Date.now() * 0.01) * 2;
      const size = this.cellSize - 4 + pulseSize;
      const offset = (this.cellSize - size) / 2;
      this.ctx.fillRect(x + offset, y + offset, size, size);
    } else if (isHead) {
      // Render snake head with special styling
      this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
      
      // Add eyes to snake head
      this.ctx.fillStyle = 'rgb(0, 0, 0)';
      const eyeSize = 3;
      this.ctx.fillRect(x + 4, y + 4, eyeSize, eyeSize);
      this.ctx.fillRect(x + this.cellSize - 7, y + 4, eyeSize, eyeSize);
    } else {
      // Regular snake body
      this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
    }
  }

  /**
   * Applies CRT-style scanlines
   */
  public applyCRTEffects(): void {
    this.applyScanlines();
    this.applyCRTCurvature();
  }

  /**
   * Applies scanline effect
   */
  private applyScanlines(): void {
    if (!this.retroEffects.scanlines) return;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    
    for (let y = 0; y < this.canvas.height; y += 2) {
      this.ctx.fillRect(0, y, this.canvas.width, 1);
    }
  }

  /**
   * Applies CRT curvature effect (simplified)
   */
  private applyCRTCurvature(): void {
    if (this.retroEffects.crtCurvature <= 0) return;
    
    // Add subtle shadow/glow effect to simulate CRT
    this.ctx.shadowColor = 'rgba(0, 255, 0, 0.3)';
    this.ctx.shadowBlur = 2;
  }

  /**
   * Renders pixel art sprite at position
   */
  public renderPixelArt(sprite: Sprite, position: Position): void {
    // For now, render as a colored rectangle
    // In a full implementation, this would handle actual sprite data
    const x = position.x * this.cellSize;
    const y = position.y * this.cellSize;
    
    this.ctx.fillStyle = 'rgb(0, 255, 0)';
    this.ctx.fillRect(x, y, sprite.width, sprite.height);
  }

  /**
   * Sets retro effects configuration
   */
  public setRetroEffects(effects: RetroEffects): void {
    this.retroEffects = { ...effects };
  }

  /**
   * Updates visual feedback for AI-driven changes
   */
  public updateVisualFeedback(feedback: VisualFeedback): void {
    this.visualFeedback = { ...feedback };
  }

  /**
   * Applies visual feedback effects
   */
  private applyVisualFeedback(): void {
    // Adjust colors based on stress level and performance
    if (this.visualFeedback.stressLevel > 0.7) {
      this.applyStressEffect();
    }
    
    if (this.visualFeedback.performanceLevel > 0.8) {
      this.applyPerformanceEffect();
    }
    
    this.applyAIAdjustmentEffect();
  }

  /**
   * Applies stress-based visual effects
   */
  private applyStressEffect(): void {
    // Add red tint to indicate danger
    this.ctx.fillStyle = `rgba(255, 0, 0, ${this.visualFeedback.stressLevel * 0.1})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Applies performance-based visual effects
   */
  private applyPerformanceEffect(): void {
    // Add blue tint to indicate good performance
    this.ctx.fillStyle = `rgba(0, 100, 255, ${this.visualFeedback.performanceLevel * 0.05})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Applies AI adjustment visual feedback
   */
  private applyAIAdjustmentEffect(): void {
    switch (this.visualFeedback.aiAdjustmentType) {
      case 'SPEED':
        // Subtle yellow tint for speed adjustments
        this.ctx.fillStyle = 'rgba(255, 255, 0, 0.03)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        break;
      case 'DIFFICULTY':
        // Subtle purple tint for difficulty adjustments
        this.ctx.fillStyle = 'rgba(128, 0, 255, 0.03)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        break;
      case 'RECOVERY':
        // Subtle green tint for recovery mode
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        break;
    }
  }

  /**
   * Gets color adjusted for current visual feedback
   */
  private getAdjustedColor(colorKey: string): Color {
    const baseColor = this.colorPalette[colorKey];
    if (!baseColor) return { r: 255, g: 255, b: 255 };

    // Apply stress-based color adjustments
    let adjustedColor = { ...baseColor };
    
    if (this.visualFeedback.stressLevel > 0.5) {
      // Shift towards red when stressed
      adjustedColor.r = Math.min(255, adjustedColor.r + (this.visualFeedback.stressLevel * 50));
    }
    
    if (this.visualFeedback.performanceLevel > 0.7) {
      // Enhance green when performing well
      adjustedColor.g = Math.min(255, adjustedColor.g + (this.visualFeedback.performanceLevel * 30));
    }

    return adjustedColor;
  }

  /**
   * Updates grid size and recalculates canvas dimensions
   */
  private updateGridSize(width: number, height: number): void {
    this.gridWidth = width;
    this.gridHeight = height;
    this.setupCanvas();
  }

  /**
   * Renders game over screen
   */
  public renderGameOver(finalScore: number): void {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Game Over text
    this.ctx.fillStyle = 'rgb(255, 0, 0)';
    this.ctx.font = 'bold 24px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);
    
    // Final score
    this.ctx.fillStyle = 'rgb(255, 255, 0)';
    this.ctx.font = '16px monospace';
    this.ctx.fillText(`Final Score: ${finalScore}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
    
    // Restart instruction
    this.ctx.fillStyle = 'rgb(0, 255, 0)';
    this.ctx.font = '12px monospace';
    this.ctx.fillText('Press R to restart', this.canvas.width / 2, this.canvas.height / 2 + 40);
  }

  /**
   * Gets canvas element for external access
   */
  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Detects changes in game state to trigger animations
   */
  private detectGameStateChanges(gameState: GameState): void {
    if (!this.lastGameState) return;

    // Detect food consumption (score increase)
    if (gameState.score > this.lastGameState.score) {
      this.animationSystem.createFoodConsumptionEffect(this.lastGameState.food);
      this.animationSystem.createSnakeGrowthEffect(gameState.snake[0].position);
    }

    // Detect game over
    if (gameState.gameStatus === 'GAME_OVER' && this.lastGameState.gameStatus === 'PLAYING') {
      this.animationSystem.createCollisionEffect(gameState.snake[0].position);
    }

    // Detect food position change (new food spawned)
    if (gameState.food.x !== this.lastGameState.food.x || gameState.food.y !== this.lastGameState.food.y) {
      // Food moved, create spawn animation
      this.animationSystem.addAnimation({
        type: 'scale',
        position: gameState.food,
        duration: 300,
        properties: {
          startScale: 0,
          endScale: 1,
          color: { r: 255, g: 255, b: 0 }
        }
      });
    }
  }

  /**
   * Triggers stress indicator animation
   */
  public showStressIndicator(position: Position, intensity: number): void {
    this.animationSystem.createStressIndicator(position, intensity);
  }

  /**
   * Triggers performance boost animation
   */
  public showPerformanceBoost(position: Position): void {
    this.animationSystem.createPerformanceBoost(position);
  }

  /**
   * Gets animation system for external access
   */
  public getAnimationSystem(): AnimationSystem {
    return this.animationSystem;
  }

  /**
   * Gets rendering context for external access
   */
  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
}