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

export class InputHandler implements IInputHandler {
  private inputStats: InputStats;
  private lastInputTime: number = 0;
  private inputBuffer: InputEvent[] = [];
  private readonly MAX_BUFFER_SIZE = 10;
  
  // Callback functions
  public onDirectionChange: (direction: Direction) => void = () => {};
  public onPause: () => void = () => {};
  public onReset: () => void = () => {};
  public onToggleAIVisibility: () => void = () => {};

  constructor() {
    this.inputStats = {
      totalInputs: 0,
      averageLatency: 0,
      inputsPerSecond: 0,
      lastInputTime: 0,
      directionChanges: 0,
      invalidInputs: 0
    };
    
    this.setupEventListeners();
  }

  /**
   * Sets up keyboard event listeners
   */
  private setupEventListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown.bind(this));
      window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }
  }

  /**
   * Handles keydown events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const timestamp = performance.now();
    const inputLatency = timestamp - this.lastInputTime;
    
    // Prevent default behavior for game keys
    if (this.isGameKey(event.key)) {
      event.preventDefault();
    }

    const inputEvent = this.processKeyInput(event.key, timestamp, inputLatency);
    
    if (inputEvent) {
      this.addToBuffer(inputEvent);
      this.updateInputStats(inputEvent);
      this.executeInputAction(inputEvent);
    }
    
    this.lastInputTime = timestamp;
  }

  /**
   * Handles keyup events (for future use with hold-to-move mechanics)
   */
  private handleKeyUp(event: KeyboardEvent): void {
    // Currently not used, but available for future enhancements
  }

  /**
   * Checks if a key is a game control key
   */
  private isGameKey(key: string): boolean {
    const gameKeys = [
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'w', 'a', 's', 'd', 'W', 'A', 'S', 'D',
      ' ', 'Escape', 'r', 'R', 't', 'T'
    ];
    return gameKeys.includes(key);
  }

  /**
   * Processes keyboard input and creates input event
   */
  private processKeyInput(key: string, timestamp: number, inputLatency: number): InputEvent | null {
    const direction = this.keyToDirection(key);
    const action = this.keyToAction(key);

    if (!direction && !action) {
      return null; // Not a recognized game input
    }

    return {
      direction,
      action,
      timestamp,
      inputLatency
    };
  }

  /**
   * Converts key to direction
   */
  private keyToDirection(key: string): Direction | undefined {
    const keyMap: Record<string, Direction> = {
      'ArrowUp': Direction.UP,
      'w': Direction.UP,
      'W': Direction.UP,
      'ArrowDown': Direction.DOWN,
      's': Direction.DOWN,
      'S': Direction.DOWN,
      'ArrowLeft': Direction.LEFT,
      'a': Direction.LEFT,
      'A': Direction.LEFT,
      'ArrowRight': Direction.RIGHT,
      'd': Direction.RIGHT,
      'D': Direction.RIGHT
    };

    return keyMap[key];
  }

  /**
   * Converts key to action
   */
  private keyToAction(key: string): 'pause' | 'reset' | 'toggleAI' | undefined {
    const actionMap: Record<string, 'pause' | 'reset' | 'toggleAI'> = {
      ' ': 'pause',
      'Escape': 'pause',
      'r': 'reset',
      'R': 'reset',
      't': 'toggleAI',
      'T': 'toggleAI'
    };

    return actionMap[key];
  }

  /**
   * Adds input event to buffer
   */
  private addToBuffer(inputEvent: InputEvent): void {
    this.inputBuffer.push(inputEvent);
    
    // Keep buffer size manageable
    if (this.inputBuffer.length > this.MAX_BUFFER_SIZE) {
      this.inputBuffer.shift();
    }
  }

  /**
   * Updates input statistics
   */
  private updateInputStats(inputEvent: InputEvent): void {
    this.inputStats.totalInputs++;
    this.inputStats.lastInputTime = inputEvent.timestamp;
    
    if (inputEvent.direction) {
      this.inputStats.directionChanges++;
    }

    // Update average latency
    const totalLatency = this.inputStats.averageLatency * (this.inputStats.totalInputs - 1) + inputEvent.inputLatency;
    this.inputStats.averageLatency = totalLatency / this.inputStats.totalInputs;

    // Calculate inputs per second (over last 10 inputs)
    const recentInputs = this.inputBuffer.slice(-10);
    if (recentInputs.length > 1) {
      const timeSpan = recentInputs[recentInputs.length - 1].timestamp - recentInputs[0].timestamp;
      this.inputStats.inputsPerSecond = (recentInputs.length - 1) / (timeSpan / 1000);
    }
  }

  /**
   * Executes the appropriate action for the input event
   */
  private executeInputAction(inputEvent: InputEvent): void {
    if (inputEvent.direction) {
      this.onDirectionChange(inputEvent.direction);
    }

    if (inputEvent.action) {
      switch (inputEvent.action) {
        case 'pause':
          this.onPause();
          break;
        case 'reset':
          this.onReset();
          break;
        case 'toggleAI':
          this.onToggleAIVisibility();
          break;
      }
    }
  }

  /**
   * Gets current input statistics for AI analysis
   */
  public getInputStats(): Readonly<InputStats> {
    return { ...this.inputStats };
  }

  /**
   * Gets recent input buffer for pattern analysis
   */
  public getRecentInputs(count: number = 5): InputEvent[] {
    return this.inputBuffer.slice(-count);
  }

  /**
   * Calculates reaction time for the last direction change
   */
  public getLastReactionTime(): number {
    const directionInputs = this.inputBuffer.filter(input => input.direction);
    if (directionInputs.length < 2) {
      return 0;
    }

    const lastTwo = directionInputs.slice(-2);
    return lastTwo[1].timestamp - lastTwo[0].timestamp;
  }

  /**
   * Analyzes input patterns for AI decision making
   */
  public analyzeInputPatterns(): {
    averageReactionTime: number;
    inputFrequency: number;
    preferredDirections: Direction[];
    inputConsistency: number;
  } {
    const directionInputs = this.inputBuffer.filter(input => input.direction);
    
    // Calculate average reaction time
    let totalReactionTime = 0;
    let reactionCount = 0;
    
    for (let i = 1; i < directionInputs.length; i++) {
      totalReactionTime += directionInputs[i].timestamp - directionInputs[i - 1].timestamp;
      reactionCount++;
    }
    
    const averageReactionTime = reactionCount > 0 ? totalReactionTime / reactionCount : 0;

    // Calculate input frequency
    const inputFrequency = this.inputStats.inputsPerSecond;

    // Find preferred directions
    const directionCounts: Record<Direction, number> = {
      [Direction.UP]: 0,
      [Direction.DOWN]: 0,
      [Direction.LEFT]: 0,
      [Direction.RIGHT]: 0
    };

    directionInputs.forEach(input => {
      if (input.direction) {
        directionCounts[input.direction]++;
      }
    });

    const preferredDirections = Object.entries(directionCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([direction]) => direction as Direction);

    // Calculate input consistency (lower variance in timing = higher consistency)
    const latencies = this.inputBuffer.map(input => input.inputLatency);
    const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
    const variance = latencies.reduce((sum, lat) => sum + Math.pow(lat - avgLatency, 2), 0) / latencies.length;
    const inputConsistency = Math.max(0, 1 - (Math.sqrt(variance) / avgLatency));

    return {
      averageReactionTime,
      inputFrequency,
      preferredDirections,
      inputConsistency: isNaN(inputConsistency) ? 0 : inputConsistency
    };
  }

  /**
   * Increments invalid input counter
   */
  public recordInvalidInput(): void {
    this.inputStats.invalidInputs++;
  }

  /**
   * Resets input statistics (for new game sessions)
   */
  public resetStats(): void {
    this.inputStats = {
      totalInputs: 0,
      averageLatency: 0,
      inputsPerSecond: 0,
      lastInputTime: 0,
      directionChanges: 0,
      invalidInputs: 0
    };
    this.inputBuffer = [];
    this.lastInputTime = 0;
  }

  /**
   * Creates a PlayerInput object for the game engine
   */
  public createPlayerInput(direction: Direction): PlayerInput {
    const timestamp = performance.now();
    const inputLatency = timestamp - this.lastInputTime;

    return {
      direction,
      timestamp,
      inputLatency
    };
  }

  /**
   * Removes event listeners (cleanup)
   */
  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown.bind(this));
      window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    }
  }

  /**
   * Simulates input for testing purposes
   */
  public simulateInput(key: string): void {
    const timestamp = performance.now();
    const inputLatency = timestamp - this.lastInputTime;
    
    const inputEvent = this.processKeyInput(key, timestamp, inputLatency);
    
    if (inputEvent) {
      this.addToBuffer(inputEvent);
      this.updateInputStats(inputEvent);
      this.executeInputAction(inputEvent);
    }
    
    this.lastInputTime = timestamp;
  }
}