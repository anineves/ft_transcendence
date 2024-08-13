import { drawCenterLine, initializeCanvas, moveOpponentPaddleAI, } from './canvasUtils.js';
import { drawScore, drawGameOver } from './score.js';
import { canvas, context, paddleWidth, paddleHeight, playerY, opponentY, movePaddle, stopPaddle } from './canvasUtils.js';

let playerScore = 0;
let opponentScore = 0;
let gameOver = false;

export let ballX, ballY, ballSpeedX, ballSpeedY;
export const ballRadius = 10;
let isAIActive = false;


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
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = 2;
    ballSpeedY = 2;
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
        if (localStorage.getItem('game') === 'ai') {
            moveOpponentPaddleAI();
            isAIActive = true;
        }
        checkCollisions();
        draw();
    }

    let ballOutOfBoundsLeft = false;
let ballOutOfBoundsRight = false;

function checkCollisions() {
    if (ballX - ballRadius < 0) {
        if (!ballOutOfBoundsLeft) {
            opponentScore++;
            if (opponentScore >= 5) {
                gameOver = true;
            }
            ballOutOfBoundsLeft = true;
            resetBall();
        }
    } else {
        ballOutOfBoundsLeft = false; 
    }

    if (ballX + ballRadius > canvas.width) {
        if (!ballOutOfBoundsRight) {
            playerScore++;
            if (playerScore >= 5) {
                gameOver = true;
            }
            ballOutOfBoundsRight = true; 
            resetBall();
        }
    } else {
        ballOutOfBoundsRight = false;
    }

    if (ballX - ballRadius < paddleWidth && ballY > playerY && ballY < playerY + paddleHeight) {
        ballSpeedX = -ballSpeedX;
    }

    if (ballX + ballRadius > canvas.width - paddleWidth && ballY > opponentY && ballY < opponentY + paddleHeight) {
        ballSpeedX = -ballSpeedX;
    }
}



    function gameLoop() {
        update();
        if (!gameOver) {
            requestAnimationFrame(gameLoop);
        }
    }

    document.addEventListener('keydown', function(event) {
        if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
            movePaddle(event);
        }
    });

    document.addEventListener('keydown', function(event) {
        if (['w', 'W', 's', 'S'].includes(event.key) && localStorage.getItem('game') === 'player') {
            const game = localStorage.getItem('game');
            console.log(game);
            movePaddle(event);
        }
    });

    document.addEventListener('keyup', function(event) {
        if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
            stopPaddle(event);
        }
    });

    document.addEventListener('keyup', function(event) {
        if (['w', 'W', 's', 'S'].includes(event.key) && localStorage.getItem('game') === 'player') {
            stopPaddle(event);
        }
    });

    

    gameLoop();
}


