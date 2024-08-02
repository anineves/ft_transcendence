export let canvas, context, paddleHeight, paddleWidth, ballRadius, playerY, opponentY;

export function initializeCanvas() {
    canvas = document.getElementById('pongCanvas');
    if (canvas) {
        context = canvas.getContext('2d');
        paddleHeight = 100;
        paddleWidth = 10;
        ballRadius = 10;
        playerY = (canvas.height - paddleHeight) / 2;
        opponentY = (canvas.height - paddleHeight) / 2;
    } else {
        console.error('Canvas element not found');
    }
}

export function drawCenterLine() {
    if (!context) return;
    context.beginPath();
    context.setLineDash([5, 15]);
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    context.strokeStyle = '#0000DD';
    context.stroke();
    context.setLineDash([]);
}

let playerPaddleInterval;
let opponentPaddleInterval;
let paddleSpeed = 10;

export function movePaddle(event) {
    if (event.key === 'ArrowUp') {
        clearInterval(playerPaddleInterval);
        playerPaddleInterval = setInterval(() => {
            playerY -= paddleSpeed;
            if (playerY < 0) playerY = 0;
        }, 16);
    } else if (event.key === 'ArrowDown') {
        clearInterval(playerPaddleInterval);
        playerPaddleInterval = setInterval(() => {
            playerY += paddleSpeed;
            if (playerY + paddleHeight > canvas.height) playerY = canvas.height - paddleHeight;
        }, 16);
    } else if (event.key === 'w' || event.key === 'W') {
        clearInterval(opponentPaddleInterval);
        opponentPaddleInterval = setInterval(() => {
            opponentY -= paddleSpeed;
            if (opponentY < 0) opponentY = 0;
        }, 16);
    } else if (event.key === 's' || event.key === 'S') {
        clearInterval(opponentPaddleInterval);
        opponentPaddleInterval = setInterval(() => {
            opponentY += paddleSpeed;
            if (opponentY + paddleHeight > canvas.height) opponentY = canvas.height - paddleHeight;
        }, 16);
    }
}

export function stopPaddle(event) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        clearInterval(playerPaddleInterval);
    } else if (event.key === 'w' || event.key === 'W' || event.key === 's' || event.key === 'S') {
        clearInterval(opponentPaddleInterval);
    }
}
