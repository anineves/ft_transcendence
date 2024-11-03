
export let canvas, context, paddleHeight, paddleWidth, ballRadius, playerY, opponentY, ballY, ballX;



export function initializeCanvas() {
    canvas = document.getElementById('pongCanvas');
    if (canvas) {
        context = canvas.getContext('2d');
        paddleHeight = 100;
        paddleWidth = 10;
        ballRadius = 10;
        playerY = (canvas.height - paddleHeight) / 2;
        opponentY = (canvas.height - paddleHeight) / 2;
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
    const modality2 = sessionStorage.getItem('modality');
    if(modality2 != 'remote' && modality2 != 'tourn-remote')
    {
        if (event.key === 'w' || event.key === 'W') {
            clearInterval(playerPaddleInterval);
            playerPaddleInterval = setInterval(() => {
                playerY -= paddleSpeed;
                if (playerY < 0) playerY = 0;
            }, 16);
        } else if (event.key === 's' || event.key === 'S')   {
            clearInterval(playerPaddleInterval);
            playerPaddleInterval = setInterval(() => {
                playerY += paddleSpeed;
                if (playerY + paddleHeight > canvas.height) playerY = canvas.height - paddleHeight;
            }, 16);
        } else if (event.key === 'ArrowUp') {
            clearInterval(opponentPaddleInterval);
            opponentPaddleInterval = setInterval(() => {
                opponentY -= paddleSpeed;
                if (opponentY < 0) opponentY = 0;
            }, 16);
        } else if (event.key === 'ArrowDown'){
            clearInterval(opponentPaddleInterval);
            opponentPaddleInterval = setInterval(() => {
                opponentY += paddleSpeed;
                if (opponentY + paddleHeight > canvas.height) opponentY = canvas.height - paddleHeight;
            }, 16);
        }
    }
    else if(modality2 == 'remote' || modality2 == 'tourn-remote')
    {
        
        const playerID = sessionStorage.getItem('playerID');
        const friendID = sessionStorage.getItem('friendID');
        let arrow_key = event.message.key
        let current_player = event.message.user
        
        if (arrow_key === 'ArrowUp' && current_player == playerID) {
            clearInterval(playerPaddleInterval);
            playerPaddleInterval = setInterval(() => {
                playerY -= paddleSpeed;
                if (playerY < 0) playerY = 0;
            }, 16);
        } else if (arrow_key === 'ArrowDown' && current_player == playerID) {
            clearInterval(playerPaddleInterval);
            playerPaddleInterval = setInterval(() => {
                playerY += paddleSpeed;
                if (playerY + paddleHeight > canvas.height) playerY = canvas.height - paddleHeight;
            }, 16);
        } else if (arrow_key === 'ArrowUp' && current_player == friendID) {
            clearInterval(opponentPaddleInterval);
            opponentPaddleInterval = setInterval(() => {
                opponentY -= paddleSpeed;
                if (opponentY < 0) opponentY = 0;
            }, 16);
        } else if (arrow_key === 'ArrowDown' && current_player == friendID) {
            clearInterval(opponentPaddleInterval);
            opponentPaddleInterval = setInterval(() => {
                opponentY += paddleSpeed;
                if (opponentY + paddleHeight > canvas.height) opponentY = canvas.height - paddleHeight;
            }, 16);
        } 
    }
}

export function stopPaddle(event) {
    
    const modality2 = sessionStorage.getItem('modality');
    
    if(modality2 !== 'remote' && modality2 != 'tourn-remote') {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') 
            clearInterval(opponentPaddleInterval);
        else if (event.key === 'w' || event.key === 'W' || event.key === 's' || event.key === 'S') 
            clearInterval(playerPaddleInterval);
    }
    else if(modality2 == 'remote' || modality2 == 'tourn-remote') {
        const playerID = sessionStorage.getItem('playerID');
        const friendID = sessionStorage.getItem('friendID');
        let arrow_key = event.message.key
        let current_player = event.message.user

        if (arrow_key == 'ArrowUp' && current_player == playerID || arrow_key == 'ArrowDown' && current_player == playerID) 
            clearInterval(playerPaddleInterval);
         else if (arrow_key == 'ArrowUp' && current_player == friendID || arrow_key == 'ArrowDown' && current_player == friendID) 
                clearInterval(opponentPaddleInterval);
        }
}

let aiUpdateRate = 1000;  
let aiTargetY = 0;       
let lastAITime = 0;       
let opponentPaddleDirection = 0;  
const opponentPaddleSpeed = 2.5;    

function simulateKeyPress(direction) {
    
    if (direction === -1) {
        opponentY -= opponentPaddleSpeed; 
    } else if (direction === 1) {
        opponentY += opponentPaddleSpeed;       
    }

    if (opponentY < 0) {
        opponentY = 0;
    } else if (opponentY + paddleHeight > canvas.height) {
        opponentY = canvas.height - paddleHeight;
    }
}


export function moveOpponentPaddleAI(ballY) {
    const currentTime = Date.now(); 
    if (currentTime - lastAITime >= aiUpdateRate) {
        aiTargetY = ballY - paddleHeight / 2; 
        lastAITime = currentTime;  
    }

  
    if (opponentY + paddleHeight / 2 < aiTargetY) {
        opponentPaddleDirection = 1; 
    } else if (opponentY + paddleHeight / 2 > aiTargetY) {
        opponentPaddleDirection = -1;  
    } else {
        opponentPaddleDirection = 0; 
    }

    if (opponentPaddleDirection !== 0) {
        simulateKeyPress(opponentPaddleDirection);
     }
}
