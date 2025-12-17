/**
 * Test data generators for property-based testing
 * These generators create valid game states and inputs for testing
 */
import * as fc from 'fast-check';
import { GameState, Position, Direction, SnakeSegment } from '../../interfaces';
/**
 * Generates valid positions within grid bounds
 */
export declare const positionGenerator: (gridWidth?: number, gridHeight?: number) => fc.Arbitrary<Position>;
/**
 * Generates valid directions
 */
export declare const directionGenerator: () => fc.Arbitrary<Direction>;
/**
 * Generates valid snake segments
 */
export declare const snakeSegmentGenerator: (gridWidth?: number, gridHeight?: number) => fc.Arbitrary<SnakeSegment>;
/**
 * Generates valid snake (array of segments)
 */
export declare const snakeGenerator: (gridWidth?: number, gridHeight?: number) => fc.Arbitrary<SnakeSegment[]>;
/**
 * Generates valid game states for testing
 */
export declare const gameStateGenerator: () => fc.Arbitrary<GameState>;
/**
 * Generates valid food positions that don't overlap with snake
 */
export declare const validFoodPositionGenerator: (snake: SnakeSegment[]) => fc.Arbitrary<Position>;
//# sourceMappingURL=GameStateGenerators.d.ts.map