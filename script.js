// Game constants
const GRID_SIZE = 20; // Size of each grid square in pixels
const GRID_WIDTH = 20; // Number of grid squares wide
const GRID_HEIGHT = 20; // Number of grid squares tall
const GAME_SPEED = 100; // Milliseconds between game updates

// Game variables
let canvas;
let ctx;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let gameLoop;
let gameActive = false;

// Initialize the game when the window loads
window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    initGame();
    
    // Event listeners for keyboard controls
    document.addEventListener('keydown', handleKeyPress);
    
    // Restart button
    document.getElementById('restartButton').addEventListener('click', initGame);
};

// Initialize the game state
function initGame() {
    clearInterval(gameLoop);
    
    // Reset game variables
    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    document.getElementById('score').textContent = score;
    
    // Create initial food
    createFood();
    
    // Start game loop
    gameActive = true;
    gameLoop = setInterval(updateGame, GAME_SPEED);
}

// Main game loop
function updateGame() {
    if (!gameActive) return;
    
    // Update snake position
    moveSnake();
    
    // Check for collisions
    if (checkCollision()) {
        endGame();
        return;
    }
    
    // Check if snake eats food
    if (snake[0].x === food.x && snake[0].y === food.y) {
        // Don't remove the tail, which makes the snake grow
        score++;
        document.getElementById('score').textContent = score;
        createFood();
    } else {
        // Remove the tail if no food was eaten
        snake.pop();
    }
    
    // Draw the game
    drawGame();
}

// Move the snake in the current direction
function moveSnake() {
    // Update direction from the next direction
    direction = nextDirection;
    
    // Calculate new head position
    const head = {x: snake[0].x, y: snake[0].y};
    
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
    
    // Add new head to the beginning of the snake array
    snake.unshift(head);
}

// Check for collisions with walls or self
function checkCollision() {
    const head = snake[0];
    
    // Check for collision with walls
    if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
        return true;
    }
    
    // Check for collision with self (starting from index 1 to skip the head)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// Generate food at a random position not occupied by the snake
function createFood() {
    let validPosition = false;
    
    while (!validPosition) {
        food = {
            x: Math.floor(Math.random() * GRID_WIDTH),
            y: Math.floor(Math.random() * GRID_HEIGHT)
        };
        
        // Check if the food is not on the snake
        validPosition = true;
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                validPosition = false;
                break;
            }
        }
    }
}

// Draw everything on the canvas
function drawGame() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the snake
    ctx.fillStyle = '#4CAF50';
    snake.forEach((segment, index) => {
        // Make the head a different color
        if (index === 0) {
            ctx.fillStyle = '#2E7D32';
        } else {
            ctx.fillStyle = '#4CAF50';
        }
        
        ctx.fillRect(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            GRID_SIZE - 1,
            GRID_SIZE - 1
        );
    });
    
    // Draw the food
    ctx.fillStyle = '#FF5722';
    ctx.fillRect(
        food.x * GRID_SIZE,
        food.y * GRID_SIZE,
        GRID_SIZE - 1,
        GRID_SIZE - 1
    );
}

// Handle keyboard input
function handleKeyPress(event) {
    // Prevent default action to avoid page scrolling with arrow keys
    if ([37, 38, 39, 40, 65, 68, 83, 87].includes(event.keyCode)) {
        event.preventDefault();
    }
    
    // Switch based on keyCode
    switch (event.keyCode) {
        // Arrow Up or W
        case 38:
        case 87:
            if (direction !== 'down') nextDirection = 'up';
            break;
            
        // Arrow Down or S
        case 40:
        case 83:
            if (direction !== 'up') nextDirection = 'down';
            break;
            
        // Arrow Left or A
        case 37:
        case 65:
            if (direction !== 'right') nextDirection = 'left';
            break;
            
        // Arrow Right or D
        case 39:
        case 68:
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
}

// End the game
function endGame() {
    gameActive = false;
    clearInterval(gameLoop);
    
    // Display game over message
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 15);
    
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('Press Restart to play again', canvas.width / 2, canvas.height / 2 + 50);
}