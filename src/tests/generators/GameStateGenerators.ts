/**
 * Test data generators for property-based testing
 * These generators create valid game states and inputs for testing
 */

import * as fc from 'fast-check';
import { GameState, Position, Direction, SnakeSegment } from '../../interfaces';

/**
 * Generates valid positions within grid bounds
 */
export const positionGenerator = (gridWidth = 20, gridHeight = 20): fc.Arbitrary<Position> =>
  fc.record({
    x: fc.integer({ min: 0, max: gridWidth - 1 }),
    y: fc.integer({ min: 0, max: gridHeight - 1 })
  });

/**
 * Generates valid directions
 */
export const directionGenerator = (): fc.Arbitrary<Direction> =>
  fc.constantFrom(Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT);

/**
 * Generates valid snake segments
 */
export const snakeSegmentGenerator = (gridWidth = 20, gridHeight = 20): fc.Arbitrary<SnakeSegment> =>
  fc.record({
    position: positionGenerator(gridWidth, gridHeight),
    direction: directionGenerator(),
    age: fc.integer({ min: 0, max: 100 })
  });

/**
 * Generates valid snake (array of segments)
 */
export const snakeGenerator = (gridWidth = 20, gridHeight = 20): fc.Arbitrary<SnakeSegment[]> =>
  fc.array(snakeSegmentGenerator(gridWidth, gridHeight), { minLength: 1, maxLength: 10 });

/**
 * Generates valid game states for testing
 */
export const gameStateGenerator = (): fc.Arbitrary<GameState> =>
  fc.record({
    snake: snakeGenerator(),
    food: positionGenerator(),
    score: fc.integer({ min: 0, max: 10000 }),
    gameStatus: fc.constantFrom('INIT', 'PLAYING', 'PAUSED', 'GAME_OVER'),
    speed: fc.float({ min: 0.1, max: 5.0 }),
    gridSize: fc.record({
      width: fc.constant(20),
      height: fc.constant(20)
    }),
    gameTime: fc.integer({ min: 0, max: 300000 }) // up to 5 minutes
  });

/**
 * Generates valid food positions that don't overlap with snake
 */
export const validFoodPositionGenerator = (snake: SnakeSegment[]): fc.Arbitrary<Position> => {
  const occupiedPositions = snake.map(segment => segment.position);
  return positionGenerator().filter(pos => 
    !occupiedPositions.some(occupied => 
      occupied.x === pos.x && occupied.y === pos.y
    )
  );
};