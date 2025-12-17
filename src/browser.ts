/**
 * Browser-compatible entry point for the AI-driven Snake game
 * This file is designed to work directly in browsers without module systems
 */

import { GameController } from './GameController';

// Declare global types for browser
declare global {
  interface Window {
    game: any;
    toggleGame: () => void;
    resetGame: () => void;
    toggleAIVisibility: () => void;
  }
}

class BrowserAISnakeGame {
  private gameController: GameController;
  
  constructor(canvasId: string = 'gameCanvas') {
    console.log('Initializing AI Snake Game...');
    this.gameController = new GameController(canvasId);
  }
  
  public initialize(): void {
    console.log('Game ready - core mechanics and rendering implemented');
    
    // Initialize the game controller
    if (!this.gameController.initialize()) {
      console.error('Failed to initialize game controller');
      return;
    }
    
    // Render initial state
    this.renderInitialState();
    
    // Setup global functions for HTML buttons
    window.toggleGame = () => this.toggleGame();
    window.resetGame = () => this.resetGame();
    window.toggleAIVisibility = () => this.toggleAIVisibility();
    
    console.log('Game initialized successfully');
  }
  
  private renderInitialState(): void {
    try {
      const renderer = this.gameController.getRenderer();
      const gameState = this.gameController.getGameState();
      
      // Clear canvas and render initial state
      renderer.renderGame(gameState);
      renderer.renderUI(gameState.score);
      
      console.log('Initial game state rendered');
    } catch (error) {
      console.error('Failed to render initial state:', error);
    }
  }
  
  public toggleGame(): void {
    const gameState = this.gameController.getGameState();
    
    if (gameState.gameStatus === 'INIT' || gameState.gameStatus === 'GAME_OVER') {
      this.gameController.start();
    } else {
      this.gameController.togglePause();
    }
  }
  
  public resetGame(): void {
    this.gameController.reset();
    console.log('Game reset');
  }
  
  public toggleAIVisibility(): void {
    this.gameController.toggleAIExplanations();
    const aiExplanation = document.getElementById('aiExplanation');
    if (aiExplanation) {
      aiExplanation.style.display = aiExplanation.style.display === 'none' ? 'block' : 'none';
    }
  }
  
  public getGameController(): GameController {
    return this.gameController;
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing game...');
  
  // Check if canvas exists
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }
  
  console.log('Canvas found:', canvas.width, 'x', canvas.height);
  
  // Test canvas rendering
  const ctx = canvas.getContext('2d');
  if (ctx) {
    console.log('Canvas context obtained, testing render...');
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(10, 10, 50, 50);
    console.log('Test rectangle drawn');
  }
  
  const game = new BrowserAISnakeGame();
  game.initialize();
  
  // Make game globally accessible for debugging
  window.game = game;
});