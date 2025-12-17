/**
 * Input Handler - Manages keyboard input and player interactions
 * Provides responsive input processing with validation and timing analysis
 */
import { Direction, PlayerInput } from '../types/GameTypes';
import { InputHandler as IInputHandler } from '../types/UITypes';
export interface InputEvent {
    direction?: Direction;
    action?: 'pause' | 'reset' | 'toggleAI';
    timestamp: number;
    inputLatency: number;
}
export interface InputStats {
    totalInputs: number;
    averageLatency: number;
    inputsPerSecond: number;
    lastInputTime: number;
    directionChanges: number;
    invalidInputs: number;
}
export declare class InputHandler implements IInputHandler {
    private inputStats;
    private lastInputTime;
    private inputBuffer;
    private readonly MAX_BUFFER_SIZE;
    onDirectionChange: (direction: Direction) => void;
    onPause: () => void;
    onReset: () => void;
    onToggleAIVisibility: () => void;
    constructor();
    /**
     * Sets up keyboard event listeners
     */
    private setupEventListeners;
    /**
     * Handles keydown events
     */
    private handleKeyDown;
    /**
     * Handles keyup events (for future use with hold-to-move mechanics)
     */
    private handleKeyUp;
    /**
     * Checks if a key is a game control key
     */
    private isGameKey;
    /**
     * Processes keyboard input and creates input event
     */
    private processKeyInput;
    /**
     * Converts key to direction
     */
    private keyToDirection;
    /**
     * Converts key to action
     */
    private keyToAction;
    /**
     * Adds input event to buffer
     */
    private addToBuffer;
    /**
     * Updates input statistics
     */
    private updateInputStats;
    /**
     * Executes the appropriate action for the input event
     */
    private executeInputAction;
    /**
     * Gets current input statistics for AI analysis
     */
    getInputStats(): Readonly<InputStats>;
    /**
     * Gets recent input buffer for pattern analysis
     */
    getRecentInputs(count?: number): InputEvent[];
    /**
     * Calculates reaction time for the last direction change
     */
    getLastReactionTime(): number;
    /**
     * Analyzes input patterns for AI decision making
     */
    analyzeInputPatterns(): {
        averageReactionTime: number;
        inputFrequency: number;
        preferredDirections: Direction[];
        inputConsistency: number;
    };
    /**
     * Increments invalid input counter
     */
    recordInvalidInput(): void;
    /**
     * Resets input statistics (for new game sessions)
     */
    resetStats(): void;
    /**
     * Creates a PlayerInput object for the game engine
     */
    createPlayerInput(direction: Direction): PlayerInput;
    /**
     * Removes event listeners (cleanup)
     */
    destroy(): void;
    /**
     * Simulates input for testing purposes
     */
    simulateInput(key: string): void;
}
//# sourceMappingURL=InputHandler.d.ts.map