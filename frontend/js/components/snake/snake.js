let canvas, ctx;
let numCells;
const gridSize = 16;
let gameOver = false; 
let gameInterval;
let speed = 200; 

let snake1 = { 
    body: [{ x: 3, y: 3 }], 
    direction: { x: 1, y: 0 },
    color: 'purple',
    foodCount: 0,
    hitWall: false 
};

let snake2 = { 
    body: [{ x: 4, y: 4 }], 
    direction: { x: 1, y: 0 },
    color: 'blue',
    foodCount: 0,
    hitWall: false
};

let foods = [{ 
    x: Math.floor(Math.random() * 18) + 1, 
    y: Math.floor(Math.random() * 18) + 1  
}];

export function startSnakeGame() {
    canvas = document.getElementById('snakeCanvas');
    if (!canvas) {
        console.error("Canvas element with id 'snakeCanvas' not found.");
        return;
    }
    
    ctx = canvas.getContext('2d');
    numCells = canvas.width / gridSize; 

    resetGame();
    gameInterval = setInterval(gameLoop, speed);

    document.addEventListener('keydown', (event) => {
        switch(event.key) {
            case 'w': if (snake1.direction.y === 0) snake1.direction = { x: 0, y: -1 }; break;
            case 's': if (snake1.direction.y === 0) snake1.direction = { x: 0, y: 1 }; break;
            case 'a': if (snake1.direction.x === 0) snake1.direction = { x: -1, y: 0 }; break;
            case 'd': if (snake1.direction.x === 0) snake1.direction = { x: 1, y: 0 }; break;
            case 'ArrowUp': if (snake2.direction.y === 0) snake2.direction = { x: 0, y: -1 }; break;
            case 'ArrowDown': if (snake2.direction.y === 0) snake2.direction = { x: 0, y: 1 }; break;
            case 'ArrowLeft': if (snake2.direction.x === 0) snake2.direction = { x: -1, y: 0 }; break;
            case 'ArrowRight': if (snake2.direction.x === 0) snake2.direction = { x: 1, y: 0 }; break;
        }
    });
}

function resetGame() {
    snake1.body = [{ x: 3, y: 3 }];
    snake1.direction = { x: 1, y: 0 };
    snake1.foodCount = 0; 
    snake1.hitWall = false;

    snake2.body = [{ x: 4, y: 4 }]; 
    snake2.direction = { x: 1, y: 0 };
    snake2.foodCount = 0; 
    snake2.hitWall = false;

    foods = [{ 
        x: Math.floor(Math.random() * 18) + 1, 
        y: Math.floor(Math.random() * 18) + 1  
    }];
}

function gameLoop() {
    if (!gameOver) {
        updateSnake(snake1);
        updateSnake(snake2);
        checkCollisions();
        drawGame();
    }
}

function updateSnake(snake) {
    const newHead = {
        x: snake.body[0].x + snake.direction.x,
        y: snake.body[0].y + snake.direction.y
    };

    snake.body.unshift(newHead);

    for (let i = 0; i < foods.length; i++) {
        if (newHead.x === foods[i].x && newHead.y === foods[i].y) {
            snake.foodCount++;
            foods.splice(i, 1); 
            placeFood(); 
            return;
        }
    }
    snake.body.pop();
}

function placeFood() {
    foods.push({ 
        x: Math.floor(Math.random() * 18) + 1, 
        y: Math.floor(Math.random() * 18) + 1 
    });
}

function checkCollisions() {
    const snakes = [snake1, snake2];

    for (const snake of snakes) {
        const head = snake.body[0];
        if (head.x < 0 || head.x >= (numCells-1) || head.y < 0 || head.y >= (canvas.height / gridSize -1)) {
            snake.hitWall = true;
            endGame();
        }

        for (let i = 1; i < snake.body.length; i++) {
            if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
                endGame();
            }
        }
    }

    if (snake1.body[0].x === snake2.body[0].x && snake1.body[0].y === snake2.body[0].y) {
        endGame();
    }
}

function endGame() {
    gameOver = true; 
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawSnake(snake1);
    drawSnake(snake2);
    drawFoods();
    drawScore();

    if (gameOver) {
        drawGameOver();
    }
}

function drawFoods() {
    ctx.fillStyle = 'green';
    foods.forEach(food => {
        ctx.beginPath();
        ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawSnake(snake) {
    ctx.fillStyle = gameOver && snake.hitWall ? 'red' : snake.color;

    snake.body.forEach((segment, index) => {
        ctx.beginPath();
        ctx.arc(segment.x * gridSize + gridSize / 2, segment.y * gridSize + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        if (index === 0) {
            drawEyes(segment, snake.direction);
            ctx.fillStyle = gameOver && snake.hitWall ? 'red' : snake.color; 
        }
    });
}

function drawEyes(head, direction) {
    ctx.fillStyle = 'white';
    const eyeSize = 2;
    const eyeOffset = gridSize / 4;

    if (direction.x === 1) { 
        drawEye(head.x * gridSize + gridSize / 2 + eyeOffset, head.y * gridSize + gridSize / 2 - eyeOffset);
        drawEye(head.x * gridSize + gridSize / 2 + eyeOffset, head.y * gridSize + gridSize / 2 + eyeOffset);
    } else if (direction.x === -1) { 
        drawEye(head.x * gridSize + gridSize / 2 - eyeOffset, head.y * gridSize + gridSize / 2 - eyeOffset);
        drawEye(head.x * gridSize + gridSize / 2 - eyeOffset, head.y * gridSize + gridSize / 2 + eyeOffset);
    } else if (direction.y === -1) { 
        drawEye(head.x * gridSize + gridSize / 2 - eyeOffset, head.y * gridSize + gridSize / 2 - eyeOffset);
        drawEye(head.x * gridSize + gridSize / 2 + eyeOffset, head.y * gridSize + gridSize / 2 - eyeOffset);
    } else if (direction.y === 1) { 
        drawEye(head.x * gridSize + gridSize / 2 - eyeOffset, head.y * gridSize + gridSize / 2 + eyeOffset);
        drawEye(head.x * gridSize + gridSize / 2 + eyeOffset, head.y * gridSize + gridSize / 2 + eyeOffset);
    }
}

function drawEye(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawScore() {
    ctx.fillStyle = 'yellow';
    ctx.font = '16px Arial';
    ctx.fillText(`Player: ${snake1.foodCount}`, 10, 20); 
    ctx.fillText(`Opponent: ${snake2.foodCount}`, canvas.width - 200, 20); 
}

function drawGameOver() {
    ctx.fillStyle = 'yellow';
    ctx.font = '30px Arial';
    ctx.fillText('Game Over!', canvas.width / 2 - 70, canvas.height / 2 - 20);
    const winner = snake1.foodCount >= snake2.foodCount ? 'Player' : 'Opponent';
    ctx.fillText(`${winner} wins!`, canvas.width / 2 - 70, canvas.height / 2 + 20);
}

export function stopGame() {
    clearInterval(gameInterval);
}

export function changeGameSpeed(newSpeed) {
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, newSpeed);
}

export function addExtraFood() {
    placeFood();
}
