// Snake Master Game - Main Script
document.addEventListener('DOMContentLoaded', function() {
    // Game Variables
    let canvas, ctx;
    let snake = [];
    let food = {};
    let direction = 'right';
    let newDirection = 'right';
    let gameSpeed = 200; // Default speed (Easy)
    let gameScore = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameLevel = 1;
    let gameMode = 'classic'; // Default mode
    let gameInterval;
    let isPaused = false;
    let isGameOver = false;
    let isCountingDown = false;
    let countdownTimer;
    let isMobile = window.innerWidth <= 600;

    // DOM Elements
    const startMenu = document.getElementById('startMenu');
    const gameUI = document.getElementById('gameUI');
    const gameOverMenu = document.getElementById('gameOverMenu');
    const countdown = document.getElementById('countdown');
    const pauseIndicator = document.getElementById('pauseIndicator');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    const levelElement = document.getElementById('level');
    const highScoreDisplay = document.getElementById('highScoreDisplay');
    const finalScore = document.getElementById('finalScore');
    const finalHighScore = document.getElementById('finalHighScore');
    const finalLevel = document.getElementById('finalLevel');
    const newHighScoreElement = document.getElementById('newHighScore');
    const notification = document.getElementById('notification');
    const pauseButton = document.getElementById('pauseButton');
    const pauseButtonText = document.getElementById('pauseButtonText');
    const pauseIcon = document.querySelector('.pause-icon');
    const playIcon = document.querySelector('.play-icon');
    
    // Game Constants
    const GRID_SIZE = 20;
    const CANVAS_SIZE = 400;
    const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;
    const INITIAL_SNAKE_LENGTH = 3;
    const LEVEL_UP_THRESHOLD = 5; // Score needed to level up
    const SPEED_INCREASE_FACTOR = 0.9;

    // Colors
    const COLORS = {
        snakeHead: '#2E7D32',
        snakeBody: '#4CAF50',
        food: '#FF5722',
        border: '#333',
        grid: 'rgba(255, 255, 255, 0.05)',
        text: '#FFFFFF'
    };

    // Initialize Game
    function initGame() {
        canvas = document.getElementById('gameCanvas');
        ctx = canvas.getContext('2d');
        
        // Set up high score display
        highScore = localStorage.getItem('snakeHighScore') || 0;
        highScoreDisplay.textContent = highScore;
        highScoreElement.textContent = highScore;
        
        // Set up event listeners
        setupEventListeners();
        
        // Show start menu
        showStartMenu();
    }

    // Set up all event listeners
    function setupEventListeners() {
        // Start Menu
        document.getElementById('startButton').addEventListener('click', startGame);
        
        // Difficulty Buttons
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        difficultyButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Update selected state
                difficultyButtons.forEach(btn => btn.classList.remove('selected'));
                this.classList.add('selected');
                
                // Set game speed
                gameSpeed = parseInt(this.getAttribute('data-speed'));
            });
        });
        
        // Game Mode Buttons
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Update selected state
                modeButtons.forEach(btn => btn.classList.remove('selected'));
                this.classList.add('selected');
                
                // Set game mode
                gameMode = this.getAttribute('data-mode');
            });
        });
        
        // Game Controls
        pauseButton.addEventListener('click', togglePause);
        document.getElementById('menuButton').addEventListener('click', returnToMenu);
        
        // Mobile Direction Buttons
        document.getElementById('upButton').addEventListener('click', () => setDirection('up'));
        document.getElementById('downButton').addEventListener('click', () => setDirection('down'));
        document.getElementById('leftButton').addEventListener('click', () => setDirection('left'));
        document.getElementById('rightButton').addEventListener('click', () => setDirection('right'));
        
        // Direction Buttons Animation
        const directionButtons = document.querySelectorAll('.direction-button');
        directionButtons.forEach(button => {
            button.addEventListener('mousedown', function() {
                this.classList.add('active');
            });
            button.addEventListener('mouseup', function() {
                this.classList.remove('active');
            });
            button.addEventListener('touchstart', function() {
                this.classList.add('active');
            });
            button.addEventListener('touchend', function() {
                this.classList.remove('active');
            });
        });
        
        // Game Over Menu
        document.getElementById('playAgainButton').addEventListener('click', restartGame);
        document.getElementById('mainMenuButton').addEventListener('click', returnToMenu);
        
        // Keyboard Controls
        document.addEventListener('keydown', handleKeyDown);
        
        // Swipe Controls for Mobile
        if (isMobile) {
            setupSwipeControls();
        }
        
        // Resize event
        window.addEventListener('resize', function() {
            isMobile = window.innerWidth <= 600;
        });
    }

    // Setup swipe controls for mobile
    function setupSwipeControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        
        canvas.addEventListener('touchstart', function(event) {
            touchStartX = event.changedTouches[0].screenX;
            touchStartY = event.changedTouches[0].screenY;
        }, false);
        
        canvas.addEventListener('touchend', function(event) {
            touchEndX = event.changedTouches[0].screenX;
            touchEndY = event.changedTouches[0].screenY;
            handleSwipe();
        }, false);
        
        function handleSwipe() {
            const xDiff = touchStartX - touchEndX;
            const yDiff = touchStartY - touchEndY;
            
            // Determine if the swipe was horizontal or vertical
            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                if (xDiff > 0) {
                    // Swipe left
                    setDirection('left');
                } else {
                    // Swipe right
                    setDirection('right');
                }
            } else {
                if (yDiff > 0) {
                    // Swipe up
                    setDirection('up');
                } else {
                    // Swipe down
                    setDirection('down');
                }
            }
        }
    }

    // Handle keyboard controls
    function handleKeyDown(event) {
        // If the game is over, don't process movement keys
        if (isGameOver) return;
        
        // Handle movement keys
        switch (event.key) {
            // Arrow keys
            case 'ArrowUp':
                setDirection('up');
                event.preventDefault();
                break;
            case 'ArrowDown':
                setDirection('down');
                event.preventDefault();
                break;
            case 'ArrowLeft':
                setDirection('left');
                event.preventDefault();
                break;
            case 'ArrowRight':
                setDirection('right');
                event.preventDefault();
                break;
                
            // WASD keys
            case 'w':
            case 'W':
                setDirection('up');
                break;
            case 's':
            case 'S':
                setDirection('down');
                break;
            case 'a':
            case 'A':
                setDirection('left');
                break;
            case 'd':
            case 'D':
                setDirection('right');
                break;
                
            // Space bar for pause
            case ' ':
                togglePause();
                event.preventDefault();
                break;
                
            // Escape to return to menu
            case 'Escape':
                returnToMenu();
                break;
        }
    }

    // Set direction based on user input
    function setDirection(dir) {
        // Prevent 180-degree turn
        if ((dir === 'up' && direction !== 'down') ||
            (dir === 'down' && direction !== 'up') ||
            (dir === 'left' && direction !== 'right') ||
            (dir === 'right' && direction !== 'left')) {
            newDirection = dir;
        }
    }

    // Toggle game pause
    function togglePause() {
        if (isCountingDown || isGameOver) return;
        
        isPaused = !isPaused;
        
        if (isPaused) {
            clearInterval(gameInterval);
            pauseIndicator.classList.remove('hidden');
            pauseButtonText.textContent = 'Resume';
            pauseIcon.classList.add('hidden');
            playIcon.classList.remove('hidden');
        } else {
            gameInterval = setInterval(gameLoop, gameSpeed);
            pauseIndicator.classList.add('hidden');
            pauseButtonText.textContent = 'Pause';
            pauseIcon.classList.remove('hidden');
            playIcon.classList.add('hidden');
        }
    }

    // Return to main menu
    function returnToMenu() {
        // Clear any active game
        clearInterval(gameInterval);
        isGameOver = false;
        isPaused = false;
        
        // Reset UI elements
        pauseIndicator.classList.add('hidden');
        countdown.classList.add('hidden');
        pauseButtonText.textContent = 'Pause';
        pauseIcon.classList.remove('hidden');
        playIcon.classList.add('hidden');
        
        // Show start menu
        hideAllMenus();
        showStartMenu();
    }

    // Hide all menus
    function hideAllMenus() {
        startMenu.classList.add('hidden');
        gameUI.classList.add('hidden');
        gameOverMenu.classList.add('hidden');
    }

    // Show start menu
    function showStartMenu() {
        hideAllMenus();
        startMenu.classList.remove('hidden');
        highScoreDisplay.textContent = highScore;
    }

    // Show game UI
    function showGameUI() {
        hideAllMenus();
        gameUI.classList.remove('hidden');
    }

    // Show game over menu
    function showGameOverMenu() {
        hideAllMenus();
        gameOverMenu.classList.remove('hidden');
        
        // Update final stats
        finalScore.textContent = gameScore;
        finalHighScore.textContent = highScore;
        finalLevel.textContent = gameLevel;
        
        // Check for new high score
        if (gameScore > highScore - 1) {
            newHighScoreElement.style.display = 'block';
        } else {
            newHighScoreElement.style.display = 'none';
        }
    }

    // Start the game
    function startGame() {
        resetGame();
        showGameUI();
        startCountdown();
    }

    // Restart game
    function restartGame() {
        resetGame();
        showGameUI();
        startCountdown();
    }

    // Start countdown before game begins
    function startCountdown() {
        isCountingDown = true;
        let count = 3;
        countdown.textContent = count;
        countdown.classList.remove('hidden');
        
        countdownTimer = setInterval(function() {
            count--;
            
            if (count <= 0) {
                clearInterval(countdownTimer);
                countdown.classList.add('hidden');
                isCountingDown = false;
                gameInterval = setInterval(gameLoop, gameSpeed);
            } else {
                countdown.textContent = count;
                countdown.classList.remove('hidden');
            }
        }, 1000);
    }

    // Reset game to initial state
    function resetGame() {
        // Clear any active intervals
        clearInterval(gameInterval);
        clearInterval(countdownTimer);
        
        // Reset game state
        direction = 'right';
        newDirection = 'right';
        gameScore = 0;
        gameLevel = 1;
        isPaused = false;
        isGameOver = false;
        
        // Initialize snake
        snake = [];
        for (let i = INITIAL_SNAKE_LENGTH - 1; i >= 0; i--) {
            snake.push({ x: i, y: 0 });
        }
        
        // Generate food
        generateFood();
        
        // Update UI
        updateScore();
        levelElement.textContent = gameLevel;
    }

    // Main game loop
    function gameLoop() {
        // Skip if paused or game over
        if (isPaused || isGameOver) return;
        
        // Apply the new direction
        direction = newDirection;
        
        // Move the snake
        moveSnake();
        
        // Check for collisions
        if (checkCollision()) {
            gameOver();
            return;
        }
        
        // Check for food consumption
        if (snake[0].x === food.x && snake[0].y === food.y) {
            // Don't remove the tail segment (snake grows)
            eatFood();
        } else {
            // Remove the last segment (snake moves)
            snake.pop();
        }
        
        // Draw the game
        drawGame();
    }

    // Move the snake based on current direction
    function moveSnake() {
        // Create new head segment based on current direction
        const head = { x: snake[0].x, y: snake[0].y };
        
        switch (direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }
        
        // Handle wrap-around for no-walls mode
        if (gameMode === 'no-walls') {
            if (head.x < 0) head.x = GRID_SIZE - 1;
            if (head.x >= GRID_SIZE) head.x = 0;
            if (head.y < 0) head.y = GRID_SIZE - 1;
            if (head.y >= GRID_SIZE) head.y = 0;
        }
        
        // Add new head segment to the front
        snake.unshift(head);
    }

    // Check for collisions
    function checkCollision() {
        const head = snake[0];
        
        // Check for wall collision (only in classic mode)
        if (gameMode === 'classic') {
            if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
                return true;
            }
        }
        
        // Check for self collision (skip the head)
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        
        return false;
    }

    // Handle food consumption
    function eatFood() {
        // Increase score
        gameScore++;
        updateScore();
        
        // Check for level up
        if (gameScore % LEVEL_UP_THRESHOLD === 0) {
            levelUp();
        }
        
        // Generate new food
        generateFood();
        
        // Show score notification
        showNotification(`+1 Point!`);
    }

    // Level up the game
    function levelUp() {
        gameLevel++;
        levelElement.textContent = gameLevel;
        
        // Increase game speed
        gameSpeed *= SPEED_INCREASE_FACTOR;
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeed);
        
        // Show level up notification
        showNotification(`Level ${gameLevel}! Speed increased!`);
    }

    // Generate food at random position
    function generateFood() {
        // Create temporary position
        let position;
        let isValid = false;
        
        // Keep generating until we find a valid position
        while (!isValid) {
            position = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
            
            // Check if position overlaps with snake
            isValid = true;
            for (let segment of snake) {
                if (position.x === segment.x && position.y === segment.y) {
                    isValid = false;
                    break;
                }
            }
        }
        
        // Set new food position
        food = position;
    }

    // Update score display
    function updateScore() {
        scoreElement.textContent = gameScore;
        
        // Update high score if needed
        if (gameScore > highScore) {
            highScore = gameScore;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
    }

    // Handle game over
    function gameOver() {
        isGameOver = true;
        clearInterval(gameInterval);
        
        // Update high score if needed
        if (gameScore > highScore) {
            highScore = gameScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // Show game over menu after a short delay
        setTimeout(function() {
            showGameOverMenu();
        }, 1000);
    }

    // Show notification
    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('show');
        
        // Hide notification after 2 seconds
        setTimeout(function() {
            notification.classList.remove('show');
        }, 2000);
    }

    // Draw the game
    function drawGame() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        drawGrid();
        
        // Draw food
        drawFood();
        
        // Draw snake
        drawSnake();
    }

    // Draw grid
    function drawGrid() {
        ctx.strokeStyle = COLORS.grid;
        
        // Draw vertical lines
        for (let x = 0; x <= CANVAS_SIZE; x += CELL_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS_SIZE);
            ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= CANVAS_SIZE; y += CELL_SIZE) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_SIZE, y);
            ctx.stroke();
        }
    }

    // Draw food
    function drawFood() {
        ctx.fillStyle = COLORS.food;
        ctx.beginPath();
        
        // Draw as a circle
        const centerX = food.x * CELL_SIZE + CELL_SIZE / 2;
        const centerY = food.y * CELL_SIZE + CELL_SIZE / 2;
        const radius = CELL_SIZE / 2 * 0.8;
        
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add shine effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(centerX - radius/3, centerY - radius/3, radius/4, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw snake
    function drawSnake() {
        // Draw each segment
        snake.forEach((segment, index) => {
            // Different color for head
            if (index === 0) {
                ctx.fillStyle = COLORS.snakeHead;
            } else {
                ctx.fillStyle = COLORS.snakeBody;
            }
            
            // Draw rounded rectangle
            const x = segment.x * CELL_SIZE;
            const y = segment.y * CELL_SIZE;
            const size = CELL_SIZE * 0.9;
            const offset = (CELL_SIZE - size) / 2;
            const radius = size / 4;
            
            ctx.beginPath();
            ctx.moveTo(x + offset + radius, y + offset);
            ctx.lineTo(x + offset + size - radius, y + offset);
            ctx.quadraticCurveTo(x + offset + size, y + offset, x + offset + size, y + offset + radius);
            ctx.lineTo(x + offset + size, y + offset + size - radius);
            ctx.quadraticCurveTo(x + offset + size, y + offset + size, x + offset + size - radius, y + offset + size);
            ctx.lineTo(x + offset + radius, y + offset + size);
            ctx.quadraticCurveTo(x + offset, y + offset + size, x + offset, y + offset + size - radius);
            ctx.lineTo(x + offset, y + offset + radius);
            ctx.quadraticCurveTo(x + offset, y + offset, x + offset + radius, y + offset);
            ctx.closePath();
            ctx.fill();
            
            // Add eyes to the head
            if (index === 0) {
                ctx.fillStyle = 'white';
                
                const eyeSize = size / 5;
                let eye1X, eye1Y, eye2X, eye2Y;
                
                // Position eyes based on direction
                switch (direction) {
                    case 'up':
                        eye1X = x + offset + size / 3 - eyeSize / 2;
                        eye1Y = y + offset + size / 3 - eyeSize / 2;
                        eye2X = x + offset + size * 2/3 - eyeSize / 2;
                        eye2Y = y + offset + size / 3 - eyeSize / 2;
                        break;
                    case 'down':
                        eye1X = x + offset + size / 3 - eyeSize / 2;
                        eye1Y = y + offset + size * 2/3 - eyeSize / 2;
                        eye2X = x + offset + size * 2/3 - eyeSize / 2;
                        eye2Y = y + offset + size * 2/3 - eyeSize / 2;
                        break;
                    case 'left':
                        eye1X = x + offset + size / 3 - eyeSize / 2;
                        eye1Y = y + offset + size / 3 - eyeSize / 2;
                        eye2X = x + offset + size / 3 - eyeSize / 2;
                        eye2Y = y + offset + size * 2/3 - eyeSize / 2;
                        break;
                    case 'right':
                        eye1X = x + offset + size * 2/3 - eyeSize / 2;
                        eye1Y = y + offset + size / 3 - eyeSize / 2;
                        eye2X = x + offset + size * 2/3 - eyeSize / 2;
                        eye2Y = y + offset + size * 2/3 - eyeSize / 2;
                        break;
                }
                
                // Draw eyes
                ctx.beginPath();
                ctx.arc(eye1X + eyeSize/2, eye1Y + eyeSize/2, eyeSize, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(eye2X + eyeSize/2, eye2Y + eyeSize/2, eyeSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Add pupils
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(eye1X + eyeSize/2, eye1Y + eyeSize/2, eyeSize/2, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(eye2X + eyeSize/2, eye2Y + eyeSize/2, eyeSize/2, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    // Initialize the game when the page loads
    initGame();
});