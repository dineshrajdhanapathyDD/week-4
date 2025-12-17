/**
 * Food Manager - Handles food spawning, consumption, and scoring logic
 * Provides intelligent food placement capabilities for AI integration
 */
import { CollisionDetector } from './CollisionDetector';
export class FoodManager {
    constructor() {
        this.FOOD_SCORE_VALUE = 10;
        this.BONUS_SCORE_MULTIPLIER = 1.5;
        this.BONUS_THRESHOLD = 5; // Consecutive food without collision
    }
    /**
     * Checks if food is consumed and handles the consumption logic
     */
    static checkFoodConsumption(gameState) {
        const head = gameState.snake[0];
        const foodConsumed = head.position.x === gameState.food.x &&
            head.position.y === gameState.food.y;
        if (!foodConsumed) {
            return { consumed: false, scoreIncrease: 0 };
        }
        // Calculate score increase (with potential bonus)
        const scoreIncrease = this.calculateScoreIncrease(gameState);
        // Generate new food position
        const newFoodPosition = this.generateOptimalFoodPosition(gameState);
        return {
            consumed: true,
            scoreIncrease,
            newFoodPosition
        };
    }
    /**
     * Calculates score increase based on game state and performance
     */
    static calculateScoreIncrease(gameState) {
        const baseScore = 10; // FOOD_SCORE_VALUE
        // Bonus for longer snakes (higher difficulty)
        const lengthBonus = Math.floor(gameState.snake.length / 10) * 5;
        // Speed bonus for faster gameplay
        const speedBonus = Math.floor((gameState.speed - 1) * 5);
        return baseScore + lengthBonus + speedBonus;
    }
    /**
     * Generates optimal food position considering snake position and AI preferences
     */
    static generateOptimalFoodPosition(gameState, aiPreference) {
        const { width, height } = gameState.gridSize;
        const snake = gameState.snake;
        const head = snake[0];
        // Get all valid positions
        const validPositions = this.getAllValidPositions(gameState);
        if (validPositions.length === 0) {
            throw new Error('No valid positions available for food placement');
        }
        // Apply AI preference if specified
        if (aiPreference) {
            return this.selectPositionByDifficulty(validPositions, head.position, aiPreference);
        }
        // Default: random valid position
        return validPositions[Math.floor(Math.random() * validPositions.length)];
    }
    /**
     * Gets all valid positions for food placement
     */
    static getAllValidPositions(gameState) {
        const { width, height } = gameState.gridSize;
        const validPositions = [];
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const position = { x, y };
                if (!CollisionDetector.wouldCollideWithSnake(position, gameState.snake)) {
                    validPositions.push(position);
                }
            }
        }
        return validPositions;
    }
    /**
     * Selects food position based on AI difficulty preference
     */
    static selectPositionByDifficulty(validPositions, snakeHead, difficulty) {
        // Calculate distances for all valid positions
        const positionsWithDistance = validPositions.map(pos => ({
            position: pos,
            distance: CollisionDetector.calculateDistance(snakeHead, pos)
        }));
        // Sort by distance
        positionsWithDistance.sort((a, b) => a.distance - b.distance);
        const totalPositions = positionsWithDistance.length;
        let selectedIndex;
        switch (difficulty) {
            case 'easy':
                // Choose from closest 30% of positions
                selectedIndex = Math.floor(Math.random() * Math.max(1, totalPositions * 0.3));
                break;
            case 'medium':
                // Choose from middle 40% of positions
                const middleStart = Math.floor(totalPositions * 0.3);
                const middleRange = Math.max(1, totalPositions * 0.4);
                selectedIndex = middleStart + Math.floor(Math.random() * middleRange);
                break;
            case 'hard':
                // Choose from farthest 30% of positions
                const farStart = Math.floor(totalPositions * 0.7);
                selectedIndex = farStart + Math.floor(Math.random() * (totalPositions - farStart));
                break;
        }
        return positionsWithDistance[selectedIndex].position;
    }
    /**
     * Validates food position for placement
     */
    static isValidFoodPosition(position, gameState) {
        // Check bounds
        if (!CollisionDetector.isPositionValid(position, gameState.gridSize)) {
            return false;
        }
        // Check collision with snake
        if (CollisionDetector.wouldCollideWithSnake(position, gameState.snake)) {
            return false;
        }
        return true;
    }
    /**
     * Gets food placement statistics for AI analysis
     */
    static getFoodPlacementStats(gameState) {
        const validPositions = this.getAllValidPositions(gameState);
        const head = gameState.snake[0];
        if (validPositions.length === 0) {
            return {
                totalValidPositions: 0,
                averageDistanceToHead: 0,
                closestDistance: 0,
                farthestDistance: 0,
                dangerousPositions: 0
            };
        }
        const distances = validPositions.map(pos => CollisionDetector.calculateDistance(head.position, pos));
        const averageDistance = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
        const closestDistance = Math.min(...distances);
        const farthestDistance = Math.max(...distances);
        // Count positions that would put snake in danger
        const dangerousPositions = validPositions.filter(pos => {
            // Simulate placing food there and check if it creates a dangerous situation
            const tempGameState = { ...gameState, food: pos };
            return CollisionDetector.assessDangerLevel(tempGameState) > 0.5;
        }).length;
        return {
            totalValidPositions: validPositions.length,
            averageDistanceToHead: averageDistance,
            closestDistance,
            farthestDistance,
            dangerousPositions
        };
    }
    /**
     * Suggests optimal food placement for current game state
     */
    static suggestFoodPlacement(gameState) {
        const stats = this.getFoodPlacementStats(gameState);
        const dangerLevel = CollisionDetector.assessDangerLevel(gameState);
        let difficulty;
        let reasoning;
        // Determine difficulty based on game state
        if (dangerLevel > 0.7 || stats.totalValidPositions < 10) {
            difficulty = 'easy';
            reasoning = 'Player in high danger - providing easier food placement for recovery';
        }
        else if (gameState.snake.length > 15 || gameState.speed > 2.0) {
            difficulty = 'hard';
            reasoning = 'Player showing mastery - increasing challenge with distant food placement';
        }
        else {
            difficulty = 'medium';
            reasoning = 'Balanced difficulty - moderate food placement distance';
        }
        const position = this.generateOptimalFoodPosition(gameState, difficulty);
        return { position, reasoning, difficulty };
    }
    /**
     * Calculates food collection efficiency for player analysis
     */
    static calculateCollectionEfficiency(foodCollected, totalMoves, gameTime) {
        if (totalMoves === 0 || gameTime === 0)
            return 0;
        // Efficiency based on food per move and time
        const foodPerMove = foodCollected / totalMoves;
        const foodPerSecond = foodCollected / (gameTime / 1000);
        // Normalize to 0-1 scale (assuming good players get ~0.1 food per move)
        return Math.min(1, (foodPerMove + foodPerSecond * 0.01) * 10);
    }
}
//# sourceMappingURL=FoodManager.js.map