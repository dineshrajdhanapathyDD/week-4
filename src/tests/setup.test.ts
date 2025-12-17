/**
 * Basic setup test to verify testing framework is working
 */

import * as fc from 'fast-check';
import { Direction, Position } from '../interfaces';

describe('Project Setup', () => {
  it('should have TypeScript interfaces available', () => {
    const position: Position = { x: 5, y: 10 };
    expect(position.x).toBe(5);
    expect(position.y).toBe(10);
  });

  it('should have Direction enum working', () => {
    expect(Direction.UP).toBe('UP');
    expect(Direction.DOWN).toBe('DOWN');
    expect(Direction.LEFT).toBe('LEFT');
    expect(Direction.RIGHT).toBe('RIGHT');
  });

  it('should have fast-check property testing available', () => {
    fc.assert(fc.property(
      fc.integer(),
      fc.integer(),
      (x, y) => {
        const pos: Position = { x, y };
        return pos.x === x && pos.y === y;
      }
    ));
  });
});