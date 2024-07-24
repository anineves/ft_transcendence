import { drawCenterLine, initializeCanvas } from './canvasUtils.js';
import { drawScore, drawGameOver } from './score.js';
import { canvas, context, paddleWidth, paddleHeight, playerY, opponentY, movePaddle, stopPaddle } from './canvasUtils.js';

let playerScore = 0;
let opponentScore = 0;
let gameOver = false;

export let ballX, ballY, ballSpeedX, ballSpeedY;
export const ballRadius = 10;



export function startPongGame() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
}
export function initializeBall() {
    if (!canvas) {
        console.error('Canvas element not found for ball');
        return;
    }
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = 5;
    ballSpeedY = 5;
}

export function updateBall() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) {
        ballSpeedY = -ballSpeedY;
    }
}

export function resetBall() {
    setTimeout(() => {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballSpeedX = -ballSpeedX;
    }, 10);
}

function initialize() {
    initializeCanvas();
    initializeBall();

    if (!canvas || !context) {
        console.error('Canvas or context not found');
        return;
    }

    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawCenterLine();
        context.fillStyle = '#0000DD';
        context.fillRect(0, playerY, paddleWidth, paddleHeight);
        context.fillRect(canvas.width - paddleWidth, opponentY, paddleWidth, paddleHeight);
        context.beginPath();
        context.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        context.fillStyle = '#00AA00';
        context.fill();
        context.closePath();
        drawScore(playerScore, opponentScore);
        if (gameOver) {
            drawGameOver(playerScore);
        }
    }

    function update() {
        if (gameOver) return;
        updateBall();
        checkCollisions();
        draw();
    }

    function checkCollisions() {
        if (ballX - ballRadius < paddleWidth) {
            if (ballY > playerY && ballY < playerY + paddleHeight) {
                ballSpeedX = -ballSpeedX;
            } else {
                opponentScore++;
                if (opponentScore >= 5) {
                    gameOver = true;
                }
                resetBall();
            }
        }

        if (ballX + ballRadius > canvas.width - paddleWidth) {
            if (ballY > opponentY && ballY < opponentY + paddleHeight) {
                ballSpeedX = -ballSpeedX;
            } else {
                playerScore++;
                if (playerScore >= 5) {
                    gameOver = true;
                }
                resetBall();
            }
        }
    }

    function gameLoop() {
        update();
        if (!gameOver) {
            requestAnimationFrame(gameLoop);
        }
    }

    document.addEventListener('keydown', function(event) {
        if (['ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S'].includes(event.key)) {
            movePaddle(event);
        }
    });

    document.addEventListener('keyup', function(event) {
        if (['ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S'].includes(event.key)) {
            stopPaddle(event);
        }
    });

    gameLoop();
}


