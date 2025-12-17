/**
 * Main entry point for the AI-driven Snake game
 */
import { GameController } from './GameController';
export * from './interfaces';
export { SnakeGameEngine } from './engine/SnakeGameEngine';
export { RetroRenderer } from './ui/RetroRenderer';
export { GameController } from './GameController';
export declare class AISnakeGame {
    private gameController;
    constructor(canvasId?: string);
    initialize(): Promise<void>;
    private renderInitialState;
    start(): void;
    stop(): void;
    toggleGame(): void;
    resetGame(): void;
    toggleAIVisibility(): void;
    getGameController(): GameController;
    getGameStats(): any;
}
//# sourceMappingURL=index.d.ts.map