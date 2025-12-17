/**
 * AI system types and interfaces for adaptive gameplay
 */

import { GameState, PlayerInput, Position, Direction } from './GameTypes';

export interface AIDecision {
  timestamp: number;
  type: 'SPEED_ADJUSTMENT' | 'FOOD_PLACEMENT' | 'RECOVERY_TRIGGER';
  reasoning: string;
  playerMetrics: {
    reactionTime: number;
    stressLevel: number;
    skillLevel: number;
  };
  gameContext: {
    score: number;
    snakeLength: number;
    gameTime: number;
  };
}

export interface PlayerBehaviorMetrics {
  inputLatency: number[];
  movementPatterns: Direction[];
  collisionNearMisses: number;
  foodCollectionEfficiency: number;
  sessionDuration: number;
}

export interface PlayerProfile {
  reactionTimes: number[];
  errorFrequency: number;
  riskTolerance: number;
  skillProgression: number;
  sessionStartTime: number;
  
  // Methods
  averageReactionTime(): number;
  calculateStressLevel(): number;
  predictNextMove(gameState: GameState): Direction[];
}

export interface AIGameDirector {
  analyzePlayerBehavior(gameState: GameState, playerInput: PlayerInput): void;
  calculateOptimalFoodPlacement(gameState: GameState): Position;
  adjustGameSpeed(currentSpeed: number, playerProfile: PlayerProfile): number;
  shouldTriggerRecoveryMechanic(playerProfile: PlayerProfile): boolean;
  logDecision(decision: string, reasoning: string): void;
  getDecisionHistory(): AIDecision[];
}