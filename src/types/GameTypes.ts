/**
 * Core game types and interfaces for the AI-driven Snake game
 */

export interface Position {
  x: number;
  y: number;
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export interface SnakeSegment {
  position: Position;
  direction: Direction;
  age: number; // for visual effects
}

export interface GameState {
  snake: SnakeSegment[];
  food: Position;
  score: number;
  gameStatus: 'INIT' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';
  speed: number;
  gridSize: { width: number; height: number };
  gameTime: number;
}

export interface PlayerInput {
  direction: Direction;
  timestamp: number;
  inputLatency: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface Sprite {
  data: ImageData | string;
  width: number;
  height: number;
}