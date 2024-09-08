export let canvas, context, paddleHeight, paddleWidth, ballRadius, playerY, opponentY, ballY;


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
    const modality = sessionStorage.getItem('modality');
    if(modality !== 'remote')
    {
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
    else if(modality === 'remote')
    {
        // console.log("Move Paddle Event: ", event);
        const playerID = sessionStorage.getItem('playerID');
        const friendID = sessionStorage.getItem('friendID');
        // console.log("Canvas Player ID: ", playerID );
        // console.log("Canvas Friend ID: ", friendID );
        if (event.key === 'ArrowUp' && event.user_id == playerID) {
            clearInterval(playerPaddleInterval);
            playerPaddleInterval = setInterval(() => {
                playerY -= paddleSpeed;
                if (playerY < 0) playerY = 0;
            }, 16);
        } else if (event.key === 'ArrowDown' && event.user_id == playerID) {
            clearInterval(playerPaddleInterval);
            playerPaddleInterval = setInterval(() => {
                playerY += paddleSpeed;
                if (playerY + paddleHeight > canvas.height) playerY = canvas.height - paddleHeight;
            }, 16);
        } else if (event.key === 'ArrowUp' && event.user_id == friendID) {
            clearInterval(opponentPaddleInterval);
            opponentPaddleInterval = setInterval(() => {
                opponentY -= paddleSpeed;
                if (opponentY < 0) opponentY = 0;
            }, 16);
        } else if (event.key === 'ArrowDown' && event.user_id == friendID) {
            clearInterval(opponentPaddleInterval);
            opponentPaddleInterval = setInterval(() => {
                opponentY += paddleSpeed;
                if (opponentY + paddleHeight > canvas.height) opponentY = canvas.height - paddleHeight;
            }, 16);
        }
    }
}

export function stopPaddle(event) {
    const modality = sessionStorage.getItem('modality');
    if(modality !== 'remote') {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            clearInterval(playerPaddleInterval);
        } else if (event.key === 'w' || event.key === 'W' || event.key === 's' || event.key === 'S') {
            clearInterval(opponentPaddleInterval);
        }
    }
    else if(modality === 'remote') {
        const playerID = sessionStorage.getItem('playerID');
        const friendID = sessionStorage.getItem('friendID');

        if (event.key === 'ArrowUp' || event.key === 'ArrowDown' && event.user_id == playerID) {
            // console.log("StopPaddlePlayer")
            clearInterval(playerPaddleInterval);
        } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown' && event.user_id == friendID) {
                // console.log("StopPaddleOpponent")
                clearInterval(opponentPaddleInterval);
            }
        }
}
// } else if (event.key === 'w' || event.key === 'W' || event.key === 's' || event.key === 'S') {
    
// export function stopPaddle(event) {
//     if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
//         clearInterval(playerPaddleInterval);
//     } else if (event.key === 'w' || event.key === 'W' || event.key === 's' || event.key === 'S') {
//         clearInterval(opponentPaddleInterval);
//     }
// }


let opponentPaddleDirection = 1;
const opponentPaddleSpeed = 2;  

export function moveOpponentPaddleAI() {
    if (!canvas) {
        console.error('Canvas not initialized');
        return;
    }

    opponentY += opponentPaddleSpeed * opponentPaddleDirection;
    if (opponentY <= 0) {
        opponentY = 0;
        opponentPaddleDirection = 1; 
    } else if (opponentY + paddleHeight >= canvas.height) {
        opponentY = canvas.height - paddleHeight;
        opponentPaddleDirection = -1; 
    }
}