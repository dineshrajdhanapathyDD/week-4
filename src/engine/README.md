# Game Engine Module

This module contains the core game mechanics and logic for the Snake game.

## Components

- `SnakeGameEngine.ts` - Main game engine implementation
- `GameStateManager.ts` - Game state management and transitions
- `CollisionDetector.ts` - Collision detection logic
- `FoodManager.ts` - Food spawning and management

## Architecture

The game engine operates as a deterministic core that provides predictable game mechanics. The AI system operates as an overlay that influences parameters but doesn't change the fundamental game rules.