/**
 * UI and rendering system types for retro visual effects
 */
import { GameState, Position, Sprite, Color, Direction } from './GameTypes';
export interface RetroEffects {
    scanlines: boolean;
    pixelPerfect: boolean;
    colorPalette: Color[];
    crtCurvature: number;
}
export interface RetroRenderer {
    renderGame(gameState: GameState): void;
    renderUI(score: number, aiExplanation?: string): void;
    applyCRTEffects(): void;
    renderPixelArt(sprite: Sprite, position: Position): void;
    setRetroEffects(effects: RetroEffects): void;
}
export interface InputHandler {
    onDirectionChange: (direction: Direction) => void;
    onPause: () => void;
    onReset: () => void;
    onToggleAIVisibility: () => void;
}
export interface VisualFeedback {
    stressLevel: number;
    performanceLevel: number;
    aiAdjustmentType: 'SPEED' | 'DIFFICULTY' | 'RECOVERY' | 'NONE';
}
//# sourceMappingURL=UITypes.d.ts.map