/**
 * Food Manager - Handles food spawning, consumption, and scoring logic
 * Provides intelligent food placement capabilities for AI integration
 */
import { Position, GameState } from '../types/GameTypes';
export interface FoodConsumptionResult {
    consumed: boolean;
    scoreIncrease: number;
    newFoodPosition?: Position;
}
export declare class FoodManager {
    private readonly FOOD_SCORE_VALUE;
    private readonly BONUS_SCORE_MULTIPLIER;
    private readonly BONUS_THRESHOLD;
    /**
     * Checks if food is consumed and handles the consumption logic
     */
    static checkFoodConsumption(gameState: GameState): FoodConsumptionResult;
    /**
     * Calculates score increase based on game state and performance
     */
    private static calculateScoreIncrease;
    /**
     * Generates optimal food position considering snake position and AI preferences
     */
    static generateOptimalFoodPosition(gameState: GameState, aiPreference?: 'easy' | 'medium' | 'hard'): Position;
    /**
     * Gets all valid positions for food placement
     */
    private static getAllValidPositions;
    /**
     * Selects food position based on AI difficulty preference
     */
    private static selectPositionByDifficulty;
    /**
     * Validates food position for placement
     */
    static isValidFoodPosition(position: Position, gameState: GameState): boolean;
    /**
     * Gets food placement statistics for AI analysis
     */
    static getFoodPlacementStats(gameState: GameState): {
        totalValidPositions: number;
        averageDistanceToHead: number;
        closestDistance: number;
        farthestDistance: number;
        dangerousPositions: number;
    };
    /**
     * Suggests optimal food placement for current game state
     */
    static suggestFoodPlacement(gameState: GameState): {
        position: Position;
        reasoning: string;
        difficulty: 'easy' | 'medium' | 'hard';
    };
    /**
     * Calculates food collection efficiency for player analysis
     */
    static calculateCollectionEfficiency(foodCollected: number, totalMoves: number, gameTime: number): number;
}
//# sourceMappingURL=FoodManager.d.ts.map