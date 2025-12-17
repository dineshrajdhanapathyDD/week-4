/**
 * Player Profiler - Tracks and analyzes player behavior patterns
 * Provides comprehensive behavioral analysis for AI decision making
 */
import { Direction } from '../types/GameTypes';
export class PlayerProfiler {
    constructor() {
        this.reactionTimes = [];
        this.errorFrequency = 0;
        this.riskTolerance = 0.5; // 0 = very safe, 1 = very risky
        this.skillProgression = 0;
        this.movementHistory = [];
        this.collisionHistory = [];
        this.foodCollectionHistory = [];
        this.decisionPoints = [];
        // Analysis parameters
        this.MAX_HISTORY_SIZE = 100;
        this.REACTION_TIME_WINDOW = 50; // Keep last 50 reaction times
        this.RISK_ANALYSIS_WINDOW = 20; // Analyze last 20 decisions
        this.sessionStartTime = performance.now();
        this.behaviorMetrics = {
            inputLatency: [],
            movementPatterns: [],
            collisionNearMisses: 0,
            foodCollectionEfficiency: 0,
            sessionDuration: 0
        };
    }
    /**
     * Records a player input with timing analysis
     */
    recordInput(playerInput, gameState) {
        // Record reaction time
        this.reactionTimes.push(playerInput.inputLatency);
        this.behaviorMetrics.inputLatency.push(playerInput.inputLatency);
        // Maintain history size
        if (this.reactionTimes.length > this.REACTION_TIME_WINDOW) {
            this.reactionTimes.shift();
            this.behaviorMetrics.inputLatency.shift();
        }
        // Record movement pattern
        this.movementHistory.push(playerInput.direction);
        this.behaviorMetrics.movementPatterns.push(playerInput.direction);
        if (this.movementHistory.length > this.MAX_HISTORY_SIZE) {
            this.movementHistory.shift();
            this.behaviorMetrics.movementPatterns.shift();
        }
        // Analyze decision context for risk assessment
        this.analyzeDecisionRisk(playerInput, gameState);
        // Update skill progression
        this.updateSkillProgression(gameState);
    }
    /**
     * Records a collision event
     */
    recordCollision(collisionType, position, gameState) {
        this.collisionHistory.push({
            timestamp: performance.now(),
            type: collisionType,
            position
        });
        // Update error frequency
        this.errorFrequency = this.calculateErrorFrequency();
        // Analyze if this was a near miss or actual collision
        if (collisionType === 'near_miss') {
            this.behaviorMetrics.collisionNearMisses++;
        }
    }
    /**
     * Records food collection event
     */
    recordFoodCollection(gameState, timeTaken) {
        const efficiency = this.calculateFoodCollectionEfficiency(gameState, timeTaken);
        this.foodCollectionHistory.push({
            timestamp: performance.now(),
            efficiency
        });
        // Update overall efficiency
        this.behaviorMetrics.foodCollectionEfficiency = this.calculateAverageEfficiency();
    }
    /**
     * Calculates average reaction time
     */
    averageReactionTime() {
        if (this.reactionTimes.length === 0)
            return 0;
        const sum = this.reactionTimes.reduce((acc, time) => acc + time, 0);
        return sum / this.reactionTimes.length;
    }
    /**
     * Calculates current stress level based on various factors
     */
    calculateStressLevel() {
        let stressFactors = 0;
        let factorCount = 0;
        // Reaction time stress (faster reactions under pressure)
        if (this.reactionTimes.length >= 5) {
            const recentAvg = this.reactionTimes.slice(-5).reduce((a, b) => a + b, 0) / 5;
            const overallAvg = this.averageReactionTime();
            if (recentAvg < overallAvg * 0.8) { // 20% faster than average
                stressFactors += 0.3;
            }
            factorCount++;
        }
        // Input frequency stress
        const recentInputs = this.behaviorMetrics.inputLatency.slice(-10);
        if (recentInputs.length >= 5) {
            const avgInterval = recentInputs.reduce((a, b) => a + b, 0) / recentInputs.length;
            if (avgInterval < 150) { // Very frequent inputs
                stressFactors += 0.4;
            }
            factorCount++;
        }
        // Error frequency stress
        stressFactors += this.errorFrequency * 0.5;
        factorCount++;
        // Near miss stress
        const recentNearMisses = this.behaviorMetrics.collisionNearMisses;
        if (recentNearMisses > 3) {
            stressFactors += 0.3;
        }
        factorCount++;
        return factorCount > 0 ? Math.min(1, stressFactors / factorCount) : 0;
    }
    /**
     * Predicts probable next moves based on movement patterns
     */
    predictNextMove(gameState) {
        if (this.movementHistory.length < 3) {
            return [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
        }
        // Analyze recent movement patterns
        const recentMoves = this.movementHistory.slice(-10);
        const patterns = this.identifyMovementPatterns(recentMoves);
        // Consider current game context
        const contextualMoves = this.analyzeContextualMoves(gameState);
        // Combine pattern-based and contextual predictions
        return this.combinePredictions(patterns, contextualMoves);
    }
    /**
     * Analyzes decision risk based on game context
     */
    analyzeDecisionRisk(playerInput, gameState) {
        const head = gameState.snake[0];
        const availableMoves = this.getAvailableMoves(gameState);
        // Record decision point
        this.decisionPoints.push({
            timestamp: performance.now(),
            options: availableMoves.length,
            choice: playerInput.direction
        });
        // Maintain decision history
        if (this.decisionPoints.length > this.RISK_ANALYSIS_WINDOW) {
            this.decisionPoints.shift();
        }
        // Calculate risk of chosen direction
        const riskLevel = this.calculateDirectionRisk(playerInput.direction, gameState);
        // Update risk tolerance based on choices
        this.updateRiskTolerance(riskLevel, availableMoves.length);
    }
    /**
     * Calculates risk level of a direction choice
     */
    calculateDirectionRisk(direction, gameState) {
        const head = gameState.snake[0];
        const nextPosition = this.getNextPosition(head.position, direction);
        let risk = 0;
        // Wall proximity risk
        const distanceToWall = this.getDistanceToWall(nextPosition, gameState.gridSize);
        if (distanceToWall <= 1)
            risk += 0.4;
        else if (distanceToWall <= 2)
            risk += 0.2;
        // Self-collision risk
        const distanceToSelf = this.getDistanceToSnakeBody(nextPosition, gameState.snake);
        if (distanceToSelf <= 1)
            risk += 0.5;
        else if (distanceToSelf <= 2)
            risk += 0.3;
        // Trap risk (limited escape routes)
        const escapeRoutes = this.countEscapeRoutes(nextPosition, gameState);
        if (escapeRoutes <= 1)
            risk += 0.3;
        else if (escapeRoutes <= 2)
            risk += 0.1;
        return Math.min(1, risk);
    }
    /**
     * Updates risk tolerance based on player choices
     */
    updateRiskTolerance(chosenRisk, availableOptions) {
        // If player consistently chooses risky moves, increase risk tolerance
        // If player avoids risk, decrease risk tolerance
        const riskWeight = 0.1; // How much each decision affects tolerance
        const adjustment = (chosenRisk - 0.5) * riskWeight;
        this.riskTolerance = Math.max(0, Math.min(1, this.riskTolerance + adjustment));
    }
    /**
     * Updates skill progression based on performance
     */
    updateSkillProgression(gameState) {
        const factors = {
            score: gameState.score / 1000, // Normalize score
            snakeLength: gameState.snake.length / 20, // Normalize length
            gameTime: Math.min(1, gameState.gameTime / 300000), // 5 minutes max
            efficiency: this.behaviorMetrics.foodCollectionEfficiency,
            consistency: 1 - this.errorFrequency
        };
        // Weighted average of skill factors
        this.skillProgression = (factors.score * 0.3 +
            factors.snakeLength * 0.25 +
            factors.gameTime * 0.15 +
            factors.efficiency * 0.2 +
            factors.consistency * 0.1);
    }
    /**
     * Calculates error frequency over recent gameplay
     */
    calculateErrorFrequency() {
        const recentCollisions = this.collisionHistory.slice(-10);
        const timeWindow = 30000; // 30 seconds
        const currentTime = performance.now();
        const recentErrors = recentCollisions.filter(collision => currentTime - collision.timestamp < timeWindow);
        return Math.min(1, recentErrors.length / 5); // Normalize to 0-1
    }
    /**
     * Calculates food collection efficiency
     */
    calculateFoodCollectionEfficiency(gameState, timeTaken) {
        const head = gameState.snake[0];
        const food = gameState.food;
        // Calculate optimal path length (Manhattan distance)
        const optimalMoves = Math.abs(head.position.x - food.x) + Math.abs(head.position.y - food.y);
        const actualTime = timeTaken / 1000; // Convert to seconds
        // Efficiency based on time vs optimal path
        const timeEfficiency = Math.max(0, 1 - (actualTime - optimalMoves) / optimalMoves);
        return Math.min(1, timeEfficiency);
    }
    /**
     * Calculates average efficiency from history
     */
    calculateAverageEfficiency() {
        if (this.foodCollectionHistory.length === 0)
            return 0;
        const recentHistory = this.foodCollectionHistory.slice(-10);
        const sum = recentHistory.reduce((acc, record) => acc + record.efficiency, 0);
        return sum / recentHistory.length;
    }
    /**
     * Identifies movement patterns in recent history
     */
    identifyMovementPatterns(moves) {
        const patterns = {};
        // Look for 2-move patterns
        for (let i = 0; i < moves.length - 1; i++) {
            const pattern = `${moves[i]}-${moves[i + 1]}`;
            patterns[pattern] = (patterns[pattern] || 0) + 1;
        }
        // Find most common next moves
        const currentMove = moves[moves.length - 1];
        const relevantPatterns = Object.entries(patterns)
            .filter(([pattern]) => pattern.startsWith(currentMove))
            .sort(([, a], [, b]) => b - a);
        return relevantPatterns.map(([pattern]) => pattern.split('-')[1]);
    }
    /**
     * Analyzes contextually appropriate moves
     */
    analyzeContextualMoves(gameState) {
        const head = gameState.snake[0];
        const food = gameState.food;
        const moves = [];
        [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT].forEach(direction => {
            const nextPos = this.getNextPosition(head.position, direction);
            let score = 0;
            // Score based on food proximity
            const foodDistance = Math.abs(nextPos.x - food.x) + Math.abs(nextPos.y - food.y);
            score += (20 - foodDistance) * 0.1; // Closer to food is better
            // Score based on safety
            const risk = this.calculateDirectionRisk(direction, gameState);
            score += (1 - risk) * 0.5; // Lower risk is better
            moves.push({ direction, score });
        });
        return moves
            .sort((a, b) => b.score - a.score)
            .map(move => move.direction);
    }
    /**
     * Combines pattern-based and contextual predictions
     */
    combinePredictions(patterns, contextual) {
        const combined = new Map();
        // Weight pattern predictions
        patterns.forEach((direction, index) => {
            const weight = 1 / (index + 1); // Higher weight for more likely patterns
            combined.set(direction, (combined.get(direction) || 0) + weight * 0.6);
        });
        // Weight contextual predictions
        contextual.forEach((direction, index) => {
            const weight = 1 / (index + 1);
            combined.set(direction, (combined.get(direction) || 0) + weight * 0.4);
        });
        return Array.from(combined.entries())
            .sort(([, a], [, b]) => b - a)
            .map(([direction]) => direction);
    }
    /**
     * Helper methods for game analysis
     */
    getAvailableMoves(gameState) {
        const head = gameState.snake[0];
        const moves = [];
        [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT].forEach(direction => {
            const nextPos = this.getNextPosition(head.position, direction);
            // Check if move is valid (not into wall or self)
            if (this.isValidPosition(nextPos, gameState)) {
                moves.push(direction);
            }
        });
        return moves;
    }
    getNextPosition(position, direction) {
        const newPos = { ...position };
        switch (direction) {
            case Direction.UP:
                newPos.y -= 1;
                break;
            case Direction.DOWN:
                newPos.y += 1;
                break;
            case Direction.LEFT:
                newPos.x -= 1;
                break;
            case Direction.RIGHT:
                newPos.x += 1;
                break;
        }
        return newPos;
    }
    isValidPosition(position, gameState) {
        // Check bounds
        if (position.x < 0 || position.x >= gameState.gridSize.width ||
            position.y < 0 || position.y >= gameState.gridSize.height) {
            return false;
        }
        // Check snake collision
        return !gameState.snake.some(segment => segment.position.x === position.x && segment.position.y === position.y);
    }
    getDistanceToWall(position, gridSize) {
        return Math.min(position.x, position.y, gridSize.width - 1 - position.x, gridSize.height - 1 - position.y);
    }
    getDistanceToSnakeBody(position, snake) {
        let minDistance = Infinity;
        snake.slice(1).forEach(segment => {
            const distance = Math.abs(position.x - segment.position.x) +
                Math.abs(position.y - segment.position.y);
            minDistance = Math.min(minDistance, distance);
        });
        return minDistance === Infinity ? 10 : minDistance;
    }
    countEscapeRoutes(position, gameState) {
        let routes = 0;
        [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT].forEach(direction => {
            const nextPos = this.getNextPosition(position, direction);
            if (this.isValidPosition(nextPos, gameState)) {
                routes++;
            }
        });
        return routes;
    }
    /**
     * Gets comprehensive behavior metrics
     */
    getBehaviorMetrics() {
        this.behaviorMetrics.sessionDuration = performance.now() - this.sessionStartTime;
        return { ...this.behaviorMetrics };
    }
    /**
     * Resets profile for new session
     */
    reset() {
        this.reactionTimes = [];
        this.errorFrequency = 0;
        this.riskTolerance = 0.5;
        this.skillProgression = 0;
        this.sessionStartTime = performance.now();
        this.behaviorMetrics = {
            inputLatency: [],
            movementPatterns: [],
            collisionNearMisses: 0,
            foodCollectionEfficiency: 0,
            sessionDuration: 0
        };
        this.movementHistory = [];
        this.collisionHistory = [];
        this.foodCollectionHistory = [];
        this.decisionPoints = [];
    }
    /**
     * Gets detailed analysis report
     */
    getAnalysisReport() {
        return {
            profile: {
                averageReactionTime: this.averageReactionTime(),
                errorFrequency: this.errorFrequency,
                riskTolerance: this.riskTolerance,
                skillProgression: this.skillProgression,
                stressLevel: this.calculateStressLevel()
            },
            metrics: this.getBehaviorMetrics(),
            patterns: {
                preferredDirections: this.getPreferredDirections(),
                riskPatterns: this.getRiskPatterns(),
                efficiencyTrend: this.getEfficiencyTrend()
            }
        };
    }
    getPreferredDirections() {
        const counts = {
            [Direction.UP]: 0,
            [Direction.DOWN]: 0,
            [Direction.LEFT]: 0,
            [Direction.RIGHT]: 0
        };
        this.movementHistory.forEach(direction => {
            counts[direction]++;
        });
        return counts;
    }
    getRiskPatterns() {
        const recentDecisions = this.decisionPoints.slice(-10);
        return {
            averageRiskTaken: recentDecisions.reduce((sum, decision) => {
                // Calculate risk of the decision (simplified)
                return sum + (decision.options <= 2 ? 0.7 : 0.3);
            }, 0) / Math.max(1, recentDecisions.length),
            riskConsistency: this.calculateRiskConsistency(recentDecisions)
        };
    }
    calculateRiskConsistency(decisions) {
        if (decisions.length < 2)
            return 1;
        const risks = decisions.map(d => d.options <= 2 ? 0.7 : 0.3);
        const mean = risks.reduce((a, b) => a + b, 0) / risks.length;
        const variance = risks.reduce((sum, risk) => sum + Math.pow(risk - mean, 2), 0) / risks.length;
        return Math.max(0, 1 - Math.sqrt(variance));
    }
    getEfficiencyTrend() {
        if (this.foodCollectionHistory.length < 2)
            return 0;
        const recent = this.foodCollectionHistory.slice(-5);
        const older = this.foodCollectionHistory.slice(-10, -5);
        if (older.length === 0)
            return 0;
        const recentAvg = recent.reduce((sum, r) => sum + r.efficiency, 0) / recent.length;
        const olderAvg = older.reduce((sum, r) => sum + r.efficiency, 0) / older.length;
        return recentAvg - olderAvg; // Positive = improving, negative = declining
    }
}
//# sourceMappingURL=PlayerProfiler.js.map