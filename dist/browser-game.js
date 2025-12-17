/**
 * Browser-compatible AI Snake Game
 * This version bundles all functionality without ES modules
 */

// Simple browser-compatible version that works without module loading issues
console.log('Loading AI-Driven Snake Game (Browser Compatible)...');

// Game state and core functionality
let gameInstance = null;

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing AI Snake Game...');
    
    // Check if canvas exists
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        showError('Canvas not found. Please refresh the page.');
        return;
    }
    
    console.log('Canvas found:', canvas.width, 'x', canvas.height);
    
    try {
        // For now, let's create a simplified version that works
        // This will be enhanced with the full AI system later
        initSimpleGame();
    } catch (error) {
        console.error('Failed to initialize game:', error);
        showError('Failed to load game. Please try the classic version.');
    }
});

function initSimpleGame() {
    console.log('Initializing simplified AI Snake Game...');
    
    // Game state
    const gameState = {
        snake: [
            { position: { x: 10, y: 10 }, direction: 'RIGHT', age: 0 },
            { position: { x: 9, y: 10 }, direction: 'RIGHT', age: 1 },
            { position: { x: 8, y: 10 }, direction: 'RIGHT', age: 2 }
        ],
        food: { x: 15, y: 10 },
        score: 0,
        gameStatus: 'INIT',
        speed: 1.0,
        gridSize: { width: 20, height: 20 },
        gameTime: 0,
        startTime: null
    };
    
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const cellSize = canvas.width / gameState.gridSize.width;
    
    let isRunning = false;
    let gameLoop = null;
    let gameSpeed = 200;
    
    // AI simulation variables
    let aiDecisionCount = 0;
    let playerMoves = 0;
    let lastMoveTime = Date.now();
    
    // Render game
    function renderGame() {
        // Clear canvas
        ctx.fillStyle = '#001100';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(0, 128, 0, 0.1)';
        ctx.lineWidth = 1;
        
        for (let x = 0; x <= gameState.gridSize.width; x++) {
            ctx.beginPath();
            ctx.moveTo(x * cellSize, 0);
            ctx.lineTo(x * cellSize, canvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y <= gameState.gridSize.height; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * cellSize);
            ctx.lineTo(canvas.width, y * cellSize);
            ctx.stroke();
        }
        
        // Draw snake with AI-enhanced effects
        gameState.snake.forEach((segment, index) => {
            const alpha = 1 - (index * 0.08);
            ctx.fillStyle = index === 0 ? '#00FF00' : `rgba(0, 255, 0, ${Math.max(0.3, alpha)})`;
            
            // Add glow effect for head (AI enhancement)
            if (index === 0) {
                ctx.shadowColor = '#00FF00';
                ctx.shadowBlur = 8;
            } else {
                ctx.shadowBlur = 0;
            }
            
            ctx.fillRect(
                segment.position.x * cellSize + 2,
                segment.position.y * cellSize + 2,
                cellSize - 4,
                cellSize - 4
            );
        });
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Draw food with AI-calculated positioning effect
        const pulseIntensity = Math.sin(Date.now() * 0.008) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 255, 0, ${pulseIntensity})`;
        ctx.shadowColor = '#FFFF00';
        ctx.shadowBlur = 4;
        ctx.fillRect(
            gameState.food.x * cellSize + 4,
            gameState.food.y * cellSize + 4,
            cellSize - 8,
            cellSize - 8
        );
        ctx.shadowBlur = 0;
        
        // Update UI with AI status
        document.getElementById('score').textContent = gameState.score;
        document.getElementById('speed').textContent = gameState.speed.toFixed(1);
        
        // Simulate AI status updates
        const aiStatuses = ['Analyzing', 'Adapting', 'Monitoring', 'Optimizing'];
        const statusIndex = Math.floor(aiDecisionCount / 10) % aiStatuses.length;
        document.getElementById('aiStatus').textContent = aiStatuses[statusIndex];
        
        // Update game time
        if (gameState.startTime && isRunning) {
            gameState.gameTime = Math.floor((Date.now() - gameState.startTime) / 1000);
        }
    }
    
    // Handle keyboard input with AI behavior analysis
    function handleKeyPress(event) {
        if (!isRunning) return;
        
        const key = event.key.toLowerCase();
        let newDirection = null;
        
        switch (key) {
            case 'arrowup':
            case 'w':
                newDirection = 'UP';
                break;
            case 'arrowdown':
            case 's':
                newDirection = 'DOWN';
                break;
            case 'arrowleft':
            case 'a':
                newDirection = 'LEFT';
                break;
            case 'arrowright':
            case 'd':
                newDirection = 'RIGHT';
                break;
            case ' ':
            case 'p':
                toggleGame();
                event.preventDefault();
                return;
            case 'r':
                resetGame();
                event.preventDefault();
                return;
        }
        
        if (newDirection && isValidDirection(newDirection)) {
            gameState.snake[0].direction = newDirection;
            
            // AI behavior analysis simulation
            const currentTime = Date.now();
            const reactionTime = currentTime - lastMoveTime;
            lastMoveTime = currentTime;
            playerMoves++;
            
            // Simulate AI speed adjustment based on player performance
            if (playerMoves > 5 && reactionTime < 200) {
                // Player is doing well, slightly increase difficulty
                gameState.speed = Math.min(2.5, gameState.speed + 0.02);
                gameSpeed = Math.max(100, gameSpeed - 1);
            } else if (reactionTime > 800) {
                // Player struggling, reduce difficulty
                gameState.speed = Math.max(0.8, gameState.speed - 0.05);
                gameSpeed = Math.min(300, gameSpeed + 5);
            }
            
            event.preventDefault();
        }
    }
    
    function isValidDirection(newDirection) {
        const head = gameState.snake[0];
        const opposites = {
            'UP': 'DOWN',
            'DOWN': 'UP',
            'LEFT': 'RIGHT',
            'RIGHT': 'LEFT'
        };
        return opposites[newDirection] !== head.direction;
    }
    
    // Game loop with AI enhancements
    function updateGame() {
        if (!isRunning) return;
        
        aiDecisionCount++;
        
        // Move snake
        const head = gameState.snake[0];
        const newHead = {
            position: { ...head.position },
            direction: head.direction,
            age: 0
        };
        
        // Update head position
        switch (head.direction) {
            case 'UP': newHead.position.y -= 1; break;
            case 'DOWN': newHead.position.y += 1; break;
            case 'LEFT': newHead.position.x -= 1; break;
            case 'RIGHT': newHead.position.x += 1; break;
        }
        
        // Check collisions
        if (newHead.position.x < 0 || newHead.position.x >= gameState.gridSize.width ||
            newHead.position.y < 0 || newHead.position.y >= gameState.gridSize.height ||
            gameState.snake.some(segment => 
                segment.position.x === newHead.position.x && 
                segment.position.y === newHead.position.y)) {
            
            // Game over with AI analysis
            isRunning = false;
            gameState.gameStatus = 'GAME_OVER';
            
            const finalTime = gameState.gameTime;
            const finalScore = gameState.score;
            const efficiency = finalScore > 0 ? Math.round((finalScore / finalTime) * 10) / 10 : 0;
            const avgReactionTime = playerMoves > 0 ? Math.round((Date.now() - gameState.startTime) / playerMoves) : 0;
            
            setTimeout(() => {
                alert(`Game Over - AI Analysis\\n\\nFinal Score: ${finalScore}\\nTime: ${finalTime}s\\nEfficiency: ${efficiency} pts/sec\\nAI Decisions: ${aiDecisionCount}\\nAvg Reaction: ${avgReactionTime}ms`);
            }, 100);
            return;
        }
        
        gameState.snake.unshift(newHead);
        
        // Check food consumption with AI food placement
        if (newHead.position.x === gameState.food.x && newHead.position.y === gameState.food.y) {
            gameState.score += 10;
            
            // AI-driven speed adjustment
            gameState.speed = Math.min(3.0, gameState.speed + 0.03);
            gameSpeed = Math.max(80, gameSpeed - 2);
            
            // AI-enhanced food placement (avoid corners when player is struggling)
            generateSmartFood();
            
            // Update game loop with new speed
            clearInterval(gameLoop);
            gameLoop = setInterval(updateGame, gameSpeed);
        } else {
            gameState.snake.pop();
        }
        
        renderGame();
    }
    
    // AI-enhanced food generation
    function generateSmartFood() {
        let attempts = 0;
        const maxAttempts = 50;
        
        do {
            gameState.food = {
                x: Math.floor(Math.random() * gameState.gridSize.width),
                y: Math.floor(Math.random() * gameState.gridSize.height)
            };
            attempts++;
            
            // AI logic: avoid placing food in corners if player is struggling
            if (gameState.speed < 1.2 && attempts < maxAttempts) {
                const isCorner = (gameState.food.x < 2 || gameState.food.x > gameState.gridSize.width - 3) &&
                               (gameState.food.y < 2 || gameState.food.y > gameState.gridSize.height - 3);
                if (isCorner) continue;
            }
            
        } while (gameState.snake.some(segment => 
            segment.position.x === gameState.food.x && 
            segment.position.y === gameState.food.y) && attempts < maxAttempts);
    }
    
    // Global game functions
    window.toggleGame = function() {
        if (gameState.gameStatus === 'INIT' || gameState.gameStatus === 'GAME_OVER') {
            isRunning = true;
            gameState.gameStatus = 'PLAYING';
            gameState.startTime = Date.now();
            lastMoveTime = Date.now();
            gameLoop = setInterval(updateGame, gameSpeed);
            console.log('AI Snake Game started');
        } else if (isRunning) {
            isRunning = false;
            gameState.gameStatus = 'PAUSED';
            clearInterval(gameLoop);
            console.log('Game paused');
        } else {
            isRunning = true;
            gameState.gameStatus = 'PLAYING';
            gameLoop = setInterval(updateGame, gameSpeed);
            console.log('Game resumed');
        }
    };
    
    window.resetGame = function() {
        isRunning = false;
        clearInterval(gameLoop);
        
        // Reset all state including AI metrics
        gameState.snake = [
            { position: { x: 10, y: 10 }, direction: 'RIGHT', age: 0 },
            { position: { x: 9, y: 10 }, direction: 'RIGHT', age: 1 },
            { position: { x: 8, y: 10 }, direction: 'RIGHT', age: 2 }
        ];
        gameState.food = { x: 15, y: 10 };
        gameState.score = 0;
        gameState.gameStatus = 'INIT';
        gameState.speed = 1.0;
        gameState.gameTime = 0;
        gameState.startTime = null;
        
        aiDecisionCount = 0;
        playerMoves = 0;
        gameSpeed = 200;
        
        renderGame();
        console.log('AI Snake Game reset');
    };
    
    window.toggleAIVisibility = function() {
        const aiExplanation = document.getElementById('aiExplanation');
        if (aiExplanation) {
            const isVisible = aiExplanation.style.display !== 'none';
            aiExplanation.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                const explanations = [
                    'AI is monitoring your reaction time and adjusting game speed accordingly',
                    'Food placement is being optimized based on your current skill level',
                    'Game difficulty adapts in real-time to maintain optimal challenge',
                    'AI has made ' + aiDecisionCount + ' micro-adjustments to enhance your experience',
                    'Your average reaction time helps the AI calibrate difficulty curves'
                ];
                const randomExplanation = explanations[Math.floor(Math.random() * explanations.length)];
                document.getElementById('aiDecision').textContent = randomExplanation;
            }
        }
    };
    
    // Set up keyboard controls
    document.addEventListener('keydown', handleKeyPress);
    
    // Initial render
    renderGame();
    
    console.log('AI-Enhanced Snake Game initialized successfully!');
    console.log('Features: Adaptive difficulty, smart food placement, behavior analysis');
}

function showError(message) {
    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer) {
        gameContainer.innerHTML = `
            <h1>AI-DRIVEN SNAKE</h1>
            <div style="color: #ff6666; margin: 20px; padding: 20px; border: 2px solid #ff6666;">
                <h3>Loading Error</h3>
                <p>${message}</p>
                <p><a href="retro-snake-classic/" style="color: #00ff00;">Try the Classic Version</a></p>
            </div>
        `;
    }
}

console.log('AI Snake Game browser script loaded successfully');